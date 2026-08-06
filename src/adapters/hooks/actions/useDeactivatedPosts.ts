import { useEffect, useState } from "react";
import { meApi, type MePost } from "@/api/clients/me.api";
import {
  activatePost as activatePostAction,
  deletePost as deletePostAction,
} from "@/presentation/router/actions/post.actions";

const DEACTIVATED_LIMIT = 20;

export interface UseDeactivatedPostsResult {
  posts: MePost[];
  loading: boolean;
  activatingId: string | null;
  deletingId: string | null;
  confirmDeleteId: string | null;
  activate: (id: string) => Promise<void>;
  requestDelete: (id: string) => void;
  cancelDelete: () => void;
  confirmDelete: (id: string) => Promise<void>;
  prepend: (post: MePost) => void;
  removeLocal: (id: string) => void;
}

// Publicaciones desactivadas del usuario. Se carga sola al montar (no depende
// de ningún tab) y expone activar/eliminar más el estado de confirmación de
// borrado ("¿Seguro?").
export function useDeactivatedPosts(): UseDeactivatedPostsResult {
  const [posts, setPosts] = useState<MePost[]>([]);
  // true por defecto: se carga en mount
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    meApi
      .getMyDeactivatedPosts(DEACTIVATED_LIMIT, 0)
      .then((res) => {
        if (!cancelled) setPosts(res.items);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const removeLocal = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.post_id !== id));
  };

  const activate = async (id: string) => {
    setActivatingId(id);
    try {
      await activatePostAction(id);
      removeLocal(id);
    } finally {
      setActivatingId(null);
    }
  };

  const requestDelete = (id: string) => setConfirmDeleteId(id);
  const cancelDelete = () => setConfirmDeleteId(null);

  const confirmDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deletePostAction(id);
      removeLocal(id);
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const prepend = (post: MePost) => setPosts((prev) => [post, ...prev]);

  return {
    posts,
    loading,
    activatingId,
    deletingId,
    confirmDeleteId,
    activate,
    requestDelete,
    cancelDelete,
    confirmDelete,
    prepend,
    removeLocal,
  };
}
