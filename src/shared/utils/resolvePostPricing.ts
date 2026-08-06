// IDs de post_category (agrodil-database/seeds/catalog/008-insert-post-categories.sql).
export const POST_CATEGORY = {
  GANADO_BOVINO: 1,
  MAQUINARIA: 2,
  FINCAS: 3,
  INSUMOS: 4,
  MINERALES: 5,
} as const;

const SALE_LABEL: Record<number, string> = {
  1: "Por Kilo",
  2: "Por Unidad",
};

export interface PostPricingInput {
  post_category_id: number;
  sale_type_id: number | null;
  price_per_kg: number | null;
  price_per_unit: number | null;
  farm_hectares?: number | null;
  price_per_hectare?: number | null;
}

export interface PostPricing {
  price: number;
  /** Subtítulo bajo el título (p.ej. "Por Kilo"). null = sin subtítulo. */
  priceLabel: string | null;
  /** Sufijo junto al precio (p.ej. "/ kg", "/ hectárea"). null = sin sufijo. */
  priceSuffix: string | null;
}

// price_per_unit se reutiliza como precio plano de Maquinaria e Insumos u
// Otros (ver models/post.sql) — por eso el caso default ya funciona sin
// lógica adicional para esas dos categorías.
export const resolvePostPricing = (post: PostPricingInput): PostPricing => {
  switch (post.post_category_id) {
    case POST_CATEGORY.GANADO_BOVINO:
      return {
        price:
          Number(
            post.sale_type_id === 1 ? post.price_per_kg : post.price_per_unit,
          ) || 0,
        priceLabel:
          post.sale_type_id != null
            ? (SALE_LABEL[post.sale_type_id] ?? null)
            : null,
        priceSuffix: post.sale_type_id === 1 ? "/ kg" : "/ unidad",
      };
    case POST_CATEGORY.FINCAS:
      return {
        price: Number(post.price_per_hectare) || 0,
        priceLabel: null,
        priceSuffix: "/ hectárea",
      };
    case POST_CATEGORY.MINERALES:
      return {
        price: Number(post.price_per_unit) || 0,
        priceLabel: null,
        priceSuffix: "/ saco",
      };
    default:
      return {
        price: Number(post.price_per_unit) || 0,
        priceLabel: null,
        priceSuffix: null,
      };
  }
};
