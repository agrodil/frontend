import { url } from "..";
import type { Login } from "../interfaces/login.interface";
import type { Register } from "../interfaces/register.interface";

const authFetch = async (endpoint: string, body: unknown) => {
  const response = await fetch(`${url}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Error de autenticación");
  }

  const json = await response.json();
  return json.data;
};

export const authApi = {
  login: (data: Login) => authFetch("/auth/login", data),
  register: (data: Register) => authFetch("/auth/register", data),
  verifyEmail: (data: { userId: string; code: string; remember_me?: boolean }) =>
    authFetch("/auth/verify-email", data),
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
