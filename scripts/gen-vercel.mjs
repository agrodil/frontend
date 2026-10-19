// Genera vercel.json a partir de vercel.template.json: los rewrites de Vercel
// no interpolan variables de entorno, así que el destino del backend se
// sustituye aquí en build. Definir VITE_API_URL por entorno en Vercel
// (p. ej. https://backend-production-6a7f.up.railway.app).
import { readFileSync, writeFileSync } from "node:fs";

const backendUrl = (process.env.VITE_API_URL || "").trim().replace(/\/+$/, "");

if (!backendUrl) {
  if (process.env.VERCEL) {
    console.error("gen-vercel: VITE_API_URL no está definida en este entorno de Vercel.");
    process.exit(1);
  }
  console.warn("gen-vercel: VITE_API_URL no definida; se conserva el vercel.json existente.");
  process.exit(0);
}

if (!/^https:\/\/[^/\s]+$/.test(backendUrl)) {
  console.error(`gen-vercel: VITE_API_URL inválida (${backendUrl}). Usa https://host sin ruta.`);
  process.exit(1);
}

const template = readFileSync(new URL("../vercel.template.json", import.meta.url), "utf8");
writeFileSync(
  new URL("../vercel.json", import.meta.url),
  template.replaceAll("__VITE_API_URL__", backendUrl),
);
console.log(`gen-vercel: vercel.json generado con destino ${backendUrl}`);
