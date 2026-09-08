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
          {
            path: "/reportar-problema",
            lazy: async () => {
              const module = await import(
                "@/presentation/pages/private/ReportProblemPage/ReportProblemPage.tsx"
              );
              return { Component: module.default };
            },
          },
          {
            path: "/wallet",
            lazy: async () => {
              const module = await import(
                "@/presentation/pages/private/WalletPage/WalletPage.tsx"
              );
              return { Component: module.default };
            },
          },
          {
            path: "/wallet/depositar",
            lazy: async () => {
              const module = await import(
                "@/presentation/pages/private/DepositPage/DepositPage.tsx"
              );
              return { Component: module.default };
            },
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
          {
            path: "/admin/troubleshooting",
            lazy: async () => {
              const module = await import(
                "@/presentation/pages/admin/AdminTroubleshootingPage/AdminTroubleshootingPage.tsx"
              );
              return { Component: module.default };
            },
          },
          {
            path: "/admin/wallet",
            lazy: async () => {
              const module = await import(
                "@/presentation/pages/admin/AdminWalletPage/AdminWalletPage.tsx"
              );
              return { Component: module.default };
            },
          },
          {
            path: "/admin/wallet/cuentas",
            lazy: async () => {
              const module = await import(
                "@/presentation/pages/admin/AdminWalletPage/AdminBankAccountsPage.tsx"
              );
              return { Component: module.default };
            },
          },
          {
            path: "/admin/wallet/ajustes",
            lazy: async () => {
              const module = await import(
                "@/presentation/pages/admin/AdminWalletPage/AdminAdjustmentPage.tsx"
              );
              return { Component: module.default };
            },
          },
          {
            path: "/admin/wallet/conciliacion",
            lazy: async () => {
              const module = await import(
                "@/presentation/pages/admin/AdminWalletPage/AdminReconciliationPage.tsx"
              );
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
