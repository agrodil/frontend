import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPurchaseRequest } from "@/routes/actions/purchase.actions";
import { notificationsApi } from "@/services/api/notifications.api";
import { fullName } from "@/utils/fullName";
import type { PostDetail } from "@/interfaces/api/posts/PostDetail.interface";
import type { User } from "@/interfaces/auth/AuthProps";

export const usePostPurchase = () => {
  const navigate = useNavigate();
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async (
    post: PostDetail,
    user: User,
    previewOwner: string | null,
    previewImg: string | null,
  ) => {
    setBuying(true);
    setError(null);
    try {
      const price =
        post.sale_type_id === 1 ? post.price_per_kg : post.price_per_unit;

      await createPurchaseRequest({
        livestockPostId: post.livestock_post_id,
        potentialBuyer: user.id,
        potentialBuyerName: fullName(user),
        requestedQuantity: 1,
      });

      const cardMessage = JSON.stringify({
        __type: "PURCHASE_CARD",
        title: post.livestock_post_name,
        saleTypeId: post.sale_type_id,
        price: Number(price ?? 0),
        owner: previewOwner ?? "",
        img: previewImg ?? "",
      });

      await notificationsApi.createNotification({
        sentTo: post.posted_by,
        livestockPostId: post.livestock_post_id,
        purchaseNotificationTypeId: 1,
        message: cardMessage,
      });

      await notificationsApi.createNotification({
        sentTo: post.posted_by,
        livestockPostId: post.livestock_post_id,
        purchaseNotificationTypeId: 2,
        message: `Has recibido una nueva solicitud de compra de ${fullName(user)}`,
      });

      navigate("/notifications", {
        state: {
          openChatWith: post.posted_by,
          sellerName: previewOwner ?? "Vendedor",
        },
      });
    } catch {
      setError("Error al enviar la solicitud. Intenta de nuevo.");
      setBuying(false);
      throw new Error("Purchase request failed");
    }
  };

  return { buying, error, handleBuy, setBuying, setError };
};
