import { authApi } from "@/api";
import type { User } from "@/adapters/contexts/AuthProps";
import type { Login } from "@/api/interfaces/requests/Login.interface";
import type { Register } from "@/api/interfaces/requests/Register.interface";
import { mapUser } from "@/shared/utils/mapUser";

interface AuthResponse {
  user: User;
}

interface RegisterResponse {
  userId: string;
  message: string;
}

export const login = async (data: Login): Promise<AuthResponse> => {
  const raw = await authApi.login(data);
  return { user: mapUser(raw.user ?? raw) };
};

export const register = async (data: Register): Promise<RegisterResponse> =>
  authApi.register(data);

export const verifyEmail = async (
  userId: string,
  code: string,
  rememberMe?: boolean,
): Promise<AuthResponse> => {
  const raw = await authApi.verifyEmail({ userId, code, remember_me: rememberMe });
  return { user: mapUser(raw.user ?? raw) };
};

export const resendVerification = async (
  email: string,
): Promise<{ message: string }> => authApi.resendVerification({ email });
