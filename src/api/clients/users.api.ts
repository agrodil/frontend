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
  checkEmail: async (
    email: string,
  ): Promise<{ email: string; exists: boolean }> => {
    const response = await fetch(
      `${url}/users/check/email/${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!response.ok) throw new Error("Error checking email");
    const json: ApiResponse<{ email: string; exists: boolean }> =
      await response.json();
    return json.data;
  },
  checkPhone: async (
    phone: string,
  ): Promise<{ phone: string; exists: boolean }> => {
    const response = await fetch(
      `${url}/users/check/phone/${encodeURIComponent(phone)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!response.ok) throw new Error("Error checking phone");
    const json: ApiResponse<{ phone: string; exists: boolean }> =
      await response.json();
    return json.data;
  },
  checkDocument: async (
    document: string,
  ): Promise<{ document: string; exists: boolean }> => {
    const response = await fetch(
      `${url}/users/check/document/${encodeURIComponent(document)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!response.ok) throw new Error("Error checking document");
    const json: ApiResponse<{ document: string; exists: boolean }> =
      await response.json();
    return json.data;
  },
  update: async (
    data: Record<string, string | File | File[] | boolean>,
  ): Promise<ApiResponse<unknown>> => {
    const response = await fetchWithAuth("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error updating user profile");
    return await response.json();
  },
};
