import type { PostDetail } from "@/interfaces/api/posts/PostDetail.interface";

export interface PostDetailModalProps {
  post: PostDetail;
  previewImg: string | null;
  previewOwner: string;
  onClose: () => void;
  onUpdated?: (post: PostDetail) => void;
  onDeactivated?: (postId: string) => void;
}
