import RootLayout from "../../components/layout/RootLayout";
import AuthPage from "../../views/public/AuthPage/AuthPage";
import LandingPage from "../../views/public/LandingPage";
import PostsPage from "../../views/public/PostsPage/PostsPage";
import { getLandingData } from "../loaders/landing.loader";
import { getPostsData } from "../loaders/posts.loader";

export const routes = [
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
        path: "/posts",
        loader: getPostsData,
        element: <PostsPage />,
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
];
