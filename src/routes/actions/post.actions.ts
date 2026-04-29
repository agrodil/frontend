import {
  postApi,
  type PostDetail,
  type UpdatePostPayload,
} from "../../services/api/posts.api";

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
