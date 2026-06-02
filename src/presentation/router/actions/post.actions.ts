import { postApi } from "@/api/clients/posts.api";

import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import type { UpdatePostPayload } from "@/api/interfaces/requests/UpdatePostPayload.interface";

export const uploadPost = async (
  data: FormData,
): Promise<{
  livestockPostId: string;
  filesInfo: { success: boolean; message: string; uploadedCount: number };
}> => postApi.uploadPost(data);

export const updatePost = async (
  id: string,
  data: UpdatePostPayload,
): Promise<PostDetail> => {
  const post = await postApi.updatePost(id, data);
  window.dispatchEvent(new CustomEvent("postUpdated", { detail: post }));
  return post;
};

export const deactivatePost = async (id: string): Promise<PostDetail> =>
  postApi.deactivatePost(id);

export const activatePost = async (id: string): Promise<PostDetail> => {
  const post = await postApi.activatePost(id);
  window.dispatchEvent(new CustomEvent("postUpdated", { detail: post }));
  return post;
};

export const deletePost = async (id: string): Promise<void> =>
  postApi.deletePost(id);
