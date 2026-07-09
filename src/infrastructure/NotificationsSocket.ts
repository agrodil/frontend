import { io, Socket } from "socket.io-client";
import { url } from "@/api";
import { refreshSession, hasSessionFlag } from "@/api/refreshSession";

const socketUrl =
  import.meta.env.VITE_SOCKET_URL || url.replace(/\/api\/?$/, "");

class NotificationsSocket {
  private socket: Socket | null = null;
  private handlers: Set<(data: unknown) => void> = new Set();

  onMessage(handler: (data: unknown) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
    });

    this.socket.on("receiveMessage", (data: unknown) => {
      this.handlers.forEach((h) => h(data));
    });

    this.socket.on("connect_error", () => {
      // Solo intentar renovar si hay sesión local; evita rotar de gusto estando
      // deslogueado. refreshSession() está deduplicado con el resto de la app.
      if (!hasSessionFlag()) return;
      void refreshSession().catch(() => {
        // refresh falló — sesión expirada o backend dormido; el socket reintenta solo
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const notificationsSocket = new NotificationsSocket();
