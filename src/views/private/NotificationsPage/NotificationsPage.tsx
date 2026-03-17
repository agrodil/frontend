import { useState, useEffect, type FC } from "react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { motion } from "framer-motion";
import { LuMessagesSquare } from "react-icons/lu";
import { useAuth } from "../../../hooks/useAuth";
import { notificationsSocket } from "../../../services/api/NotificationsSocket";
import type {
  NotificationsPageLoaderData,
  Chat,
} from "../../../interfaces/loaders/NotificationsPageLoaderData";

type Tab = "venta" | "compra";

const NotificationsPage: FC = () => {
  const { items = [] } =
    (useLoaderData() as NotificationsPageLoaderData) ?? {};
  const { user } = useAuth();
  const { revalidate } = useRevalidator();
  const [tab, setTab] = useState<Tab>("venta");

  useEffect(() => {
    return notificationsSocket.onMessage(() => revalidate());
  }, [revalidate]);

  const filtered: Chat[] =
    tab === "compra"
      ? items.filter((item: Chat) => item.sent_by === user?.id)
      : items.filter((item: Chat) => item.sent_by !== user?.id);

  return (
    <main className="w-[90vw] mx-auto min-h-screen flex flex-col gap-4 mt-8 lg:mt-0">
      {/* Tab toggle */}
      <div className="flex items-center flex-wrap justify-center gap-2 bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 w-full">
        {(["venta", "compra"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-5 py-2 min-w-32 rounded-full text-sm shadow-sm font-semibold capitalize transition-colors cursor-pointer border-0 ${
              tab === t
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Chat list / empty state */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col"
      >
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-primary">
            <LuMessagesSquare size={96} strokeWidth={1.2} />
            <p className="text-lg font-semibold italic">No hay Chats</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((chat) => (
              <li
                key={chat.purchase_notification_id}
                className="flex flex-col gap-1 px-5 py-4 hover:bg-gray-200 transition-colors cursor-pointer rounded-2xl"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-800">
                    {chat.sender_name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(chat.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-primary font-medium truncate">
                  {chat.livestock_post_name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {chat.sender_name.split(" ")[0]}: {chat.message}
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
