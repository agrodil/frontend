import { useCallback, useEffect, useState } from "react";
import {
  walletApi,
  type DepositReceiptDetailRow,
} from "@/api/clients/wallet.api";
import type { DepositStatus } from "@/shared/constants/deposit-status.catalog";
import { WALLET_REFRESH_EVENT } from "./useWallet";

const PAGE_SIZE = 20;

// Comprobantes de depósito del propio usuario, paginado "cargar más". Sirve
// para mostrar los que están "en revisión" (aún no llegan al ledger). `status`
// opcional para acotar (p.ej. solo pending).
export const useMyDeposits = (status?: DepositStatus) => {
  const [items, setItems] = useState<DepositReceiptDetailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  const load = useCallback(
    async (offset: number, append: boolean) => {
      try {
        const result = await walletApi.getMyDeposits({
          status: status ?? null,
          limit: PAGE_SIZE,
          offset,
        });
        setItems((prev) =>
          append ? [...prev, ...result.items] : result.items,
        );
        setHasMore(result.pagination.hasMore);
        setError(null);
      } catch {
        setError("No se pudieron cargar tus depósitos.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [status],
  );

  useEffect(() => {
    let cancelled = false;
    walletApi
      .getMyDeposits({ status: status ?? null, limit: PAGE_SIZE, offset: 0 })
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setHasMore(result.pagination.hasMore);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar tus depósitos.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, reloadKey]);

  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener(WALLET_REFRESH_EVENT, handler);
    return () => window.removeEventListener(WALLET_REFRESH_EVENT, handler);
  }, [refetch]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    void load(items.length, true);
  };

  return { items, loading, loadingMore, error, hasMore, loadMore, refetch };
};
