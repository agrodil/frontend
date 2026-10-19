import type { User } from "@/entities/User.interface";
import type { UserWalletRow } from "@/api/clients/wallet.api";

export type { User };

// Partial<User> + los dos campos de cambio de contraseña, que nunca viven en
// el User local (no se persisten en el estado del cliente).
export type ProfileUpdatePayload = Partial<User> & {
  password?: string;
  currentPassword?: string;
};

export interface AuthContextType {
  user: User | null;
  login: (user: User, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  updateUser: (data: ProfileUpdatePayload) => Promise<void>;
  checkSession: () => Promise<boolean>;
  isAuthenticated: boolean;
  loading: boolean;
  // Saldo de cartera: se fetchea una vez por sesión (resolve inicial o
  // login), no en cada componente que lo necesita — ver useWallet.ts.
  wallet: UserWalletRow | null;
  walletLoading: boolean;
}
