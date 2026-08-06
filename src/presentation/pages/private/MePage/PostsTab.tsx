import type { FC } from "react";
import { motion } from "framer-motion";
import { LuClipboardList, LuLoader, LuRefreshCw, LuTrash2 } from "react-icons/lu";
import CardPost from "@/presentation/ui/CardPost.tsx";
import Button from "@/presentation/ui/Button.tsx";
import type { MePost } from "@/api/clients/me.api.ts";
import type { PostsTabProps } from "./PostsTabProps";
import { resolvePostPricing } from "@/shared/utils/resolvePostPricing";

const mapToCardPost = (post: MePost) => {
  const pricing = resolvePostPricing(post);
  return {
    img: post.main_image_url ?? null,
    title: post.post_name,
    priceLabel: pricing.priceLabel,
    priceSuffix: pricing.priceSuffix,
    price: pricing.price,
    townshipId: post.township_id,
  };
};

const PostsTab: FC<PostsTabProps> = ({
  myPosts,
  deactivatedPosts,
  displayName,
  onCardClick,
  onActivate,
}) => (
  <>
    {/* Active posts */}
    <h2 className="text-primary font-bold text-[clamp(1.2rem,1.8vw,1.5rem)]">
      Publicaciones activas
    </h2>

    {myPosts.posts.length === 0 ? (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center justify-center gap-3 py-10 text-gray-400"
      >
        <LuClipboardList size={40} strokeWidth={1.2} />
        <p className="text-sm font-medium">No tienes publicaciones activas</p>
      </motion.div>
    ) : (
      <>
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {myPosts.posts.map((post) => (
            <CardPost
              key={post.post_id}
              {...mapToCardPost(post)}
              owner={displayName}
              onClick={() => onCardClick(post.post_id)}
            />
          ))}
        </motion.div>

        {myPosts.pagination.hasMore && (
          <div className="flex justify-center mt-2">
            <Button
              label={
                myPosts.loadingMore ? "Cargando..." : "Ver más publicaciones"
              }
              variant="secondary"
              size="sm"
              disabled={myPosts.loadingMore}
              onClick={myPosts.loadMore}
              className="gap-2"
            />
            {myPosts.loadingMore && (
              <LuLoader
                size={16}
                className="animate-spin text-primary ml-2 self-center"
              />
            )}
          </div>
        )}
      </>
    )}

    {/* Deactivated posts */}
    <h2 className="text-gray-500 font-bold text-[clamp(1.2rem,1.8vw,1.5rem)] mt-4">
      Publicaciones desactivadas
    </h2>

    {deactivatedPosts.loading ? (
      <div className="flex justify-center py-8">
        <LuLoader size={24} className="animate-spin text-gray-400" />
      </div>
    ) : deactivatedPosts.posts.length === 0 ? (
      <p className="text-sm text-gray-400 text-center py-6">
        No tienes publicaciones desactivadas
      </p>
    ) : (
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      >
        {deactivatedPosts.posts.map((post) => (
          <div key={post.post_id} className="flex flex-col gap-2">
            {/* Card with grayscale overlay */}
            <div className="relative rounded-xl overflow-hidden border border-gray-200 grayscale opacity-70">
              <CardPost
                {...mapToCardPost(post)}
                owner={displayName}
                onClick={() => onCardClick(post.post_id)}
              />
              <div className="absolute top-2 left-2">
                <span className="text-[10px] font-bold bg-gray-700 text-white px-2 py-0.5 rounded-full uppercase">
                  Desactivada
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => onCardClick(post.post_id)}
                className="flex items-center justify-center gap-1 text-[10px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg py-1.5 transition-colors border-0 cursor-pointer"
                title="Editar"
              >
                Editar
              </button>

              <button
                type="button"
                onClick={() => onActivate(post.post_id)}
                disabled={deactivatedPosts.activatingId === post.post_id}
                className="flex items-center justify-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg py-1.5 transition-colors border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Activar"
              >
                {deactivatedPosts.activatingId === post.post_id ? (
                  <LuLoader size={10} className="animate-spin" />
                ) : (
                  <LuRefreshCw size={10} />
                )}
                Activar
              </button>

              {deactivatedPosts.confirmDeleteId === post.post_id ? (
                <button
                  type="button"
                  onClick={() =>
                    deactivatedPosts.confirmDelete(post.post_id)
                  }
                  disabled={
                    deactivatedPosts.deletingId === post.post_id
                  }
                  className="flex items-center justify-center gap-1 text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg py-1.5 transition-colors border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Confirmar eliminación"
                >
                  {deactivatedPosts.deletingId === post.post_id ? (
                    <LuLoader size={10} className="animate-spin" />
                  ) : (
                    <LuTrash2 size={10} />
                  )}
                  ¿Seguro?
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    deactivatedPosts.requestDelete(post.post_id)
                  }
                  className="flex items-center justify-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg py-1.5 transition-colors border-0 cursor-pointer"
                  title="Eliminar permanentemente"
                >
                  <LuTrash2 size={10} />
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </motion.div>
    )}
  </>
);

export default PostsTab;
