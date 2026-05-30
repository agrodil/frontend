import { purchaseApi } from "@/api/clients/purchase.api";
import type { CreatePurchaseRequestPayload } from "@/api/clients/purchase.api";

export const createPurchaseRequest = async (
  payload: CreatePurchaseRequestPayload,
): Promise<void> => purchaseApi.createPurchaseRequest(payload);
