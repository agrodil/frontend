import { useState, type FC } from "react";
import { motion } from "framer-motion";
import {
  LuClipboardList,
  LuLoader,
  LuRefreshCw,
  LuTrash2,
} from "react-icons/lu";
import CardPost from "@/presentation/ui/CardPost.tsx";
import Button from "@/presentation/ui/Button.tsx";
import RenewPostModal from "@/presentation/ui/RenewPostModal";
import type { MePost } from "@/api/clients/me.api.ts";
import type { PostsTabProps } from "./PostsTabProps";
import { resolvePostPricing } from "@/shared/utils/resolvePostPricing";
import { resolvePostStatus } from "@/shared/utils/resolvePostStatus";
import { POST_STATUS } from "@/shared/constants/post-status.catalog";
import { useCatalog } from "@/adapters/hooks/actions/useCatalog";
import { resolveRenewalDiscountPlanId } from "@/shared/utils/resolveRenewalDiscountPlanId";

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
  onRenew,
}) => {
  const catalog = useCatalog();
  const [renewTarget, setRenewTarget] = useState<MePost | null>(null);
  const [renewing, setRenewing] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);

  const handleConfirmRenew = async (postingFeeId: string) => {
    if (!renewTarget) return;
    setRenewing(true);
    setRenewError(null);
    try {
      const expectedCostUsd = catalog.postingFeePrices[postingFeeId] ?? 0;
      await onRenew(renewTarget.post_id, postingFeeId, expectedCostUsd);
      setRenewTarget(null);
    } catch (error) {
      setRenewError(
        error instanceof Error
          ? error.message
          : "No se pudo renovar la publicación.",
      );
    } finally {
      setRenewing(false);
    }
  };

  // GET /posts/me?active=false trae el historial COMPLETO a propósito (ver
  // sql/functions/get_user_posts.sql: incluye activos vigentes para que un
  // vencido-no-flippado-todavía aparezca como candidato a renovar). Esta
  // sección solo debe mostrar lo que su título promete: filtrar los activos
  // vigentes acá, no en el backend.
  const visibleDeactivatedPosts = deactivatedPosts.posts.filter(
    (post) => resolvePostStatus(post) !== "active",
  );

  return (
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
    <h2 className="text-primary font-bold text-[clamp(1.2rem,1.8vw,1.5rem)] mt-4">
      Publicaciones desactivadas
    </h2>

    {deactivatedPosts.loading ? (
      <div className="flex justify-center py-8">
        <LuLoader size={24} className="animate-spin text-gray-400" />
      </div>
    ) : visibleDeactivatedPosts.length === 0 ? (
      <p className="text-sm text-gray-400 text-center py-6">
        No tienes publicaciones desactivadas
      </p>
    ) : (
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {visibleDeactivatedPosts.map((post) => {
          const status = resolvePostStatus(post);
          const expired = status === "expired";
          return (
          <div key={post.post_id} className="flex flex-col gap-2">
            {/* Card: gris si solo desactivada, ámbar si vencida (indica que
                reactivarla cobra a la cartera) */}
            <div
              className={`relative rounded-xl overflow-hidden border opacity-70 ${
                expired ? "border-amber-300" : "border-gray-200 grayscale"
              }`}
            >
              {expired && (
                <span
                  className={`absolute top-2 left-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${POST_STATUS.expired.badgeClass}`}
                >
                  {POST_STATUS.expired.label}
                </span>
              )}
              <CardPost
                {...mapToCardPost(post)}
                owner={displayName}
                onClick={() => onCardClick(post.post_id)}
              />
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
                onClick={() =>
                  expired ? setRenewTarget(post) : onActivate(post.post_id)
                }
                disabled={deactivatedPosts.activatingId === post.post_id}
                className={`flex items-center justify-center gap-1 text-[10px] font-semibold rounded-lg py-1.5 transition-colors border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  expired
                    ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
                    : "text-green-700 bg-green-50 hover:bg-green-100"
                }`}
                title={expired ? "Renovar (cobra a tu cartera)" : "Activar"}
              >
                {deactivatedPosts.activatingId === post.post_id ? (
                  <LuLoader size={10} className="animate-spin" />
                ) : (
                  <LuRefreshCw size={10} />
                )}
                {expired ? "Renovar" : "Activar"}
              </button>

              {deactivatedPosts.confirmDeleteId === post.post_id ? (
                <button
                  type="button"
                  onClick={() => deactivatedPosts.confirmDelete(post.post_id)}
                  disabled={deactivatedPosts.deletingId === post.post_id}
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
                  onClick={() => deactivatedPosts.requestDelete(post.post_id)}
                  className="flex items-center justify-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg py-1.5 transition-colors border-0 cursor-pointer"
                  title="Eliminar permanentemente"
                >
                  <LuTrash2 size={10} />
                  Eliminar
                </button>
              )}
            </div>
          </div>
          );
        })}
      </motion.div>
    )}

    {renewTarget && (
      <RenewPostModal
        postTitle={renewTarget.post_name}
        plans={catalog.postingFees}
        planPrices={catalog.postingFeePrices}
        recommendedPlanId={resolveRenewalDiscountPlanId(renewTarget, catalog)}
        onConfirm={handleConfirmRenew}
        onClose={() => setRenewTarget(null)}
        loading={renewing}
        error={renewError}
      />
    )}
  </>
  );
};

export default PostsTab;
