import type { FC } from "react";
import { motion } from "framer-motion";
import { formatChatTime } from "@/shared/utils/formatChatTime";
import {
  parsePurchaseCard,
  parsePurchaseStatus,
} from "@/shared/utils/parsePurchaseMessage";
import {
  PURCHASE_STATUS_APPROVED,
  PURCHASE_STATUS_REJECTED,
} from "@/shared/constants/purchase-status.catalog";
import PurchaseCard from "./PurchaseCard";
import type { ChatMessageBubbleProps } from "./ChatMessageBubbleProps";

const ANIMATION = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.15 },
};

const ChatMessageBubble: FC<ChatMessageBubbleProps> = ({
  msg,
  isOwn,
  freshCardImages,
  freshCardPosts,
  purchaseStatusMap,
  actionLoading,
  onCardClick,
  onConfirmSale,
  onRejectPurchase,
  onCancelPurchase,
}) => {
  const card = parsePurchaseCard(msg.message);
  const statusMsg = parsePurchaseStatus(msg.message);
  const freshPost = msg.post_id ? freshCardPosts[msg.post_id] : undefined;
  const freshMedia = msg.post_id ? freshCardImages[msg.post_id] : undefined;
  const purchaseStatus = card?.purchaseRequestId
    ? purchaseStatusMap[card.purchaseRequestId]
    : undefined;

  // Cambio de estado: línea de sistema centrada (trazabilidad en el chat).
  if (statusMsg) {
    return (
      <motion.div {...ANIMATION} className="flex justify-center">
        <span
          className={`text-[11px] rounded-full px-3 py-1 border ${
            statusMsg.status === PURCHASE_STATUS_APPROVED
              ? "text-green-700 bg-green-50 border-green-200"
              : "text-gray-500 bg-gray-100 border-gray-200"
          }`}
        >
          {statusMsg.status === PURCHASE_STATUS_APPROVED
            ? `Venta confirmada · ${statusMsg.title}`
            : statusMsg.status === PURCHASE_STATUS_REJECTED
              ? `Solicitud rechazada · ${statusMsg.title}`
              : `Solicitud cancelada · ${statusMsg.title}`}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      {...ANIMATION}
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
    >
      {card ? (
        <PurchaseCard
          msg={msg}
          card={card}
          isOwn={isOwn}
          freshPost={freshPost}
          freshMedia={freshMedia}
          cardStatus={purchaseStatus}
          actionLoading={actionLoading}
          onCardClick={onCardClick}
          onConfirmSale={onConfirmSale}
          onRejectPurchase={onRejectPurchase}
          onCancelPurchase={onCancelPurchase}
        />
      ) : (
        <div
          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
            isOwn
              ? "bg-primary text-white rounded-br-sm"
              : "bg-white text-gray-600 rounded-bl-sm border border-gray-200"
          } ${msg.status === "failed" ? "border-2 border-red-500" : ""}`}
        >
          <p className="text-sm whitespace-pre-wrap wrap-break-words">
            {msg.message}
          </p>
          <div
            className={`flex items-center gap-1 mt-1 ${
              isOwn ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`text-[10px] ${isOwn ? "text-white/70" : "text-gray-400"}`}
            >
              {formatChatTime(msg.created_at)}
            </span>
            {isOwn && (
              <span className="text-[10px] text-white/70">
                {msg.is_read ? "✓✓" : "✓"}
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessageBubble;
