import { createContext } from "react";

export interface UnreadCountContextType {
  count: number;
  refresh: () => Promise<void>;
}

export const UnreadCountContext = createContext<UnreadCountContextType | null>(
  null,
);
