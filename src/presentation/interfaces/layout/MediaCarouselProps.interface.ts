import type { PostFile } from "@/entities/PostFile.interface";

export interface MediaCarouselProps {
  items: PostFile[];
  fallbackImg?: string | null;
  alt: string;
  className?: string;
}
