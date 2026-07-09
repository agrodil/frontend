import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { AuthContextType, User } from "@/adapters/contexts/AuthProps";
import { AuthContext } from "./AuthContext";
import { authApi, usersApi } from "@/api";
import { AuthError } from "@/api/clients/auth.api";
import { refreshSession } from "@/api/refreshSession";
import { mapUser } from "@/shared/utils/mapUser";
import { notificationsSocket } from "@/infrastructure/NotificationsSocket";

interface Props {
  children: ReactNode;
}

const SESSION_KEY = import.meta.env.VITE_SESSION_KEY;

// Reintentos de auto-sanación tras un fallo transitorio (backend despertando).
const RECHECK_DELAYS_MS = [15_000, 30_000, 60_000];

const getSessionStorage = () =>
  localStorage.getItem(SESSION_KEY)
    ? localStorage
    : sessionStorage.getItem(SESSION_KEY)
      ? sessionStorage
      : null;

const removeSessionStorage = () => {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
};

// ok = autenticado; unauthorized = 401/403 definitivo (borrar sesión);
// transient = fallo de red/timeout/5xx (conservar flag, reintentar).
type SessionResult =
  | { status: "ok"; user: User }
  | { status: "unauthorized" }
  | { status: "transient" };

const isDefinitive = (e: unknown): boolean =>
  e instanceof AuthError && (e.statusCode === 401 || e.statusCode === 403);

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const recheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recheckAttempt = useRef(0);
  const isResolving = useRef(false);
  // Ref al último runResolve, para que el timer de recheck se llame a sí mismo
  // sin crear un ciclo de declaración entre callbacks.
  const resolveRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const loadMe = useCallback(async (): Promise<SessionResult> => {
    try {
      const raw = await authApi.getMe();
      return { status: "ok", user: mapUser(raw) };
    } catch (e) {
      return isDefinitive(e)
        ? { status: "unauthorized" }
        : { status: "transient" };
    }
  }, []);

  // Restaura la sesión: si /auth/me da 401 definitivo, intenta un refresh
  // (que rota el token) y reintenta. Un fallo transitorio NO se interpreta
  // como sesión expirada.
  const resolveSession = useCallback(async (): Promise<SessionResult> => {
    const first = await loadMe();
    if (first.status !== "unauthorized") return first;
    try {
      await refreshSession();
    } catch (e) {
      return isDefinitive(e)
        ? { status: "unauthorized" }
        : { status: "transient" };
    }
    return loadMe();
  }, [loadMe]);

  const clearRecheck = useCallback(() => {
    if (recheckTimer.current) {
      clearTimeout(recheckTimer.current);
      recheckTimer.current = null;
    }
  }, []);

  // Resuelve la sesión y aplica el resultado. En "transient" conserva el flag y
  // agenda una re-verificación para que la sesión se recupere sola cuando el
  // backend despierte.
  const runResolve = useCallback(async () => {
    if (isResolving.current) return;
    isResolving.current = true;
    try {
      const result = await resolveSession();
      if (result.status === "ok") {
        recheckAttempt.current = 0;
        clearRecheck();
        setUser(result.user);
        notificationsSocket.connect();
        // Desliza la ventana de 7 días en cada entrada (rota el token).
        void refreshSession().catch(() => {});
      } else if (result.status === "unauthorized") {
        recheckAttempt.current = 0;
        clearRecheck();
        removeSessionStorage();
        setUser(null);
      } else {
        const attempt = recheckAttempt.current;
        if (attempt < RECHECK_DELAYS_MS.length) {
          recheckAttempt.current = attempt + 1;
          clearRecheck();
          recheckTimer.current = setTimeout(() => {
            void resolveRef.current();
          }, RECHECK_DELAYS_MS[attempt]);
        }
      }
    } finally {
      isResolving.current = false;
    }
  }, [resolveSession, clearRecheck]);

  useEffect(() => {
    resolveRef.current = runResolve;
  }, [runResolve]);

  useEffect(() => {
    const init = async () => {
      if (!getSessionStorage()) {
        setLoading(false);
        return;
      }
      await runResolve();
      setLoading(false);
    };
    void init();
    return () => clearRecheck();
  }, [runResolve, clearRecheck]);

  const fetchMe = useCallback(async (): Promise<User | null> => {
    const result = await loadMe();
    return result.status === "ok" ? result.user : null;
  }, [loadMe]);

  const login = async (user: User, rememberMe = false) => {
    try {
      if (rememberMe) {
        localStorage.setItem(SESSION_KEY, "1");
      } else {
        sessionStorage.setItem(SESSION_KEY, "1");
      }
    } catch {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // private browsing blocks all storage — session won't survive reload
      }
    }
    const fullUser = await fetchMe();
    setUser(fullUser ?? user);
    notificationsSocket.connect();
  };

  const logout = async () => {
    clearRecheck();
    recheckAttempt.current = 0;
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    notificationsSocket.disconnect();
    removeSessionStorage();
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    try {
      await usersApi.update(
        data as Record<string, string | File | File[] | boolean>,
      );
      setUser({ ...user, ...data });
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  // Devuelve true solo si la sesión quedó confirmada. En "transient" devuelve
  // false SIN borrar el flag (la cookie de 7 días sigue viva).
  const checkSession = useCallback(async (): Promise<boolean> => {
    if (!getSessionStorage()) return false;
    const result = await resolveSession();
    if (result.status === "ok") {
      setUser(result.user);
      return true;
    }
    if (result.status === "unauthorized") {
      removeSessionStorage();
      setUser(null);
    }
    return false;
  }, [resolveSession]);

  const value: AuthContextType = {
    user,
    login,
    logout,
    updateUser,
    checkSession,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
