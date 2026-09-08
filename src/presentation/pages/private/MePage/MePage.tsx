import { useEffect, useState, type FC } from "react";
import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/adapters/hooks/common/useAuth.tsx";
import { AnimatePresence } from "framer-motion";

import ProfileEditForm from "./ProfileEditForm.tsx";
import PostDetailModal from "@/presentation/ui/PostDetailModal/PostDetailModal";
import TransactionDetailModal from "./TransactionDetailModal";
import ProfileCard from "./ProfileCard";
import PostsTab from "./PostsTab";
import TransactionsTab from "./TransactionsTab";
import PreferencesTab from "./PreferencesTab";

import { useMyPosts } from "@/adapters/hooks/actions/useMyPosts";
import { useDeactivatedPosts } from "@/adapters/hooks/actions/useDeactivatedPosts";
import { usePostDetailModal } from "@/adapters/hooks/actions/usePostDetailModal";
import { useMyTransactions } from "@/adapters/hooks/actions/useMyTransactions";
import { useMyPreferences } from "@/adapters/hooks/actions/useMyPreferences";

import type { MePageLoaderData } from "@/presentation/router/loaders/me.loader.ts";
import type { PurchaseRequest } from "@/api/interfaces/responses/PurchaseRequest.interface";

import { getAvatarColor } from "@/shared/utils/getAvatarColor.ts";
import { getInitials } from "@/shared/utils/getInitials.ts";
import { ADMIN_ROLE_ID } from "@/shared/constants/roles.catalog";

import {
  parseTab,
  handleActivatePost,
  handlePostUpdated,
  handlePostDeactivated,
  handlePostActivatedFromModal,
  handleUpdateProfile,
  handleLogout,
  type Tab,
} from "./MePage.handlers";

const TAB_LIST: Tab[] = ["publicaciones", "transacciones", "preferencias"];

// ─── Component ────────────────────────────────────────────────────────────────

const MePage: FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const loaderData = useLoaderData() as MePageLoaderData;
  const { user, updateUser, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseTab(searchParams.get("tab"));
  const setActiveTab = (tab: Tab) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", tab);
        return next;
      },
      { replace: true },
    );

  const myPosts = useMyPosts(loaderData.posts, loaderData.pagination);
  const deactivatedPosts = useDeactivatedPosts();
  const postDetailModal = usePostDetailModal();
  const transactions = useMyTransactions(activeTab === "transacciones");
  const preferences = useMyPreferences(activeTab === "preferencias");

  const [selectedTransaction, setSelectedTransaction] =
    useState<PurchaseRequest | null>(null);

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) return null;

  const displayName = user.firstName + " " + user.lastName,
    initials = getInitials(user.firstName + " " + user.lastName),
    avatarColor = getAvatarColor(user.email);

  const isSelectedActive = postDetailModal.selectedPostId
    ? !deactivatedPosts.posts.some(
        (p) => p.post_id === postDetailModal.selectedPostId,
      )
    : true;

  const previewImg =
    myPosts.posts.find(
      (p) => p.post_id === postDetailModal.selectedPostId,
    )?.main_image_url ??
    deactivatedPosts.posts.find(
      (p) => p.post_id === postDetailModal.selectedPostId,
    )?.main_image_url ??
    null;

  const stats = [
    {
      value: String(myPosts.pagination.total).padStart(2, "0"),
      label: "publicaciones",
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <main className="flex-1 w-[90vw] mx-auto py-[clamp(1.5rem,4vw,3rem)] flex flex-col gap-[clamp(0.75rem,2vw,1.5rem)]">
        <ProfileCard
          displayName={displayName}
          documentType={user.documentType ?? ""}
          documentNumber={user.documentNumber ?? ""}
          initials={initials}
          avatarColor={avatarColor}
          stats={stats}
          isAdmin={user.role === ADMIN_ROLE_ID}
          onEdit={() => setIsEditing((v) => !v)}
          onLogout={() => handleLogout(logout, navigate)}
          onGoAdmin={() => navigate("/admin")}
          onGoWallet={() => navigate("/wallet")}
        />

        {/* ── Edit form ──────────────────────────────────────────────────── */}
        <AnimatePresence>
          {isEditing && (
            <ProfileEditForm
              user={user}
              onSave={(data) =>
                handleUpdateProfile(updateUser, data, () => setIsEditing(false))
              }
              onClose={() => setIsEditing(false)}
            />
          )}
        </AnimatePresence>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div className="flex flex-nowrap gap-1 border-b border-gray-200 overflow-x-auto">
          {TAB_LIST.map((tab) => (
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
          ))}
        </div>

        {activeTab === "publicaciones" && (
          <PostsTab
            myPosts={myPosts}
            deactivatedPosts={deactivatedPosts}
            displayName={displayName}
            onCardClick={postDetailModal.open}
            onActivate={(postId) =>
              handleActivatePost(deactivatedPosts, myPosts, postId)
            }
          />
        )}

        {activeTab === "transacciones" && (
          <TransactionsTab
            transactions={transactions}
            onSelectTransaction={setSelectedTransaction}
          />
        )}

        {activeTab === "preferencias" && (
          <PreferencesTab preferences={preferences} userEmail={user.email} />
        )}
      </main>

      {/* ── Post detail modal ──────────────────────────────────────────── */}
      {postDetailModal.postDetail && postDetailModal.selectedPostId && (
        <PostDetailModal
          post={postDetailModal.postDetail}
          previewImg={previewImg}
          previewOwner={displayName}
          isActive={isSelectedActive}
          onActivated={(activatedId) =>
            handlePostActivatedFromModal(myPosts, deactivatedPosts, activatedId)
          }
          onClose={postDetailModal.close}
          onUpdated={(updated) =>
            handlePostUpdated(myPosts, postDetailModal, updated)
          }
          onDeactivated={(deactivatedId) =>
            handlePostDeactivated(
              myPosts,
              deactivatedPosts,
              postDetailModal,
              deactivatedId,
            )
          }
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
