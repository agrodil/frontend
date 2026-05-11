import type { PostDetail } from "@/interfaces/api/posts/PostDetail.interface";
import { url } from "..";
import { fetchWithAuth } from "./fetchWithAuth";
import type { PostsPost } from "@/interfaces/api/posts/PostsPost.interface";
import type { UpdatePostPayload } from "@/interfaces/api/posts/UpdatePostPayload.interface";
import type { PostsSearchResult } from "@/interfaces/api/posts/PostsSearchResult.interface";

export type PostsPagination = {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export const postApi = {
  uploadPost: async (
    data: FormData,
  ): Promise<{
    livestockPostId: string;
    filesInfo: { success: boolean; message: string; uploadedCount: number };
  }> => {
    const response = await fetchWithAuth("/posts/", {
      method: "POST",
      body: data,
    });

    type UploadEnvelope = {
      message?: unknown;
      error?: unknown;
      data?: {
        livestockPostId: string;
        filesInfo: { success: boolean; message: string; uploadedCount: number };
      };
    };
    let json: UploadEnvelope = {};
    try {
      json = (await response.json()) as UploadEnvelope;
    } catch (parseError) {
      console.error(
        "[posts.api.uploadPost] No se pudo parsear la respuesta JSON",
        { status: response.status, parseError },
      );
    }

    if (!response.ok) {
      const message = json.message ?? json.error ?? json;
      const detail = Array.isArray(message)
        ? message.join("; ")
        : typeof message === "string"
          ? message
          : JSON.stringify(message);
      console.error("[posts.api.uploadPost] El backend respondió con error", {
        status: response.status,
        body: json,
      });
      throw new Error(`(${response.status}) ${detail}`);
    }

    if (!json.data) {
      console.error("[posts.api.uploadPost] Respuesta 2xx sin payload `data`", {
        body: json,
      });
      throw new Error("Respuesta inválida del servidor (data faltante)");
    }

    return json.data;
  },

  updatePost: async (
    id: string,
    data: UpdatePostPayload,
  ): Promise<PostDetail> => {
    const response = await fetchWithAuth(`/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(
        typeof json.message === "string"
          ? json.message
          : JSON.stringify(json.message ?? json),
      );
    }
    return json.data;
  },

  deactivatePost: async (id: string): Promise<PostDetail> => {
    const response = await fetchWithAuth(`/posts/${id}`, {
      method: "DELETE",
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(
        typeof json.message === "string"
          ? json.message
          : JSON.stringify(json.message ?? json),
      );
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
    console.log(response);
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
