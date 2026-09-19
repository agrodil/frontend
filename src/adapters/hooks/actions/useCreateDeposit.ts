import { useCallback, useEffect, useState } from "react";
import { walletApi, type DepositResult } from "@/api/clients/wallet.api";
import { catalogApi } from "@/api/clients/catalog.api";
import { compressImage } from "@/shared/utils/compressImage";
import {
  WALLET_REFRESH_EVENT,
  dispatchWalletOptimistic,
  dispatchWalletRefresh,
} from "./useWallet";

export interface CreateDepositInput {
  bankAccountId: string;
  referenceNumber: string;
  amountBs: string; // string tal cual lo tecleó el usuario; el backend valida
  receiptImage: File;
}

// Límites del backend para el comprobante (DepositReceiptValidationPipe).
const MIN_BYTES = 5 * 1024; // 5 KB
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const RAW_INPUT_CAP = 20 * 1024 * 1024; // corta antes de invocar al worker
const COOLDOWN_MS = 10_000; // tras un 429

// Orquesta el alta de un comprobante de pago móvil: comprime la imagen,
// valida tamaño de salida (el worker puede devolver el original si falla),
// calcula el offset horario del pagador, arma el multipart y postea.
export const useCreateDeposit = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<DepositResult | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);

  const reset = useCallback(() => {
    setError(null);
    setFieldErrors({});
    setResult(null);
  }, []);

  const submit = async (input: CreateDepositInput): Promise<void> => {
    if (Date.now() < cooldownUntil) {
      setError("Demasiados intentos seguidos, espera unos segundos.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      if (input.receiptImage.size > RAW_INPUT_CAP) {
        setFieldErrors({ receipt_image: "La imagen es demasiado grande." });
        return;
      }

      const file = input.receiptImage.type.startsWith("image/")
        ? await compressImage(input.receiptImage)
        : input.receiptImage;

      if (file.size < MIN_BYTES) {
        setFieldErrors({ receipt_image: "La imagen es demasiado pequeña." });
        return;
      }
      if (file.size > MAX_BYTES) {
        setFieldErrors({ receipt_image: "La imagen supera los 8MB." });
        return;
      }

      const offset = -new Date().getTimezoneOffset();

      const fd = new FormData();
      fd.append("deposit_method", "mobile_payment");
      fd.append("bank_account_id", input.bankAccountId);
      fd.append("reference_number", input.referenceNumber);
      fd.append("amount_bs", input.amountBs);
      if (offset >= -840 && offset <= 840) {
        fd.append("client_utc_offset_minutes", String(offset));
      }
      fd.append("receipt_image", file);

      // Estimado en USD para acreditar optimistamente (el backend recalcula
      // con la tasa exacta vigente al cobrar — puede diferir en centavos, se
      // reconcilia con dispatchWalletRefresh({silent:true}) si se aprueba).
      // Si no se puede obtener la tasa, sigue sin optimistic (0 = no-op).
      let estimatedUsd = 0;
      try {
        const { usd_rate } = await catalogApi.getUsdRate();
        const amountBs = Number(input.amountBs);
        if (usd_rate > 0 && Number.isFinite(amountBs)) {
          estimatedUsd = amountBs / usd_rate;
        }
      } catch {
        // sin tasa disponible: se manda el depósito igual, sin optimistic.
      }
      if (estimatedUsd > 0) dispatchWalletOptimistic(estimatedUsd);

      let res: DepositResult;
      try {
        res = await walletApi.createDeposit(fd);
      } catch (error) {
        if (estimatedUsd > 0) dispatchWalletOptimistic(-estimatedUsd);
        throw error;
      }
      setResult(res);

      if (res.status === "completed") {
        // El backend ya acreditó: reconciliar en silencio con el monto exacto.
        if (estimatedUsd > 0) dispatchWalletRefresh({ silent: true });
        else window.dispatchEvent(new CustomEvent(WALLET_REFRESH_EVENT));
      } else {
        // Queda "pending": el backend NO acreditó nada todavía — revertir el
        // optimista (no es un error, pero tampoco hay crédito real aún).
        if (estimatedUsd > 0) dispatchWalletOptimistic(-estimatedUsd);
        // Igual refresca la lista de "en revisión" (useMyDeposits).
        window.dispatchEvent(new CustomEvent(WALLET_REFRESH_EVENT));
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo registrar el depósito.";
      if (message.includes("Demasiados intentos")) {
        setCooldownUntil(Date.now() + COOLDOWN_MS);
        setError(message);
      } else if (/ya fue registrado/i.test(message)) {
        setFieldErrors({
          reference_number: "Este comprobante ya fue registrado.",
        });
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Limpia el cooldown pasado el tiempo para rehabilitar el botón.
  useEffect(() => {
    if (cooldownUntil === 0) return;
    const t = setTimeout(
      () => setCooldownUntil(0),
      Math.max(0, cooldownUntil - Date.now()),
    );
    return () => clearTimeout(t);
  }, [cooldownUntil]);

  return {
    submit,
    submitting,
    error,
    fieldErrors,
    result,
    reset,
    onCooldown: cooldownUntil !== 0,
  };
};
