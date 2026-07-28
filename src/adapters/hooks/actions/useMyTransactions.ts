import { useEffect, useState } from "react";
import { purchaseApi } from "@/api/clients/purchase.api";
import type { PurchaseRequest } from "@/api/interfaces/responses/PurchaseRequest.interface";
import type { MyPostsPagination } from "@/api/clients/me.api";

const TRANSACTIONS_LIMIT = 20;

export interface UseMyTransactionsResult {
  transactions: PurchaseRequest[];
  pagination: MyPostsPagination | null;
  loading: boolean;
  loadingMore: boolean;
  loadMore: () => Promise<void>;
}

// Historial de transacciones. Carga perezosa: solo pide datos la primera vez
// que `enabled` (tab "transacciones" activo) pasa a true.
export function useMyTransactions(enabled: boolean): UseMyTransactionsResult {
  const [transactions, setTransactions] = useState<PurchaseRequest[]>([]);
  const [pagination, setPagination] = useState<MyPostsPagination | null>(
    null,
  );
  const [fetched, setFetched] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!enabled || fetched) return;
    let cancelled = false;
    purchaseApi
      .getMyPurchaseRequests(TRANSACTIONS_LIMIT, 0)
      .then((res) => {
        if (!cancelled) {
          setTransactions(Array.isArray(res?.items) ? res.items : []);
          setPagination(res?.pagination ?? null);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setFetched(true);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, fetched]);

  const loadMore = async () => {
    if (!pagination) return;
    setLoadingMore(true);
    try {
      const nextOffset = pagination.offset + pagination.limit;
      const { items, pagination: newPag } =
        await purchaseApi.getMyPurchaseRequests(
          TRANSACTIONS_LIMIT,
          nextOffset,
        );
      setTransactions((prev) => [
        ...prev,
        ...(Array.isArray(items) ? items : []),
      ]);
      setPagination(newPag ?? null);
    } catch {
      // silently ignore
    } finally {
      setLoadingMore(false);
    }
  };

  return {
    transactions,
    pagination,
    loading: enabled && !fetched,
    loadingMore,
    loadMore,
  };
}
