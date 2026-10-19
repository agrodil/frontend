import { useEffect, useState } from "react";
import { walletApi, type BankAccountRow } from "@/api/clients/wallet.api";

// Cuentas de pago móvil donde el usuario puede depositar. Carga al montar.
export const useDepositBankAccounts = () => {
  const [accounts, setAccounts] = useState<BankAccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    walletApi
      .getBankAccounts("mobile_payment")
      .then((rows) => {
        if (!cancelled) setAccounts(rows);
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

  return { accounts, loading, error };
};
