import { url } from ".";
import { refreshSession } from "./refreshSession";

export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const isFormData = options.body instanceof FormData;

  const doFetch = () =>
    fetch(`${url}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });

  let response = await doFetch();

  if (response.status === 401) {
    try {
      await refreshSession();
      response = await doFetch();
    } catch {
      // refresh failed, propagate the 401
    }
  }

  return response;
}
