import { purchaseApi } from "../../services/api/purchase.api";
import type { CreatePurchaseRequestPayload } from "../../services/api/purchase.api";

export const createPurchaseRequest = async (
  payload: CreatePurchaseRequestPayload,
): Promise<void> => purchaseApi.createPurchaseRequest(payload);
