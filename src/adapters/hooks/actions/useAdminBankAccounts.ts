import { useEffect, useState } from "react";
import {
  walletApi,
  type BankAccountRow,
  type CreateBankAccountInput,
} from "@/api/clients/wallet.api";

// Cuentas propias (destino de depósitos), ambas modalidades. No hay endpoint
// "todas", así que se piden las dos y se mezclan. Alta/baja optimistas.
export const useAdminBankAccounts = () => {
  const [accounts, setAccounts] = useState<BankAccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      walletApi.getBankAccounts("mobile_payment"),
      walletApi.getBankAccounts("transfer"),
    ])
      .then(([mobile, transfer]) => {
        if (!cancelled) setAccounts([...mobile, ...transfer]);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar las cuentas.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Devuelve un error legible (string) o null si salió bien.
  const create = async (
    input: CreateBankAccountInput,
  ): Promise<string | null> => {
    try {
      const row = await walletApi.createBankAccount(input);
      setAccounts((prev) => [...prev, row]);
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "No se pudo crear la cuenta.";
    }
  };

  const remove = async (id: string): Promise<string | null> => {
    try {
      await walletApi.deleteBankAccount(id);
      setAccounts((prev) => prev.filter((a) => a.bank_account_id !== id));
      return null;
    } catch (err) {
      return err instanceof Error
        ? err.message
        : "No se pudo eliminar la cuenta.";
    }
  };

  return { accounts, loading, error, create, remove };
};
