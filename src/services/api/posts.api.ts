import { fetchWithAuth } from "./fetchWithAuth";

export const postApi = {
  uploadPost: async (data: FormData) => {
    const response = await fetchWithAuth("/posts/", {
      method: "POST",
      body: data,
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(JSON.stringify(json.message ?? json));
    }
    return json.data;
  },
};
