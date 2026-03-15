import { redirect } from "react-router-dom";
import type { MePost, MeStat } from "../../services/api/me.api";

export type MePageLoaderData = {
  posts: MePost[];
  stats: MeStat[];
};

const MOCK_POSTS: MePost[] = [
  {
    img: "https://picsum.photos/seed/cow1/400/550",
    title: "Novilla Brahman",
    weight: 250,
    price: 580,
  },
  {
    img: "https://picsum.photos/seed/cow2/400/550",
    title: "Toro Cebú",
    weight: 420,
    price: 1200,
  },
  {
    img: "https://picsum.photos/seed/cow3/400/550",
    title: "Novilla Angus",
    weight: 230,
    price: 540,
  },
];

const MOCK_STATS: MeStat[] = [
  { value: "03", label: "publicaciones" },
  { value: "90", label: "reputación" },
];

export const getMeData = (): MePageLoaderData | Response => {
  const hasSession =
    localStorage.getItem("has_session") || sessionStorage.getItem("has_session");

  if (!hasSession) return redirect("/login");

  return { posts: MOCK_POSTS, stats: MOCK_STATS };
};
