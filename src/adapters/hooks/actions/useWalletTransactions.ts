import { useCallback, useEffect, useState } from "react";
import {
  walletApi,
  type WalletTransactionRow,
} from "@/api/clients/wallet.api";
import type { WalletTransactionType } from "@/shared/constants/wallet-transaction-type.catalog";

const PAGE_SIZE = 20;

// Ledger paginado tipo "cargar más" con filtro por tipo de movimiento. Reusa el
// contrato limit/offset + hasMore del backend. Mismo patrón que
// useAdminTroubleshooting.
export const useWalletTransactions = () => {
  const [items, setItems] = useState<WalletTransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [typeFilter, setTypeFilterState] = useState<WalletTransactionType | null>(
    null,
  );

  const load = useCallback(
    async (
      type: WalletTransactionType | null,
      offset: number,
      append: boolean,
    ) => {
      try {
        const result = await walletApi.getTransactions({
          type,
          limit: PAGE_SIZE,
          offset,
        });
        setItems((prev) =>
          append ? [...prev, ...result.items] : result.items,
        );
        setHasMore(result.pagination.hasMore);
        setError(null);
      } catch {
        setError("No se pudo cargar el historial de movimientos.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    walletApi
      .getTransactions({ type: null, limit: PAGE_SIZE, offset: 0 })
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setHasMore(result.pagination.hasMore);
      })
      .catch(() => {
        if (!cancelled)
          setError("No se pudo cargar el historial de movimientos.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setTypeFilter = (type: WalletTransactionType | null) => {
    setTypeFilterState(type);
    setItems([]);
    setLoading(true);
    void load(type, 0, false);
  };

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    void load(typeFilter, items.length, true);
  };

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    typeFilter,
    setTypeFilter,
    loadMore,
  };
};
