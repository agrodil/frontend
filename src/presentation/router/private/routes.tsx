import RootLayout from "@/presentation/layout/RootLayout.tsx";
import NewPostPage from "@/presentation/pages/private/NewPostPage/NewPostPage.tsx";
import { getMeData } from "../loaders/me.loader.ts";
import {
  getNotificationsData,
  getChatData,
} from "../loaders/notifications.loader.ts";
import { getAdminDashboardData } from "../loaders/admin.loader.ts";
import { ProtectedLayout } from "./ProtectedLayout.tsx";
import { AdminLayout } from "./AdminLayout.tsx";

export const routes = [
  {
    element: <RootLayout />,
    children: [
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: "/me",
            loader: getMeData,
            lazy: async () => {
              const module =
                await import("@/presentation/pages/private/MePage/MePage.tsx");
              return { Component: module.default };
            },
          },
          {
            path: "/notifications",
            loader: getNotificationsData,
            lazy: async () => {
              const module =
                await import("@/presentation/pages/private/NotificationsPage/NotificationsPage.tsx");
              return { Component: module.default };
            },
          },
          {
            path: "/new-post",
            element: <NewPostPage />,
          },
        ],
      },
    ],
  },
  {
    element: <RootLayout />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: "/admin",
            loader: getAdminDashboardData,
            lazy: async () => {
              const module =
                await import("@/presentation/pages/admin/AdminPage/AdminDashboardPage.tsx");
              return { Component: module.default };
            },
          },
          {
            path: "/admin/chats",
            lazy: async () => {
              const module =
                await import("@/presentation/pages/admin/AdminChatPage/AdminChatPage.tsx");
              return { Component: module.default };
            },
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "/notifications/chat/:otherUserId",
        loader: getChatData,
        lazy: async () => {
          const module =
            await import("@/presentation/pages/private/ChatPage/ChatPage.tsx");
          return { Component: module.default };
        },
      },
    ],
  },
];
