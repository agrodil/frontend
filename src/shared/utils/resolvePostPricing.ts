// IDs de post_category (agrodil-database/seeds/catalog/008-insert-post-categories.sql).
// Las 5 especies de ganado son categorías de primer nivel (antes todas vivían
// bajo una única categoría "Animales", id 1 — Bovino la reutiliza).
export const POST_CATEGORY = {
  BOVINO: 1,
  MAQUINARIA: 2,
  FINCAS: 3,
  INSUMOS: 4,
  OVINO: 5,
  CAPRINO: 6,
  PORCINO: 7,
  EQUINO: 8,
} as const;

export const LIVESTOCK_CATEGORY_IDS: number[] = [
  POST_CATEGORY.BOVINO,
  POST_CATEGORY.OVINO,
  POST_CATEGORY.CAPRINO,
  POST_CATEGORY.PORCINO,
  POST_CATEGORY.EQUINO,
];

export const isLivestockCategory = (categoryId: number): boolean =>
  LIVESTOCK_CATEGORY_IDS.includes(categoryId);

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
  if (isLivestockCategory(post.post_category_id)) {
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
  }

  switch (post.post_category_id) {
    case POST_CATEGORY.FINCAS:
      return {
        price: Number(post.price_per_hectare) || 0,
        priceLabel: null,
        priceSuffix: "/ hectárea",
      };
    default:
      return {
        price: Number(post.price_per_unit) || 0,
        priceLabel: null,
        priceSuffix: null,
      };
  }
};
