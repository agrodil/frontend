import { url } from "..";

export type MePost = {
  img: string;
  title: string;
  weight: number;
  price: number;
};

export type MeStat = {
  value: string;
  label: string;
};

const authGet = async (endpoint: string) => {
  const response = await fetch(`${url}${endpoint}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Not authenticated");
  const json = await response.json();
  return json.data;
};

export const meApi = {
  getMe: () => authGet("/auth/me"),
  getUserById: (id: string) => authGet(`/users/${id}`),
};
