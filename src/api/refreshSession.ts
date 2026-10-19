import { authApi } from "./clients/auth.api";

const SESSION_KEY = import.meta.env.VITE_SESSION_KEY;

/**
 * True si existe el flag local de sesión (localStorage o sessionStorage).
 * No prueba que la cookie siga válida, solo que el usuario intentó estar logueado.
 */
export const hasSessionFlag = (): boolean =>
  !!localStorage.getItem(SESSION_KEY) || !!sessionStorage.getItem(SESSION_KEY);

// Single-flight compartido por TODOS los módulos (fetchWithAuth, AuthProvider,
// NotificationsSocket). Como el backend ROTA el refresh token, dos refresh en
// paralelo desde distintos módulos harían que uno reciba un token ya revocado
// → logout. Con este dedup, en una pestaña hay un único punto de rotación.
let refreshPromise: Promise<void> | null = null;

export const refreshSession = (): Promise<void> => {
  if (!refreshPromise) {
    refreshPromise = authApi.refresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};
