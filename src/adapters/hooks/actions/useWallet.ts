import { useAuth } from "@/adapters/hooks/common/useAuth";
import type { UserWalletRow } from "@/api/clients/wallet.api";

// Evento global para forzar recarga del saldo tras un depósito acreditado o un
// ajuste (mismo patrón que "postUpdated" en post.actions.ts). Lo escucha
// AuthProvider (única fuente del saldo, ver AuthProvider.tsx), así que
// dispararlo desde cualquier lado (incluso fuera de un componente, como
// post.actions.ts) actualiza el saldo en toda la app a la vez.
// `detail.silent` pide un refetch sin pasar por `loading` (para no tapar un
// valor optimista con el spinner mientras se reconcilia con el servidor).
export const WALLET_REFRESH_EVENT = "wallet:refresh";

export interface WalletRefreshDetail {
  silent?: boolean;
}

// Evento global para aplicar un ajuste optimista al saldo (antes de que el
// servidor confirme). `deltaUsd` > 0 acredita, < 0 descuenta. AuthProvider lo
// aplica sobre el único saldo compartido, así el header y el sidebar mobile
// se actualizan a la vez. Si la operación falla, quien la disparó debe volver
// a emitir el evento con el signo invertido para revertir.
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

// Accessor del saldo — vive en AuthContext (ver AuthProvider.tsx), fetcheado
// una sola vez por sesión (login o resolve inicial), no en cada montaje de
// componente. `refetch` dispara el mismo WALLET_REFRESH_EVENT que ya
// escuchan otras partes de la app (ej. useMyDeposits), así se mantiene un
// solo mecanismo de sincronización cross-componente.
export function useWallet(): UseWalletResult {
  const { wallet, walletLoading } = useAuth();
  return {
    wallet,
    loading: walletLoading,
    error: null,
    refetch: () => dispatchWalletRefresh(),
  };
}
