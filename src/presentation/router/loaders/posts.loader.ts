import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import type { PostsPost } from "@/api/interfaces/requests/PostsPost.interface";
import type { PostsSearchResult } from "@/api/interfaces/responses/PostsSearchResult.interface";
import { postApi, type PostsPagination } from "@/api/clients/posts.api";
import type { LoaderFunctionArgs } from "react-router-dom";

export const POSTS_LIMIT = 20;

export type PostsPageLoaderData = {
  items: PostsPost[] | PostsSearchResult[];
  pagination: PostsPagination;
  query: string;
  postDetail: PostDetail | null;
  postId: string | null;
};

export const getPostsData = async ({
  request,
}: LoaderFunctionArgs): Promise<PostsPageLoaderData> => {
  const urlObj = new URL(request.url);
  const q = urlObj.searchParams.get("q") ?? "";
  const postId = urlObj.searchParams.get("postId") ?? null;

  try {
    const [listResult, postDetail] = await Promise.all([
      q
        ? postApi.searchPosts(q, POSTS_LIMIT, 0)
        : postApi.getAllPosts(POSTS_LIMIT, 0),
      postId ? postApi.getPostById(postId).catch(() => null) : null,
    ]);

    return {
      items: listResult.items,
      pagination: listResult.pagination,
      query: q,
      postDetail,
      postId,
    };
  } catch {
    return {
      items: [],
      pagination: { total: 0, limit: POSTS_LIMIT, offset: 0, hasMore: false },
      query: q,
      postDetail: null,
      postId,
    };
  }
};
