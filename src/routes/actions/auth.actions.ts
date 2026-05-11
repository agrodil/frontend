import { authApi } from "../../services";
import type { User } from "../../interfaces/auth/AuthProps";
import type { Login } from "../../interfaces/api/auth/Login.interface";
import type { Register } from "../../interfaces/api/auth/Register.interface";

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
