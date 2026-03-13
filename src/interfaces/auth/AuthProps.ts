export interface User {
  id: string;
  email: string;
  role: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: { user: User; token: string }) => void;
  logout: () => void;
  isAuthenticated: boolean;
}
