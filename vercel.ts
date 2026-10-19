import { routes } from "@vercel/config/v1";
import type { VercelConfig } from "@vercel/config/v1";

// Los rewrites de vercel.json no interpolan variables de entorno; vercel.ts sí
// (se evalúa al iniciar `vercel build`). VITE_API_URL es el origen del backend
// de cada entorno, sin ruta ni "/" final.
const backendUrl = (process.env.VITE_API_URL ?? "").trim().replace(/\/+$/, "");

if (!/^https:\/\/[^/\s]+$/.test(backendUrl)) {
  throw new Error(
    `VITE_API_URL inválida o no definida (${backendUrl || "vacía"}). Usa https://host sin ruta.`,
  );
}

export const config: VercelConfig = {
  rewrites: [
    routes.rewrite("/api/:path*", `${backendUrl}/api/:path*`),
    routes.rewrite("/((?!assets/).*)", "/index.html"),
  ],
  headers: [
    {
      source: "/assets/(.*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      source: "/index.html",
      headers: [
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
      ],
    },
  ],
};
