import { useState } from "react";
import {
  meApi,
  type MePost,
  type MyPostsPagination,
} from "@/api/clients/me.api";
import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";

export interface UseMyPostsResult {
  posts: MePost[];
  pagination: MyPostsPagination;
  loadingMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  applyUpdate: (updated: PostDetail) => void;
  removePost: (id: string) => void;
}

// Publicaciones activas del usuario. Se siembra con los datos del loader
// (getMeData) y expone las operaciones que el resto de la página necesita
// para mantenerlas en sync (paginar, refrescar tras activar un post desde la
// lista de desactivadas, reflejar una edición o remover al desactivar).
export function useMyPosts(
  initialPosts: MePost[],
  initialPagination: MyPostsPagination,
): UseMyPostsResult {
  const [posts, setPosts] = useState<MePost[]>(initialPosts);
  const [pagination, setPagination] =
    useState<MyPostsPagination>(initialPagination);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextOffset = pagination.offset + pagination.limit;
      const { items, pagination: newPagination } = await meApi.getMyPosts(
        pagination.limit,
        nextOffset,
      );
      setPosts((prev) => [...prev, ...items]);
      setPagination(newPagination);
    } finally {
      setLoadingMore(false);
    }
  };

  const refresh = async () => {
    const { items, pagination: newPag } = await meApi.getMyPosts(
      pagination.limit,
      0,
    );
    setPosts(items);
    setPagination(newPag);
  };

  const applyUpdate = (updated: PostDetail) => {
    setPosts((prev) =>
      prev.map((item) =>
        item.livestock_post_id === updated.livestock_post_id
          ? {
              ...item,
              livestock_post_name: updated.livestock_post_name,
              sale_type_id: updated.sale_type_id,
              avg_weight_kg: updated.avg_weight_kg,
              price_per_kg: updated.price_per_kg,
              price_per_unit: updated.price_per_unit,
            }
          : item,
      ),
    );
  };

  const removePost = (id: string) => {
    setPosts((prev) => prev.filter((item) => item.livestock_post_id !== id));
  };

  return {
    posts,
    pagination,
    loadingMore,
    loadMore,
    refresh,
    applyUpdate,
    removePost,
  };
}
