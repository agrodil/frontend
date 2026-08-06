import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type FC,
  type KeyboardEvent,
} from "react";
import { motion } from "framer-motion";
import { LuChevronLeft, LuImageOff } from "react-icons/lu";
import { useAuth } from "@/adapters/hooks/common/useAuth";
import { notificationsSocket } from "@/infrastructure/NotificationsSocket";
import { notificationsApi } from "@/api/clients/notifications.api";
import { purchaseApi } from "@/api/clients/purchase.api";
import { postApi } from "@/api/clients/posts.api";
import { useUnreadCount } from "@/adapters/hooks/actions/useUnreadCount";
import { useMessageModeration } from "@/adapters/hooks/actions/useMessageModeration";
import {
  sendMessage as sendMessageAction,
  markChatAsRead,
} from "@/presentation/router/actions/notifications.actions";
import { getFilesByPost } from "@/presentation/router/actions/aws.actions";
import type { Message } from "@/presentation/interfaces/pages/NotificationsPageLoaderData";
import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import { sales } from "@/shared/constants/sale-types.catalog";
import type { ChatWindowProps } from "@/presentation/interfaces/layout/ChatWindowProps";
import PostDetailModal from "@/presentation/ui/PostDetailModal/PostDetailModal";
import ConfirmSaleModal from "@/presentation/ui/ConfirmSaleModal";
import PostSaleActionsModal from "@/presentation/ui/PostSaleActionsModal";
import Toast from "@/presentation/ui/Toast";
import type { ToastMode } from "@/presentation/interfaces/ui/ToastProps.interface";

type PurchaseCardPayload = {
  __type: "PURCHASE_CARD";
  purchaseRequestId: string;
  postedBy: string;
  title: string;
  saleTypeId: number;
  price: number;
  owner: string;
  img: string | null;
};

const parsePurchaseCard = (text: string): PurchaseCardPayload | null => {
  try {
    const parsed = JSON.parse(text);
    if (parsed.__type === "PURCHASE_CARD") return parsed as PurchaseCardPayload;
  } catch {
    /* not a card */
  }
  return null;
};

// purchase_status_id: 2 = approved (vendedor), 3 = rejected (vendedor), 4 = cancelled (comprador)
const STATUS_APPROVED = 2;
const STATUS_REJECTED = 3;
const STATUS_CANCELLED = 4;

type PurchaseStatusPayload = {
  __type: "PURCHASE_STATUS";
  purchaseRequestId: string;
  status: number;
  title: string;
};

const parsePurchaseStatus = (text: string): PurchaseStatusPayload | null => {
  try {
    const parsed = JSON.parse(text);
    if (parsed.__type === "PURCHASE_STATUS")
      return parsed as PurchaseStatusPayload;
  } catch {
    /* not a status update */
  }
  return null;
};

const MESSAGES_LIMIT = 50;

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const ChatWindow: FC<ChatWindowProps> = ({ chat, onBack }) => {
  const { user } = useAuth();
  const { refresh: refreshUnreadCount } = useUnreadCount();
  const { moderate, reportViolations } = useMessageModeration();

  const [messages, setMessages] = useState<Message[]>([]),
    [text, setText] = useState(""),
    [sending, setSending] = useState(false),
    [brokenImgs, setBrokenImgs] = useState<Set<string>>(new Set()),
    [freshCardImages, setFreshCardImages] = useState<Record<string, string>>(
      {},
    ),
    [freshCardPosts, setFreshCardPosts] = useState<Record<string, PostDetail>>(
      {},
    ),
    [selectedPost, setSelectedPost] = useState<{
      post: PostDetail;
      img: string | null;
      owner: string;
    } | null>(null);

  // Sale flow state
  const [confirmingSale, setConfirmingSale] = useState<{
    purchaseRequestId: string;
    postDetail: PostDetail;
  } | null>(null);
  const [postSalePost, setPostSalePost] = useState<PostDetail | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{
    mode: ToastMode;
    message: string;
  } | null>(null);

  const messagesRef = useRef<HTMLDivElement>(null),
    textareaRef = useRef<HTMLTextAreaElement>(null),
    fetchedPostIds = useRef<Set<string>>(new Set()),
    seenStatusIds = useRef<Set<string>>(new Set()),
    statusToastsInit = useRef(false);

  // Mapa purchaseRequestId -> status (3 rechazado, 4 cancelado), derivado del historial.
  const purchaseStatusMap = useMemo(() => {
    const map: Record<string, number> = {};
    messages.forEach((m) => {
      const s = parsePurchaseStatus(m.message);
      if (s) map[s.purchaseRequestId] = s.status;
    });
    return map;
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const data = await notificationsApi.getAllMessagesByChat(
        chat.other_user_id,
        MESSAGES_LIMIT,
        0,
      );
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    }
  }, [chat.other_user_id]);

  useEffect(() => {
    let cancelled = false;
    // Reset del tracking de toasts de estado al abrir otro chat.
    seenStatusIds.current = new Set();
    statusToastsInit.current = false;
    notificationsApi
      .getAllMessagesByChat(chat.other_user_id, MESSAGES_LIMIT, 0)
      .then((data) => {
        if (!cancelled) setMessages(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      });
    markChatAsRead(chat.other_user_id)
      .then(() => refreshUnreadCount())
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [chat.other_user_id, refreshUnreadCount]);

  // Toast en tiempo real cuando llega un cambio de estado del OTRO usuario.
  useEffect(() => {
    const statusMsgs = messages.filter((m) => parsePurchaseStatus(m.message));

    // Primera carga: marca todo lo histórico como visto sin notificar.
    if (!statusToastsInit.current) {
      statusMsgs.forEach((m) =>
        seenStatusIds.current.add(m.purchase_notification_id),
      );
      statusToastsInit.current = true;
      return;
    }

    statusMsgs.forEach((m) => {
      if (seenStatusIds.current.has(m.purchase_notification_id)) return;
      seenStatusIds.current.add(m.purchase_notification_id);
      if (m.sent_by === user?.id) return; // ignora los propios
      const s = parsePurchaseStatus(m.message)!;
      if (s.status === STATUS_APPROVED) {
        setToast({
          mode: "success",
          message: `¡Tu compra de "${s.title}" fue confirmada por el vendedor!`,
        });
      } else if (s.status === STATUS_REJECTED) {
        setToast({
          mode: "warning",
          message: `Tu solicitud de compra de "${s.title}" fue rechazada.`,
        });
      } else {
        setToast({
          mode: "info",
          message: `La solicitud de compra de "${s.title}" fue cancelada.`,
        });
      }
    });
  }, [messages, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return notificationsSocket.onMessage(() => {
      loadMessages();
      markChatAsRead(chat.other_user_id)
        .then(() => refreshUnreadCount())
        .catch(() => {});
    });
  }, [chat.other_user_id, loadMessages, refreshUnreadCount]);

  useEffect(() => {
    const handler = (e: Event) => {
      const post = (e as CustomEvent<PostDetail>).detail;
      setFreshCardPosts((prev) => ({ ...prev, [post.post_id]: post }));
    };
    window.addEventListener("postUpdated", handler);
    return () => window.removeEventListener("postUpdated", handler);
  }, []);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    // Censura teléfonos ANTES de enviar: el número crudo nunca sale del cliente.
    // Se chequea también contra los últimos mensajes propios (sin cards/status
    // de compra) por si el número viene partido entre varios mensajes.
    const recentOwnMessages = messages
      .filter(
        (m) =>
          m.sent_by === user?.id &&
          !parsePurchaseCard(m.message) &&
          !parsePurchaseStatus(m.message),
      )
      .slice(-3)
      .map((m) => m.message);
    const { sanitized, violations } = moderate(trimmed, recentOwnMessages);

    setSending(true);
    setText("");
    try {
      const created = await sendMessageAction(chat.other_user_id, sanitized);
      if (violations.length > 0 && created?.purchase_notification_id) {
        void reportViolations(violations, created.purchase_notification_id);
      }
      await loadMessages();
    } catch {
      setText(trimmed);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const uniquePostIds = [
      ...new Set(
        messages
          .filter((m) => m.post_id && parsePurchaseCard(m.message))
          .map((m) => m.post_id!),
      ),
    ];

    uniquePostIds.forEach(async (postId) => {
      if (fetchedPostIds.current.has(postId)) return;
      fetchedPostIds.current.add(postId);
      try {
        const [files, post] = await Promise.all([
          getFilesByPost(postId),
          postApi.getPostById(postId),
        ]);
        const main = files.find((f) => f.is_main_file) ?? files[0];
        if (main?.url) {
          setFreshCardImages((prev) => ({ ...prev, [postId]: main.url }));
        }
        setFreshCardPosts((prev) => ({ ...prev, [postId]: post }));
      } catch {
        /* keep card data as fallback */
      }
    });
  }, [messages]);

  const handleCardClick = async (msg: Message, card: PurchaseCardPayload) => {
    if (!msg.post_id) return;
    try {
      const post = await postApi.getPostById(msg.post_id);
      setSelectedPost({
        post,
        img: freshCardImages[msg.post_id] ?? card.img ?? null,
        owner: card.owner,
      });
    } catch {
      /* post may be deactivated */
    }
  };

  const handleConfirmSale = async () => {
    if (!confirmingSale) return;
    setActionLoading(true);
    try {
      await purchaseApi.updatePurchaseRequest(
        confirmingSale.purchaseRequestId,
        { purchaseStatusId: STATUS_APPROVED },
      );
      await notificationsApi.createNotification({
        sentTo: chat.other_user_id,
        postId: confirmingSale.postDetail.post_id,
        purchaseNotificationTypeId: 2,
        message: JSON.stringify({
          __type: "PURCHASE_STATUS",
          purchaseRequestId: confirmingSale.purchaseRequestId,
          status: STATUS_APPROVED,
          title: confirmingSale.postDetail.post_name,
        }),
      });
      setConfirmingSale(null);
      setToast({ mode: "success", message: "¡Venta confirmada exitosamente!" });
      setPostSalePost(confirmingSale.postDetail);
      loadMessages();
    } catch {
      setToast({ mode: "error", message: "Error al confirmar la venta. Intenta de nuevo." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPurchase = async (
    purchaseRequestId: string,
    postDetail: PostDetail,
  ) => {
    setActionLoading(true);
    try {
      await purchaseApi.updatePurchaseRequest(purchaseRequestId, {
        purchaseStatusId: STATUS_REJECTED,
      });
      await notificationsApi.createNotification({
        sentTo: chat.other_user_id,
        postId: postDetail.post_id,
        purchaseNotificationTypeId: 2,
        message: JSON.stringify({
          __type: "PURCHASE_STATUS",
          purchaseRequestId,
          status: STATUS_REJECTED,
          title: postDetail.post_name,
        }),
      });
      setToast({ mode: "warning", message: "Solicitud rechazada." });
      loadMessages();
    } catch {
      setToast({ mode: "error", message: "Error al rechazar. Intenta de nuevo." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelPurchase = async (
    purchaseRequestId: string,
    postDetail: PostDetail,
  ) => {
    setActionLoading(true);
    try {
      await purchaseApi.updatePurchaseRequest(purchaseRequestId, {
        purchaseStatusId: STATUS_CANCELLED,
      });
      await notificationsApi.createNotification({
        sentTo: chat.other_user_id,
        postId: postDetail.post_id,
        purchaseNotificationTypeId: 2,
        message: JSON.stringify({
          __type: "PURCHASE_STATUS",
          purchaseRequestId,
          status: STATUS_CANCELLED,
          title: postDetail.post_name,
        }),
      });
      setToast({ mode: "info", message: "Solicitud cancelada." });
      loadMessages();
    } catch {
      setToast({ mode: "error", message: "Error al cancelar. Intenta de nuevo." });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostSaleDeactivate = async () => {
    if (!postSalePost) return;
    setActionLoading(true);
    try {
      await postApi.deactivatePost(postSalePost.post_id);
      setPostSalePost(null);
      setToast({ mode: "info", message: "Publicación desactivada." });
    } catch {
      setToast({ mode: "error", message: "Error al desactivar. Intenta de nuevo." });
    } finally {
      setActionLoading(false);
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
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <button
            aria-label="Volver"
            type="button"
            onClick={onBack}
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
          {messages.map((msg) => {
            const isOwn = msg.sent_by === user?.id;
            const card = parsePurchaseCard(msg.message);
            const statusMsg = parsePurchaseStatus(msg.message);

            // Cambio de estado: línea de sistema centrada (trazabilidad en el chat).
            if (statusMsg) {
              return (
                <motion.div
                  key={msg.purchase_notification_id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex justify-center"
                >
                  <span
                    className={`text-[11px] rounded-full px-3 py-1 border ${
                      statusMsg.status === STATUS_APPROVED
                        ? "text-green-700 bg-green-50 border-green-200"
                        : "text-gray-500 bg-gray-100 border-gray-200"
                    }`}
                  >
                    {statusMsg.status === STATUS_APPROVED
                      ? `Venta confirmada · ${statusMsg.title}`
                      : statusMsg.status === STATUS_REJECTED
                        ? `Solicitud rechazada · ${statusMsg.title}`
                        : `Solicitud cancelada · ${statusMsg.title}`}
                  </span>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={msg.purchase_notification_id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                {card ? (
                  <div className="max-w-[75%] flex flex-col gap-1">
                    {(() => {
                      const freshPost = msg.post_id
                        ? freshCardPosts[msg.post_id]
                        : undefined;
                      const displayTitle =
                        freshPost?.post_name ?? card.title;
                      const displaySaleTypeId =
                        freshPost?.sale_type_id ?? card.saleTypeId;
                      const displayPrice = freshPost
                        ? (freshPost.price_per_kg ??
                          freshPost.price_per_unit ??
                          card.price)
                        : card.price;
                      const imgSrc =
                        (msg.post_id &&
                          freshCardImages[msg.post_id]) ||
                        card.img ||
                        null;

                      // El card lo envía el comprador; quien NO lo envió es el vendedor
                      const isSeller = !isOwn;
                      const hasPurchaseRequestId = Boolean(
                        card.purchaseRequestId,
                      );
                      const cardStatus = card.purchaseRequestId
                        ? purchaseStatusMap[card.purchaseRequestId]
                        : undefined;
                      const isResolved =
                        cardStatus === STATUS_APPROVED ||
                        cardStatus === STATUS_REJECTED ||
                        cardStatus === STATUS_CANCELLED;
                      const showActions =
                        hasPurchaseRequestId && freshPost && !isResolved;

                      return (
                        <div className="flex flex-col gap-2">
                          <div
                            className={`rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                              isResolved ? "opacity-50 grayscale" : ""
                            }`}
                            onClick={() => handleCardClick(msg, card)}
                          >
                            {isResolved && (
                              <div className="px-3 pt-2">
                                <span
                                  className={`text-[10px] font-bold uppercase ${
                                    cardStatus === STATUS_APPROVED
                                      ? "text-green-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {cardStatus === STATUS_APPROVED
                                    ? "Vendida"
                                    : cardStatus === STATUS_REJECTED
                                      ? "Rechazada"
                                      : "Cancelada"}
                                </span>
                              </div>
                            )}
                            <div className="w-48 h-36 relative bg-gray-100">
                              {imgSrc &&
                              !brokenImgs.has(msg.purchase_notification_id) ? (
                                <img
                                  src={imgSrc}
                                  alt={displayTitle}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  onError={() =>
                                    setBrokenImgs((prev) =>
                                      new Set(prev).add(
                                        msg.purchase_notification_id,
                                      ),
                                    )
                                  }
                                />
                              ) : (
                                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                  <LuImageOff
                                    size={28}
                                    className="text-primary/40"
                                  />
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
                                US ${(() => { const n = Number(displayPrice); return Number.isInteger(n) ? n : n.toFixed(2); })()}
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
                                      setConfirmingSale({
                                        purchaseRequestId:
                                          card.purchaseRequestId,
                                        postDetail: freshPost,
                                      })
                                    }
                                    className="flex-1 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Confirmar venta
                                  </button>
                                  <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() =>
                                      handleRejectPurchase(
                                        card.purchaseRequestId,
                                        freshPost,
                                      )
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
                                    handleCancelPurchase(
                                      card.purchaseRequestId,
                                      freshPost,
                                    )
                                  }
                                  className="flex-1 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Cancelar solicitud
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    <span
                      className={`text-[10px] text-gray-400 ${isOwn ? "text-right" : "text-left"}`}
                    >
                      {formatTime(msg.created_at)}
                      {isOwn && (
                        <span className="ml-1">{msg.is_read ? "✓✓" : "✓"}</span>
                      )}
                    </span>
                  </div>
                ) : (
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      isOwn
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-white text-gray-600 rounded-bl-sm border border-gray-200"
                    }`}
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
                        className={`text-[10px] ${
                          isOwn ? "text-white/70" : "text-gray-400"
                        }`}
                      >
                        {formatTime(msg.created_at)}
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
          })}
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
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 hover:bg-primary-hover transition-colors cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LuChevronLeft size={18} />
          </button>
        </div>
      </div>

      {selectedPost && (
        <PostDetailModal
          post={selectedPost.post}
          previewImg={selectedPost.img}
          previewOwner={selectedPost.owner}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {confirmingSale && (
        <ConfirmSaleModal
          postTitle={confirmingSale.postDetail.post_name}
          quantity={confirmingSale.postDetail.quantity ?? 0}
          onConfirm={handleConfirmSale}
          onClose={() => !actionLoading && setConfirmingSale(null)}
          loading={actionLoading}
        />
      )}

      {postSalePost && (
        <PostSaleActionsModal
          postTitle={postSalePost.post_name}
          onDeactivate={handlePostSaleDeactivate}
          onEdit={() => {
            setSelectedPost({
              post: postSalePost,
              img: freshCardImages[postSalePost.post_id] ?? null,
              owner: postSalePost.post_name,
            });
            setPostSalePost(null);
          }}
          onSkip={() => setPostSalePost(null)}
          loading={actionLoading}
        />
      )}

      {toast && (
        <Toast
          mode={toast.mode}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default ChatWindow;
