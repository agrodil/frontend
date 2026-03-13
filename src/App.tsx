import { Routes, Route } from "react-router-dom";
import RootLayout from "./components/layout/RootLayout";
import LandingPage from "./views/public/LandingPage";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
