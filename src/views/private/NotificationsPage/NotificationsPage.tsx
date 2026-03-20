import { useEffect, type FC } from "react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { motion } from "framer-motion";
import { LuMessagesSquare } from "react-icons/lu";
import { useAuth } from "../../../hooks/useAuth";
import { notificationsSocket } from "../../../services/api/NotificationsSocket";
import type { NotificationsPageLoaderData } from "../../../interfaces/loaders/NotificationsPageLoaderData";

const NotificationsPage: FC = () => {
  const { items = [] } =
    (useLoaderData() as NotificationsPageLoaderData) ?? {};
  const { user } = useAuth();
  const { revalidate } = useRevalidator();

  useEffect(() => {
    return notificationsSocket.onMessage(() => revalidate());
  }, [revalidate]);

  return (
    <main className="w-[90vw] mx-auto min-h-screen flex flex-col gap-4 mt-8 lg:mt-0">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col"
      >
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-primary">
            <LuMessagesSquare size={96} strokeWidth={1.2} />
            <p className="text-lg font-semibold italic">No hay Chats</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((chat) => (
              <li
                key={chat.purchase_notification_id}
                className="flex flex-col gap-1 px-5 py-4 hover:bg-gray-200 transition-colors cursor-pointer rounded-2xl"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-800">
                    {chat.other_user_name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(chat.created_at).toLocaleDateString()}
                  </span>
                </div>
                {chat.livestock_post_name && (
                  <p className="text-xs text-primary font-medium truncate">
                    {chat.livestock_post_name}
                  </p>
                )}
                <p className="text-sm text-gray-500 truncate">
                  {chat.sent_by === user?.id
                    ? "Tú"
                    : chat.other_user_name.split(" ")[0]}
                  : {chat.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </main>
  );
};

export default NotificationsPage;
