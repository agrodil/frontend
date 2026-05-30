import { useState } from "react";
import { updatePost } from "@/presentation/router/actions/post.actions";
import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import type { UpdatePostPayload } from "@/api/interfaces/requests/UpdatePostPayload.interface";

export const usePostEdit = (initialPost: PostDetail) => {
  const [currentPost, setCurrentPost] = useState<PostDetail>(initialPost);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveEdit = async (
    data: Record<string, string | File | File[] | boolean>,
  ) => {
    setIsSaving(true);
    setError(null);
    try {
      const payload: UpdatePostPayload = {
        livestockPostName: (data.livestockPostName as string).trim(),
        sex: data.sex as string,
        quantity: Number(data.quantity),
        details:
          typeof data.details === "string" && data.details.trim().length > 0
            ? (data.details as string).trim()
            : undefined,
      };

      if (currentPost.sale_type_id === 1) {
        payload.avgWeightKg = Number(data.avgWeightKg);
        payload.pricePerKg = Number(data.pricePerKg);
      } else {
        payload.pricePerUnit = Number(data.pricePerUnit);
      }

      const updated = await updatePost(currentPost.livestock_post_id, payload);
      setCurrentPost(updated);
      setIsEditing(false);
      return updated;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo actualizar el post";
      setError(msg);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const resetPost = (post: PostDetail) => {
    setCurrentPost(post);
    setIsEditing(false);
    setError(null);
  };

  return {
    currentPost,
    isEditing,
    isSaving,
    error,
    setIsEditing,
    handleSaveEdit,
    resetPost,
    setError,
  };
};
