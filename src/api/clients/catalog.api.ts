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
};
