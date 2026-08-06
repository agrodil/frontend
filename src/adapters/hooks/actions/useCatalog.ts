import { useEffect, useState } from "react";
import { catalogApi } from "@/api/clients/catalog.api";
import type { SelectOption } from "@/presentation/interfaces/ui/FormProps";

const GANADO_BOVINO_ID = 1;

export type CatalogState = {
  categories: SelectOption[];
  livestockSectors: SelectOption[];
  // Solo Ganado Bovino tiene subcategorías (razas) hoy — ver
  // docs/Post-Restructure-Implementation-Plan.md en agrodil-database. Si el
  // catálogo crece a otras categorías, este hook debe pasar a resolver por
  // categoría en vez de precargar una sola.
  livestockSubcategories: SelectOption[];
  isLoading: boolean;
  error: string | null;
};

// Catálogo de post (categorías/subcategorías/sectores) — vive en la DB, se
// trae una sola vez al montar. Mismo motivo que townshipsByState: pocas filas,
// bajo movimiento, no justifica refetch por interacción.
export const useCatalog = (): CatalogState => {
  const [state, setState] = useState<CatalogState>({
    categories: [],
    livestockSectors: [],
    livestockSubcategories: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      catalogApi.getPostCategories(),
      catalogApi.getLivestockSectors(),
      catalogApi.getPostSubcategories(GANADO_BOVINO_ID),
    ])
      .then(([categories, sectors, subcategories]) => {
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
