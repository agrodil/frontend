import { useState } from "react";
import { updatePost } from "@/presentation/router/actions/post.actions";
import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import type { UpdatePostPayload } from "@/api/interfaces/requests/UpdatePostPayload.interface";
import { POST_CATEGORY } from "@/shared/utils/resolvePostPricing";

type EditFormData = Record<string, string | File | File[] | boolean>;

// Espejo de buildEditFields: cada categoría edita solo sus propios campos.
// La categoría en sí es inmutable (ver comentario en buildEditFields.ts).
const buildUpdatePayload = (
  categoryId: number,
  data: EditFormData,
): UpdatePostPayload => {
  const details =
    typeof data.details === "string" && data.details.trim().length > 0
      ? (data.details as string).trim()
      : undefined;

  const base: UpdatePostPayload = {
    postName: (data.postName as string).trim(),
    details,
  };

  switch (categoryId) {
    case POST_CATEGORY.MAQUINARIA:
      return {
        ...base,
        postBrand:
          typeof data.postBrand === "string" && data.postBrand.trim()
            ? data.postBrand.trim()
            : undefined,
        pricePerUnit: Number(data.pricePerUnit),
      };

    case POST_CATEGORY.FINCAS:
      return {
        ...base,
        farmHectares: Number(data.farmHectares),
        pricePerHectare: Number(data.pricePerHectare),
      };

    case POST_CATEGORY.INSUMOS:
      return {
        ...base,
        pricePerUnit: Number(data.pricePerUnit),
      };

    default: // Animales
      return {
        ...base,
        sex: data.sex as string,
        quantity: Number(data.quantity),
        ...(data.avgWeightKg || data.pricePerKg
          ? {
              avgWeightKg: Number(data.avgWeightKg),
              pricePerKg: Number(data.pricePerKg),
            }
          : { pricePerUnit: Number(data.pricePerUnit) }),
      };
  }
};

export const usePostEdit = (initialPost: PostDetail) => {
  const [currentPost, setCurrentPost] = useState<PostDetail>(initialPost);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveEdit = async (data: EditFormData) => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = buildUpdatePayload(currentPost.post_category_id, data);
      const updated = await updatePost(currentPost.post_id, payload);
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
