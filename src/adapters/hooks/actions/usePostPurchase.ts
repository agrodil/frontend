import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPurchaseRequest } from "@/presentation/router/actions/purchase.actions";
import { notificationsApi } from "@/api/clients/notifications.api";
import { fullName } from "@/shared/utils/fullName";
import { resolvePostPricing } from "@/shared/utils/resolvePostPricing";
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
      // sale_type_id (por kg / por unidad) solo existe para ganado — Fincas
      // usa price_per_hectare, Maquinaria/Insumos usan price_per_unit como
      // precio plano. resolvePostPricing ya conoce esa distinción por
      // categoría (mismo resolver que usa la card de la lista); calcularlo a
      // mano acá con solo sale_type_id daba $0 para Fincas.
      const { price } = resolvePostPricing(post);

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
        price,
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
