import { useState } from "react";
import { adminApi } from "@/api/clients/admin.api";
import type { Chat } from "@/presentation/interfaces/pages/NotificationsPageLoaderData";

export const useAdminChatList = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [chatsError, setChatsError] = useState<string | null>(null);
  const [chatNameFilter, setChatNameFilter] = useState("");

  const loadChatsForUser = async (userId: string) => {
    setChatsLoading(true);
    setChatsError(null);
    setChatNameFilter("");
    try {
      const result = await adminApi.getChatsForUser(userId);
      setChats(result);
    } catch {
      setChatsError("Error al cargar los chats del usuario.");
    } finally {
      setChatsLoading(false);
    }
  };

  const reset = () => {
    setChats([]);
    setChatsError(null);
    setChatNameFilter("");
  };

  const filteredChats = chatNameFilter.trim()
    ? chats.filter((c) =>
        c.other_user_name.toLowerCase().includes(chatNameFilter.toLowerCase()),
      )
    : chats;

  return {
    chats,
    filteredChats,
    chatsLoading,
    chatsError,
    chatNameFilter,
    setChatNameFilter,
    loadChatsForUser,
    reset,
  };
};
