import { useContext } from "react";
import { UnreadCountContext } from "../context/UnreadCountContext";

export const useUnreadCount = () => {
  const context = useContext(UnreadCountContext);
  if (!context)
    throw new Error("useUnreadCount debe usarse dentro de UnreadCountProvider");
  return context;
};
