import { useState, useEffect, useRef, useCallback, type FC } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuArrowLeft,
  LuSearch,
  LuMessageSquare,
  LuTrash2,
  LuUser,
  LuChevronRight,
  LuLoader,
  LuX,
  LuShoppingCart,
  LuSquareCheck,
  LuSquare,
  LuTriangleAlert,
} from "react-icons/lu";
import { adminApi } from "@/api/clients/admin.api";
import type { AdminUser, AdminIncident } from "@/api/clients/admin.api";
import { postApi } from "@/api/clients/posts.api";
import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import PostDetailModal from "@/presentation/ui/PostDetailModal/PostDetailModal";
import type {
  Chat,
  Message,
  ChatPagination,
} from "@/presentation/interfaces/pages/NotificationsPageLoaderData";

const MESSAGES_LIMIT = 30;
const SEARCH_DEBOUNCE_MS = 400;

type PageView = "search" | "chat-list" | "chat-view";

type PurchaseCardPayload = {
  __type: "PURCHASE_CARD";
  purchaseRequestId: string;
  postedBy: string;
  title: string;
  saleTypeId: number;
  price: number;
  owner: string;
  img: string | null;
};

const parsePurchaseCard = (message: string, typeId: number): PurchaseCardPayload | null => {
  if (typeId !== 1) return null;
  try {
    const parsed = JSON.parse(message);
    if (parsed.__type === "PURCHASE_CARD") return parsed as PurchaseCardPayload;
  } catch {
    /* not a card */
  }
  return null;
};

const INCIDENT_REASON_LABELS: Record<string, string> = {
  phone_number: "Número de teléfono",
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ── Confirmation modal ────────────────────────────────────────────────────────
type ConfirmModalProps = {
  count: number;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal: FC<ConfirmModalProps> = ({ count, loading, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
    >
      <h3 className="font-bold text-gray-900 text-lg mb-2">Eliminar mensajes</h3>
      <p className="text-sm text-gray-600 mb-6">
        ¿Eliminar <span className="font-semibold text-red-600">{count}</span>{" "}
        mensaje{count !== 1 ? "s" : ""}? Esta acción no se puede deshacer.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold
                     text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white
                     hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <LuLoader size={14} className="animate-spin" />}
          Eliminar
        </button>
      </div>
    </motion.div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const AdminChatPage: FC = () => {
  const [view, setView] = useState<PageView>("search");

  // search
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<AdminUser | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // chat list
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [chatsError, setChatsError] = useState<string | null>(null);
  const [chatNameFilter, setChatNameFilter] = useState("");

  // chat view
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pagination, setPagination] = useState<ChatPagination | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // message text filter (triggers re-fetch)
  const [messageFilter, setMessageFilter] = useState("");
  const [messageFilterDebounced, setMessageFilterDebounced] = useState("");
  const msgFilterDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // selection & batch delete
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);
  const [batchDeleting, setBatchDeleting] = useState(false);

  // single delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // purchase card → PostDetailModal
  const [selectedPost, setSelectedPost] = useState<{
    post: PostDetail;
    img: string | null;
    owner: string;
  } | null>(null);
  const [fetchingCardId, setFetchingCardId] = useState<string | null>(null);

  // incidents
  const [incidents, setIncidents] = useState<AdminIncident[]>([]);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [incidentsError, setIncidentsError] = useState<string | null>(null);
  const [focusMessageId, setFocusMessageId] = useState<string | null>(null);

  // ── Load incidents (independent of the search flow) ───────────────────────
  useEffect(() => {
    let cancelled = false;
    adminApi
      .getIncidents(100, 0)
      .then((result) => {
        if (!cancelled) setIncidents(result.incidents);
      })
      .catch(() => {
        if (!cancelled) setIncidentsError("Error al cargar las incidencias.");
      })
      .finally(() => {
        if (!cancelled) setIncidentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Scroll + resalta brevemente el mensaje puntual de una incidencia, una vez
  // que la conversación termina de cargar.
  useEffect(() => {
    if (!focusMessageId || messagesLoading) return;
    const el = document.getElementById(`msg-${focusMessageId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = setTimeout(() => setFocusMessageId(null), 2500);
    return () => clearTimeout(timer);
  }, [focusMessageId, messagesLoading, messages]);

  // ── Debounced user search ─────────────────────────────────────────────────
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setFoundUser(null);
      setSearchError(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    setSearchError(null);

    searchDebounce.current = setTimeout(async () => {
      try {
        const user = await adminApi.searchUser(trimmed);
        if (user) {
          setFoundUser(user);
          setSearchError(null);
        } else {
          setFoundUser(null);
          setSearchError("No se encontró ningún usuario con ese correo o número de documento.");
        }
      } catch {
        setFoundUser(null);
        setSearchError("Error al buscar el usuario.");
      } finally {
        setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, [query]);

  // ── Debounced message filter ──────────────────────────────────────────────
  useEffect(() => {
    if (msgFilterDebounce.current) clearTimeout(msgFilterDebounce.current);
    msgFilterDebounce.current = setTimeout(() => {
      setMessageFilterDebounced(messageFilter);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (msgFilterDebounce.current) clearTimeout(msgFilterDebounce.current);
    };
  }, [messageFilter]);

  // Re-fetch messages when debounced filter changes
  const fetchMessages = useCallback(
    async (userId1: string, userId2: string, q: string, offset: number) => {
      const result = await adminApi.getChatMessages(
        userId1,
        userId2,
        MESSAGES_LIMIT,
        offset,
        q || undefined,
      );
      return result;
    },
    [],
  );

  useEffect(() => {
    if (!foundUser || !selectedChat || view !== "chat-view") return;
    let cancelled = false;

    setMessagesLoading(true);
    setSelectedIds(new Set());
    fetchMessages(foundUser.app_user_id, selectedChat.other_user_id, messageFilterDebounced, 0)
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

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageFilterDebounced, foundUser?.app_user_id, selectedChat?.other_user_id]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleViewChats = async (user: AdminUser) => {
    setChatsLoading(true);
    setChatsError(null);
    setChatNameFilter("");
    setView("chat-list");
    try {
      const result = await adminApi.getChatsForUser(user.app_user_id);
      setChats(result);
    } catch {
      setChatsError("Error al cargar los chats del usuario.");
    } finally {
      setChatsLoading(false);
    }
  };

  const handleOpenChat = (chat: Chat) => {
    if (!foundUser) return;
    setSelectedChat(chat);
    setMessages([]);
    setPagination(null);
    setSelectedIds(new Set());
    setMessageFilter("");
    setMessageFilterDebounced("");
    setView("chat-view");
    // The useEffect above will fetch when messageFilterDebounced settles,
    // but we need an immediate fetch since debounced value is already "".
    setMessagesLoading(true);
    fetchMessages(foundUser.app_user_id, chat.other_user_id, "", 0)
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

    setFoundUser(offenderUser);
    setQuery(incident.offender_name);
    setSelectedChat(chat);
    setMessages([]);
    setPagination(null);
    setSelectedIds(new Set());
    setMessageFilter("");
    setMessageFilterDebounced("");
    setFocusMessageId(incident.purchase_notification_id);
    setView("chat-view");
    setMessagesLoading(true);
    fetchMessages(incident.app_user_id, incident.other_user_id, "", 0)
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

  const handleLoadMore = async () => {
    if (!foundUser || !selectedChat || !pagination || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextOffset = pagination.offset + pagination.limit;
      const result = await fetchMessages(
        foundUser.app_user_id,
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

  const handleDeleteSingle = async (messageId: string) => {
    setDeletingId(messageId);
    try {
      await adminApi.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.purchase_notification_id !== messageId));
      setSelectedIds((prev) => { const s = new Set(prev); s.delete(messageId); return s; });
      setPagination((prev) => prev ? { ...prev, total: prev.total - 1 } : prev);
    } catch {
      /* silently ignore */
    } finally {
      setDeletingId(null);
    }
  };

  const handleBatchDelete = async () => {
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
      s.has(id) ? s.delete(id) : s.add(id);
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

  const handleCardClick = async (msg: Message, card: PurchaseCardPayload) => {
    if (!msg.livestock_post_id) return;
    setFetchingCardId(msg.purchase_notification_id);
    try {
      const post = await postApi.getPostById(msg.livestock_post_id);
      setSelectedPost({ post, img: card.img ?? null, owner: card.owner });
    } catch {
      /* post may be deactivated — silently ignore */
    } finally {
      setFetchingCardId(null);
    }
  };

  const resetToSearch = () => {
    setView("search");
    setFoundUser(null);
    setQuery("");
    setSearchError(null);
    setChats([]);
    setSelectedChat(null);
    setMessages([]);
    setPagination(null);
    setSelectedIds(new Set());
    setMessageFilter("");
    setMessageFilterDebounced("");
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredChats = chatNameFilter.trim()
    ? chats.filter((c) =>
        c.other_user_name.toLowerCase().includes(chatNameFilter.toLowerCase()),
      )
    : chats;

  const allSelected = messages.length > 0 && selectedIds.size === messages.length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="w-[90vw] mx-auto py-[clamp(1.5rem,4vw,3rem)] flex flex-col gap-8">
      {/* Modals */}
      {showBatchConfirm && (
        <ConfirmModal
          count={selectedIds.size}
          loading={batchDeleting}
          onConfirm={handleBatchDelete}
          onCancel={() => setShowBatchConfirm(false)}
        />
      )}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost.post}
          previewImg={selectedPost.img}
          previewOwner={selectedPost.owner}
          onClose={() => setSelectedPost(null)}
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

      {/* Search box — always visible */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-xl"
      >
        <label className="flex items-center gap-2 mb-3 font-bold text-gray-900">
          <LuSearch size={18} className="text-primary" />
          Buscar usuario
        </label>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (view !== "search") resetToSearch();
            }}
            placeholder="Correo o número de documento (V-12345678 / J-123456789)"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                       placeholder:text-gray-400 pr-10"
          />
          {searching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <LuLoader size={16} className="text-gray-400 animate-spin" />
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!searching && foundUser && view === "search" && (
            <motion.div
              key="user-card"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <LuUser size={18} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">
                  {foundUser.display_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{foundUser.email}</p>
                {foundUser.document_type && foundUser.document_number && (
                  <p className="text-xs text-gray-400">
                    {foundUser.document_type}-{foundUser.document_number}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleViewChats(foundUser)}
                className="shrink-0 bg-primary text-white text-xs font-semibold px-3 py-1.5
                           rounded-lg hover:bg-primary/90 transition-colors"
              >
                Ver chats
              </button>
            </motion.div>
          )}

          {!searching && searchError && query.trim() && view === "search" && (
            <motion.p
              key="search-error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 text-sm text-red-500"
            >
              {searchError}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Incidents — always visible, independent of the search flow */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
      >
        <div className="flex items-center gap-2 mb-4 font-bold text-gray-900">
          <LuTriangleAlert size={18} className="text-amber-500" />
          Incidencias
          {incidentsLoading && (
            <LuLoader size={16} className="text-gray-400 animate-spin ml-1" />
          )}
        </div>

        {incidentsError && (
          <p className="text-sm text-red-500">{incidentsError}</p>
        )}

        {!incidentsLoading && !incidentsError && incidents.length === 0 && (
          <p className="text-sm text-gray-400">
            No hay incidencias reportadas.
          </p>
        )}

        {!incidentsLoading && incidents.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="font-semibold py-2 pr-4">Motivo</th>
                  <th className="font-semibold py-2 pr-4">Usuario</th>
                  <th className="font-semibold py-2 pr-4">Mensaje</th>
                  <th className="font-semibold py-2 pr-4">Fecha</th>
                  <th className="font-semibold py-2">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr
                    key={incident.purchase_notification_incident_id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="py-2.5 pr-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1">
                        {INCIDENT_REASON_LABELS[incident.reason_name] ??
                          incident.reason_name}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-800 whitespace-nowrap">
                      {incident.offender_name || "—"}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600 max-w-xs truncate">
                      {incident.message}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-400 whitespace-nowrap">
                      {formatDateTime(incident.created_at)}
                    </td>
                    <td className="py-2.5">
                      <button
                        type="button"
                        onClick={() => openChatFromIncident(incident)}
                        className="text-primary text-xs font-semibold hover:underline whitespace-nowrap"
                      >
                        Ver chat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Chat list view */}
      <AnimatePresence>
        {view === "chat-list" && (
          <motion.div
            key="chat-list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-3 max-w-xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                Chats de{" "}
                <span className="text-primary">{foundUser?.display_name}</span>
              </p>
              {chatsLoading && (
                <LuLoader size={16} className="text-gray-400 animate-spin" />
              )}
            </div>

            {/* Filter by recipient name */}
            {!chatsLoading && chats.length > 0 && (
              <div className="relative">
                <LuSearch
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={chatNameFilter}
                  onChange={(e) => setChatNameFilter(e.target.value)}
                  placeholder="Filtrar por nombre del receptor..."
                  className="w-full rounded-xl border border-gray-200 pl-8 pr-4 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                             placeholder:text-gray-400"
                />
              </div>
            )}

            {chatsError && <p className="text-sm text-red-500">{chatsError}</p>}

            {!chatsLoading && !chatsError && filteredChats.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10
                              flex flex-col items-center gap-3 text-gray-400">
                <LuMessageSquare size={40} strokeWidth={1.2} />
                <p className="text-sm">
                  {chatNameFilter.trim()
                    ? "No hay chats que coincidan con ese nombre."
                    : "Este usuario no tiene conversaciones."}
                </p>
              </div>
            )}

            {filteredChats.map((chat) => (
              <button
                key={chat.purchase_notification_id}
                type="button"
                onClick={() => handleOpenChat(chat)}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4
                           flex items-center gap-3 hover:border-primary/40 hover:shadow-md
                           transition-all text-left w-full"
              >
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <LuUser size={18} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {chat.other_user_name}
                  </p>
                  {chat.livestock_post_name && (
                    <p className="text-xs text-gray-400 truncate">{chat.livestock_post_name}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{chat.message}</p>
                </div>
                <LuChevronRight size={18} className="text-gray-400 shrink-0" />
              </button>
            ))}
          </motion.div>
        )}

        {/* Chat view */}
        {view === "chat-view" && selectedChat && (
          <motion.div
            key="chat-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4"
          >
            {/* Chat view header */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                aria-label="Volver a lista de chats"
                onClick={() => {
                  setView("chat-list");
                  setSelectedIds(new Set());
                  setMessageFilter("");
                  setMessageFilterDebounced("");
                }}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center
                           hover:bg-gray-50 transition-colors shrink-0"
              >
                <LuArrowLeft size={16} className="text-gray-600" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {foundUser?.display_name}{" "}
                  <span className="text-gray-400 font-normal">↔</span>{" "}
                  {selectedChat.other_user_name}
                </p>
                {pagination && (
                  <p className="text-xs text-gray-400">
                    {pagination.total} mensaje{pagination.total !== 1 ? "s" : ""}
                    {messageFilterDebounced ? " (filtrados)" : ""}
                  </p>
                )}
              </div>

              {/* Batch delete action */}
              {selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={() => setShowBatchConfirm(true)}
                  className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold
                             px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <LuTrash2 size={13} />
                  Eliminar ({selectedIds.size})
                </button>
              )}
            </div>

            {/* Message filter + select-all row */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <LuSearch
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={messageFilter}
                  onChange={(e) => setMessageFilter(e.target.value)}
                  placeholder="Buscar dentro del chat..."
                  className="w-full rounded-xl border border-gray-200 pl-8 pr-8 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                             placeholder:text-gray-400"
                />
                {messageFilter && (
                  <button
                    type="button"
                    aria-label="Limpiar búsqueda"
                    onClick={() => setMessageFilter("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <LuX size={14} />
                  </button>
                )}
              </div>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="shrink-0 flex items-center gap-1.5 text-xs text-gray-600
                             font-medium hover:text-primary transition-colors"
                >
                  {allSelected ? (
                    <LuSquareCheck size={16} className="text-primary" />
                  ) : (
                    <LuSquare size={16} />
                  )}
                  {allSelected ? "Deseleccionar" : "Seleccionar todo"}
                </button>
              )}
            </div>

            {/* Loading state */}
            {messagesLoading && (
              <div className="flex justify-center py-12">
                <LuLoader size={24} className="text-gray-400 animate-spin" />
              </div>
            )}

            {/* Empty state */}
            {!messagesLoading && messages.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12
                              flex flex-col items-center gap-3 text-gray-400">
                <LuMessageSquare size={48} strokeWidth={1.2} />
                <p className="text-sm">
                  {messageFilterDebounced
                    ? "No se encontraron mensajes con ese texto."
                    : "No hay mensajes en esta conversación."}
                </p>
              </div>
            )}

            {/* Message list */}
            {!messagesLoading && messages.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
                {messages.map((msg) => {
                  const card = parsePurchaseCard(msg.message, msg.purchase_notification_type_id);
                  const isDeleting = deletingId === msg.purchase_notification_id;
                  const isSelected = selectedIds.has(msg.purchase_notification_id);
                  const isFetchingCard = fetchingCardId === msg.purchase_notification_id;
                  const isFocused = focusMessageId === msg.purchase_notification_id;

                  return (
                    <div
                      key={msg.purchase_notification_id}
                      id={`msg-${msg.purchase_notification_id}`}
                      className={`px-5 py-4 flex items-start gap-3 transition-colors ${
                        isSelected ? "bg-red-50" : isFocused ? "bg-yellow-50" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        type="button"
                        aria-label={isSelected ? "Deseleccionar mensaje" : "Seleccionar mensaje"}
                        onClick={() => toggleSelect(msg.purchase_notification_id)}
                        className="mt-0.5 shrink-0 text-gray-400 hover:text-primary transition-colors"
                      >
                        {isSelected ? (
                          <LuSquareCheck size={18} className="text-primary" />
                        ) : (
                          <LuSquare size={18} />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-semibold text-sm text-gray-900 truncate">
                            {msg.sender_name}
                          </span>
                          <span className="text-xs text-gray-400 shrink-0">
                            {formatDateTime(msg.created_at)}
                          </span>
                        </div>

                        {card ? (
                          <button
                            type="button"
                            disabled={isFetchingCard}
                            onClick={() => handleCardClick(msg, card)}
                            className="inline-flex items-center gap-1.5 text-sm text-primary
                                       font-medium hover:underline text-left disabled:opacity-60"
                          >
                            {isFetchingCard ? (
                              <LuLoader size={14} className="animate-spin" />
                            ) : (
                              <LuShoppingCart size={14} />
                            )}
                            Solicitud de compra: {card.title}
                          </button>
                        ) : (
                          <p className="text-sm text-gray-700 whitespace-pre-wrap wrap-break-word">
                            {msg.message}
                          </p>
                        )}
                      </div>

                      {/* Single delete */}
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDeleteSingle(msg.purchase_notification_id)}
                        className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500
                                   hover:bg-red-50 transition-colors disabled:opacity-40"
                        title="Eliminar mensaje"
                      >
                        {isDeleting ? (
                          <LuLoader size={16} className="animate-spin" />
                        ) : (
                          <LuTrash2 size={16} />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Load more */}
            {!messagesLoading && pagination?.hasMore && (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="self-center text-sm text-primary font-medium hover:underline disabled:opacity-50
                           flex items-center gap-1.5"
              >
                {loadingMore && <LuLoader size={14} className="animate-spin" />}
                {loadingMore ? "Cargando..." : "Cargar mensajes anteriores"}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default AdminChatPage;
