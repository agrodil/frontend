import { url } from "..";

export type PostCategory = {
  post_category_id: number;
  post_category_name: string;
  post_category_description: string | null;
};

export type PostSubcategory = {
  post_subcategory_id: number;
  post_subcategory_name: string;
  post_subcategory_description: string | null;
  post_category_id: number;
};

export type LivestockSector = {
  livestock_sector_id: number;
  livestock_sector_name: string;
  livestock_sector_description: string | null;
};

export type PostingFee = {
  posting_fee_id: string;
  duration_days: number;
  price_usd: string;
  renewal_discount_percentage: string;
};

// Precio de referencia por kg, por subcategoría (ej. Maute, Novillo), en pie
// (animal vivo) y en canal (animal faenado). Cargado a mano desde el panel
// de administración — ver backend migrations/029.
export type CattlePriceAverage = {
  post_subcategory_id: number;
  post_subcategory_name: string;
  avg_price_per_kg_live: string | null;
  avg_price_per_kg_carcass: string | null;
  updated_at: string;
};

const getJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${url}${path}`);
  if (!response.ok) throw new Error(`Failed to fetch ${path}`);
  const json = await response.json();
  return json.data as T;
};

export const catalogApi = {
  getPostCategories: () => getJson<PostCategory[]>("/catalog/post-categories"),
  getPostSubcategories: (categoryId: number) =>
    getJson<PostSubcategory[]>(
      `/catalog/post-subcategories?categoryId=${categoryId}`,
    ),
  getLivestockSectors: () =>
    getJson<LivestockSector[]>("/catalog/livestock-sectors"),
  getPostingFees: () => getJson<PostingFee[]>("/catalog/posting-fees"),
  getCattlePriceAverages: () =>
    getJson<CattlePriceAverage[]>("/catalog/cattle-price-averages"),
  // Tasa vigente, para estimar en USD un monto cargado en Bs (ej. depósito)
  // antes de confirmar. El backend recalcula con la tasa exacta al cobrar.
  getUsdRate: () => getJson<{ usd_rate: number }>("/catalog/usd-rate"),
};
