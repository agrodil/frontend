import { useState } from "react";
import { purchaseApi } from "@/api/clients/purchase.api";
import { notificationsApi } from "@/api/clients/notifications.api";
import { postApi } from "@/api/clients/posts.api";
import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import type { ToastMode } from "@/presentation/interfaces/ui/ToastProps.interface";
import {
  PURCHASE_STATUS_APPROVED,
  PURCHASE_STATUS_REJECTED,
  PURCHASE_STATUS_CANCELLED,
} from "@/shared/constants/purchase-status.catalog";

interface ConfirmingSale {
  purchaseRequestId: string;
  postDetail: PostDetail;
}

export interface UsePurchaseSaleActionsResult {
  confirmingSale: ConfirmingSale | null;
  openConfirmSale: (purchaseRequestId: string, postDetail: PostDetail) => void;
  closeConfirmSale: () => void;
  postSalePost: PostDetail | null;
  clearPostSalePost: () => void;
  actionLoading: boolean;
  confirmSale: () => Promise<void>;
  rejectPurchase: (
    purchaseRequestId: string,
    postDetail: PostDetail,
  ) => Promise<void>;
  cancelPurchase: (
    purchaseRequestId: string,
    postDetail: PostDetail,
  ) => Promise<void>;
  deactivatePost: () => Promise<void>;
}

// Flujo de venta desde una purchase card: confirmar/rechazar/cancelar una
// solicitud (notificando el cambio de estado al otro usuario en el chat) y,
// tras confirmar, desactivar la publicación vendida. `onAfterStatusChange` se
// usa para refrescar los mensajes del chat después de cada notificación de
// estado creada.
export function usePurchaseSaleActions(
  otherUserId: string,
  onAfterStatusChange: () => void,
  notify: (mode: ToastMode, message: string) => void,
): UsePurchaseSaleActionsResult {
  const [confirmingSale, setConfirmingSale] = useState<ConfirmingSale | null>(
    null,
  );
  const [postSalePost, setPostSalePost] = useState<PostDetail | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const openConfirmSale = (purchaseRequestId: string, postDetail: PostDetail) =>
    setConfirmingSale({ purchaseRequestId, postDetail });

  const closeConfirmSale = () => {
    if (!actionLoading) setConfirmingSale(null);
  };

  const clearPostSalePost = () => setPostSalePost(null);

  const notifyStatusChange = (
    purchaseRequestId: string,
    postDetail: PostDetail,
    status: number,
  ) =>
    notificationsApi.createNotification({
      sentTo: otherUserId,
      postId: postDetail.post_id,
      purchaseNotificationTypeId: 2,
      message: JSON.stringify({
        __type: "PURCHASE_STATUS",
        purchaseRequestId,
        status,
        title: postDetail.post_name,
      }),
    });

  const confirmSale = async () => {
    if (!confirmingSale) return;
    setActionLoading(true);
    try {
      await purchaseApi.updatePurchaseRequest(confirmingSale.purchaseRequestId, {
        purchaseStatusId: PURCHASE_STATUS_APPROVED,
      });
      await notifyStatusChange(
        confirmingSale.purchaseRequestId,
        confirmingSale.postDetail,
        PURCHASE_STATUS_APPROVED,
      );
      setPostSalePost(confirmingSale.postDetail);
      setConfirmingSale(null);
      notify("success", "¡Venta confirmada exitosamente!");
      onAfterStatusChange();
    } catch {
      notify("error", "Error al confirmar la venta. Intenta de nuevo.");
    } finally {
      setActionLoading(false);
    }
  };

  const rejectPurchase = async (
    purchaseRequestId: string,
    postDetail: PostDetail,
  ) => {
    setActionLoading(true);
    try {
      await purchaseApi.updatePurchaseRequest(purchaseRequestId, {
        purchaseStatusId: PURCHASE_STATUS_REJECTED,
      });
      await notifyStatusChange(
        purchaseRequestId,
        postDetail,
        PURCHASE_STATUS_REJECTED,
      );
      notify("warning", "Solicitud rechazada.");
      onAfterStatusChange();
    } catch {
      notify("error", "Error al rechazar. Intenta de nuevo.");
    } finally {
      setActionLoading(false);
    }
  };

  const cancelPurchase = async (
    purchaseRequestId: string,
    postDetail: PostDetail,
  ) => {
    setActionLoading(true);
    try {
      await purchaseApi.updatePurchaseRequest(purchaseRequestId, {
        purchaseStatusId: PURCHASE_STATUS_CANCELLED,
      });
      await notifyStatusChange(
        purchaseRequestId,
        postDetail,
        PURCHASE_STATUS_CANCELLED,
      );
      notify("info", "Solicitud cancelada.");
      onAfterStatusChange();
    } catch {
      notify("error", "Error al cancelar. Intenta de nuevo.");
    } finally {
      setActionLoading(false);
    }
  };

  const deactivatePost = async () => {
    if (!postSalePost) return;
    setActionLoading(true);
    try {
      await postApi.deactivatePost(postSalePost.post_id);
      setPostSalePost(null);
      notify("info", "Publicación desactivada.");
    } catch {
      notify("error", "Error al desactivar. Intenta de nuevo.");
    } finally {
      setActionLoading(false);
    }
  };

  return {
    confirmingSale,
    openConfirmSale,
    closeConfirmSale,
    postSalePost,
    clearPostSalePost,
    actionLoading,
    confirmSale,
    rejectPurchase,
    cancelPurchase,
    deactivatePost,
  };
}
