import { useState } from "react";
import { postApi } from "@/api/clients/posts.api";
import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import type { Message } from "@/presentation/interfaces/pages/NotificationsPageLoaderData";

export type PurchaseCardPayload = {
  __type: "PURCHASE_CARD";
  purchaseRequestId: string;
  postedBy: string;
  title: string;
  saleTypeId: number;
  price: number;
  owner: string;
  img: string | null;
};

/**
 * Abre el `PostDetailModal` de un post a partir de la card de compra que
 * aparece embebida en un mensaje de chat.
 */
export const usePostPreviewModal = () => {
  const [selectedPost, setSelectedPost] = useState<{
    post: PostDetail;
    img: string | null;
    owner: string;
  } | null>(null);
  const [fetchingCardId, setFetchingCardId] = useState<string | null>(null);

  const handleCardClick = async (msg: Message, card: PurchaseCardPayload) => {
    if (!msg.post_id) return;
    setFetchingCardId(msg.purchase_notification_id);
    try {
      const post = await postApi.getPostById(msg.post_id);
      setSelectedPost({ post, img: card.img ?? null, owner: card.owner });
    } catch {
      /* post may be deactivated — silently ignore */
    } finally {
      setFetchingCardId(null);
    }
  };

  return {
    selectedPost,
    closePost: () => setSelectedPost(null),
    fetchingCardId,
    handleCardClick,
  };
};
