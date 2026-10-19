import { useState } from "react";
import {
  walletApi,
  type ClaimOrphanInput,
  type DepositReviewResult,
} from "@/api/clients/wallet.api";
import { WALLET_REFRESH_EVENT } from "./useWallet";

// Reclama un pago del extracto sin comprobante: lo registra y acredita.
export const useClaimOrphan = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DepositReviewResult | null>(null);

  const submit = async (input: ClaimOrphanInput): Promise<void> => {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await walletApi.claimOrphan(input);
      setResult(res);
      window.dispatchEvent(new CustomEvent(WALLET_REFRESH_EVENT));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo reclamar el pago.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, error, result };
};
