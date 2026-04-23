export const url =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
export { authApi } from "./api/auth.api";
export { meApi } from "./api/me.api";
export { landingApi } from "./api/landing.api";
