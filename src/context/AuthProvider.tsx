import React, { useState, useEffect, useCallback, type ReactNode } from "react";
import type { AuthContextType, User } from "../interfaces/auth/AuthProps";
import { AuthContext } from "./AuthContext";
import { authApi } from "../services";

interface Props {
  children: ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async (): Promise<User | null> => {
    try {
      return await authApi.getMe();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      let currentUser = await fetchMe();
      if (!currentUser) {
        try {
          await authApi.refresh();
          currentUser = await fetchMe();
        } catch {
          // session expired
        }
      }
      setUser(currentUser);
      setLoading(false);
    };
    init();
  }, [fetchMe]);

  const login = (user: User) => {
    setUser(user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...data });
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
