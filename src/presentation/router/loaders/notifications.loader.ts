import type { NotificationsPageLoaderData } from "@/presentation/interfaces/pages/NotificationsPageLoaderData";
import { notificationsApi } from "@/api/clients/notifications.api";

const INITIAL_CHATS_LIMIT = 30;

export const getNotificationsData =
  async (): Promise<NotificationsPageLoaderData> => {
    try {
      const { chats } = await notificationsApi.getAllChatsByUser(
        INITIAL_CHATS_LIMIT,
        0,
      );
      return {
        items: chats ?? [],
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }

    return {
      items: [],
      pagination: { total: 0, limit: 0, offset: 0, hasMore: false },
    };
  };

export const getMessagesData = async (
  otherUserId: string,
): Promise<NotificationsPageLoaderData> => {
  try {
    const { messages } = await notificationsApi.getAllMessagesByChat(
      otherUserId,
      INITIAL_CHATS_LIMIT,
      0,
    );
    return {
      items: messages ?? [],
    };
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
  return {
    items: [],
    pagination: { total: 0, limit: 0, offset: 0, hasMore: false },
  };
};
