export interface PurchaseRequest {
  purchase_request_id: string;
  livestock_post_id: string;
  livestock_post_name: string;
  seller_id: string;
  seller_name: string;
  buyer_id: string;
  buyer_name: string;
  requested_quantity: number;
  purchase_status_id: number;
  purchase_status_name: string;
  request_date: string;
  resolution_date: string | null;
  sale_type_id: number;
  price_per_kg: number | null;
  price_per_unit: number | null;
  avg_weight_kg: number | null;
  breed_name: string | null;
}
