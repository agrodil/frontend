import { useCallback, useState } from "react";
import {
  walletApi,
  type StatementReconciliationResult,
} from "@/api/clients/wallet.api";

export interface RunReconciliationInput {
  bankAccountId: string;
  day?: string; // YYYY-MM-DD
  file: File;
}

const MAX_BYTES = 15 * 1024 * 1024;
const MIN_BYTES = 200;
const NAME_RE = /\.(xlsx|zip)$/i;

// Sube el extracto y aplica la conciliación. Guardas de archivo del lado
// cliente antes de gastar el request.
export const useReconciliation = () => {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatementReconciliationResult | null>(
    null,
  );

  const reset = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  const run = async (input: RunReconciliationInput): Promise<void> => {
    setError(null);
    if (!NAME_RE.test(input.file.name)) {
      setError("Formato no válido, sube un .xlsx o .zip.");
      return;
    }
    if (input.file.size < MIN_BYTES || input.file.size > MAX_BYTES) {
      setError("El archivo debe pesar entre 200 B y 15 MB.");
      return;
    }
    setRunning(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("bank_account_id", input.bankAccountId);
      if (input.day) fd.append("day", input.day);
      fd.append("statement_file", input.file);
      const res = await walletApi.runReconciliation(fd);
      setResult(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo procesar el extracto.",
      );
    } finally {
      setRunning(false);
    }
  };

  return { run, running, error, result, reset };
};
