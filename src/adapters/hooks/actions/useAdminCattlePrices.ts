import { useEffect, useState } from "react";
import {
  adminApi,
  type AdminCattlePriceAverage,
  type UpdateCattlePriceAverageInput,
} from "@/api/clients/admin.api";

// Precio promedio de ganado (en pie / en canal), control manual — ver
// agrodil-database migrations/029-livestock-species-categories-manual-pricing.sql.
export const useAdminCattlePrices = () => {
  const [averages, setAverages] = useState<AdminCattlePriceAverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .getCattlePriceAverages()
      .then((rows) => {
        if (!cancelled) setAverages(rows);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar los precios.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Devuelve un error legible (string) o null si salió bien.
  const update = async (
    postSubcategoryId: number,
    input: UpdateCattlePriceAverageInput,
  ): Promise<string | null> => {
    try {
      const row = await adminApi.updateCattlePriceAverage(
        postSubcategoryId,
        input,
      );
      setAverages((prev) =>
        prev.map((a) =>
          a.post_subcategory_id === postSubcategoryId ? row : a,
        ),
      );
      return null;
    } catch (err) {
      return err instanceof Error
        ? err.message
        : "No se pudo actualizar el precio.";
    }
  };

  return { averages, loading, error, update };
};
