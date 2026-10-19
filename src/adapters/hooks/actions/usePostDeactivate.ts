import { useState } from "react";
import { deactivatePost } from "@/presentation/router/actions/post.actions";

export const usePostDeactivate = () => {
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeactivate = async (postId: string) => {
    setIsDeactivating(true);
    setError(null);
    try {
      await deactivatePost(postId);
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo desactivar el post";
      setError(msg);
      return false;
    } finally {
      setIsDeactivating(false);
    }
  };

  return {
    confirmDeactivate,
    setConfirmDeactivate,
    isDeactivating,
    error,
    handleDeactivate,
    setError,
  };
};
