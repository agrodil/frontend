import { notificationsApi } from "../../services/api/notifications.api";

export const uploadPost = async (
  data: FormData,
): Promise<{
  livestockPostId: string;
  filesInfo: { success: boolean; message: string; uploadedCount: number };
}> => notificationsApi.createNotification(data);
