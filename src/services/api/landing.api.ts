import { url } from "..";

export const landingApi = {
  getLandingPage: async () => {
    const response = await fetch(`${url}/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.json();
  },
};
