import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type FC,
  type KeyboardEvent,
} from "react";
import { motion } from "framer-motion";
import { LuChevronLeft } from "react-icons/lu";
import { useAuth } from "../../../hooks/useAuth";
import { notificationsSocket } from "../../../services/api/NotificationsSocket";
import { notificationsApi } from "../../../services/api/notifications.api";
import {
  sendMessage as sendMessageAction,
  markChatAsRead,
} from "../../../routes/actions/notifications.actions";
import type {
  Chat,
  Message,
} from "../../../interfaces/loaders/NotificationsPageLoaderData";

interface ChatWindowProps {
  chat: Chat;
  onBack: () => void;
}

const MESSAGES_LIMIT = 50;

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const ChatWindow: FC<ChatWindowProps> = ({ chat, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    markChatAsRead(chat.other_user_id).catch(() => {});
  }, [chat.other_user_id, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return notificationsSocket.onMessage(() => {
      loadMessages();
      markChatAsRead(chat.other_user_id).catch(() => {});
    });
  }, [chat.other_user_id, loadMessages]);

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
      <div ref={messagesRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {messages.map((msg) => {
          const isOwn = msg.sent_by === user?.id;
          return (
            <motion.div
              key={msg.purchase_notification_id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isOwn
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm"
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
          className="flex-1 resize-none rounded-full bg-gray-100 px-4 py-2.5 text-sm outline-none border border-gray-200 focus:border-primary/40 transition-colors placeholder:text-gray-400"
          style={{ maxHeight: 120 }}
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
  );
};

export default ChatWindow;
