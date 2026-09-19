import { postApi } from "@/api/clients/posts.api";
import { compressMedia } from "@/shared/utils/compressMedia";
import {
  dispatchWalletOptimistic,
  dispatchWalletRefresh,
} from "@/adapters/hooks/actions/useWallet";

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
//  2. crea el post (solo JSON) — el backend cobra el plan en la misma
//     transacción que crea el post (charge_post_publication)
//  3. pide URLs presigned
//  4. sube cada binario DIRECTO a S3 (salta el proxy → sin 413)
//  5. confirma para persistir la metadata
//
// `expectedCostUsd` es el precio del plan elegido (0 si no aplica cobro).
// Se descuenta del saldo optimistamente ANTES de llamar al backend; si crear
// el post falla, se revierte (nunca se cobró). Si el post se crea, el cobro
// ya es real e irreversible aunque falle la subida de archivos después —
// ahí no se revierte, se reconcilia con el saldo real del servidor.
export const uploadPost = async (
  input: NewPostInput,
  expectedCostUsd: number,
  onProgress?: (progress: UploadProgress) => void,
): Promise<{ postId: string; uploadedCount: number }> => {
  if (expectedCostUsd > 0) dispatchWalletOptimistic(-expectedCostUsd);

  let postId: string;
  let files: File[];
  try {
    onProgress?.({ phase: "compressing" });
    files = await compressMedia(input.media);

    onProgress?.({ phase: "creating" });
    ({ postId } = await postApi.createPost(input.post));
  } catch (error) {
    if (expectedCostUsd > 0) dispatchWalletOptimistic(expectedCostUsd);
    throw error;
  }

  // El post ya existe y el cobro (si hubo) ya se aplicó: reemplaza el
  // estimado optimista por el saldo real (cubre el primer plan gratis y
  // redondeos de tasa) sin mostrar el spinner de carga.
  dispatchWalletRefresh({ silent: true });

  if (files.length === 0) {
    return { postId, uploadedCount: 0 };
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
    const { uploads } = await postApi.presignPostFiles(postId, presignInput);

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
      postId,
      confirmInput,
    );

    return { postId, uploadedCount };
  } catch (error) {
    try {
      await postApi.deletePost(postId);
    } catch (rollbackError) {
      console.error("[uploadPost] Falló el rollback del post huérfano", {
        postId,
        rollbackError,
      });
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

// Reactivación gratis si no venció; si venció, `postingFeeId` +
// `expectedCostUsd` disparan la renovación paga con el mismo patrón
// optimista de `uploadPost`: descuenta de la cartera antes de llamar al
// backend, revierte si falla (saldo insuficiente, plan inactivo, etc).
export const activatePost = async (
  id: string,
  postingFeeId?: string,
  expectedCostUsd = 0,
): Promise<PostDetail> => {
  if (expectedCostUsd > 0) dispatchWalletOptimistic(-expectedCostUsd);
  try {
    const post = await postApi.activatePost(id, postingFeeId);
    window.dispatchEvent(new CustomEvent("postUpdated", { detail: post }));
    if (expectedCostUsd > 0) dispatchWalletRefresh({ silent: true });
    return post;
  } catch (error) {
    if (expectedCostUsd > 0) dispatchWalletOptimistic(expectedCostUsd);
    throw error;
  }
};

export const deletePost = async (id: string): Promise<void> =>
  postApi.deletePost(id);
