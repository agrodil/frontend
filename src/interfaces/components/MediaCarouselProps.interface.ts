import type { PostFile } from "../api/posts/PostFile.interface";

export interface MediaCarouselProps {
  items: PostFile[];
  fallbackImg?: string | null;
  alt: string;
  className?: string;
}
