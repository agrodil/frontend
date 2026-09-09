import { useEffect, useState } from "react";
import { catalogApi } from "@/api/clients/catalog.api";
import type { SelectOption } from "@/presentation/interfaces/ui/FormProps";

const ANIMALES_ID = 1;

export type CatalogState = {
  categories: SelectOption[];
  livestockSectors: SelectOption[];
  // Solo Animales tiene subcategorías (razas) hoy — ver
  // docs/Post-Restructure-Implementation-Plan.md en agrodil-database. Si el
  // catálogo crece a otras categorías, este hook debe pasar a resolver por
  // categoría en vez de precargar una sola.
  livestockSubcategories: SelectOption[];
  // Planes de publicación (posting_fee): value = posting_fee_id (uuid), label =
  // duración, sublabel = precio (+ descuento de renovación si aplica).
  postingFees: SelectOption[];
  isLoading: boolean;
  error: string | null;
};

const durationLabel = (days: number): string => {
  const months = Math.round(days / 30);
  if (months >= 1) return months === 1 ? "1 mes" : `${months} meses`;
  return days === 1 ? "1 día" : `${days} días`;
};

const priceLabel = (usd: string): string => {
  const n = Number(usd);
  if (!Number.isFinite(n) || n === 0) return "Gratis";
  return `$${Number.isInteger(n) ? n : n.toFixed(2)}`;
};

const postingFeeSublabel = (fee: {
  price_usd: string;
  renewal_discount_percentage: string;
}): string => {
  const discount = Number(fee.renewal_discount_percentage);
  const price = priceLabel(fee.price_usd);
  return discount > 0
    ? `${price} · renovación -${Number.isInteger(discount) ? discount : discount.toFixed(1)}%`
    : price;
};

// Catálogo de post (categorías/subcategorías/sectores) — vive en la DB, se
// trae una sola vez al montar. Mismo motivo que townshipsByState: pocas filas,
// bajo movimiento, no justifica refetch por interacción.
export const useCatalog = (): CatalogState => {
  const [state, setState] = useState<CatalogState>({
    categories: [],
    livestockSectors: [],
    livestockSubcategories: [],
    postingFees: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      catalogApi.getPostCategories(),
      catalogApi.getLivestockSectors(),
      catalogApi.getPostSubcategories(ANIMALES_ID),
      catalogApi.getPostingFees(),
    ])
      .then(([categories, sectors, subcategories, postingFees]) => {
        if (cancelled) return;
        setState({
          categories: categories.map((c) => ({
            value: c.post_category_id,
            label: c.post_category_name,
          })),
          livestockSectors: sectors.map((s) => ({
            value: s.livestock_sector_id,
            label: s.livestock_sector_name,
          })),
          livestockSubcategories: subcategories.map((s) => ({
            value: s.post_subcategory_id,
            label: s.post_subcategory_name,
          })),
          postingFees: postingFees.map((f) => ({
            value: f.posting_fee_id,
            label: durationLabel(f.duration_days),
            sublabel: postingFeeSublabel(f),
          })),
          isLoading: false,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            err instanceof Error
              ? err.message
              : "No se pudo cargar el catálogo",
        }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};
