import type { User } from "@/entities/User.interface";
import type { UserWalletRow } from "@/api/clients/wallet.api";

export type { User };

export interface AuthContextType {
  user: User | null;
  login: (user: User, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  checkSession: () => Promise<boolean>;
  isAuthenticated: boolean;
  loading: boolean;
  // Saldo de cartera: se fetchea una vez por sesión (resolve inicial o
  // login), no en cada componente que lo necesita — ver useWallet.ts.
  wallet: UserWalletRow | null;
  walletLoading: boolean;
}
