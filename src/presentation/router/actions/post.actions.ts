import { postApi } from "@/api/clients/posts.api";
import { compressMedia } from "@/shared/utils/compressMedia";

import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import type { UpdatePostPayload } from "@/api/interfaces/requests/UpdatePostPayload.interface";

export type UploadProgress =
  | { phase: "compressing" }
  | { phase: "creating" }
  | { phase: "uploading"; index: number; total: number }
  | { phase: "confirming" };

export type NewPostInput = {
  post: Record<string, unknown>;
  media: File[];
};

// Orquesta el flujo presigned de creación de publicación:
//  1. comprime media (imágenes → ~1MB; videos passthrough)
//  2. crea el post (solo JSON)
//  3. pide URLs presigned
//  4. sube cada binario DIRECTO a S3 (salta el proxy → sin 413)
//  5. confirma para persistir la metadata
export const uploadPost = async (
  input: NewPostInput,
  onProgress?: (progress: UploadProgress) => void,
): Promise<{ livestockPostId: string; uploadedCount: number }> => {
  onProgress?.({ phase: "compressing" });
  const files = await compressMedia(input.media);

  onProgress?.({ phase: "creating" });
  const { livestockPostId } = await postApi.createPost(input.post);

  if (files.length === 0) {
    return { livestockPostId, uploadedCount: 0 };
  }

  // A partir de acá el post YA existe en BD. Si algo falla (presign, PUT a S3,
  // confirm), lo borramos para no dejar un post huérfano sin archivos — desde
  // afuera debe verse como "nunca se creó", tal como pide el usuario.
  try {
    const presignInput = files.map((file, index) => ({
      fileName: file.name,
      mimeType: file.type,
      fileSizeBytes: file.size,
      isMainFile: index === 0,
      displayOrder: index + 1,
    }));
    const { uploads } = await postApi.presignPostFiles(
      livestockPostId,
      presignInput,
    );

    // `uploads` conserva el orden de `files` (Promise.all + map preservan índice).
    for (let index = 0; index < uploads.length; index++) {
      onProgress?.({ phase: "uploading", index, total: uploads.length });
      await postApi.uploadToS3(uploads[index].uploadUrl, files[index]);
    }

    onProgress?.({ phase: "confirming" });
    const confirmInput = uploads.map((upload, index) => ({
      s3Key: upload.s3Key,
      fileName: files[index].name,
      mimeType: files[index].type,
      fileSizeBytes: files[index].size,
      isMainFile: index === 0,
      displayOrder: index + 1,
    }));
    const { uploadedCount } = await postApi.confirmPostFiles(
      livestockPostId,
      confirmInput,
    );

    return { livestockPostId, uploadedCount };
  } catch (error) {
    try {
      await postApi.deletePost(livestockPostId);
    } catch (rollbackError) {
      console.error(
        "[uploadPost] Falló el rollback del post huérfano",
        { livestockPostId, rollbackError },
      );
    }
    throw error;
  }
};

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
