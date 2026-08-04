import { url } from "..";

export type LandingPost = {
  livestock_post_id: string;
  livestock_post_name: string;
  sale_type_id: number;
  price_per_kg: number | null;
  price_per_unit: number | null;
  main_image_url: string | null;
  owner_name: string;
  township_id: number;
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
