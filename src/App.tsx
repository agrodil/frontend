import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";

import LandingPage from "./views/public/LandingPage";
import AuthPage from "./views/public/AuthPage/AuthPage.tsx";

import NewPostPage from "./views/private/NewPostPage/NewPostPage.tsx";

import RootLayout from "./components/layout/RootLayout";

import { getMeData } from "./routes/loaders/me.loader";
import { getLandingData } from "./routes/loaders/landing.loader.ts";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        loader: getLandingData,
        element: <LandingPage />,
      },
      {
        path: "/login",
        element: <AuthPage />,
      },
      {
        path: "/me",
        loader: getMeData,
        lazy: async () => {
          const module = await import("./views/public/MePage/MePage.tsx");

          return {
            Component: module.default,
          };
        },
      },

      {
        path: "/new-post",
        element: <NewPostPage />,
      },

      {
        path: "*",
        element: (
          <h1 className="text-center mt-20 text-2xl">
            404 - Página no encontrada
          </h1>
        ),
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
