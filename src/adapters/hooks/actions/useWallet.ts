import { useCallback, useEffect, useState } from "react";
import { walletApi, type UserWalletRow } from "@/api/clients/wallet.api";

// Evento global para forzar recarga del saldo tras un depósito acreditado o un
// ajuste (mismo patrón que "postUpdated" en post.actions.ts). Lo escucha este
// hook estén donde estén sus instancias (card del header, página de billetera).
export const WALLET_REFRESH_EVENT = "wallet:refresh";

export interface UseWalletResult {
  wallet: UserWalletRow | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Carga el saldo de la cartera del usuario autenticado al montar. 404 (usuario
// sin cartera todavía) se trata como saldo cero, no como error.
export function useWallet(): UseWalletResult {
  const [wallet, setWallet] = useState<UserWalletRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    walletApi
      .getWallet()
      .then((w) => {
        if (!cancelled) {
          setWallet(w);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar el saldo.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener(WALLET_REFRESH_EVENT, handler);
    return () => window.removeEventListener(WALLET_REFRESH_EVENT, handler);
  }, [refetch]);

  return { wallet, loading, error, refetch };
}
