import type { Chat } from "../loaders/NotificationsPageLoaderData";

export interface ChatWindowProps {
  chat: Chat;
  onBack: () => void;
}
