import { useCallback, useState } from "react";
import { walletApi, type AdjustmentResult } from "@/api/clients/wallet.api";
import { WALLET_REFRESH_EVENT } from "./useWallet";

export interface AdminAdjustmentInput {
  appUserId: string;
  usdAmount: number; // firmado; > 0 acredita, < 0 descuenta
  reason: string;
}

// Ajuste manual de saldo (admin). El backend calcula los Bs con la tasa
// vigente. Estado inline success/error à la useReportProblem.
export const useAdminAdjustment = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AdjustmentResult | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  const submit = async (input: AdminAdjustmentInput): Promise<void> => {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await walletApi.createAdjustment(input);
      setResult(res);
      window.dispatchEvent(new CustomEvent(WALLET_REFRESH_EVENT));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo aplicar el ajuste.";
      if (/no wallet found/i.test(message)) {
        setError("El usuario no tiene billetera.");
      } else if (/tasa/i.test(message)) {
        setError("No hay tasa USD/Bs registrada.");
      } else if (/usd_amount no puede ser 0|demasiado peque/i.test(message)) {
        setError("El monto es inválido para la tasa vigente.");
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, error, result, reset };
};
