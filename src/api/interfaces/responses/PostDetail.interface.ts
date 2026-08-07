export interface PostDetail {
  post_id: string;
  post_category_id: number;
  post_name: string;
  posted_by: string;

  // Animales (post_category_id = 1)
  post_subcategory_id: number | null;
  post_subcategory_name?: string | null;
  livestock_sector_id: number | null;
  livestock_sector_name?: string | null;
  sale_type_id: number | null;
  sex: string | null;
  quantity: number | null;
  avg_weight_kg: number | null;
  price_per_kg: number | null;

  // Reutilizado: precio "por unidad" de Animales, y precio plano de
  // Maquinarias e Implementos / Insumos u Otros.
  price_per_unit: number | null;

  // Maquinarias e Implementos (post_category_id = 2)
  post_brand: string | null;

  // Fincas (post_category_id = 3)
  farm_hectares: number | null;
  price_per_hectare: number | null;

  township_id: number | null;
  details: string | null;
  created_at: string;
  updated_at: string;
  main_image_s3_key?: string | null;
  is_active?: boolean;
}
