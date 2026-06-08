import { fetchWithAuth } from "../fetchWithAuth";
import type {
  Message,
  Chat,
  ChatPagination,
} from "@/presentation/interfaces/pages/NotificationsPageLoaderData";

export type AdminStats = {
  verifiedUsersCount: number;
  purchaseRequestsCount: number;
  convertedToSalesCount: number;
};

export type AdminUser = {
  app_user_id: string;
  email: string;
  document_type: string | null;
  document_number: number | null;
  role_id: number;
  is_verified: boolean;
  display_name: string;
};

export type AdminChatMessagesResult = {
  messages: Message[];
  pagination: ChatPagination;
};

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await fetchWithAuth("/admin/stats");
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("[admin] getStats failed", { status: response.status, body });
      throw new Error(`Failed to fetch admin stats (status ${response.status})`);
    }
    const json = await response.json();
    return json.data ?? json;
  },

  searchUser: async (q: string): Promise<AdminUser | null> => {
    const params = new URLSearchParams({ q });
    const response = await fetchWithAuth(`/admin/users/search?${params}`);
    if (!response.ok) {
      if (response.status === 400) return null;
      throw new Error(`Search failed (status ${response.status})`);
    }
    const json = await response.json();
    return (json.data ?? json) as AdminUser | null;
  },

  getChatsForUser: async (userId: string): Promise<Chat[]> => {
    const params = new URLSearchParams({ userId });
    const response = await fetchWithAuth(`/admin/chats?${params}`);
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Failed to fetch chats (status ${response.status}): ${body}`);
    }
    const json = await response.json();
    return (json.data ?? json) as Chat[];
  },

  getChatMessages: async (
    userId1: string,
    userId2: string,
    limit: number,
    offset: number,
    q?: string,
  ): Promise<AdminChatMessagesResult> => {
    const params = new URLSearchParams({
      userId1,
      userId2,
      limit: String(limit),
      offset: String(offset),
    });
    if (q?.trim()) params.set("q", q.trim());
    const response = await fetchWithAuth(`/admin/chats/messages?${params}`);
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Failed to fetch chat messages (status ${response.status}): ${body}`);
    }
    const json = await response.json();
    return (json.data ?? json) as AdminChatMessagesResult;
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    const response = await fetchWithAuth(
      `/admin/chats/messages/${messageId}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Failed to delete message (status ${response.status}): ${body}`);
    }
  },
};
