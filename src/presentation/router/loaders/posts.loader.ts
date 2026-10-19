import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import type { PostsPost } from "@/api/interfaces/requests/PostsPost.interface";
import type { PostsSearchResult } from "@/api/interfaces/responses/PostsSearchResult.interface";
import { postApi, type PostsPagination } from "@/api/clients/posts.api";
import type { LoaderFunctionArgs } from "react-router-dom";

export const POSTS_LIMIT = 20;

export type PostsPageLoaderData = {
  items: PostsPost[] | PostsSearchResult[];
  pagination: PostsPagination;
  query: string;
  stateId: string;
  townshipId: string;
  postDetail: PostDetail | null;
  postId: string | null;
};

// Solo se aceptan enteros positivos; cualquier otra cosa en la URL se descarta
// en vez de mandarse al backend, que respondería 400 por el @IsInt del DTO.
const readIdParam = (params: URLSearchParams, key: string): string => {
  const raw = params.get(key) ?? "";
  return /^\d+$/.test(raw) ? raw : "";
};

export const getPostsData = async ({
  request,
}: LoaderFunctionArgs): Promise<PostsPageLoaderData> => {
  const urlObj = new URL(request.url);
  const q = urlObj.searchParams.get("q") ?? "";
  const postId = urlObj.searchParams.get("postId") ?? null;

  // Los filtros de ubicación solo aplican a la búsqueda por texto; sin `q` la
  // página lista todo y no muestra el panel de filtros.
  const stateId = q ? readIdParam(urlObj.searchParams, "stateId") : "";
  const townshipId = q ? readIdParam(urlObj.searchParams, "townshipId") : "";

  try {
    const [listResult, postDetail] = await Promise.all([
      q
        ? postApi.searchPosts(q, POSTS_LIMIT, 0, {
            stateId: stateId ? Number(stateId) : undefined,
            townshipId: townshipId ? Number(townshipId) : undefined,
          })
        : postApi.getAllPosts(POSTS_LIMIT, 0),
      postId ? postApi.getPostById(postId).catch(() => null) : null,
    ]);

    return {
      items: listResult.items,
      pagination: listResult.pagination,
      query: q,
      stateId,
      townshipId,
      postDetail,
      postId,
    };
  } catch {
    return {
      items: [],
      pagination: { total: 0, limit: POSTS_LIMIT, offset: 0, hasMore: false },
      query: q,
      stateId,
      townshipId,
      postDetail: null,
      postId,
    };
  }
};
