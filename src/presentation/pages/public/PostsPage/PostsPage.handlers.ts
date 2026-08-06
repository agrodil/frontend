import type { Dispatch, SetStateAction } from "react";
import type { NavigateFunction } from "react-router-dom";
import type { LocationValue } from "@/presentation/interfaces/ui/LocationSelectsProps";
import type { PostsPost } from "@/api/interfaces/requests/PostsPost.interface";
import type { PostsSearchResult } from "@/api/interfaces/responses/PostsSearchResult.interface";
import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";

type PostsItems = (PostsPost | PostsSearchResult)[];

// Toda la búsqueda vive en la URL: cambiar un filtro navega, react-router vuelve
// a correr el loader y la petición se relanza sola. Sin `q` no hay filtros que
// aplicar, así que se descartan.
export const buildPostsUrl = (
  q: string,
  filters: LocationValue = { stateId: "", townshipId: "" },
): string => {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (q && filters.stateId) params.set("stateId", filters.stateId);
  if (q && filters.townshipId) params.set("townshipId", filters.townshipId);
  const qs = params.toString();
  return qs ? `/posts?${qs}` : "/posts";
};

export const handleSearch = (
  navigate: NavigateFunction,
  filters: LocationValue,
  val: string,
): void => {
  navigate(buildPostsUrl(val.trim(), filters));
};

export const handleFiltersChange = (
  navigate: NavigateFunction,
  query: string,
  next: LocationValue,
): void => {
  navigate(buildPostsUrl(query, next));
};

export const handleCardClick = (
  navigate: NavigateFunction,
  query: string,
  filters: LocationValue,
  cardId: string,
): void => {
  const params = new URLSearchParams(
    buildPostsUrl(query, filters).split("?")[1] ?? "",
  );
  params.set("postId", cardId);
  navigate(`/posts?${params.toString()}`);
};

export const handleModalClose = (
  navigate: NavigateFunction,
  query: string,
  filters: LocationValue,
): void => {
  navigate(buildPostsUrl(query, filters));
};

// Callback onUpdated del PostDetailModal: refleja la edición en el modal y en
// la card correspondiente del grid.
export const handlePostUpdated = (
  setPostDetail: Dispatch<SetStateAction<PostDetail | null>>,
  setItems: Dispatch<SetStateAction<PostsItems>>,
  updated: PostDetail,
): void => {
  setPostDetail(updated);
  setItems((prev) =>
    prev.map((item) =>
      item.post_id === updated.post_id
        ? {
            ...item,
            post_name: updated.post_name,
            sale_type_id: updated.sale_type_id,
            avg_weight_kg: updated.avg_weight_kg,
            price_per_kg: updated.price_per_kg,
            price_per_unit: updated.price_per_unit,
          }
        : item,
    ),
  );
};

// Callback onDeactivated del PostDetailModal: la publicación deja de listarse
// (ya no está activa) y se cierra el modal.
export const handlePostDeactivated = (
  setItems: Dispatch<SetStateAction<PostsItems>>,
  setPostDetail: Dispatch<SetStateAction<PostDetail | null>>,
  deactivatedId: string,
): void => {
  setItems((prev) =>
    prev.filter((item) => item.post_id !== deactivatedId),
  );
  setPostDetail(null);
};
