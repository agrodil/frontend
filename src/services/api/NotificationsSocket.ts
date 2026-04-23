import { io, Socket } from "socket.io-client";
import { authApi, url } from "../";

const socketUrl = url.replace(/\/api\/?$/, "");

class NotificationsSocket {
  private socket: Socket | null = null;
  private handlers: Set<(data: unknown) => void> = new Set();
  private isRefreshing = false;

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

    this.socket.on("receiveMessage", (data) => {
      this.handlers.forEach((h) => h(data));
    });

    this.socket.on("connect_error", async () => {
      if (this.isRefreshing) return;
      this.isRefreshing = true;
      try {
        await authApi.refresh();
      } catch {
        // refresh falló — sesión expirada completamente
      } finally {
        this.isRefreshing = false;
      }
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
