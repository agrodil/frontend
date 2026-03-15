import { postApi } from "../../services/api/posts.api";

export const uploadPost = async (
  data: FormData,
): Promise<{
  livestockPostId: string;
  filesInfo: { success: boolean; message: string; uploadedCount: number };
}> => postApi.uploadPost(data);
