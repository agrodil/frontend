import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "woaded-facultative-jayla.ngrok-free.dev",
      ".ngrok-free.dev",
    ],
  },
});
