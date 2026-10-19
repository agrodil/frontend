import { useCallback, useEffect, useState } from "react";
import {
  walletApi,
  type DepositReceiptDetailRow,
  type DepositReviewResult,
} from "@/api/clients/wallet.api";
import type { DepositStatus } from "@/shared/constants/deposit-status.catalog";

const PAGE_SIZE = 20;

// Cola de comprobantes para revisión (admin). Filtro por estado, "cargar más",
// y mutación optimista al aprobar/rechazar. Mismo patrón que
// useAdminTroubleshooting.
export const useAdminDeposits = () => {
  const [items, setItems] = useState<DepositReceiptDetailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [statusFilter, setStatusFilterState] = useState<DepositStatus | null>(
    "pending",
  );

  const load = useCallback(
    async (status: DepositStatus | null, offset: number, append: boolean) => {
      try {
        const result = await walletApi.listDeposits({
          status,
          limit: PAGE_SIZE,
          offset,
        });
        setItems((prev) =>
          append ? [...prev, ...result.items] : result.items,
        );
        setHasMore(result.pagination.hasMore);
        setError(null);
      } catch {
        setError("No se pudo cargar la cola de comprobantes.");
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
      .listDeposits({ status: "pending", limit: PAGE_SIZE, offset: 0 })
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setHasMore(result.pagination.hasMore);
      })
      .catch(() => {
        if (!cancelled)
          setError("No se pudo cargar la cola de comprobantes.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setStatusFilter = (status: DepositStatus | null) => {
    setStatusFilterState(status);
    setItems([]);
    setLoading(true);
    void load(status, 0, false);
  };

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    void load(statusFilter, items.length, true);
  };

  // Aprueba/rechaza y saca la fila de la vista actual (que suele filtrar por
  // "pending"). Devuelve el resultado para que el modal muestre el nuevo saldo.
  const reviewDeposit = async (
    id: string,
    status: "completed" | "rejected",
  ): Promise<DepositReviewResult> => {
    try {
      const result = await walletApi.reviewDeposit(id, status);
      setItems((prev) =>
        prev.filter((d) => d.deposit_receipt_id !== id),
      );
      return result;
    } catch (err) {
      // Carrera: el comprobante ya no está pendiente. Recarga la lista.
      void load(statusFilter, 0, false);
      throw err;
    }
  };

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    statusFilter,
    setStatusFilter,
    loadMore,
    reviewDeposit,
  };
};
