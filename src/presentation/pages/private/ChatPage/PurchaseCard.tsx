import { useState, type FC } from "react";
import { LuImageOff } from "react-icons/lu";
import { sales } from "@/shared/constants/sale-types.catalog";
import { formatChatTime } from "@/shared/utils/formatChatTime";
import {
  PURCHASE_STATUS_APPROVED,
  PURCHASE_STATUS_REJECTED,
  PURCHASE_STATUS_CANCELLED,
} from "@/shared/constants/purchase-status.catalog";
import type { PurchaseCardProps } from "./PurchaseCardProps";

const PurchaseCard: FC<PurchaseCardProps> = ({
  msg,
  card,
  isOwn,
  freshPost,
  freshMedia,
  cardStatus,
  actionLoading,
  onCardClick,
  onConfirmSale,
  onRejectPurchase,
  onCancelPurchase,
}) => {
  const [imgBroken, setImgBroken] = useState(false);

  const displayTitle = freshPost?.post_name ?? card.title;
  const displaySaleTypeId = freshPost?.sale_type_id ?? card.saleTypeId;
  const displayPrice = freshPost
    ? (freshPost.price_per_kg ?? freshPost.price_per_unit ?? card.price)
    : card.price;
  const imgSrc = freshMedia?.url || card.img || null;
  const imgIsVideo = freshMedia ? freshMedia.isVideo : false;

  // El card lo envía el comprador; quien NO lo envió es el vendedor.
  const isSeller = !isOwn;
  const hasPurchaseRequestId = Boolean(card.purchaseRequestId);
  const isResolved =
    cardStatus === PURCHASE_STATUS_APPROVED ||
    cardStatus === PURCHASE_STATUS_REJECTED ||
    cardStatus === PURCHASE_STATUS_CANCELLED;
  const showActions = hasPurchaseRequestId && freshPost && !isResolved;

  return (
    <div className="max-w-[75%] flex flex-col gap-1">
      <div className="flex flex-col gap-2">
        <div
          className={`rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
            isResolved ? "opacity-50 grayscale" : ""
          }`}
          onClick={() => onCardClick(msg, card)}
        >
          {isResolved && (
            <div className="px-3 pt-2">
              <span
                className={`text-[10px] font-bold uppercase ${
                  cardStatus === PURCHASE_STATUS_APPROVED
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {cardStatus === PURCHASE_STATUS_APPROVED
                  ? "Vendida"
                  : cardStatus === PURCHASE_STATUS_REJECTED
                    ? "Rechazada"
                    : "Cancelada"}
              </span>
            </div>
          )}
          <div className="w-48 h-36 relative bg-gray-100">
            {imgSrc && !imgBroken ? (
              imgIsVideo ? (
                <video
                  src={imgSrc}
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => setImgBroken(true)}
                />
              ) : (
                <img
                  src={imgSrc}
                  alt={displayTitle}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => setImgBroken(true)}
                />
              )
            ) : (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <LuImageOff size={28} className="text-primary/40" />
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="text-[10px] text-gray-500 uppercase font-semibold">
              {sales[displaySaleTypeId] ?? "—"}
            </p>
            <p className="font-bold text-xs text-gray-900 truncate">
              {displayTitle}
            </p>
            <p className="font-black text-sm text-gray-900">
              US $
              {(() => {
                const n = Number(displayPrice);
                return Number.isInteger(n) ? n : n.toFixed(2);
              })()}
            </p>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2 w-48">
            {isSeller ? (
              <>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    onConfirmSale(card.purchaseRequestId, freshPost)
                  }
                  className="flex-1 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar venta
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    onRejectPurchase(card.purchaseRequestId, freshPost)
                  }
                  className="flex-1 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Rechazar
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() =>
                  onCancelPurchase(card.purchaseRequestId, freshPost)
                }
                className="flex-1 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar solicitud
              </button>
            )}
          </div>
        )}
      </div>
      <span
        className={`text-[10px] text-gray-400 ${isOwn ? "text-right" : "text-left"}`}
      >
        {formatChatTime(msg.created_at)}
        {isOwn && <span className="ml-1">{msg.is_read ? "✓✓" : "✓"}</span>}
      </span>
    </div>
  );
};

export default PurchaseCard;
