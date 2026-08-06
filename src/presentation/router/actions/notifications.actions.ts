import { notificationsApi } from "@/api/clients/notifications.api";

export const sendMessage = async (
  sentTo: string,
  message: string,
  postId?: string,
) =>
  notificationsApi.createNotification({
    sentTo,
    message,
    purchaseNotificationTypeId: 2,
    ...(postId && { postId }),
  });

export const markChatAsRead = async (otherUserId: string) =>
  notificationsApi.markChatAsRead(otherUserId);
