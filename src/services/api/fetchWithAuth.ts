import { url } from "..";
import { authApi } from "./auth.api";

let refreshPromise: Promise<void> | null = null;

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
    if (!refreshPromise) {
      refreshPromise = authApi.refresh().finally(() => {
        refreshPromise = null;
      });
    }

    try {
      await refreshPromise;
      response = await doFetch();
    } catch {
      // refresh failed, propagate the 401
    }
  }

  return response;
}
