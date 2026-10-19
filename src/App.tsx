import { RouterProvider } from "react-router-dom";
import { router } from "@/presentation/router/router";
import { AuthProvider } from "@/adapters/contexts/AuthProvider";
import { UnreadCountProvider } from "@/adapters/contexts/UnreadCountProvider";

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
