import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router.tsx";
import { AuthProvider } from "./context/AuthProvider";
import { UnreadCountProvider } from "./context/UnreadCountProvider";

function App() {
  return (
    <AuthProvider>
      <UnreadCountProvider>
        <RouterProvider router={router} />
      </UnreadCountProvider>
    </AuthProvider>
  );
}

export default App;
