import type { FC } from "react";
import { motion } from "framer-motion";
import { LuSearch, LuLoader, LuMessageSquare, LuUser, LuChevronRight } from "react-icons/lu";
import type { Chat } from "@/presentation/interfaces/pages/NotificationsPageLoaderData";

type ChatListViewProps = {
  userDisplayName: string | undefined;
  chats: Chat[];
  loading: boolean;
  error: string | null;
  nameFilter: string;
  onNameFilterChange: (value: string) => void;
  onOpenChat: (chat: Chat) => void;
};

const ChatListView: FC<ChatListViewProps> = ({
  userDisplayName,
  chats,
  loading,
  error,
  nameFilter,
  onNameFilterChange,
  onOpenChat,
}) => (
  <motion.div
    key="chat-list"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col gap-3 max-w-xl"
  >
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-gray-700">
        Chats de <span className="text-primary">{userDisplayName}</span>
      </p>
      {loading && <LuLoader size={16} className="text-gray-400 animate-spin" />}
    </div>

    {/* Filter by recipient name */}
    {!loading && chats.length > 0 && (
      <div className="relative">
        <LuSearch
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={nameFilter}
          onChange={(e) => onNameFilterChange(e.target.value)}
          placeholder="Filtrar por nombre del receptor..."
          className="w-full rounded-xl border border-gray-200 pl-8 pr-4 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                     placeholder:text-gray-400"
        />
      </div>
    )}

    {error && <p className="text-sm text-red-500">{error}</p>}

    {!loading && !error && chats.length === 0 && (
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10
                    flex flex-col items-center gap-3 text-gray-400"
      >
        <LuMessageSquare size={40} strokeWidth={1.2} />
        <p className="text-sm">
          {nameFilter.trim()
            ? "No hay chats que coincidan con ese nombre."
            : "Este usuario no tiene conversaciones."}
        </p>
      </div>
    )}

    {chats.map((chat) => (
      <button
        key={chat.purchase_notification_id}
        type="button"
        onClick={() => onOpenChat(chat)}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4
                   flex items-center gap-3 hover:border-primary/40 hover:shadow-md
                   transition-all text-left w-full"
      >
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <LuUser size={18} className="text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">
            {chat.other_user_name}
          </p>
          {chat.post_name && (
            <p className="text-xs text-gray-400 truncate">
              {chat.post_name}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {chat.message}
          </p>
        </div>
        <LuChevronRight size={18} className="text-gray-400 shrink-0" />
      </button>
    ))}
  </motion.div>
);

export default ChatListView;
