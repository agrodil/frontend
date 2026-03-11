import { Routes, Route } from "react-router-dom";
import RootLayout from "./components/layout/RootLayout";
import LandingPage from "./views/public/LandingPage";

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>
    </Routes>
  );
}

export default App;
