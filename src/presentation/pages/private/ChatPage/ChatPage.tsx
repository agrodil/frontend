import { useEffect, useRef, useState, type FC, type KeyboardEvent } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { LuChevronLeft } from "react-icons/lu";
import { useAuth } from "@/adapters/hooks/common/useAuth";
import { useChatMessages } from "@/adapters/hooks/actions/useChatMessages";
import { usePurchaseCardData } from "@/adapters/hooks/actions/usePurchaseCardData";
import { usePurchaseSaleActions } from "@/adapters/hooks/actions/usePurchaseSaleActions";
import type { Chat } from "@/presentation/interfaces/pages/NotificationsPageLoaderData";
import PostDetailModal from "@/presentation/ui/PostDetailModal/PostDetailModal";
import ConfirmSaleModal from "@/presentation/ui/ConfirmSaleModal";
import PostSaleActionsModal from "@/presentation/ui/PostSaleActionsModal";
import Toast from "@/presentation/ui/Toast";
import type { ToastMode } from "@/presentation/interfaces/ui/ToastProps.interface";
import {
  PURCHASE_STATUS_APPROVED,
  PURCHASE_STATUS_REJECTED,
} from "@/shared/constants/purchase-status.catalog";
import ChatMessageBubble from "./ChatMessageBubble";

const ChatPage: FC = () => {
  const chat = useLoaderData() as Chat;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [text, setText] = useState("");
  const [toast, setToast] = useState<{
    mode: ToastMode;
    message: string;
  } | null>(null);
  const notify = (mode: ToastMode, message: string) => setToast({ mode, message });

  const chatMessages = useChatMessages(chat.other_user_id, (change) => {
    if (change.status === PURCHASE_STATUS_APPROVED) {
      notify(
        "success",
        `¡Tu compra de "${change.title}" fue confirmada por el vendedor!`,
      );
    } else if (change.status === PURCHASE_STATUS_REJECTED) {
      notify("warning", `Tu solicitud de compra de "${change.title}" fue rechazada.`);
    } else {
      notify("info", `La solicitud de compra de "${change.title}" fue cancelada.`);
    }
  });
  const cardData = usePurchaseCardData(chatMessages.messages);
  const saleActions = usePurchaseSaleActions(
    chat.other_user_id,
    chatMessages.reloadMessages,
    notify,
  );

  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatMessages.messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || chatMessages.sending) return;
    setText("");
    try {
      await chatMessages.sendMessage(trimmed);
    } catch {
      notify("error", "No se pudo enviar el mensaje. Intenta de nuevo.");
    } finally {
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const initials = chat.other_user_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-hidden">
      <div className="flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <button
            aria-label="Volver"
            type="button"
            onClick={() => navigate("/notifications")}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors bg-transparent border-0 cursor-pointer"
          >
            <LuChevronLeft size={20} />
          </button>
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
            {initials}
          </div>
          <span className="font-semibold text-gray-800">
            {chat.other_user_name}
          </span>
        </div>

        {/* Messages */}
        <div
          ref={messagesRef}
          className="flex-1 min-h-0 overflow-y-auto px-4 lg:px-16 py-4 flex flex-col gap-4"
        >
          {chatMessages.messages.map((msg) => (
            <ChatMessageBubble
              key={msg.purchase_notification_id}
              msg={msg}
              isOwn={msg.sent_by === user?.id}
              freshCardImages={cardData.freshCardImages}
              freshCardPosts={cardData.freshCardPosts}
              purchaseStatusMap={chatMessages.purchaseStatusMap}
              actionLoading={saleActions.actionLoading}
              onCardClick={cardData.openPostDetail}
              onConfirmSale={saleActions.openConfirmSale}
              onRejectPurchase={saleActions.rejectPurchase}
              onCancelPurchase={saleActions.cancelPurchase}
            />
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 px-4 py-3 flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Escribe"
            rows={1}
            className="flex-1 max-h-30 resize-none rounded-full bg-gray-100 px-4 py-2.5 text-sm outline-none border border-gray-200 focus:border-primary/40 transition-colors placeholder:text-gray-400"
          />
          <button
            aria-label="send"
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || chatMessages.sending}
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 hover:bg-primary-hover transition-colors cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LuChevronLeft size={18} />
          </button>
        </div>
      </div>

      {cardData.selectedPost && (
        <PostDetailModal
          post={cardData.selectedPost.post}
          previewImg={cardData.selectedPost.img}
          previewOwner={cardData.selectedPost.owner}
          onClose={cardData.closePostDetail}
        />
      )}

      {saleActions.confirmingSale && (
        <ConfirmSaleModal
          postTitle={saleActions.confirmingSale.postDetail.post_name}
          quantity={saleActions.confirmingSale.postDetail.quantity ?? 0}
          onConfirm={saleActions.confirmSale}
          onClose={saleActions.closeConfirmSale}
          loading={saleActions.actionLoading}
        />
      )}

      {saleActions.postSalePost && (
        <PostSaleActionsModal
          postTitle={saleActions.postSalePost.post_name}
          onDeactivate={saleActions.deactivatePost}
          onEdit={() => {
            const post = saleActions.postSalePost!;
            cardData.showPostDetail(
              post,
              cardData.freshCardImages[post.post_id]?.url ?? null,
              post.post_name,
            );
            saleActions.clearPostSalePost();
          }}
          onSkip={saleActions.clearPostSalePost}
          loading={saleActions.actionLoading}
        />
      )}

      {toast && (
        <Toast
          mode={toast.mode}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ChatPage;
