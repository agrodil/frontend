import { authApi } from "@/api";
import type { User } from "@/adapters/contexts/AuthProps";
import type { Login } from "@/api/interfaces/requests/Login.interface";
import type { Register } from "@/api/interfaces/requests/Register.interface";

interface AuthResponse {
  user: User;
}

interface RegisterResponse {
  userId: string;
  message: string;
}

export const login = async (data: Login): Promise<AuthResponse> =>
  authApi.login(data);

export const register = async (data: Register): Promise<RegisterResponse> =>
  authApi.register(data);

export const verifyEmail = async (
  userId: string,
  code: string,
  rememberMe?: boolean,
): Promise<AuthResponse> =>
  authApi.verifyEmail({ userId, code, remember_me: rememberMe });

export const resendVerification = async (
  email: string,
): Promise<{ message: string }> => authApi.resendVerification({ email });
