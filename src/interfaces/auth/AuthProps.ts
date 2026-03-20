export interface User {
  id: string;
  email: string;
  role: number;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  secondLastName?: string;
  companyName?: string;
  documentType?: string;
  documentNumber?: string;
  municipality?: string;
  phone?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (user: User, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  checkSession: () => Promise<boolean>;
  isAuthenticated: boolean;
  loading: boolean;
}
