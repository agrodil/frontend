import { useCallback, useEffect, useState } from "react";
import {
  troubleshootingApi,
  type TroubleshootingReportRow,
} from "@/api/clients/troubleshooting.api";

const PAGE_SIZE = 20;

// Lista paginada tipo "cargar más" con filtro por tipo. Reusa el contrato
// limit/offset+hasMore del backend admin.
export const useAdminTroubleshooting = () => {
  const [items, setItems] = useState<TroubleshootingReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [typeFilter, setTypeFilterState] = useState<number | null>(null);

  // Solo setea estado dentro de callbacks async (nunca de forma síncrona) para
  // poder invocarse desde el efecto de montaje sin disparar cascadas de render.
  const load = useCallback(
    async (typeId: number | null, offset: number, append: boolean) => {
      try {
        const result = await troubleshootingApi.listReports(
          PAGE_SIZE,
          offset,
          typeId,
        );
        setItems((prev) =>
          append ? [...prev, ...result.items] : result.items,
        );
        setHasMore(result.pagination.hasMore);
        setError(null);
      } catch {
        setError("Error al cargar los reportes.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  // Carga inicial: cadena de promesa con setState solo en callbacks async
  // (patrón lint-clean del repo). El resto de cargas van por los handlers.
  useEffect(() => {
    let cancelled = false;
    troubleshootingApi
      .listReports(PAGE_SIZE, 0, null)
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setHasMore(result.pagination.hasMore);
      })
      .catch(() => {
        if (!cancelled) setError("Error al cargar los reportes.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setTypeFilter = (typeId: number | null) => {
    setTypeFilterState(typeId);
    setItems([]);
    setLoading(true);
    void load(typeId, 0, false);
  };

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    void load(typeFilter, items.length, true);
  };

  // Cambia el estado y refleja localmente sin recargar toda la lista.
  const updateStatus = async (id: string, statusId: number) => {
    await troubleshootingApi.updateStatus(id, statusId);
    setItems((prev) =>
      prev.map((r) =>
        r.troubleshooting_report_id === id
          ? { ...r, troubleshooting_status_id: statusId }
          : r,
      ),
    );
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
    updateStatus,
  };
};
