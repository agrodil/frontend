import { fetchWithAuth } from "../fetchWithAuth";

export type CreatePurchaseRequestPayload = {
  livestockPostId: string;
  potentialBuyer: string;
  potentialBuyerName: string;
  requestedQuantity: number;
  message?: string;
};

export const purchaseApi = {
  createPurchaseRequest: async (
    payload: CreatePurchaseRequestPayload,
  ): Promise<void> => {
    const response = await fetchWithAuth("/purchase", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error("[purchase] createPurchaseRequest failed", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
      throw new Error(
        `Failed to create purchase request (status ${response.status})`,
      );
    }
  },
};
