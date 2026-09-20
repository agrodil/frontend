import type { ChatMessage } from "@/adapters/hooks/actions/useChatMessages";
import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import type { PurchaseCardPayload } from "@/shared/utils/parsePurchaseMessage";

export interface ChatMessageBubbleProps {
  msg: ChatMessage;
  isOwn: boolean;
  freshCardImages: Record<string, { url: string; isVideo: boolean }>;
  freshCardPosts: Record<string, PostDetail>;
  purchaseStatusMap: Record<string, number>;
  actionLoading: boolean;
  onCardClick: (msg: ChatMessage, card: PurchaseCardPayload) => void;
  onConfirmSale: (purchaseRequestId: string, postDetail: PostDetail) => void;
  onRejectPurchase: (purchaseRequestId: string, postDetail: PostDetail) => void;
  onCancelPurchase: (purchaseRequestId: string, postDetail: PostDetail) => void;
}
