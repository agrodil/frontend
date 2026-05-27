import type { User } from "@/interfaces/api/users/User.interface";

export type { User };

export interface AuthContextType {
  user: User | null;
  login: (user: User, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  checkSession: () => Promise<boolean>;
  isAuthenticated: boolean;
  loading: boolean;
}
