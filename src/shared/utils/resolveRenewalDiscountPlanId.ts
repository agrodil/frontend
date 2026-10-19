import type { CatalogState } from "@/adapters/hooks/actions/useCatalog";

type RenewablePost = {
  renewal_count?: number;
  posting_fee_id?: string | null;
};

// Plan que aplica el descuento de primera renovación: misma duración que el
// plan original del post y ninguna renovación previa (ver
// renew_post.sql — el backend es la fuente de verdad, esto es solo un hint
// de UI). Si el plan original ya no está activo o no hay match exacto de
// duración entre los planes vigentes, no hay nada que resaltar.
export const resolveRenewalDiscountPlanId = (
  post: RenewablePost,
  catalog: Pick<CatalogState, "postingFees" | "postingFeeDurations">,
): string | null => {
  if ((post.renewal_count ?? 0) !== 0) return null;

  const originalFeeId = post.posting_fee_id;
  if (!originalFeeId) return null;

  const originalDuration = catalog.postingFeeDurations[originalFeeId];
  if (originalDuration == null) return null;

  const match = catalog.postingFees.find(
    (plan) =>
      catalog.postingFeeDurations[String(plan.value)] === originalDuration,
  );
  return match ? String(match.value) : null;
};
