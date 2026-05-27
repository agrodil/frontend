import React, { useState, useEffect, useCallback, type ReactNode } from "react";
import type { AuthContextType, User } from "../interfaces/auth/AuthProps";
import { AuthContext } from "./AuthContext";
import { authApi, usersApi } from "../services";
import { mapUser } from "../utils/mapUser";
import { notificationsSocket } from "../services/api/NotificationsSocket";

interface Props {
  children: ReactNode;
}

const SESSION_KEY = import.meta.env.VITE_SESSION_KEY;

const getSessionStorage = () =>
  localStorage.getItem(SESSION_KEY)
    ? localStorage
    : sessionStorage.getItem(SESSION_KEY)
      ? sessionStorage
      : null;

const removeSessionStorage = () => {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
};

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async (): Promise<User | null> => {
    try {
      const raw = await authApi.getMe();
      return mapUser(raw);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!getSessionStorage()) {
        setLoading(false);
        return;
      }

      let currentUser: User | null = await fetchMe();
      if (!currentUser) {
        try {
          await authApi.refresh();
          currentUser = await fetchMe();
        } catch {
          // session expired
        }
      }

      if (!currentUser) {
        removeSessionStorage();
      } else {
        notificationsSocket.connect();
      }

      setUser(currentUser);
      setLoading(false);
    };
    init();
  }, [fetchMe]);

  const login = async (user: User, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem(SESSION_KEY, "1");
    } else {
      sessionStorage.setItem(SESSION_KEY, "1");
    }
    const fullUser = await fetchMe();
    setUser(fullUser ?? user);
    notificationsSocket.connect();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    notificationsSocket.disconnect();
    removeSessionStorage();
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    try {
      await usersApi.update(
        data as Record<string, string | File | File[] | boolean>,
      );
      setUser({ ...user, ...data });
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const checkSession = useCallback(async (): Promise<boolean> => {
    if (!getSessionStorage()) return false;

    let currentUser = await fetchMe();

    if (!currentUser) {
      try {
        await authApi.refresh();
        currentUser = await fetchMe();
      } catch {
        // refresh failed, currentUser stays null
      }
    }

    if (currentUser) {
      setUser(currentUser);
      return true;
    }

    removeSessionStorage();
    setUser(null);
    return false;
  }, [fetchMe]);

  const value: AuthContextType = {
    user,
    login,
    logout,
    updateUser,
    checkSession,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
