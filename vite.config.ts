import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "url";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    plugins: [react(), tailwindcss()],
    server: {
      // Mismo contrato que el rewrite de Vercel: /api/* va al backend.
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:3000",
          changeOrigin: true,
        },
      },
      allowedHosts: [
        "localhost",
        "127.0.0.1",
        "woaded-facultative-jayla.ngrok-free.dev",
        ".ngrok-free.dev",
      ],
    },
  };
});
