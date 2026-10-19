import type { ChatMessage } from "@/adapters/hooks/actions/useChatMessages";
import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import type { PurchaseCardPayload } from "@/shared/utils/parsePurchaseMessage";

export interface PurchaseCardProps {
  msg: ChatMessage;
  card: PurchaseCardPayload;
  isOwn: boolean;
  freshPost: PostDetail | undefined;
  freshMedia: { url: string; isVideo: boolean } | undefined;
  cardStatus: number | undefined;
  actionLoading: boolean;
  onCardClick: (msg: ChatMessage, card: PurchaseCardPayload) => void;
  onConfirmSale: (purchaseRequestId: string, postDetail: PostDetail) => void;
  onRejectPurchase: (purchaseRequestId: string, postDetail: PostDetail) => void;
  onCancelPurchase: (purchaseRequestId: string, postDetail: PostDetail) => void;
}
