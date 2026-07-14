import type { FC } from "react";
import { motion } from "framer-motion";
import {
  LuArrowLeft,
  LuSearch,
  LuMessageSquare,
  LuTrash2,
  LuLoader,
  LuX,
  LuShoppingCart,
  LuSquareCheck,
  LuSquare,
} from "react-icons/lu";
import type { PurchaseCardPayload } from "@/adapters/hooks/actions/usePostPreviewModal";
import { formatDateTime } from "@/shared/utils/formatDateTime";
import type { ChatMessagesViewProps } from "./ChatMessagesViewProps";

const parsePurchaseCard = (
  message: string,
  typeId: number,
): PurchaseCardPayload | null => {
  if (typeId !== 1) return null;
  try {
    const parsed = JSON.parse(message);
    if (parsed.__type === "PURCHASE_CARD") return parsed as PurchaseCardPayload;
  } catch {
    /* not a card */
  }
  return null;
};

const ChatMessagesView: FC<ChatMessagesViewProps> = ({
  chatMessages,
  selectedChat,
  postPreview,
  userSearch,
  onBack,
}) => {
  const {
    messages,
    pagination,
    messagesLoading,
    loadingMore,
    messageFilter,
    setMessageFilter,
    messageFilterDebounced,
    selectedIds,
    allSelected,
    toggleSelect,
    toggleSelectAll,
    setShowBatchConfirm,
    deletingId,
    deleteSingle,
    focusMessageId,
    loadMore,
  } = chatMessages;
  const { fetchingCardId, handleCardClick } = postPreview;
  const { foundUser } = userSearch;

  return (
    <motion.div
      key="chat-view"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {/* Chat view header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          aria-label="Volver a lista de chats"
          onClick={onBack}
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center
                     hover:bg-gray-50 transition-colors shrink-0"
        >
          <LuArrowLeft size={16} className="text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {foundUser?.display_name}{" "}
            <span className="text-gray-400 font-normal">↔</span>{" "}
            {selectedChat.other_user_name}
          </p>
          {pagination && (
            <p className="text-xs text-gray-400">
              {pagination.total} mensaje{pagination.total !== 1 ? "s" : ""}
              {messageFilterDebounced ? " (filtrados)" : ""}
            </p>
          )}
        </div>

        {/* Batch delete action */}
        {selectedIds.size > 0 && (
          <button
            type="button"
            onClick={() => setShowBatchConfirm(true)}
            className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold
                       px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
          >
            <LuTrash2 size={13} />
            Eliminar ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Message filter + select-all row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <LuSearch
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={messageFilter}
            onChange={(e) => setMessageFilter(e.target.value)}
            placeholder="Buscar dentro del chat..."
            className="w-full rounded-xl border border-gray-200 pl-8 pr-8 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                       placeholder:text-gray-400"
          />
          {messageFilter && (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={() => setMessageFilter("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <LuX size={14} />
            </button>
          )}
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={toggleSelectAll}
            className="shrink-0 flex items-center gap-1.5 text-xs text-gray-600
                       font-medium hover:text-primary transition-colors"
          >
            {allSelected ? (
              <LuSquareCheck size={16} className="text-primary" />
            ) : (
              <LuSquare size={16} />
            )}
            {allSelected ? "Deseleccionar" : "Seleccionar todo"}
          </button>
        )}
      </div>

      {/* Loading state */}
      {messagesLoading && (
        <div className="flex justify-center py-12">
          <LuLoader size={24} className="text-gray-400 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!messagesLoading && messages.length === 0 && (
        <div
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12
                      flex flex-col items-center gap-3 text-gray-400"
        >
          <LuMessageSquare size={48} strokeWidth={1.2} />
          <p className="text-sm">
            {messageFilterDebounced
              ? "No se encontraron mensajes con ese texto."
              : "No hay mensajes en esta conversación."}
          </p>
        </div>
      )}

      {/* Message list */}
      {!messagesLoading && messages.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
          {messages.map((msg) => {
            const card = parsePurchaseCard(
              msg.message,
              msg.purchase_notification_type_id,
            );
            const isDeleting = deletingId === msg.purchase_notification_id;
            const isSelected = selectedIds.has(msg.purchase_notification_id);
            const isFetchingCard = fetchingCardId === msg.purchase_notification_id;
            const isFocused = focusMessageId === msg.purchase_notification_id;

            return (
              <div
                key={msg.purchase_notification_id}
                id={`msg-${msg.purchase_notification_id}`}
                className={`px-5 py-4 flex items-start gap-3 transition-colors ${
                  isSelected ? "bg-red-50" : isFocused ? "bg-yellow-50" : ""
                }`}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  aria-label={
                    isSelected ? "Deseleccionar mensaje" : "Seleccionar mensaje"
                  }
                  onClick={() => toggleSelect(msg.purchase_notification_id)}
                  className="mt-0.5 shrink-0 text-gray-400 hover:text-primary transition-colors"
                >
                  {isSelected ? (
                    <LuSquareCheck size={18} className="text-primary" />
                  ) : (
                    <LuSquare size={18} />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-900 truncate">
                      {msg.sender_name}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">
                      {formatDateTime(msg.created_at)}
                    </span>
                  </div>

                  {card ? (
                    <button
                      type="button"
                      disabled={isFetchingCard}
                      onClick={() => handleCardClick(msg, card)}
                      className="inline-flex items-center gap-1.5 text-sm text-primary
                                 font-medium hover:underline text-left disabled:opacity-60"
                    >
                      {isFetchingCard ? (
                        <LuLoader size={14} className="animate-spin" />
                      ) : (
                        <LuShoppingCart size={14} />
                      )}
                      Solicitud de compra: {card.title}
                    </button>
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap wrap-break-word">
                      {msg.message}
                    </p>
                  )}
                </div>

                {/* Single delete */}
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => deleteSingle(msg.purchase_notification_id)}
                  className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500
                             hover:bg-red-50 transition-colors disabled:opacity-40"
                  title="Eliminar mensaje"
                >
                  {isDeleting ? (
                    <LuLoader size={16} className="animate-spin" />
                  ) : (
                    <LuTrash2 size={16} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Load more */}
      {!messagesLoading && pagination?.hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="self-center text-sm text-primary font-medium hover:underline disabled:opacity-50
                     flex items-center gap-1.5"
        >
          {loadingMore && <LuLoader size={14} className="animate-spin" />}
          {loadingMore ? "Cargando..." : "Cargar mensajes anteriores"}
        </button>
      )}
    </motion.div>
  );
};

export default ChatMessagesView;
