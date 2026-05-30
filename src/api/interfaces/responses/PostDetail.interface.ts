export interface PostDetail {
  livestock_post_id: string;
  livestock_type_id: number;
  livestock_post_name: string;
  posted_by: string;
  breed_id: number;
  breed_name: string;
  sector_id: number;
  sector_name: string;
  sale_type_id: number;
  sex: string;
  quantity: number;
  avg_weight_kg: number | null;
  price_per_kg: number | null;
  price_per_unit: number | null;
  township_id: number;
  details: string | null;
  created_at: string;
  updated_at: string;
  main_image_s3_key?: string | null;
}
