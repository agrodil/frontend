import type { UseMyPostsResult } from "@/adapters/hooks/actions/useMyPosts";
import type { UseDeactivatedPostsResult } from "@/adapters/hooks/actions/useDeactivatedPosts";

export interface PostsTabProps {
  myPosts: UseMyPostsResult;
  deactivatedPosts: UseDeactivatedPostsResult;
  displayName: string;
  onCardClick: (postId: string) => void;
  onActivate: (postId: string) => void;
  onRenew: (
    postId: string,
    postingFeeId: string,
    expectedCostUsd: number,
  ) => Promise<void>;
}
