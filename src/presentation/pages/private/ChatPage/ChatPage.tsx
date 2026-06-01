import { type FC } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import ChatWindow from "@/presentation/layout/ChatWindow";
import type { Chat } from "@/presentation/interfaces/pages/NotificationsPageLoaderData";

const ChatPage: FC = () => {
  const chat = useLoaderData() as Chat;
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatWindow chat={chat} onBack={() => navigate("/notifications")} />
    </div>
  );
};

export default ChatPage;
