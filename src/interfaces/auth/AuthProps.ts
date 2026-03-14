export interface User {
  id: string;
  email: string;
  role: number;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  secondLastName?: string;
  documentType?: string;
  documentNumber?: string;
  municipality?: string;
  phone?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: { user: User; token: string }) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isAuthenticated: boolean;
}
