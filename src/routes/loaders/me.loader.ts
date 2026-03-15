import { redirect } from "react-router-dom";
import { meApi } from "../../services";
import type { User } from "../../interfaces/auth/AuthProps";
import type { MePost, MeStat } from "../../services/api/me.api";

export type MePageLoaderData = {
  user: User;
  posts: MePost[];
  stats: MeStat[];
};

function mapUser(raw: Record<string, unknown>): User {
  return {
    id: raw.app_user_id as string,
    email: raw.email as string,
    role: raw.role_id as number,
    firstName: (raw.first_name as string) ?? undefined,
    middleName: (raw.middle_name as string) ?? undefined,
    lastName: (raw.surname as string) ?? undefined,
    secondLastName: (raw.second_surname as string) ?? undefined,
    documentType: (raw.document_type as string) ?? undefined,
    documentNumber:
      raw.document_number != null ? String(raw.document_number) : undefined,
    municipality: raw.township_id != null ? String(raw.township_id) : undefined,
    phone: (raw.phone as string) ?? undefined,
  };
}

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

export const getMeData = async (): Promise<MePageLoaderData | Response> => {
  try {
    const raw = await meApi.getMe();
    const user = mapUser(raw);

    return { user, posts: MOCK_POSTS, stats: MOCK_STATS };
  } catch {
    return redirect("/login");
  }
};
