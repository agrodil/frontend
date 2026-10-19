import { STATE_LABELS } from "@/shared/constants/state.catalog";
import { TOWNSHIP_BY_ID } from "@/shared/constants/townships.catalog";

export interface ResolvedLocation {
  township: string;
  state: string;
}

/**
 * Resuelve un township_id del backend a los nombres de municipio y estado usando
 * el catálogo local. Devuelve null si el id es nulo o no está en el catálogo,
 * para que quien lo consuma pueda omitir la ubicación en vez de mostrar basura.
 */
export const resolveLocation = (
  townshipId?: number | null,
): ResolvedLocation | null => {
  if (townshipId == null) return null;

  const township = TOWNSHIP_BY_ID[townshipId];
  if (!township) return null;

  const state = STATE_LABELS[township.stateId];
  if (!state) return null;

  return { township: township.name, state };
};

/** Formato corto para mostrar en una línea: "Maracaibo, Zulia". */
export const formatLocation = (townshipId?: number | null): string | null => {
  const location = resolveLocation(townshipId);
  return location ? `${location.township}, ${location.state}` : null;
};
