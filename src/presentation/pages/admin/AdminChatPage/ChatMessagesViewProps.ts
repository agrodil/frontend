import type { Chat } from "@/presentation/interfaces/pages/NotificationsPageLoaderData";
import type { useAdminChatMessages } from "@/adapters/hooks/actions/useAdminChatMessages";
import type { usePostPreviewModal } from "@/adapters/hooks/actions/usePostPreviewModal";
import type { useAdminUserSearch } from "@/adapters/hooks/actions/useAdminUserSearch";

type UseChatMessagesReturn = ReturnType<typeof useAdminChatMessages>;
type UsePostPreviewReturn = ReturnType<typeof usePostPreviewModal>;
type UseAdminUserSearchReturn = ReturnType<typeof useAdminUserSearch>;

export type ChatMessagesViewProps = {
  chatMessages: Pick<
    UseChatMessagesReturn,
    | "messages"
    | "pagination"
    | "messagesLoading"
    | "loadingMore"
    | "messageFilter"
    | "setMessageFilter"
    | "messageFilterDebounced"
    | "selectedIds"
    | "allSelected"
    | "toggleSelect"
    | "toggleSelectAll"
    | "setShowBatchConfirm"
    | "deletingId"
    | "deleteSingle"
    | "focusMessageId"
    | "loadMore"
  >;
  // Aparte del bundle: el hook lo tipa `Chat | null`, pero este componente lo
  // usa sin null-check (asume conversación ya resuelta) — el call site lo
  // narrowa con el `&&` antes de renderizar.
  selectedChat: Chat;
  postPreview: Pick<UsePostPreviewReturn, "fetchingCardId" | "handleCardClick">;
  userSearch: Pick<UseAdminUserSearchReturn, "foundUser">;
  onBack: () => void;
};
