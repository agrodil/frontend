import { fetchWithAuth } from "./fetchWithAuth";

export const notificationsApi = {
  getAllChatsByUser: async (limit: number, offset: number) => {
    const response = await fetchWithAuth(
      `/notifications/chats?limit=${limit}&offset=${offset}`,
    );
    if (!response.ok) throw new Error("Failed to fetch chats");
    const json = await response.json();
    return json.data;
  },
  getAllMessagesByChat: async (
    userId: string,
    limit: number,
    offset: number,
  ) => {
    const response = await fetchWithAuth(
      `/notifications/chats/${userId}/messages?limit=${limit}&offset=${offset}`,
    );
    if (!response.ok) throw new Error("Failed to fetch messages");
    const json = await response.json();
    return json.data;
  },
  createNotification: async (data: {
    sentTo: string;
    livestockPostId?: string;
    purchaseNotificationTypeId: number;
    message: string;
  }) => {
    const response = await fetchWithAuth(`/notifications`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to send notification");
    const json = await response.json();
    return json.data;
  },
  markChatAsRead: async (otherUserId: string) => {
    const response = await fetchWithAuth(
      `/notifications/chats/${otherUserId}/read`,
      { method: "PATCH" },
    );
    if (!response.ok) throw new Error("Failed to mark chat as read");
    const json = await response.json();
    return json.data;
  },
};
