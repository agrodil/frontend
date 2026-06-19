import { useEffect, useState, type FC } from "react";
import { useLoaderData, useRevalidator, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LuMessagesSquare } from "react-icons/lu";
import { useAuth } from "@/adapters/hooks/common/useAuth";
import { notificationsSocket } from "@/infrastructure/NotificationsSocket";
import type {
  Chat,
  NotificationsPageLoaderData,
} from "@/presentation/interfaces/pages/NotificationsPageLoaderData";
import Toast from "@/presentation/ui/Toast";

const NotificationsPage: FC = () => {
  const { items = [], error } = (useLoaderData() as NotificationsPageLoaderData) ?? {};
  const { user } = useAuth();
  const { revalidate } = useRevalidator();
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (error) setToast(error);
  }, [error]);

  useEffect(() => {
    return notificationsSocket.onMessage(() => revalidate());
  }, [revalidate]);

  const handleSelectChat = (chat: Chat) => {
    navigate(`/notifications/chat/${chat.other_user_id}`);
  };

  return (
    <>
    <main className="w-[90vw] mx-auto flex flex-col mt-8 lg:mt-0 h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200 shadow-sm flex overflow-hidden"
      >
        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <LuMessagesSquare size={64} strokeWidth={1.2} className="text-red-300" />
            <p className="text-sm font-semibold text-red-500">Error al cargar los chats</p>
            <p className="text-xs text-gray-400 font-mono max-w-xs break-all">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-primary">
            <LuMessagesSquare size={96} strokeWidth={1.2} />
            <p className="text-lg font-semibold italic">No hay Chats</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 overflow-y-auto flex-1">
            {items.map((chat) => {
              const unread = !chat.is_read && chat.sent_by !== user?.id;
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
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-gray-50"
                >
                  <div className="w-11 h-11 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                    {initials}
                  </div>

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

                  {unread && (
                    <span className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </motion.div>
    </main>
    {toast && (
      <Toast mode="error" message={toast} onClose={() => setToast(null)} />
    )}
    </>
  );
};

export default NotificationsPage;
