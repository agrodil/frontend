import { useCallback, useEffect, useState } from "react";
import { walletApi, type UserWalletRow } from "@/api/clients/wallet.api";

// Evento global para forzar recarga del saldo tras un depósito acreditado o un
// ajuste (mismo patrón que "postUpdated" en post.actions.ts). Lo escucha este
// hook estén donde estén sus instancias (card del header, página de billetera).
// `detail.silent` pide un refetch sin pasar por `loading` (para no tapar un
// valor optimista con el spinner mientras se reconcilia con el servidor).
export const WALLET_REFRESH_EVENT = "wallet:refresh";

export interface WalletRefreshDetail {
  silent?: boolean;
}

// Evento global para aplicar un ajuste optimista al saldo (antes de que el
// servidor confirme). `deltaUsd` > 0 acredita, < 0 descuenta. Todas las
// instancias de useWallet lo reciben, así el header y el sidebar mobile se
// actualizan a la vez. Si la operación falla, quien la disparó debe volver a
// emitir el evento con el signo invertido para revertir.
export const WALLET_OPTIMISTIC_EVENT = "wallet:optimistic";

export interface WalletOptimisticDetail {
  deltaUsd: number;
}

export function dispatchWalletOptimistic(deltaUsd: number): void {
  window.dispatchEvent(
    new CustomEvent<WalletOptimisticDetail>(WALLET_OPTIMISTIC_EVENT, {
      detail: { deltaUsd },
    }),
  );
}

export function dispatchWalletRefresh(detail?: WalletRefreshDetail): void {
  window.dispatchEvent(
    new CustomEvent<WalletRefreshDetail>(WALLET_REFRESH_EVENT, { detail }),
  );
}

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
    const handler = (e: Event) => {
      const silent = (e as CustomEvent<WalletRefreshDetail>).detail?.silent;
      if (!silent) {
        refetch();
        return;
      }
      // Reconciliación silenciosa: no pisa el saldo optimista con el spinner,
      // solo lo reemplaza por el valor real cuando llega.
      walletApi
        .getWallet()
        .then((w) => setWallet(w))
        .catch(() => {
          /* si falla, se queda el valor optimista hasta el próximo refresh */
        });
    };
    window.addEventListener(WALLET_REFRESH_EVENT, handler);
    return () => window.removeEventListener(WALLET_REFRESH_EVENT, handler);
  }, [refetch]);

  // Ajuste optimista: suma/resta al saldo mostrado sin esperar al servidor.
  // Es la única aritmética de dinero en el cliente en toda la app — a
  // propósito, y siempre transitoria: se reconcilia con WALLET_REFRESH_EVENT
  // apenas responde el servidor, o se revierte si la operación falla.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<WalletOptimisticDetail>).detail;
      if (!detail) return;
      setWallet((prev) => {
        if (!prev) return prev;
        const next = Number(prev.balance) + detail.deltaUsd;
        if (!Number.isFinite(next)) return prev;
        return { ...prev, balance: next.toFixed(2) };
      });
    };
    window.addEventListener(WALLET_OPTIMISTIC_EVENT, handler);
    return () => window.removeEventListener(WALLET_OPTIMISTIC_EVENT, handler);
  }, []);

  return { wallet, loading, error, refetch };
}
