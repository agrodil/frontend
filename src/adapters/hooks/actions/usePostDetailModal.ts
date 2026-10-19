import { useState } from "react";
import { postApi } from "@/api/clients/posts.api";
import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";

export interface UsePostDetailModalResult {
  postDetail: PostDetail | null;
  selectedPostId: string | null;
  open: (postId: string) => Promise<void>;
  close: () => void;
  setPostDetail: (post: PostDetail) => void;
}

// Abre el PostDetailModal para una publicación propia (activa o desactivada),
// buscando el detalle completo por id. Mismo shape que usePostPreviewModal
// (usado en AdminChatPage), adaptado al flujo de MePage.
export function usePostDetailModal(): UsePostDetailModalResult {
  const [postDetail, setPostDetailState] = useState<PostDetail | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const open = async (postId: string) => {
    try {
      const detail = await postApi.getPostById(postId);
      setPostDetailState(detail);
      setSelectedPostId(postId);
    } catch (error) {
      console.error("Error loading post detail:", error);
    }
  };

  const close = () => {
    setPostDetailState(null);
    setSelectedPostId(null);
  };

  const setPostDetail = (post: PostDetail) => setPostDetailState(post);

  return { postDetail, selectedPostId, open, close, setPostDetail };
}
