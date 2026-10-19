import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/adapters/hooks/common/useAuth";
import { notificationsSocket } from "@/infrastructure/NotificationsSocket";
import { notificationsApi } from "@/api/clients/notifications.api";
import { useUnreadCount } from "@/adapters/hooks/actions/useUnreadCount";
import {
  sendMessage as sendMessageAction,
  markChatAsRead,
} from "@/presentation/router/actions/notifications.actions";
import type { Message } from "@/presentation/interfaces/pages/NotificationsPageLoaderData";
import { parsePurchaseStatus } from "@/shared/utils/parsePurchaseMessage";

const MESSAGES_LIMIT = 50;

export type ChatMessage = Message & { status?: "sending" | "failed" };

interface IncomingStatusChange {
  status: number;
  title: string;
}

export interface UseChatMessagesResult {
  messages: ChatMessage[];
  sending: boolean;
  purchaseStatusMap: Record<string, number>;
  sendMessage: (text: string) => Promise<void>;
  reloadMessages: () => Promise<void>;
}

// Maneja el historial de un chat: carga inicial, refresco por socket, envío
// optimista y el mapa de estados de solicitudes de compra derivado de los
// mensajes. `onIncomingStatusChange` se dispara solo para cambios de estado
// del OTRO usuario, ya vistos por primera vez — el componente decide cómo
// mostrarlos (toast).
export function useChatMessages(
  otherUserId: string,
  onIncomingStatusChange: (change: IncomingStatusChange) => void,
): UseChatMessagesResult {
  const { user } = useAuth();
  const { refresh: refreshUnreadCount } = useUnreadCount();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);

  const seenStatusIds = useRef<Set<string>>(new Set());
  const statusToastsInit = useRef(false);

  const purchaseStatusMap = useMemo(() => {
    const map: Record<string, number> = {};
    messages.forEach((m) => {
      const s = parsePurchaseStatus(m.message);
      if (s) map[s.purchaseRequestId] = s.status;
    });
    return map;
  }, [messages]);

  const reloadMessages = useCallback(async () => {
    try {
      const data = await notificationsApi.getAllMessagesByChat(
        otherUserId,
        MESSAGES_LIMIT,
        0,
      );
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    }
  }, [otherUserId]);

  useEffect(() => {
    let cancelled = false;
    // Reset del tracking de toasts de estado al abrir otro chat.
    seenStatusIds.current = new Set();
    statusToastsInit.current = false;
    notificationsApi
      .getAllMessagesByChat(otherUserId, MESSAGES_LIMIT, 0)
      .then((data) => {
        if (!cancelled) setMessages(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      });
    markChatAsRead(otherUserId)
      .then(() => refreshUnreadCount())
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [otherUserId, refreshUnreadCount]);

  // Toast en tiempo real cuando llega un cambio de estado del OTRO usuario.
  useEffect(() => {
    const statusMsgs = messages.filter((m) => parsePurchaseStatus(m.message));

    // Primera carga: marca todo lo histórico como visto sin notificar.
    if (!statusToastsInit.current) {
      statusMsgs.forEach((m) =>
        seenStatusIds.current.add(m.purchase_notification_id),
      );
      statusToastsInit.current = true;
      return;
    }

    statusMsgs.forEach((m) => {
      if (seenStatusIds.current.has(m.purchase_notification_id)) return;
      seenStatusIds.current.add(m.purchase_notification_id);
      if (m.sent_by === user?.id) return; // ignora los propios
      const s = parsePurchaseStatus(m.message)!;
      onIncomingStatusChange({ status: s.status, title: s.title });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, user?.id]);

  useEffect(() => {
    return notificationsSocket.onMessage(() => {
      reloadMessages();
      markChatAsRead(otherUserId)
        .then(() => refreshUnreadCount())
        .catch(() => {});
    });
  }, [otherUserId, reloadMessages, refreshUnreadCount]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const tempId = `optimistic-${crypto.randomUUID()}`;
    const optimisticMessage: ChatMessage = {
      purchase_notification_id: tempId,
      sent_by: user?.id ?? "",
      sent_to: otherUserId,
      post_id: null,
      purchase_notification_type_id: 2,
      message: trimmed,
      is_read: false,
      created_at: new Date().toISOString(),
      sender_name: user?.firstName ?? "",
      post_name: null,
      status: "sending",
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    setSending(true);
    try {
      await sendMessageAction(otherUserId, trimmed);
      // No recargar acá: el mensaje optimista ya está en pantalla con su
      // animación. Un reload ahora reemplazaría el id temporal por el real y
      // volvería a montar el nodo, re-disparando el slide/fade de entrada.
      setMessages((prev) =>
        prev.map((m) =>
          m.purchase_notification_id === tempId
            ? { ...m, status: undefined }
            : m,
        ),
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.purchase_notification_id === tempId
            ? { ...m, status: "failed" }
            : m,
        ),
      );
      throw error;
    } finally {
      setSending(false);
    }
  };

  return { messages, sending, purchaseStatusMap, sendMessage, reloadMessages };
}
