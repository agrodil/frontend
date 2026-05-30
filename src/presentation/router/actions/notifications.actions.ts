import { notificationsApi } from "@/api/clients/notifications.api";

export const sendMessage = async (
  sentTo: string,
  message: string,
  livestockPostId?: string,
) =>
  notificationsApi.createNotification({
    sentTo,
    message,
    purchaseNotificationTypeId: 2,
    ...(livestockPostId && { livestockPostId }),
  });

export const markChatAsRead = async (otherUserId: string) =>
  notificationsApi.markChatAsRead(otherUserId);
