import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPurchaseRequest } from "@/presentation/router/actions/purchase.actions";
import { notificationsApi } from "@/api/clients/notifications.api";
import { fullName } from "@/shared/utils/fullName";
import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import type { User } from "@/adapters/contexts/AuthProps";

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

      const { purchaseRequestId } = await createPurchaseRequest({
        postId: post.post_id,
        potentialBuyer: user.id,
        potentialBuyerName: fullName(user),
        requestedQuantity: 1,
      });

      const cardMessage = JSON.stringify({
        __type: "PURCHASE_CARD",
        purchaseRequestId,
        postedBy: post.posted_by,
        title: post.post_name,
        saleTypeId: post.sale_type_id,
        price: Number(price ?? 0),
        owner: previewOwner ?? "",
        img: previewImg ?? "",
      });

      try {
        await notificationsApi.createNotification({
          sentTo: post.posted_by,
          postId: post.post_id,
          purchaseNotificationTypeId: 1,
          message: cardMessage,
        });

        await notificationsApi.createNotification({
          sentTo: post.posted_by,
          postId: post.post_id,
          purchaseNotificationTypeId: 2,
          message: `Has recibido una nueva solicitud de compra de ${fullName(user)}`,
        });
      } catch (notifErr) {
        console.error("[purchase] notification step failed:", notifErr);
      }

      navigate(`/notifications/chat/${post.posted_by}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al enviar la solicitud. Intenta de nuevo.");
      }
      setBuying(false);
      console.error("[purchase] handleBuy failed:", err);
      throw new Error("Purchase request failed");
    }
  };

  return { buying, error, handleBuy, setBuying, setError };
};
