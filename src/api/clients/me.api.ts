import { url } from "..";
import { fetchWithAuth } from "../fetchWithAuth";

export type MePost = {
  post_id: string;
  post_name: string;
  post_category_id: number;
  avg_weight_kg: number | null;
  price_per_kg: number | null;
  price_per_unit: number | null;
  farm_hectares: number | null;
  price_per_hectare: number | null;
  sale_type_id: number | null;
  created_at: string;
  main_image_url: string | null;
  is_active: boolean;
  township_id: number | null;
};

export type MeStat = {
  value: string;
  label: string;
};

export type MyPostsPagination = {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

const authGet = async (endpoint: string) => {
  const response = await fetch(`${url}${endpoint}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Not authenticated");
  const json = await response.json();
  return json.data;
};

export const meApi = {
  getMe: () => authGet("/auth/me"),
  getUserById: (id: string) => authGet(`/users/${id}`),
  getMyDeactivatedPosts: async (
    limit: number,
    offset: number,
  ): Promise<{ items: MePost[]; pagination: MyPostsPagination }> => {
    const response = await fetchWithAuth(
      `/posts/me?active=false&limit=${limit}&offset=${offset}`,
    );
    if (!response.ok) throw new Error("Failed to fetch deactivated posts");
    const json = await response.json();
    return json.data;
  },
  getMyPosts: async (
    limit: number,
    offset: number,
  ): Promise<{ items: MePost[]; pagination: MyPostsPagination }> => {
    const response = await fetchWithAuth(
      `/posts/me?limit=${limit}&offset=${offset}`,
    );
    if (!response.ok) throw new Error("Failed to fetch posts");
    const json = await response.json();
    return json.data;
  },
};
