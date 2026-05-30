import RootLayout from "@/presentation/layout/RootLayout.tsx";
import NewPostPage from "@/presentation/pages/private/NewPostPage/NewPostPage.tsx";
import { getMeData } from "../loaders/me.loader.ts";
import { getNotificationsData } from "../loaders/notifications.loader.ts";
import { ProtectedLayout } from "./ProtectedLayout.tsx";

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
              const module = await import("@/presentation/pages/private/MePage/MePage.tsx");
              return { Component: module.default };
            },
          },
          {
            path: "/notifications",
            loader: getNotificationsData,
            lazy: async () => {
              const module = await import("@/presentation/pages/private/NotificationsPage/NotificationsPage.tsx");
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
];
