import { postApi } from "@/services/api/posts.api";

import type { PostDetail } from "@/interfaces/api/posts/PostDetail.interface";
import type { UpdatePostPayload } from "@/interfaces/api/posts/UpdatePostPayload.interface";

export const uploadPost = async (
  data: FormData,
): Promise<{
  livestockPostId: string;
  filesInfo: { success: boolean; message: string; uploadedCount: number };
}> => postApi.uploadPost(data);

export const updatePost = async (
  id: string,
  data: UpdatePostPayload,
): Promise<PostDetail> => postApi.updatePost(id, data);

export const deactivatePost = async (id: string): Promise<PostDetail> =>
  postApi.deactivatePost(id);
