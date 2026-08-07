import { io, Socket } from "socket.io-client";
import { url } from "@/api";
import { authApi, AuthError } from "@/api/clients/auth.api";
import { refreshSession, hasSessionFlag } from "@/api/refreshSession";

const socketUrl =
  import.meta.env.VITE_SOCKET_URL || url.replace(/\/api\/?$/, "");

// El socket se conecta directo al backend, pero el tráfico HTTP pasa por el
// proxy del frontend: la cookie access_token es host-only del dominio del
// frontend y NO viaja en el handshake. Por eso la auth va por ticket, pedido
// vía HTTP (donde la cookie sí es first-party) y enviado en el payload del
// handshake. Un 401 significa access token vencido: se renueva y se reintenta.
const getTicket = async (): Promise<string> => {
  try {
    return await authApi.getWsTicket();
  } catch (error) {
    if (!(error instanceof AuthError) || error.statusCode !== 401) throw error;
    await refreshSession();
    return authApi.getWsTicket();
  }
};

class NotificationsSocket {
  private socket: Socket | null = null;
  private handlers: Set<(data: unknown) => void> = new Set();

  onMessage(handler: (data: unknown) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  connect() {
    // Basta con que exista: si está desconectado, socket.io reintenta solo.
    // Comprobar `connected` crearía una instancia nueva en cada reintento.
    if (this.socket) return;

    this.socket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      // socket.io re-ejecuta este callback en CADA intento de conexión, así que
      // cada reconexión pide un ticket fresco (el anterior ya venció).
      auth: (cb) => {
        if (!hasSessionFlag()) {
          cb({});
          return;
        }
        void getTicket()
          .then((token) => cb({ token }))
          .catch(() => cb({}));
      },
    });

    this.socket.on("receiveMessage", (data: unknown) => {
      this.handlers.forEach((h) => h(data));
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
