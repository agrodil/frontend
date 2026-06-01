import type { LoaderFunctionArgs } from "react-router-dom";
import type { NotificationsPageLoaderData, Chat } from "@/presentation/interfaces/pages/NotificationsPageLoaderData";
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

export const getChatData = async ({
  params,
}: LoaderFunctionArgs): Promise<Chat> => {
  const otherUserId = params.otherUserId!;
  const { chats } = await notificationsApi.getAllChatsByUser(
    INITIAL_CHATS_LIMIT,
    0,
  );
  const chat = (chats ?? []).find(
    (c: Chat) => c.other_user_id === otherUserId,
  );
  if (!chat) throw new Response("Chat not found", { status: 404 });
  return chat;
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
