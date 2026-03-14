import { Routes, Route } from "react-router-dom";
import RootLayout from "./components/layout/RootLayout";
import LandingPage from "./views/public/LandingPage";
import { AuthProvider } from "./context/AuthProvider";
import AuthPage from "./views/public/AuthPage";
import MePage from "./views/public/MePage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/me" element={<MePage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
