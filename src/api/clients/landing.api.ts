import { url } from "..";

export type LandingPost = {
  post_id: string;
  post_name: string;
  post_category_id: number;
  sale_type_id: number | null;
  price_per_kg: number | null;
  price_per_unit: number | null;
  farm_hectares: number | null;
  price_per_hectare: number | null;
  main_image_url: string | null;
  owner_name: string;
  township_id: number | null;
};

export const landingApi = {
  getLandingPage: async (): Promise<LandingPost[]> => {
    const response = await fetch(`${url}/posts/latest`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch landing posts");
    const json = await response.json();
    return json.data;
  },
};
