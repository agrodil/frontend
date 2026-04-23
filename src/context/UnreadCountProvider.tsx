import { useState, useEffect, useCallback, type FC, type ReactNode } from "react";
import { UnreadCountContext } from "./UnreadCountContext";
import { useAuth } from "../hooks/useAuth";
import { notificationsApi } from "../services/api/notifications.api";
import { notificationsSocket } from "../services/api/NotificationsSocket";

export const UnreadCountProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCount(0);
      return;
    }
    try {
      const data = await notificationsApi.getUnreadCount();
      setCount(data.unreadCount);
    } catch {
      /* ignore */
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isAuthenticated) return;
    return notificationsSocket.onMessage(() => refresh());
  }, [isAuthenticated, refresh]);

  return (
    <UnreadCountContext.Provider value={{ count, refresh }}>
      {children}
    </UnreadCountContext.Provider>
  );
};
