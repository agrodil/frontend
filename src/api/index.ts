// El navegador siempre llama a la ruta relativa: en producción Vercel la
// reenvía al backend (rewrite) y en desarrollo lo hace el proxy de Vite. Así
// las cookies son first-party y no hay CORS. El host del backend vive solo en
// VITE_API_URL.
export const url = "/api/v1";
export { authApi } from "./clients/auth.api";
export { meApi } from "./clients/me.api";
export { landingApi } from "./clients/landing.api";
export { usersApi } from "./clients/users.api";
