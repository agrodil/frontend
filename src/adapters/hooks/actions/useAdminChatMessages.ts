import { useCallback, useEffect, useRef, useState } from "react";
import { adminApi } from "@/api/clients/admin.api";
import type { Chat, Message, ChatPagination } from "@/presentation/interfaces/pages/NotificationsPageLoaderData";

const MESSAGES_LIMIT = 30;
const FILTER_DEBOUNCE_MS = 400;

interface OpenChatOptions {
  focusMessageId?: string;
}

/**
 * Maneja la vista de una conversación admin: mensajes, paginación, filtro de
 * texto, selección/borrado (single + batch), y el scroll+resaltado de un
 * mensaje puntual. `openChat` recibe `userId1` explícito (no depende de otro
 * hook) para servir igual a "abrir desde la lista de chats" y "abrir desde
 * una incidencia" (usuario sintético).
 */
export const useAdminChatMessages = () => {
  const [userId1, setUserId1] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pagination, setPagination] = useState<ChatPagination | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [messageFilter, setMessageFilter] = useState("");
  const [messageFilterDebounced, setMessageFilterDebounced] = useState("");
  const msgFilterDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [focusMessageId, setFocusMessageId] = useState<string | null>(null);

  const fetchMessages = useCallback(
    async (userId2: string, q: string, offset: number) => {
      if (!userId1) throw new Error("No chat is open");
      return adminApi.getChatMessages(
        userId1,
        userId2,
        MESSAGES_LIMIT,
        offset,
        q || undefined,
      );
    },
    [userId1],
  );

  // ── Debounced message filter ──────────────────────────────────────────────
  useEffect(() => {
    if (msgFilterDebounce.current) clearTimeout(msgFilterDebounce.current);
    msgFilterDebounce.current = setTimeout(() => {
      setMessageFilterDebounced(messageFilter);
    }, FILTER_DEBOUNCE_MS);
    return () => {
      if (msgFilterDebounce.current) clearTimeout(msgFilterDebounce.current);
    };
  }, [messageFilter]);

  // Re-fetch cuando cambia el filtro debounced (con chat ya abierto).
  useEffect(() => {
    if (!userId1 || !selectedChat) return;
    let cancelled = false;

    // Deferido a microtask: setState no debe ejecutarse síncrono dentro del
    // cuerpo del efecto (react-hooks/set-state-in-effect). El fetch arranca
    // igual de inmediato, no depende de este flag.
    queueMicrotask(() => {
      if (cancelled) return;
      setMessagesLoading(true);
      setSelectedIds(new Set());
    });

    fetchMessages(selectedChat.other_user_id, messageFilterDebounced, 0)
      .then((result) => {
        if (cancelled) return;
        setMessages(result.messages);
        setPagination(result.pagination);
      })
      .catch(() => {
        if (!cancelled) {
          setMessages([]);
          setPagination(null);
        }
      })
      .finally(() => {
        if (!cancelled) setMessagesLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageFilterDebounced, userId1, selectedChat?.other_user_id]);

  // Scroll + resalta brevemente el mensaje puntual de una incidencia, una vez
  // que la conversación termina de cargar.
  useEffect(() => {
    if (!focusMessageId || messagesLoading) return;
    const el = document.getElementById(`msg-${focusMessageId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = setTimeout(() => setFocusMessageId(null), 2500);
    return () => clearTimeout(timer);
  }, [focusMessageId, messagesLoading, messages]);

  const openChat = (
    openUserId1: string,
    chat: Chat,
    opts?: OpenChatOptions,
  ) => {
    setUserId1(openUserId1);
    setSelectedChat(chat);
    setMessages([]);
    setPagination(null);
    setSelectedIds(new Set());
    setMessageFilter("");
    setMessageFilterDebounced("");
    setFocusMessageId(opts?.focusMessageId ?? null);
    // El efecto de arriba dispara cuando cambian userId1/selectedChat, pero
    // necesitamos un fetch inmediato ya que el filtro debounced ya está en "".
    setMessagesLoading(true);
    adminApi
      .getChatMessages(openUserId1, chat.other_user_id, MESSAGES_LIMIT, 0)
      .then((result) => {
        setMessages(result.messages);
        setPagination(result.pagination);
      })
      .catch(() => {
        setMessages([]);
        setPagination(null);
      })
      .finally(() => setMessagesLoading(false));
  };

  const loadMore = async () => {
    if (!userId1 || !selectedChat || !pagination || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextOffset = pagination.offset + pagination.limit;
      const result = await fetchMessages(
        selectedChat.other_user_id,
        messageFilterDebounced,
        nextOffset,
      );
      setMessages((prev) => [...prev, ...result.messages]);
      setPagination(result.pagination);
    } catch {
      /* silently ignore */
    } finally {
      setLoadingMore(false);
    }
  };

  const deleteSingle = async (messageId: string) => {
    setDeletingId(messageId);
    try {
      await adminApi.deleteMessage(messageId);
      setMessages((prev) =>
        prev.filter((m) => m.purchase_notification_id !== messageId),
      );
      setSelectedIds((prev) => {
        const s = new Set(prev);
        s.delete(messageId);
        return s;
      });
      setPagination((prev) =>
        prev ? { ...prev, total: prev.total - 1 } : prev,
      );
    } catch {
      /* silently ignore */
    } finally {
      setDeletingId(null);
    }
  };

  const batchDelete = async () => {
    if (selectedIds.size === 0) return;
    setBatchDeleting(true);
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map((id) => adminApi.deleteMessage(id)));
      setMessages((prev) =>
        prev.filter((m) => !ids.includes(m.purchase_notification_id)),
      );
      setPagination((prev) =>
        prev ? { ...prev, total: Math.max(0, prev.total - ids.length) } : prev,
      );
      setSelectedIds(new Set());
    } catch {
      /* partial failure: remove only what succeeded would need per-promise tracking */
    } finally {
      setBatchDeleting(false);
      setShowBatchConfirm(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) {
        s.delete(id);
      } else {
        s.add(id);
      }
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === messages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(messages.map((m) => m.purchase_notification_id)));
    }
  };

  const closeToList = () => {
    setSelectedIds(new Set());
    setMessageFilter("");
    setMessageFilterDebounced("");
  };

  const reset = () => {
    setUserId1(null);
    setSelectedChat(null);
    setMessages([]);
    setPagination(null);
    setSelectedIds(new Set());
    setMessageFilter("");
    setMessageFilterDebounced("");
    setFocusMessageId(null);
  };

  const allSelected = messages.length > 0 && selectedIds.size === messages.length;

  return {
    selectedChat,
    messages,
    pagination,
    messagesLoading,
    loadingMore,
    messageFilter,
    setMessageFilter,
    messageFilterDebounced,
    selectedIds,
    showBatchConfirm,
    setShowBatchConfirm,
    batchDeleting,
    deletingId,
    focusMessageId,
    allSelected,
    openChat,
    loadMore,
    deleteSingle,
    batchDelete,
    toggleSelect,
    toggleSelectAll,
    closeToList,
    reset,
  };
};
