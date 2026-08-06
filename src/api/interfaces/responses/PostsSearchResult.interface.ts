export interface PostsSearchResult {
  post_id: string;
  post_name: string;
  post_category_id: number;
  posted_by: string;
  posted_by_name: string;
  relevance: number;
  sale_type_id: number | null;
  avg_weight_kg: number | null;
  price_per_kg: number | null;
  price_per_unit: number | null;
  farm_hectares: number | null;
  price_per_hectare: number | null;
  main_image_url: string | null;
  township_id: number | null;
}
