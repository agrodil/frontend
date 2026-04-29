import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Recover from stale lazy-import chunks after a redeploy.
// When index.html caches a hash that no longer exists, Vite emits
// `vite:preloadError`; reloading pulls the fresh index.html + chunk map.
window.addEventListener("vite:preloadError", () => {
  if (
    !sessionStorage.getItem("__chunkReloaded") &&
    typeof window !== "undefined"
  ) {
    sessionStorage.setItem("__chunkReloaded", "1");
    window.location.reload();
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
