import { url } from "..";
import type { Login } from "@/api/interfaces/requests/Login.interface";
import type { Register } from "@/api/interfaces/requests/Register.interface";

export class AuthError extends Error {
  statusCode: number;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    statusCode: number,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}

// --- Cold-start resilience (Render free tier duerme ~30-50s) ---

// Llamadas idempotentes (GET /auth/me): timeout corto + retry con backoff.
const ATTEMPT_TIMEOUT_MS = 12_000;
const MAX_ATTEMPTS = 4;
const BACKOFF_MS = [0, 2_000, 4_000, 6_000];
const TOTAL_BUDGET_MS = 50_000;

// /auth/refresh ROTA el token: un retry tras timeout podría mandar un token ya
// revocado → 401 espurio → logout. Por eso: un solo intento largo, y un segundo
// intento SOLO si el primero fue error de red duro (nunca tras un timeout que el
// server pudo haber procesado). La ventana de gracia del backend cubre el resto.
const REFRESH_TIMEOUT_MS = 55_000;
const REFRESH_MAX_ATTEMPTS = 2;

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (
  input: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

// Reintenta ante error de red/abort y ante 5xx. Devuelve inmediatamente en <500
// (incluye 4xx: no tiene sentido reintentar un 401). Agotados los intentos:
// devuelve la última respuesta 5xx, o re-lanza el último error de red.
const fetchIdempotent = async (
  input: string,
  init: RequestInit,
): Promise<Response> => {
  const start = Date.now();
  let lastResponse: Response | null = null;
  let lastError: unknown = null;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    if (i > 0) {
      if (Date.now() - start >= TOTAL_BUDGET_MS) break;
      await sleep(BACKOFF_MS[i] ?? BACKOFF_MS[BACKOFF_MS.length - 1]);
    }
    try {
      const response = await fetchWithTimeout(
        input,
        init,
        ATTEMPT_TIMEOUT_MS,
      );
      if (response.status < 500) return response;
      lastResponse = response;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastResponse) return lastResponse;
  throw lastError ?? new Error("Request failed");
};

// Convierte una respuesta no-ok en AuthError, mapeando el mensaje genérico del
// backend a un campo específico cuando se puede.
const throwAuthError = async (response: Response): Promise<never> => {
  const error = await response.json().catch(() => ({}));
  const fieldErrors: Record<string, string> = {};
  const message = error.message ?? "Error de autenticación";

  if (message.includes("email")) fieldErrors.email = message;
  else if (message.includes("password")) fieldErrors.password = message;
  else if (message.includes("already exists")) fieldErrors.email = message;
  else if (message.includes("verified")) fieldErrors.email = message;
  else if (message.includes("documento")) fieldErrors.id_document = message;

  throw new AuthError(
    message,
    error.statusCode || response.status,
    Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
  );
};

const authFetch = async (endpoint: string, body: unknown) => {
  const response = await fetch(`${url}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!response.ok) await throwAuthError(response);

  const json = await response.json();
  return json.data;
};

// Registro con archivo: multipart/form-data. NO se setea Content-Type a mano —
// el browser agrega el boundary. Mismo mapeo de errores que authFetch.
const authFetchMultipart = async (endpoint: string, formData: FormData) => {
  const response = await fetch(`${url}${endpoint}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) await throwAuthError(response);

  const json = await response.json();
  return json.data;
};

export const authApi = {
  login: (data: Login) => authFetch("/auth/login", data),
  register: (data: Register) => authFetch("/auth/register", data),
  registerMultipart: (formData: FormData) =>
    authFetchMultipart("/auth/register", formData),
  verifyEmail: (data: {
    userId: string;
    code: string;
    remember_me?: boolean;
  }) => authFetch("/auth/verify-email", data),
  resendVerification: (data: { email: string }) =>
    authFetch("/auth/resend-verification", data),
  // Rota el refresh token. Timeout largo de un solo intento (ver arriba); un
  // AbortError/red se propaga como error nativo (transitorio), un no-ok lanza
  // AuthError con el status real para que el caller discrimine 401 definitivo.
  refresh: async (): Promise<void> => {
    const start = Date.now();
    let lastError: unknown = null;
    for (let i = 0; i < REFRESH_MAX_ATTEMPTS; i++) {
      try {
        const response = await fetchWithTimeout(
          `${url}/auth/refresh`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({}),
          },
          REFRESH_TIMEOUT_MS,
        );
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new AuthError(
            error.message ?? "No se pudo renovar la sesión",
            error.statusCode || response.status,
          );
        }
        return;
      } catch (error) {
        // Un no-ok (AuthError) es definitivo: no reintentar.
        if (error instanceof AuthError) throw error;
        // Solo reintentar si el 1er intento fue error de red DURO (no timeout),
        // porque un AbortError pudo haberse procesado en el server y rotado.
        lastError = error;
        const isAbort =
          error instanceof Error && error.name === "AbortError";
        if (isAbort || Date.now() - start >= REFRESH_TIMEOUT_MS) break;
      }
    }
    throw lastError ?? new Error("Refresh failed");
  },
  logout: () => authFetch("/auth/logout", {}),
  // Ticket de 60s para el handshake del socket (el socket va directo al backend
  // y no recibe la cookie). No usa fetchWithAuth para no crear un ciclo de
  // imports: el refresh + retry ante 401 lo hace el caller (NotificationsSocket).
  getWsTicket: async (): Promise<string> => {
    const response = await fetch(`${url}/auth/ws-ticket`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new AuthError(
        "No se pudo obtener el ticket del socket",
        response.status,
      );
    }
    const json = await response.json();
    return json.data.token as string;
  },
  getMe: async () => {
    const response = await fetchIdempotent(`${url}/auth/me`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new AuthError("Not authenticated", response.status);
    }
    const json = await response.json();
    return json.data;
  },
};
