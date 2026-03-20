import { useState, useEffect, type FC } from "react";
import { useLoaderData, useRevalidator, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LuMessagesSquare } from "react-icons/lu";
import { useAuth } from "../../../hooks/useAuth";
import { notificationsSocket } from "../../../services/api/NotificationsSocket";
import type {
  Chat,
  NotificationsPageLoaderData,
} from "../../../interfaces/loaders/NotificationsPageLoaderData";
import ChatWindow from "../../../components/layout/ChatWindow";

const NotificationsPage: FC = () => {
  const { items = [] } = (useLoaderData() as NotificationsPageLoaderData) ?? {};
  const { user } = useAuth();
  const { revalidate } = useRevalidator();
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  useEffect(() => {
    return notificationsSocket.onMessage(() => revalidate());
  }, [revalidate]);

  // Auto-open the chat with the seller after a purchase redirect
  useEffect(() => {
    const state = location.state as
      | { openChatWith?: string }
      | null
      | undefined;
    if (!state?.openChatWith || items.length === 0) return;
    const chat = items.find((c) => c.other_user_id === state.openChatWith);
    if (chat) setSelectedChat(chat);
  }, [location.state, items]);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleBack = () => {
    setSelectedChat(null);
    revalidate();
  };

  const isUnread = (chat: Chat) => !chat.is_read && chat.sent_by !== user?.id;

  return (
    <main className="w-[90vw] mx-auto flex flex-col mt-8 lg:mt-0 h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200 shadow-sm flex overflow-hidden"
      >
        {/* Chat list sidebar */}
        <div
          className={`w-full lg:w-[320px] lg:min-w-[320px] border-r border-gray-200 flex flex-col ${
            selectedChat ? "hidden lg:flex" : "flex"
          }`}
        >
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-primary">
              <LuMessagesSquare size={96} strokeWidth={1.2} />
              <p className="text-lg font-semibold italic">No hay Chats</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 overflow-y-auto flex-1">
              {items.map((chat) => {
                const unread = isUnread(chat);
                const active =
                  selectedChat?.other_user_id === chat.other_user_id;
                const initials = chat.other_user_name
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase();

                return (
                  <li
                    key={chat.purchase_notification_id}
                    onClick={() => handleSelectChat(chat)}
                    className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${
                      active ? "bg-primary/5" : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                      {initials}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm truncate ${
                            unread
                              ? "font-bold text-gray-900"
                              : "font-semibold text-gray-800"
                          }`}
                        >
                          {chat.other_user_name}
                        </span>
                        <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                          {new Date(chat.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p
                        className={`text-sm truncate mt-0.5 ${
                          unread ? "font-bold text-gray-800" : "text-gray-500"
                        }`}
                      >
                        {chat.sent_by === user?.id
                          ? "Tú"
                          : chat.other_user_name.split(" ")[0]}
                        : {chat.message}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {unread && (
                      <span className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Chat window */}
        <div
          className={`flex-1 flex flex-col ${
            selectedChat ? "flex" : "hidden lg:flex"
          }`}
        >
          {selectedChat ? (
            <ChatWindow chat={selectedChat} onBack={handleBack} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-300">
              <LuMessagesSquare size={80} strokeWidth={1} />
              <p className="text-base font-medium">
                Selecciona un chat para comenzar
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
};

export default NotificationsPage;
