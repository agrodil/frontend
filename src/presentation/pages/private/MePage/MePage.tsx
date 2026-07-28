import { useState, useEffect, type FC } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useAuth } from "@/adapters/hooks/common/useAuth.tsx";

import { motion, AnimatePresence } from "framer-motion";
import {
  LuClipboardList,
  LuLoader,
  LuPowerOff,
  LuRefreshCw,
  LuTrash2,
} from "react-icons/lu";

import CardPost from "@/presentation/ui/CardPost.tsx";
import Button from "@/presentation/ui/Button.tsx";
import ProfileEditForm from "./ProfileEditForm.tsx";
import PostDetailModal from "@/presentation/ui/PostDetailModal/PostDetailModal";
import TransactionDetailModal from "./TransactionDetailModal";
import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import type { PurchaseRequest } from "@/api/interfaces/responses/PurchaseRequest.interface";
import { postApi } from "@/api/clients/posts.api";
import { purchaseApi } from "@/api/clients/purchase.api";
import {
  activatePost as activatePostAction,
  deletePost as deletePostAction,
} from "@/presentation/router/actions/post.actions";

import type { MePageLoaderData } from "@/presentation/router/loaders/me.loader.ts";
import type { MePost, MyPostsPagination } from "@/api/clients/me.api.ts";
import { meApi } from "@/api/clients/me.api.ts";

import { getAvatarColor } from "@/shared/utils/getAvatarColor.ts";
import { getInitials } from "@/shared/utils/getInitials.ts";
import { sales } from "@/shared/constants/sale-types.catalog";
import { purchaseStatuses } from "@/shared/constants/purchase-status.catalog";
import { ADMIN_ROLE_ID } from "@/shared/constants/roles.catalog";
import { userPreferencesApi } from "@/api/clients/userPreferences.api";
import type { UserPreferences } from "@/api/interfaces/responses/UserPreferences.interface";

type Tab = "publicaciones" | "transacciones" | "preferencias";

const DEACTIVATED_LIMIT = 20;
const TRANSACTIONS_LIMIT = 20;

const mapToCardPost = (post: MePost) => ({
  img: post.main_image_url ?? null,
  title: post.livestock_post_name,
  saleTypeId: post.sale_type_id,
  weight: Number(post.avg_weight_kg ?? 0),
  price: Number(post.price_per_kg ?? post.price_per_unit ?? 0),
});

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("es-VE", { dateStyle: "short" }) : "—";

const statusColors: Record<string, string> = {
  yellow: "bg-yellow-100 text-yellow-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-500",
};

// ─── Component ────────────────────────────────────────────────────────────────

const MePage: FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const loaderData = useLoaderData() as MePageLoaderData;
  const { user, updateUser, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>("publicaciones");

  // ── Active posts ─────────────────────────────────────────────────────────
  const [posts, setPosts] = useState<MePost[]>(loaderData.posts);
  const [pagination, setPagination] = useState<MyPostsPagination>(
    loaderData.pagination,
  );
  const [loadingMore, setLoadingMore] = useState(false);

  // ── Deactivated posts ─────────────────────────────────────────────────────
  const [deactivatedPosts, setDeactivatedPosts] = useState<MePost[]>([]);
  // true por defecto: se carga en mount
  const [deactivatedLoading, setDeactivatedLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ── Post detail modal ─────────────────────────────────────────────────────
  const [postDetail, setPostDetail] = useState<PostDetail | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // ── Transactions ──────────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState<PurchaseRequest[]>([]);
  const [transactionsFetched, setTransactionsFetched] = useState(false);
  const [transactionsPagination, setTransactionsPagination] =
    useState<MyPostsPagination | null>(null);
  const transactionsLoading =
    activeTab === "transacciones" && !transactionsFetched;
  const [loadingMoreTx, setLoadingMoreTx] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<PurchaseRequest | null>(null);

  // ── Preferences ───────────────────────────────────────────────────────────
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [preferencesFetched, setPreferencesFetched] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsError, setPrefsError] = useState<string | null>(null);
  const preferencesLoading =
    activeTab === "preferencias" && !preferencesFetched;

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [loading, user, navigate]);

  // ── Load deactivated posts on mount (loading initialized true) ───────────
  useEffect(() => {
    let cancelled = false;
    meApi
      .getMyDeactivatedPosts(DEACTIVATED_LIMIT, 0)
      .then((res) => {
        if (!cancelled) setDeactivatedPosts(res.items);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setDeactivatedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Load transactions when tab first opens ────────────────────────────────
  useEffect(() => {
    if (activeTab !== "transacciones" || transactionsFetched) return;
    let cancelled = false;
    purchaseApi
      .getMyPurchaseRequests(TRANSACTIONS_LIMIT, 0)
      .then((res) => {
        if (!cancelled) {
          setTransactions(Array.isArray(res?.items) ? res.items : []);
          setTransactionsPagination(res?.pagination ?? null);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setTransactionsFetched(true);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, transactionsFetched]);

  // ── Load preferences when tab first opens ─────────────────────────────────
  useEffect(() => {
    if (activeTab !== "preferencias" || preferencesFetched) return;
    let cancelled = false;
    userPreferencesApi
      .getPreferences()
      .then((prefs) => {
        if (!cancelled) setPreferences(prefs);
      })
      .catch(() => {
        if (!cancelled) setPreferences({ email_on_purchase_request: false });
      })
      .finally(() => {
        if (!cancelled) setPreferencesFetched(true);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, preferencesFetched]);

  if (loading || !user) return null;

  const displayName = user.firstName + " " + user.lastName,
    initials = getInitials(user.firstName + " " + user.lastName),
    avatarColor = getAvatarColor(user.email);

  // ── Handlers ──────────────────────────────────────────────────────────────

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

  const handleCardClick = async (postId: string) => {
    try {
      const detail = await postApi.getPostById(postId);
      setPostDetail(detail);
      setSelectedPostId(postId);
    } catch (error) {
      console.error("Error loading post detail:", error);
    }
  };

  const handleActivate = async (postId: string) => {
    setActivatingId(postId);
    try {
      await activatePostAction(postId);
      setDeactivatedPosts((prev) =>
        prev.filter((p) => p.livestock_post_id !== postId),
      );
      // Reload active posts so the newly activated post appears
      const { items, pagination: newPag } = await meApi.getMyPosts(
        pagination.limit,
        0,
      );
      setPosts(items);
      setPagination(newPag);
    } catch (error) {
      console.error("Error activating post:", error);
    } finally {
      setActivatingId(null);
    }
  };

  const handleDeleteConfirm = async (postId: string) => {
    setDeletingId(postId);
    try {
      await deletePostAction(postId);
      setDeactivatedPosts((prev) =>
        prev.filter((p) => p.livestock_post_id !== postId),
      );
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleLoadMoreTransactions = async () => {
    if (!transactionsPagination) return;
    setLoadingMoreTx(true);
    try {
      const nextOffset =
        transactionsPagination.offset + transactionsPagination.limit;
      const { items, pagination: newPag } =
        await purchaseApi.getMyPurchaseRequests(TRANSACTIONS_LIMIT, nextOffset);
      setTransactions((prev) => [
        ...prev,
        ...(Array.isArray(items) ? items : []),
      ]);
      setTransactionsPagination(newPag ?? null);
    } catch {
      // silently ignore
    } finally {
      setLoadingMoreTx(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;
    const prev = preferences;
    setSavingPrefs(true);
    setPrefsError(null);
    try {
      const updated = await userPreferencesApi.updatePreferences(preferences);
      setPreferences(updated);
    } catch {
      setPreferences(prev);
      setPrefsError("No se pudieron guardar los cambios. Intenta de nuevo.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleModalActivated = (activatedId: string) => {
    setDeactivatedPosts((prev) =>
      prev.filter((p) => p.livestock_post_id !== activatedId),
    );
    meApi
      .getMyPosts(pagination.limit, 0)
      .then(({ items, pagination: newPag }) => {
        setPosts(items);
        setPagination(newPag);
      })
      .catch(() => {});
  };

  const isSelectedActive = selectedPostId
    ? !deactivatedPosts.some((p) => p.livestock_post_id === selectedPostId)
    : true;

  const stats = [
    {
      value: String(pagination.total).padStart(2, "0"),
      label: "publicaciones",
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <main className="flex-1 w-[90vw] mx-auto py-[clamp(1.5rem,4vw,3rem)] flex flex-col gap-[clamp(0.75rem,2vw,1.5rem)]">
        {/* ── Profile card ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center flex-col sm:flex-row w-full
                   px-[clamp(1.25rem,4vw,2.5rem)] py-[clamp(1rem,2.5vw,1.75rem)]
                   gap-[clamp(0.75rem,2.5vw,2rem)]"
        >
          <div
            className={`${avatarColor} rounded-full flex items-center justify-center text-white font-bold shrink-0
                      w-[clamp(3.5rem,7vw,6rem)] h-[clamp(3.5rem,7vw,6rem)] text-[clamp(1rem,2vw,1.75rem)]`}
          >
            {initials}
          </div>

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

              <Button
                label="Cerrar sesión"
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                className="shrink-0 text-[clamp(0.7rem,1.2vw,0.875rem)] px-[clamp(1rem,2vw,2rem)]"
              />

              {user.role === ADMIN_ROLE_ID && (
                <Button
                  label="Admin"
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/admin")}
                  className="shrink-0 text-[clamp(0.7rem,1.2vw,0.875rem)] px-[clamp(1rem,2vw,2rem)]"
                />
              )}
            </div>
          </div>

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

        {/* ── Edit form ──────────────────────────────────────────────────── */}
        <AnimatePresence>
          {isEditing && (
            <ProfileEditForm
              user={user}
              onSave={handleUpdateProfile}
              onClose={() => setIsEditing(false)}
            />
          )}
        </AnimatePresence>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div className="flex flex-nowrap gap-1 border-b border-gray-200 overflow-x-auto">
          {(["publicaciones", "transacciones", "preferencias"] as Tab[]).map(
            (tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 whitespace-nowrap px-5 py-2.5 text-sm font-semibold capitalize border-0 bg-transparent cursor-pointer transition-colors border-b-2 -mb-px
                ${
                  activeTab === tab
                    ? "text-primary border-primary"
                    : "text-gray-400 border-transparent hover:text-gray-600"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ),
          )}
        </div>

        {/* ── Tab: Publicaciones ────────────────────────────────────────── */}
        {activeTab === "publicaciones" && (
          <>
            {/* Active posts */}
            <h2 className="text-primary font-bold text-[clamp(1.2rem,1.8vw,1.5rem)]">
              Publicaciones activas
            </h2>

            {posts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center justify-center gap-3 py-10 text-gray-400"
              >
                <LuClipboardList size={40} strokeWidth={1.2} />
                <p className="text-sm font-medium">
                  No tienes publicaciones activas
                </p>
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
                  {posts.map((post) => (
                    <CardPost
                      key={post.livestock_post_id}
                      {...mapToCardPost(post)}
                      owner={displayName}
                      onClick={() => handleCardClick(post.livestock_post_id)}
                    />
                  ))}
                </motion.div>

                {pagination.hasMore && (
                  <div className="flex justify-center mt-2">
                    <Button
                      label={
                        loadingMore ? "Cargando..." : "Ver más publicaciones"
                      }
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

            {/* Deactivated posts */}
            <h2 className="text-gray-500 font-bold text-[clamp(1.2rem,1.8vw,1.5rem)] mt-4">
              Publicaciones desactivadas
            </h2>

            {deactivatedLoading ? (
              <div className="flex justify-center py-8">
                <LuLoader size={24} className="animate-spin text-gray-400" />
              </div>
            ) : deactivatedPosts.length === 0 ? (
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
                {deactivatedPosts.map((post) => (
                  <div
                    key={post.livestock_post_id}
                    className="flex flex-col gap-2"
                  >
                    {/* Card with grayscale overlay */}
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 grayscale opacity-70">
                      <CardPost
                        {...mapToCardPost(post)}
                        owner={displayName}
                        onClick={() => handleCardClick(post.livestock_post_id)}
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
                        onClick={() => handleCardClick(post.livestock_post_id)}
                        className="flex items-center justify-center gap-1 text-[10px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg py-1.5 transition-colors border-0 cursor-pointer"
                        title="Editar"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleActivate(post.livestock_post_id)}
                        disabled={activatingId === post.livestock_post_id}
                        className="flex items-center justify-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg py-1.5 transition-colors border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Activar"
                      >
                        {activatingId === post.livestock_post_id ? (
                          <LuLoader size={10} className="animate-spin" />
                        ) : (
                          <LuRefreshCw size={10} />
                        )}
                        Activar
                      </button>

                      {confirmDeleteId === post.livestock_post_id ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteConfirm(post.livestock_post_id)
                          }
                          disabled={deletingId === post.livestock_post_id}
                          className="flex items-center justify-center gap-1 text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg py-1.5 transition-colors border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Confirmar eliminación"
                        >
                          {deletingId === post.livestock_post_id ? (
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
                            setConfirmDeleteId(post.livestock_post_id)
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
        )}

        {/* ── Tab: Transacciones ────────────────────────────────────────── */}
        {activeTab === "transacciones" && (
          <>
            <h2 className="text-primary font-bold text-[clamp(1.2rem,1.8vw,1.5rem)]">
              Historial de transacciones
            </h2>

            {transactionsLoading ? (
              <div className="flex justify-center py-16">
                <LuLoader size={28} className="animate-spin text-gray-400" />
              </div>
            ) : transactions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400"
              >
                <LuPowerOff size={40} strokeWidth={1.2} />
                <p className="text-sm font-medium">
                  No tienes transacciones registradas
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-x-auto rounded-xl border border-gray-200"
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Vendedor
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Comprador
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Publicación
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Tipo
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Solicitud
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Resolución
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => {
                      const status = purchaseStatuses[tx.purchase_status_id];
                      return (
                        <tr
                          key={tx.purchase_request_id}
                          onClick={() => setSelectedTransaction(tx)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 text-gray-800 font-medium max-w-36 truncate">
                            {tx.seller_name}
                          </td>
                          <td className="px-4 py-3 text-gray-800 max-w-36 truncate">
                            {tx.buyer_name}
                          </td>
                          <td className="px-4 py-3 text-gray-700 max-w-44 truncate">
                            {tx.livestock_post_name}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {sales[tx.sale_type_id] ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                            {formatDate(tx.request_date)}
                          </td>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                            {formatDate(tx.resolution_date)}
                          </td>
                          <td className="px-4 py-3">
                            {status && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusColors[status.color] ?? statusColors.gray}`}
                              >
                                {status.label}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {transactionsPagination?.hasMore && (
                  <div className="flex justify-center py-4 border-t border-gray-100">
                    <Button
                      label={loadingMoreTx ? "Cargando..." : "Ver más"}
                      variant="secondary"
                      size="sm"
                      disabled={loadingMoreTx}
                      onClick={handleLoadMoreTransactions}
                    />
                    {loadingMoreTx && (
                      <LuLoader
                        size={16}
                        className="animate-spin text-primary ml-2 self-center"
                      />
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}

        {/* ── Tab: Preferencias ─────────────────────────────────────────── */}
        {activeTab === "preferencias" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6 max-w-xl"
          >
            <h2 className="text-primary font-bold text-[clamp(1.2rem,1.8vw,1.5rem)]">
              Preferencias
            </h2>

            {preferencesLoading ? (
              <div className="flex justify-center py-16">
                <LuLoader size={24} className="animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Notificaciones
                </p>

                {/* Toggle: email en solicitud de compra */}
                <label className="flex items-start gap-4 cursor-pointer group">
                  <div className="mt-0.5 relative shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences?.email_on_purchase_request ?? false}
                      onChange={(e) =>
                        setPreferences((p) =>
                          p
                            ? {
                                ...p,
                                email_on_purchase_request: e.target.checked,
                              }
                            : { email_on_purchase_request: e.target.checked },
                        )
                      }
                    />
                    <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors" />
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Recibir correo al llegar una solicitud de compra
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      Te enviamos un email a{" "}
                      <span className="font-medium text-gray-500">
                        {user.email}
                      </span>{" "}
                      cuando alguien te envía una solicitud de compra.
                    </p>
                  </div>
                </label>

                {prefsError && (
                  <p className="text-xs text-red-500">{prefsError}</p>
                )}

                <Button
                  label={savingPrefs ? "Guardando..." : "Guardar preferencias"}
                  variant="primary"
                  size="sm"
                  disabled={savingPrefs || !preferences}
                  onClick={handleSavePreferences}
                  className="self-start px-6"
                />
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* ── Post detail modal ──────────────────────────────────────────── */}
      {postDetail && selectedPostId && (
        <PostDetailModal
          post={postDetail}
          previewImg={
            posts.find((p) => p.livestock_post_id === selectedPostId)
              ?.main_image_url ??
            deactivatedPosts.find((p) => p.livestock_post_id === selectedPostId)
              ?.main_image_url ??
            null
          }
          previewOwner={displayName}
          isActive={isSelectedActive}
          onActivated={handleModalActivated}
          onClose={() => {
            setPostDetail(null);
            setSelectedPostId(null);
          }}
          onUpdated={(updated) => {
            setPostDetail(updated);
            setPosts((prev) =>
              prev.map((item) =>
                item.livestock_post_id === updated.livestock_post_id
                  ? {
                      ...item,
                      livestock_post_name: updated.livestock_post_name,
                      sale_type_id: updated.sale_type_id,
                      avg_weight_kg: updated.avg_weight_kg,
                      price_per_kg: updated.price_per_kg,
                      price_per_unit: updated.price_per_unit,
                    }
                  : item,
              ),
            );
          }}
          onDeactivated={(deactivatedId) => {
            // Optimistic: move post from active → deactivated immediately
            setPosts((prev) => {
              const deactivated = prev.find(
                (item) => item.livestock_post_id === deactivatedId,
              );
              if (deactivated) {
                setDeactivatedPosts((d) => [deactivated, ...d]);
              }
              return prev.filter(
                (item) => item.livestock_post_id !== deactivatedId,
              );
            });
            setPostDetail(null);
            setSelectedPostId(null);
          }}
        />
      )}

      {/* ── Transaction detail modal ───────────────────────────────────── */}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </>
  );
};

export default MePage;
