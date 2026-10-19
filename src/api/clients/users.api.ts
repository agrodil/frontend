import { url } from "..";
import { fetchWithAuth } from "../fetchWithAuth";

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export const usersApi = {
  // AUT-07: POST con el email en el body (no en la URL) para que no quede en
  // logs de acceso/proxy. Solo se valida el email en vivo; teléfono y
  // documento se validan al enviar el registro.
  checkEmail: async (email: string): Promise<{ exists: boolean }> => {
    const response = await fetch(`${url}/auth/check-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error("Error checking email");
    const json: ApiResponse<{ exists: boolean }> = await response.json();
    return json.data;
  },
  update: async (
    data: Record<string, string | File | File[] | boolean>,
  ): Promise<ApiResponse<unknown>> => {
    const response = await fetchWithAuth("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message ?? "Error al actualizar el perfil");
    }
    return await response.json();
  },
};
