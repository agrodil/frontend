import { useState, type FC } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LuArrowLeft } from "react-icons/lu";
import type { AdminUser, AdminIncident } from "@/api/clients/admin.api";
import type { Chat } from "@/presentation/interfaces/pages/NotificationsPageLoaderData";
import PostDetailModal from "@/presentation/ui/PostDetailModal/PostDetailModal";
import { useAdminUserSearch } from "@/adapters/hooks/actions/useAdminUserSearch";
import { useAdminChatList } from "@/adapters/hooks/actions/useAdminChatList";
import { useAdminChatMessages } from "@/adapters/hooks/actions/useAdminChatMessages";
import { useAdminIncidents } from "@/adapters/hooks/actions/useAdminIncidents";
import { usePostPreviewModal } from "@/adapters/hooks/actions/usePostPreviewModal";
import ConfirmModal from "./ConfirmModal";
import IncidentsTable from "./IncidentsTable";
import UserSearchBox from "./UserSearchBox";
import ChatListView from "./ChatListView";
import ChatMessagesView from "./ChatMessagesView";

export type PageView = "search" | "chat-list" | "chat-view";

// ── Main page ─────────────────────────────────────────────────────────────────
const AdminChatPage: FC = () => {
  const [view, setView] = useState<PageView>("search");

  const userSearch = useAdminUserSearch();
  const chatList = useAdminChatList();
  const chatMessages = useAdminChatMessages();
  const incidents = useAdminIncidents();
  const postPreview = usePostPreviewModal();

  const resetToSearch = () => {
    userSearch.reset();
    chatList.reset();
    chatMessages.reset();
    setView("search");
  };

  const handleQueryChange = (value: string) => {
    userSearch.setQuery(value);
    if (view !== "search") resetToSearch();
  };

  const handleViewChats = (user: AdminUser) => {
    setView("chat-list");
    void chatList.loadChatsForUser(user.app_user_id);
  };

  const handleOpenChat = (chat: Chat) => {
    if (!userSearch.foundUser) return;
    chatMessages.openChat(userSearch.foundUser.app_user_id, chat);
    setView("chat-view");
  };

  const handleBackToList = () => {
    setView("chat-list");
    chatMessages.closeToList();
  };

  const openChatFromIncident = (incident: AdminIncident) => {
    const offenderUser: AdminUser = {
      app_user_id: incident.app_user_id,
      email: "",
      document_type: null,
      document_number: null,
      role_id: 0,
      is_verified: false,
      display_name: incident.offender_name || "Usuario",
    };
    const chat: Chat = {
      purchase_notification_id: incident.purchase_notification_id,
      sent_by: incident.app_user_id,
      sent_to: incident.other_user_id,
      livestock_post_id: null,
      purchase_notification_type_id: 2,
      message: incident.message,
      is_read: true,
      created_at: incident.created_at,
      other_user_id: incident.other_user_id,
      other_user_name: incident.other_user_name || "Usuario",
      livestock_post_name: null,
    };

    userSearch.setFoundUserDirectly(offenderUser, incident.offender_name);
    chatMessages.openChat(incident.app_user_id, chat, {
      focusMessageId: incident.purchase_notification_id,
    });
    setView("chat-view");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="w-[90vw] mx-auto py-[clamp(1.5rem,4vw,3rem)] flex flex-col gap-8">
      {/* Modals */}
      {chatMessages.showBatchConfirm && (
        <ConfirmModal
          count={chatMessages.selectedIds.size}
          loading={chatMessages.batchDeleting}
          onConfirm={chatMessages.batchDelete}
          onCancel={() => chatMessages.setShowBatchConfirm(false)}
        />
      )}
      {postPreview.selectedPost && (
        <PostDetailModal
          post={postPreview.selectedPost.post}
          previewImg={postPreview.selectedPost.img}
          previewOwner={postPreview.selectedPost.owner}
          onClose={postPreview.closePost}
        />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center gap-4"
      >
        <Link
          to="/admin"
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center
                     hover:bg-gray-50 transition-colors shrink-0"
        >
          <LuArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-primary font-black text-[clamp(1.25rem,2.5vw,2rem)]">
            Administración de Chats
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Busca un usuario para ver y gestionar sus conversaciones
          </p>
        </div>
      </motion.div>

      <UserSearchBox
        query={userSearch.query}
        onQueryChange={handleQueryChange}
        searching={userSearch.searching}
        foundUser={userSearch.foundUser}
        searchError={userSearch.searchError}
        view={view}
        onViewChats={handleViewChats}
      />

      <IncidentsTable
        incidents={incidents.incidents}
        loading={incidents.incidentsLoading}
        error={incidents.incidentsError}
        onViewChat={openChatFromIncident}
      />

      <AnimatePresence>
        {view === "chat-list" && (
          <ChatListView
            userDisplayName={userSearch.foundUser?.display_name}
            chats={chatList.filteredChats}
            loading={chatList.chatsLoading}
            error={chatList.chatsError}
            nameFilter={chatList.chatNameFilter}
            onNameFilterChange={chatList.setChatNameFilter}
            onOpenChat={handleOpenChat}
          />
        )}

        {view === "chat-view" && chatMessages.selectedChat && (
          <ChatMessagesView
            chatMessages={chatMessages}
            selectedChat={chatMessages.selectedChat}
            postPreview={postPreview}
            userSearch={userSearch}
            onBack={handleBackToList}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

export default AdminChatPage;
