import type { Chat } from "@/presentation/interfaces/pages/NotificationsPageLoaderData";

export interface ChatWindowProps {
  chat: Chat;
  onBack: () => void;
}
