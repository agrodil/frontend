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
import { walletApi, type UserWalletRow } from "@/api/clients/wallet.api";
import {
  WALLET_REFRESH_EVENT,
  WALLET_OPTIMISTIC_EVENT,
  type WalletRefreshDetail,
  type WalletOptimisticDetail,
} from "@/adapters/hooks/actions/useWallet";

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
  const [wallet, setWallet] = useState<UserWalletRow | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  const recheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recheckAttempt = useRef(0);
  const isResolving = useRef(false);
  // Ref al último runResolve, para que el timer de recheck se llame a sí mismo
  // sin crear un ciclo de declaración entre callbacks.
  const resolveRef = useRef<() => Promise<void>>(() => Promise.resolve());

  // Fetch único del saldo por sesión (resolve inicial o login) — no lo
  // dispara cada componente que necesita mostrar el saldo, ver useWallet.ts.
  const loadWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      const w = await walletApi.getWallet();
      setWallet(w);
    } catch {
      // se queda con el último valor conocido (o null); WALLET_REFRESH_EVENT
      // permite reintentar sin recargar la página.
    } finally {
      setWalletLoading(false);
    }
  }, []);

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
        void loadWallet();
        // Desliza la ventana de 7 días en cada entrada (rota el token).
        void refreshSession().catch(() => {});
      } else if (result.status === "unauthorized") {
        recheckAttempt.current = 0;
        clearRecheck();
        removeSessionStorage();
        setUser(null);
        setWallet(null);
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
  }, [resolveSession, clearRecheck, loadWallet]);

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
    void loadWallet();
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
    setWallet(null);
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

  // Reconciliación con el servidor: refetch completo, o silenciosa (no pisa
  // un valor optimista con el loading) si detail.silent.
  useEffect(() => {
    const handler = (e: Event) => {
      const silent = (e as CustomEvent<WalletRefreshDetail>).detail?.silent;
      if (!silent) {
        void loadWallet();
        return;
      }
      walletApi
        .getWallet()
        .then((w) => setWallet(w))
        .catch(() => {
          /* si falla, se queda el valor optimista hasta el próximo refresh */
        });
    };
    window.addEventListener(WALLET_REFRESH_EVENT, handler);
    return () => window.removeEventListener(WALLET_REFRESH_EVENT, handler);
  }, [loadWallet]);

  // Ajuste optimista: suma/resta al saldo mostrado sin esperar al servidor.
  // Única aritmética de dinero en el cliente — siempre transitoria, se
  // reconcilia con WALLET_REFRESH_EVENT o se revierte si la operación falla.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<WalletOptimisticDetail>).detail;
      if (!detail) return;
      setWallet((prev) => {
        if (!prev) return prev;
        const next = Number(prev.balance) + detail.deltaUsd;
        if (!Number.isFinite(next)) return prev;
        return { ...prev, balance: next.toFixed(2) };
      });
    };
    window.addEventListener(WALLET_OPTIMISTIC_EVENT, handler);
    return () => window.removeEventListener(WALLET_OPTIMISTIC_EVENT, handler);
  }, []);

  const value: AuthContextType = {
    user,
    login,
    logout,
    updateUser,
    checkSession,
    isAuthenticated: !!user,
    loading,
    wallet,
    walletLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
