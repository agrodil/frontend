import { fetchWithAuth } from "../fetchWithAuth";
import type { PurchaseRequest } from "@/api/interfaces/responses/PurchaseRequest.interface";
import type { MyPostsPagination } from "./me.api";

export type CreatePurchaseRequestPayload = {
  postId: string;
  potentialBuyer: string;
  potentialBuyerName: string;
  requestedQuantity: number;
  message?: string;
};

export type UpdatePurchaseRequestPayload = {
  purchaseStatusId: number;
  requestedQuantity?: number;
  message?: string;
};

export type UpdatePurchaseRequestResult = {
  purchaseRequest: {
    purchase_request_id: string;
    post_id: string;
    potential_buyer: string;
    requested_quantity: number;
    purchase_status_id: number;
    message: string | null;
  };
  saleCreated: boolean;
  saleId: string | null;
};

export const purchaseApi = {
  createPurchaseRequest: async (
    payload: CreatePurchaseRequestPayload,
  ): Promise<{ purchaseRequestId: string }> => {
    const response = await fetchWithAuth("/purchase", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error("[purchase] createPurchaseRequest failed", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        body: errorBody,
      });
      throw new Error(
        `Failed to create purchase request (status ${response.status})`,
      );
    }
    const json = await response.json();
    return json.data ?? json;
  },

  getMyPurchaseRequests: async (
    limit: number,
    offset: number,
  ): Promise<{ items: PurchaseRequest[]; pagination: MyPostsPagination }> => {
    const response = await fetchWithAuth(
      `/purchase/me?limit=${limit}&offset=${offset}`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch purchase requests (status ${response.status})`,
      );
    }
    const json = await response.json();
    return json.data;
  },

  updatePurchaseRequest: async (
    id: string,
    payload: UpdatePurchaseRequestPayload,
  ): Promise<UpdatePurchaseRequestResult> => {
    const response = await fetchWithAuth(`/purchase/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error("[purchase] updatePurchaseRequest failed", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
      throw new Error(
        `Failed to update purchase request (status ${response.status})`,
      );
    }
    const json = await response.json();
    return json.data ?? json;
  },
};
