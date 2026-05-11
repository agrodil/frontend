import { url } from "..";
import type { Login } from "../../interfaces/api/auth/Login.interface";
import type { Register } from "../../interfaces/api/auth/Register.interface";

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

const authFetch = async (endpoint: string, body: unknown) => {
  const response = await fetch(`${url}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const fieldErrors: Record<string, string> = {};

    // Intentar mapear errores genéricos a campos específicos
    const message = error.message ?? "Error de autenticación";

    if (message.includes("email")) fieldErrors.email = message;
    else if (message.includes("password")) fieldErrors.password = message;
    else if (message.includes("already exists")) fieldErrors.email = message;
    else if (message.includes("verified")) fieldErrors.email = message;

    throw new AuthError(
      message,
      error.statusCode || response.status,
      Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
    );
  }

  const json = await response.json();
  return json.data;
};

export const authApi = {
  login: (data: Login) => authFetch("/auth/login", data),
  register: (data: Register) => authFetch("/auth/register", data),
  verifyEmail: (data: {
    userId: string;
    code: string;
    remember_me?: boolean;
  }) => authFetch("/auth/verify-email", data),
  resendVerification: (data: { email: string }) =>
    authFetch("/auth/resend-verification", data),
  refresh: () => authFetch("/auth/refresh", {}),
  logout: () => authFetch("/auth/logout", {}),
  getMe: async () => {
    const response = await fetch(`${url}/auth/me`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Not authenticated");
    const json = await response.json();
    return json.data;
  },
};
