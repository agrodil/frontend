export interface PurchaseCardPayload {
  __type: "PURCHASE_CARD";
  purchaseRequestId: string;
  postedBy: string;
  title: string;
  saleTypeId: number;
  price: number;
  owner: string;
  img: string | null;
}

export interface PurchaseStatusPayload {
  __type: "PURCHASE_STATUS";
  purchaseRequestId: string;
  status: number;
  title: string;
}

export const parsePurchaseCard = (text: string): PurchaseCardPayload | null => {
  try {
    const parsed = JSON.parse(text);
    if (parsed.__type === "PURCHASE_CARD") return parsed as PurchaseCardPayload;
  } catch {
    /* not a card */
  }
  return null;
};

export const parsePurchaseStatus = (
  text: string,
): PurchaseStatusPayload | null => {
  try {
    const parsed = JSON.parse(text);
    if (parsed.__type === "PURCHASE_STATUS")
      return parsed as PurchaseStatusPayload;
  } catch {
    /* not a status update */
  }
  return null;
};
