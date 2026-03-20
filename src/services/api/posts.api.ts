import { url } from "..";
import { fetchWithAuth } from "./fetchWithAuth";

export type PostDetail = {
  livestock_post_id: string;
  livestock_type_id: number;
  livestock_post_name: string;
  posted_by: string;
  breed_id: number;
  sector_id: number;
  sale_type_id: number;
  sex: string;
  quantity: number;
  avg_weight_kg: number | null;
  price_per_kg: number | null;
  price_per_unit: number | null;
  township_id: number;
  details: string | null;
  created_at: string;
  updated_at: string;
  main_image_s3_key?: string | null;
};

export type PostsPost = {
  livestock_post_id: string;
  livestock_post_name: string;
  posted_by: string;
  sale_type_id: number;
  avg_weight_kg: number | null;
  price_per_kg: number | null;
  price_per_unit: number | null;
  main_image_url?: string | null;
};

export type PostsSearchResult = {
  livestock_post_id: string;
  livestock_post_name: string;
  posted_by: string;
  posted_by_name: string;
  relevance: number;
  sale_type_id: number;
  avg_weight_kg: number | null;
  price_per_kg: number | null;
  price_per_unit: number | null;
  main_image_url: string | null;
};

export type PostsPagination = {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export const postApi = {
  uploadPost: async (data: FormData) => {
    const response = await fetchWithAuth("/posts/", {
      method: "POST",
      body: data,
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(JSON.stringify(json.message ?? json));
    }
    return json.data;
  },

  getAllPosts: async (
    limit?: number,
    offset?: number,
  ): Promise<{ items: PostsPost[]; pagination: PostsPagination }> => {
    const params = new URLSearchParams();
    if (limit !== undefined) params.set("limit", String(limit));
    if (offset !== undefined) params.set("offset", String(offset));
    const response = await fetch(`${url}/posts?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch posts");
    const json = await response.json();
    return json.data;
  },

  getPostById: async (id: string): Promise<PostDetail> => {
    const response = await fetch(`${url}/posts/${id}`);
    if (!response.ok) throw new Error("Failed to fetch post");
    const json = await response.json();
    return json.data;
  },

  searchPosts: async (
    q: string,
    limit?: number,
    offset?: number,
  ): Promise<{ items: PostsSearchResult[]; pagination: PostsPagination }> => {
    const params = new URLSearchParams({ q });
    if (limit !== undefined) params.set("limit", String(limit));
    if (offset !== undefined) params.set("offset", String(offset));
    const response = await fetch(`${url}/posts/search?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to search posts");
    const json = await response.json();
    return json.data;
  },
};
