import { useEffect, useRef, useState } from "react";
import { postApi } from "@/api/clients/posts.api";
import { getFilesByPost } from "@/presentation/router/actions/aws.actions";
import type { Message } from "@/presentation/interfaces/pages/NotificationsPageLoaderData";
import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import {
  parsePurchaseCard,
  type PurchaseCardPayload,
} from "@/shared/utils/parsePurchaseMessage";

const isVideoFile = (mime: string | undefined, name?: string) =>
  mime?.startsWith("video/") || /\.(mp4|webm|mov|m4v|ogg)$/i.test(name ?? "");

export interface SelectedPost {
  post: PostDetail;
  img: string | null;
  owner: string;
}

export interface UsePurchaseCardDataResult {
  freshCardImages: Record<string, { url: string; isVideo: boolean }>;
  freshCardPosts: Record<string, PostDetail>;
  selectedPost: SelectedPost | null;
  openPostDetail: (msg: Message, card: PurchaseCardPayload) => Promise<void>;
  showPostDetail: (post: PostDetail, img: string | null, owner: string) => void;
  closePostDetail: () => void;
}

// Mantiene fresca la data de los posts referenciados por purchase cards
// (imagen/video principal + detalle actualizado, ya que precio/título pueden
// cambiar después de que la card se envió) y el modal de detalle de post que
// se abre al hacer click en una.
export function usePurchaseCardData(
  messages: Message[],
): UsePurchaseCardDataResult {
  const [freshCardImages, setFreshCardImages] = useState<
    Record<string, { url: string; isVideo: boolean }>
  >({});
  const [freshCardPosts, setFreshCardPosts] = useState<
    Record<string, PostDetail>
  >({});
  const [selectedPost, setSelectedPost] = useState<SelectedPost | null>(null);

  const fetchedPostIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handler = (e: Event) => {
      const post = (e as CustomEvent<PostDetail>).detail;
      setFreshCardPosts((prev) => ({ ...prev, [post.post_id]: post }));
    };
    window.addEventListener("postUpdated", handler);
    return () => window.removeEventListener("postUpdated", handler);
  }, []);

  useEffect(() => {
    const uniquePostIds = [
      ...new Set(
        messages
          .filter((m) => m.post_id && parsePurchaseCard(m.message))
          .map((m) => m.post_id!),
      ),
    ];

    uniquePostIds.forEach(async (postId) => {
      if (fetchedPostIds.current.has(postId)) return;
      fetchedPostIds.current.add(postId);
      try {
        const [files, post] = await Promise.all([
          getFilesByPost(postId),
          postApi.getPostById(postId),
        ]);
        const main = files.find((f) => f.is_main_file) ?? files[0];
        if (main?.url) {
          setFreshCardImages((prev) => ({
            ...prev,
            [postId]: {
              url: main.url,
              isVideo: isVideoFile(main.mime_type, main.app_file_name),
            },
          }));
        }
        setFreshCardPosts((prev) => ({ ...prev, [postId]: post }));
      } catch {
        /* keep card data as fallback */
      }
    });
  }, [messages]);

  const showPostDetail = (post: PostDetail, img: string | null, owner: string) => {
    setSelectedPost({ post, img, owner });
  };

  const openPostDetail = async (msg: Message, card: PurchaseCardPayload) => {
    if (!msg.post_id) return;
    try {
      const post = await postApi.getPostById(msg.post_id);
      showPostDetail(
        post,
        freshCardImages[msg.post_id]?.url ?? card.img ?? null,
        card.owner,
      );
    } catch {
      /* post may be deactivated */
    }
  };

  const closePostDetail = () => setSelectedPost(null);

  return {
    freshCardImages,
    freshCardPosts,
    selectedPost,
    openPostDetail,
    showPostDetail,
    closePostDetail,
  };
}
