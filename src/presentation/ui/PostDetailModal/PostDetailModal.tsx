import { useEffect, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";
import { LuX } from "react-icons/lu";

import { useAuth } from "@/adapters/hooks/common/useAuth";
import { useMediaFiles } from "@/adapters/hooks/actions/useMediaFiles";
import { usePostEdit } from "@/adapters/hooks/actions/usePostEdit";
import { usePostPurchase } from "@/adapters/hooks/actions/usePostPurchase";
import { usePostDeactivate } from "@/adapters/hooks/actions/usePostDeactivate";
import { activatePost } from "@/presentation/router/actions/post.actions";

import Form from "../Form";
import MediaCarousel from "../MediaCarousel";
import { PostDetailContent } from "./PostDetailContent";
import { PostDetailActions } from "./PostDetailActions";

import type { PostDetailModalProps } from "@/presentation/interfaces/layout/PostDetailModalProps";

import { buildEditFields } from "./buildEditFields";

const PostDetailModal: FC<PostDetailModalProps> = ({
  post,
  previewImg,
  previewOwner,
  isActive = true,
  onClose,
  onUpdated,
  onDeactivated,
  onActivated,
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isActivating, setIsActivating] = useState(false);

  // Custom hooks
  const { mediaFiles } = useMediaFiles(post.post_id);
  const {
    currentPost,
    isEditing,
    isSaving,
    error: editError,
    setIsEditing,
    handleSaveEdit,
    resetPost,
  } = usePostEdit(post);

  const { buying, error: purchaseError, handleBuy } = usePostPurchase();

  const {
    confirmDeactivate,
    setConfirmDeactivate,
    isDeactivating,
    error: deactivateError,
    handleDeactivate,
  } = usePostDeactivate();

  const isOwnPost = user?.id === currentPost.posted_by;

  useEffect(() => {
    resetPost(post);
  }, [post]);

  const handleBuyClick = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (isOwnPost) return;

    try {
      await handleBuy(post, user!, previewOwner, previewImg);
    } catch {
      // Error is handled in hook
    }
  };

  const handleSaveEditClick = async (
    data: Record<string, string | File | File[] | boolean>,
  ) => {
    try {
      const updated = await handleSaveEdit(data);
      onUpdated?.(updated);
    } catch {
      // Error is handled in hook
    }
  };

  const handleDeactivateClick = async () => {
    const success = await handleDeactivate(currentPost.post_id);
    if (success) {
      onDeactivated?.(currentPost.post_id);
      onClose();
    }
  };

  const handleActivateClick = async () => {
    setIsActivating(true);
    try {
      await activatePost(currentPost.post_id);
      onActivated?.(currentPost.post_id);
      onClose();
    } catch {
      // silently ignore — parent reloads state on success only
    } finally {
      setIsActivating(false);
    }
  };

  const error = editError || purchaseError || deactivateError;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-y-auto"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-0 h-full">
            <div className="relative aspect-square lg:aspect-auto lg:min-h-164 rounded-bl-none rounded-tl-2xl overflow-hidden bg-gray-100">
              <MediaCarousel
                items={mediaFiles}
                fallbackImg={previewImg}
                alt={currentPost.post_name}
              />
            </div>

            <div className="p-6 lg:p-8 flex flex-col gap-4 relative overflow-y-auto min-h-0">
              <button
                aria-label="Cerrar"
                type="button"
                onClick={onClose}
                className="absolute top-8 right-8 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer border-0"
              >
                <LuX size={24} />
              </button>

              {isEditing ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">
                      Editar post
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent"
                      aria-label="Cancelar edición"
                    >
                      <LuX size={16} />
                    </button>
                  </div>
                  <Form
                    key={currentPost.post_id}
                    singleColumn
                    fields={buildEditFields(currentPost)}
                    onSubmit={handleSaveEditClick}
                    submitLabel="Guardar cambios"
                    isLoading={isSaving}
                  />
                  {editError && (
                    <p className="text-xs text-red-500 text-center mt-3">
                      {editError}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <PostDetailContent
                    post={currentPost}
                    previewOwner={previewOwner}
                  />

                  <PostDetailActions
                    isOwnPost={isOwnPost}
                    isActive={isActive}
                    buying={buying}
                    isDeactivating={isDeactivating}
                    isActivating={isActivating}
                    confirmDeactivate={confirmDeactivate}
                    error={purchaseError || deactivateError}
                    onBuy={handleBuyClick}
                    onEditStart={() => setIsEditing(true)}
                    onDeactivateStart={() => setConfirmDeactivate(true)}
                    onDeactivateConfirm={handleDeactivateClick}
                    onDeactivateCancel={() => setConfirmDeactivate(false)}
                    onActivate={handleActivateClick}
                  />

                  {error && (
                    <p className="text-xs text-red-500 text-center">{error}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PostDetailModal;
