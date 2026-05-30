export const url =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
export { authApi } from "./clients/auth.api";
export { meApi } from "./clients/me.api";
export { landingApi } from "./clients/landing.api";
export { usersApi } from "./clients/users.api";
