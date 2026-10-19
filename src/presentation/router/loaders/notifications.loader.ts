import { redirect, type LoaderFunctionArgs } from "react-router-dom";
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
      const message = error instanceof Error ? error.message : String(error);
      console.error("[notifications] getNotificationsData failed:", message);
      return {
        items: [],
        pagination: { total: 0, limit: 0, offset: 0, hasMore: false },
        error: message,
      };
    }
  };

export const getChatData = async ({
  params,
}: LoaderFunctionArgs): Promise<Chat> => {
  const otherUserId = params.otherUserId!;
  try {
    const { chats } = await notificationsApi.getAllChatsByUser(
      INITIAL_CHATS_LIMIT,
      0,
    );
    const chat = (chats ?? []).find(
      (c: Chat) => c.other_user_id === otherUserId,
    );
    if (!chat) throw new Response("Chat not found", { status: 404 });
    return chat;
  } catch (error) {
    if (error instanceof Response) throw error;
    throw redirect("/notifications");
  }
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
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error fetching messages:", message);
    return {
      items: [],
      pagination: { total: 0, limit: 0, offset: 0, hasMore: false },
      error: message,
    };
  }
};
