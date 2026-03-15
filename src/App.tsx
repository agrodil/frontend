import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./components/layout/RootLayout";
import LandingPage from "./views/public/LandingPage";
import { AuthProvider } from "./context/AuthProvider";
import AuthPage from "./views/public/AuthPage/AuthPage.tsx";
import { landingLoader } from "./views/public/LandingPage";
import { getMeData } from "./routes/loaders/me.loader";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        loader: landingLoader,
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
