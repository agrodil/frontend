import { useState, useEffect, type FC } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useAuth } from "@/adapters/hooks/common/useAuth.tsx";

import { motion, AnimatePresence } from "framer-motion";
import { LuMessageCircle, LuClipboardList, LuLoader } from "react-icons/lu";

import CardPost from "@/presentation/ui/CardPost.tsx";
import Button from "@/presentation/ui/Button.tsx";
import ProfileEditForm from "./ProfileEditForm.tsx";

import type { MePageLoaderData } from "@/presentation/router/loaders/me.loader.ts";

import type { MePost, MyPostsPagination } from "@/api/clients/me.api.ts";
import { meApi } from "@/api/clients/me.api.ts";

import { getAvatarColor } from "@/shared/utils/getAvatarColor.ts";
import { getInitials } from "@/shared/utils/getInitials.ts";

const mapToCardPost = (post: MePost) => ({
  img: post.main_image_url ?? null,
  title: post.livestock_post_name,
  saleTypeId: post.sale_type_id,
  weight: Number(post.avg_weight_kg ?? 0),
  price: Number(post.price_per_kg ?? post.price_per_unit ?? 0),
});

// ─── Component ────────────────────────────────────────────────────────────────

const MePage: FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const loaderData = useLoaderData() as MePageLoaderData;
  const { user, updateUser, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<MePost[]>(loaderData.posts);
  const [pagination, setPagination] = useState<MyPostsPagination>(
    loaderData.pagination,
  );
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) return null;

  const displayName = user.firstName + " " + user.lastName,
    initials = getInitials(user.firstName + " " + user.lastName),
    avatarColor = getAvatarColor(user.email);

  const handleUpdateProfile = async (
    data: Record<string, string | File | File[] | boolean>,
  ) => {
    try {
      await updateUser({
        firstName: data.firstName as string,
        middleName: data.middleName as string,
        lastName: data.lastName as string,
        secondLastName: data.secondLastName as string,
        documentType: data.documentType as string,
        documentNumber: Number(data.documentNumber),
        townshipId: Number(data.townshipId),
        phone: data.phone as string,
        email: data.email as string,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const nextOffset = pagination.offset + pagination.limit;
      const { items, pagination: newPagination } = await meApi.getMyPosts(
        pagination.limit,
        nextOffset,
      );
      setPosts((prev) => [...prev, ...items]);
      setPagination(newPagination);
    } catch {
      // silently ignore
    } finally {
      setLoadingMore(false);
    }
  };

  const stats = [
    {
      value: String(pagination.total).padStart(2, "0"),
      label: "publicaciones",
    },
    ...loaderData.stats.slice(1),
  ];

  return (
    <>
      <main className="flex-1 w-[90vw] mx-auto py-[clamp(1.5rem,4vw,3rem)] flex flex-col gap-[clamp(0.75rem,2vw,1.5rem)]">
        {/* ── Profile card ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center flex-col sm:flex-row w-full
                   px-[clamp(1.25rem,4vw,2.5rem)] py-[clamp(1rem,2.5vw,1.75rem)]
                   gap-[clamp(0.75rem,2.5vw,2rem)]"
        >
          {/* Avatar */}
          <div
            className={`${avatarColor} rounded-full flex items-center justify-center text-white font-bold shrink-0
                      w-[clamp(3.5rem,7vw,6rem)] h-[clamp(3.5rem,7vw,6rem)] text-[clamp(1rem,2vw,1.75rem)]`}
          >
            {initials}
          </div>

          {/* Name + actions */}
          <div className="flex flex-col min-w-0 flex-1 gap-[clamp(0.35rem,1vw,0.6rem)] sm:items-start items-center">
            <h1 className="text-primary font-bold capitalize truncate text-[clamp(1.1rem,2.5vw,2rem)]">
              {displayName}
            </h1>
            <p className="text-gray-500 text-[clamp(0.8rem,1.2vw,1rem)] text-center md:text-start -my-1">
              {`${user.documentType} - ${user.documentNumber}`}
            </p>
            <div className="flex items-center gap-[clamp(0.5rem,1.2vw,0.75rem)]">
              <Button
                label="Editar Perfil"
                variant="primary"
                size="sm"
                onClick={() => setIsEditing((v) => !v)}
                className="shrink-0 text-[clamp(0.7rem,1.2vw,0.875rem)] px-[clamp(1rem,2vw,2rem)]"
              />
              <button
                type="button"
                aria-label="Mensaje"
                className="rounded-full border border-primary flex items-center justify-center
                         text-primary hover:bg-primary/10 transition-colors cursor-pointer bg-white
                         shrink-0 w-[clamp(2.5rem,4vw,3rem)] h-[clamp(2.5rem,4vw,3rem)]"
              >
                <LuMessageCircle className="w-[clamp(1rem,1.8vw,1.35rem)] h-[clamp(1rem,1.8vw,1.35rem)]" />
              </button>
              <Button
                label="Cerrar sesión"
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                className="shrink-0 text-[clamp(0.7rem,1.2vw,0.875rem)] px-[clamp(1rem,2vw,2rem)]"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center shrink-0 gap-[clamp(1rem,3.5vw,3rem)]">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-[clamp(0.1rem,0.3vw,0.2rem)]"
              >
                <span className="text-primary font-bold text-[clamp(1rem,2vw,1.5rem)]">
                  {stat.value}
                </span>
                <span className="text-gray-400 text-[clamp(0.6rem,0.85vw,0.75rem)]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Edit form ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {isEditing && (
            <ProfileEditForm
              user={user}
              onSave={handleUpdateProfile}
              onClose={() => setIsEditing(false)}
            />
          )}
        </AnimatePresence>

        {/* ── Recent posts ──────────────────────────────────────────────── */}
        <h2 className="text-primary font-bold text-[clamp(2rem,1.8vw,2.5rem)]">
          Publicaciones recientes
        </h2>

        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400"
          >
            <LuClipboardList size={48} strokeWidth={1.2} />
            <p className="text-base font-medium">
              No tienes publicaciones recientes
            </p>
            <p className="text-sm">
              Tus publicaciones aparecerán aquí una vez que las crees.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
              className="flex-1 flex flex-col sm:flex-row flex-wrap gap-4"
            >
              {posts.map((post) => (
                <CardPost
                  key={post.livestock_post_id}
                  {...mapToCardPost(post)}
                  owner={displayName}
                />
              ))}
            </motion.div>

            {pagination.hasMore && (
              <div className="flex justify-center mt-2">
                <Button
                  label={loadingMore ? "Cargando..." : "Ver más publicaciones"}
                  variant="secondary"
                  size="sm"
                  disabled={loadingMore}
                  onClick={handleLoadMore}
                  className="gap-2"
                />
                {loadingMore && (
                  <LuLoader
                    size={16}
                    className="animate-spin text-primary ml-2 self-center"
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default MePage;
