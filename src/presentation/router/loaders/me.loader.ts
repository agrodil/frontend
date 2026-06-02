import {
  meApi,
  type MePost,
  type MyPostsPagination,
  type MeStat,
} from "@/api/clients/me.api";

export const INITIAL_POSTS_LIMIT = 4;

export type MePageLoaderData = {
  posts: MePost[];
  pagination: MyPostsPagination;
  stats: MeStat[];
};

const MOCK_STATS: MeStat[] = [
  { value: "0", label: "publicaciones" },
  { value: "90", label: "reputación" },
];

export const getMeData = async (): Promise<MePageLoaderData> => {
  try {
    const { items, pagination } = await meApi.getMyPosts(
      INITIAL_POSTS_LIMIT,
      0,
    );

    const stats: MeStat[] = [
      {
        value: String(pagination.total).padStart(2, "0"),
        label: "publicaciones",
      },
      { value: "90", label: "reputación" },
    ];

    return { posts: items, pagination, stats };
  } catch {
    return {
      posts: [],
      pagination: {
        total: 0,
        limit: INITIAL_POSTS_LIMIT,
        offset: 0,
        hasMore: false,
      },
      stats: MOCK_STATS,
    };
  }
};
