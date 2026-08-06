import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import { url } from "..";
import { fetchWithAuth } from "../fetchWithAuth";
import type { PostsPost } from "@/api/interfaces/requests/PostsPost.interface";
import type { UpdatePostPayload } from "@/api/interfaces/requests/UpdatePostPayload.interface";
import type { PostsSearchResult } from "@/api/interfaces/responses/PostsSearchResult.interface";

export type PostsPagination = {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

// Filtros opcionales de /posts/search. Cada campo ausente = sin filtrar.
export type SearchFilters = {
  stateId?: number;
  townshipId?: number;
};

// Metadatos que el cliente manda a /presign (antes de subir a S3).
export type PresignFileInput = {
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  isMainFile?: boolean;
  displayOrder?: number;
};

// URL presigned que devuelve el backend para subir un archivo a S3.
export type PresignedUpload = {
  fileName: string;
  s3Key: string;
  uploadUrl: string;
  contentType: string;
};

// Metadatos que el cliente manda a /confirm (después de subir a S3).
export type ConfirmFileInput = {
  s3Key: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  isMainFile?: boolean;
  displayOrder?: number;
};

type Envelope = { data?: unknown; message?: unknown; error?: unknown };

// El backend envuelve toda respuesta en { data }. Parsea el sobre y, si !ok,
// lanza con formato "(status) detalle" para que la UI lo muestre.
async function readEnvelope(
  response: Response,
  ctx: string,
): Promise<Envelope> {
  let json: Envelope = {};
  try {
    json = (await response.json()) as Envelope;
  } catch (parseError) {
    console.error(`[posts.api.${ctx}] No se pudo parsear JSON`, {
      status: response.status,
      parseError,
    });
  }

  if (!response.ok) {
    const message = json.message ?? json.error ?? json;
    const detail = Array.isArray(message)
      ? message.join("; ")
      : typeof message === "string"
        ? message
        : JSON.stringify(message);
    console.error(`[posts.api.${ctx}] El backend respondió con error`, {
      status: response.status,
      body: json,
    });
    throw new Error(`(${response.status}) ${detail}`);
  }

  return json;
}

export const postApi = {
  // Paso 1 del flujo presigned: crea el post (solo JSON, sin binarios) y
  // devuelve su id. El binario NO pasa por aquí.
  createPost: async (
    post: Record<string, unknown>,
  ): Promise<{ postId: string }> => {
    const formData = new FormData();
    formData.append("post", JSON.stringify(post));

    const response = await fetchWithAuth("/posts", {
      method: "POST",
      body: formData,
    });
    const json = await readEnvelope(response, "createPost");

    const id = (json.data as { postId?: string } | undefined)?.postId;
    if (!id) {
      throw new Error("Respuesta inválida del servidor (postId faltante)");
    }
    return { postId: id };
  },

  // Paso 2: pide URLs presigned PUT para subir los archivos del post a S3.
  presignPostFiles: async (
    postId: string,
    files: PresignFileInput[],
  ): Promise<{ uploads: PresignedUpload[]; expiresIn: number }> => {
    const response = await fetchWithAuth(`/posts/${postId}/files/presign`, {
      method: "POST",
      body: JSON.stringify({ files }),
    });
    const json = await readEnvelope(response, "presignPostFiles");
    return json.data as { uploads: PresignedUpload[]; expiresIn: number };
  },

  // Paso 3 (por archivo): sube el binario DIRECTO a S3 con la URL presigned.
  // fetch nativo (no fetchWithAuth): S3 no debe recibir nuestras credenciales,
  // y no pasa por el proxy Vercel → sin límite de 4.5MB.
  uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    if (!response.ok) {
      throw new Error(`Falló la subida a S3 (${response.status})`);
    }
  },

  // Paso 4: confirma las subidas para que el backend persista la metadata.
  confirmPostFiles: async (
    postId: string,
    files: ConfirmFileInput[],
  ): Promise<{ uploadedCount: number }> => {
    const response = await fetchWithAuth(`/posts/${postId}/files/confirm`, {
      method: "POST",
      body: JSON.stringify({ files }),
    });
    const json = await readEnvelope(response, "confirmPostFiles");
    const data = json.data as { files?: unknown[] } | undefined;
    return { uploadedCount: data?.files?.length ?? 0 };
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

  activatePost: async (id: string): Promise<PostDetail> => {
    const response = await fetchWithAuth(`/posts/${id}/activate`, {
      method: "PATCH",
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

  deletePost: async (id: string): Promise<void> => {
    const response = await fetchWithAuth(`/posts/${id}/permanent`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      throw new Error(
        typeof json.message === "string"
          ? json.message
          : `Failed to delete post (${response.status})`,
      );
    }
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
    filters?: SearchFilters,
  ): Promise<{ items: PostsSearchResult[]; pagination: PostsPagination }> => {
    const params = new URLSearchParams({ q });
    if (limit !== undefined) params.set("limit", String(limit));
    if (offset !== undefined) params.set("offset", String(offset));
    // Sin valor = sin filtro: el backend interpreta el parámetro ausente como
    // NULL y search_posts lo ignora.
    if (filters?.stateId) params.set("stateId", String(filters.stateId));
    if (filters?.townshipId)
      params.set("townshipId", String(filters.townshipId));
    const response = await fetch(`${url}/posts/search?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to search posts");
    const json = await response.json();
    return json.data;
  },
};
