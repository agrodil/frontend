import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type FC,
  type KeyboardEvent,
} from "react";
import { motion } from "framer-motion";
import { LuChevronLeft, LuImageOff } from "react-icons/lu";
import { useAuth } from "@/adapters/hooks/common/useAuth";
import { notificationsSocket } from "@/infrastructure/NotificationsSocket";
import { notificationsApi } from "@/api/clients/notifications.api";
import { postApi } from "@/api/clients/posts.api";
import { useUnreadCount } from "@/adapters/hooks/actions/useUnreadCount";
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

type PurchaseCardPayload = {
  __type: "PURCHASE_CARD";
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

const MESSAGES_LIMIT = 50;

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const ChatWindow: FC<ChatWindowProps> = ({ chat, onBack }) => {
  const { user } = useAuth();
  const { refresh: refreshUnreadCount } = useUnreadCount();

  const [messages, setMessages] = useState<Message[]>([]),
    [text, setText] = useState(""),
    [sending, setSending] = useState(false),
    [brokenImgs, setBrokenImgs] = useState<Set<string>>(new Set()),
    [freshCardImages, setFreshCardImages] = useState<Record<string, string>>(
      {},
    ),
    [selectedPost, setSelectedPost] = useState<{
      post: PostDetail;
      img: string | null;
      owner: string;
    } | null>(null);

  const messagesRef = useRef<HTMLDivElement>(null),
    textareaRef = useRef<HTMLTextAreaElement>(null),
    fetchedPostIds = useRef<Set<string>>(new Set());

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
    loadMessages();
    markChatAsRead(chat.other_user_id)
      .then(() => refreshUnreadCount())
      .catch(() => {});
  }, [chat.other_user_id, loadMessages, refreshUnreadCount]);

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

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setText("");
    try {
      await sendMessageAction(chat.other_user_id, trimmed);
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
          .filter((m) => m.livestock_post_id && parsePurchaseCard(m.message))
          .map((m) => m.livestock_post_id!),
      ),
    ];

    uniquePostIds.forEach(async (postId) => {
      if (fetchedPostIds.current.has(postId)) return;
      fetchedPostIds.current.add(postId);
      try {
        const files = await getFilesByPost(postId);
        const main = files.find((f) => f.is_main_file) ?? files[0];
        if (main?.url) {
          setFreshCardImages((prev) => ({ ...prev, [postId]: main.url }));
        }
      } catch {
        /* keep card.img as fallback */
      }
    });
  }, [messages]);

  const handleCardClick = async (msg: Message, card: PurchaseCardPayload) => {
    if (!msg.livestock_post_id) return;
    try {
      const post = await postApi.getPostById(msg.livestock_post_id);
      setSelectedPost({
        post,
        img: freshCardImages[msg.livestock_post_id] ?? card.img ?? null,
        owner: card.owner,
      });
    } catch {
      /* post may be deactivated */
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
          className="flex-1 min-h-0 overflow-y-auto px-16 py-4 flex flex-col gap-4"
        >
          {messages.map((msg) => {
            const isOwn = msg.sent_by === user?.id;
            const card = parsePurchaseCard(msg.message);

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
                    <div
                      className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleCardClick(msg, card)}
                    >
                      <div className="w-48 h-36 relative bg-gray-100">
                        {(() => {
                          const imgSrc =
                            (msg.livestock_post_id &&
                              freshCardImages[msg.livestock_post_id]) ||
                            card.img ||
                            null;
                          return imgSrc &&
                            !brokenImgs.has(msg.purchase_notification_id) ? (
                            <img
                              src={imgSrc}
                              alt={card.title}
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
                          );
                        })()}
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">
                          {sales[card.saleTypeId] ?? "—"}
                        </p>
                        <p className="font-bold text-xs text-gray-900 truncate">
                          {card.title}
                        </p>
                        <p className="font-black text-sm text-gray-900">
                          US ${Number(card.price).toFixed(0)}
                        </p>
                      </div>
                    </div>
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
    </>
  );
};

export default ChatWindow;
