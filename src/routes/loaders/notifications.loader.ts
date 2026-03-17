import type { NotificationsPageLoaderData } from "../../interfaces/loaders/NotificationsPageLoaderData";
import { notificationsApi } from "../../services/api/notifications.api";

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

    return { items: [], pagination: { total: 0, limit: 0, offset: 0, hasMore: false } };
  };
