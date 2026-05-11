export interface PostsPost {
  livestock_post_id: string;
  livestock_post_name: string;
  posted_by: string;
  sale_type_id: number;
  avg_weight_kg: number | null;
  price_per_kg: number | null;
  price_per_unit: number | null;
  main_image_url?: string | null;
}
