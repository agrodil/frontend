import { useState, type FC } from "react";
import { LuChevronLeft, LuChevronRight, LuPlay } from "react-icons/lu";
import type { PostFile } from "../../services/api/aws.api";

interface MediaCarouselProps {
  items: PostFile[];
  fallbackImg?: string | null;
  alt: string;
  className?: string;
}

const isVideo = (mime: string | undefined, name?: string) =>
  mime?.startsWith("video/") ||
  /\.(mp4|webm|mov|m4v|ogg)$/i.test(name ?? "");

const MediaCarousel: FC<MediaCarouselProps> = ({
  items,
  fallbackImg,
  alt,
  className,
}) => {
  const [index, setIndex] = useState(0);

  const sorted = [...items].sort((a, b) => {
    if (a.is_main_file !== b.is_main_file) return a.is_main_file ? -1 : 1;
    return (a.display_order ?? 0) - (b.display_order ?? 0);
  });

  const hasItems = sorted.length > 0;
  const safeIndex = Math.min(index, Math.max(sorted.length - 1, 0));
  const current = hasItems ? sorted[safeIndex] : null;

  const next = () => setIndex((i) => (i + 1) % sorted.length);
  const prev = () =>
    setIndex((i) => (i - 1 + sorted.length) % sorted.length);

  if (!hasItems) {
    return (
      <div
        className={`relative w-full h-full bg-gray-100 ${className ?? ""}`}
      >
        {fallbackImg ? (
          <img
            src={fallbackImg}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-primary/10" />
        )}
      </div>
    );
  }

  const showVideo = current && isVideo(current.mime_type, current.app_file_name);

  return (
    <div
      className={`relative w-full h-full bg-black/5 ${className ?? ""}`}
    >
      {current && showVideo ? (
        <video
          key={current.app_file_id}
          src={current.url}
          controls
          playsInline
          className="absolute inset-0 w-full h-full object-contain bg-black"
        />
      ) : current ? (
        <img
          key={current.app_file_id}
          src={current.url}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : null}

      {sorted.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white shadow flex items-center justify-center cursor-pointer border-0 z-10"
          >
            <LuChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Siguiente"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white shadow flex items-center justify-center cursor-pointer border-0 z-10"
          >
            <LuChevronRight size={20} />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {sorted.map((item, i) => (
              <button
                key={item.app_file_id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                aria-label={`Ir al elemento ${i + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer border-0 ${
                  i === safeIndex
                    ? "bg-white w-6"
                    : "bg-white/60 hover:bg-white/80 w-1.5"
                }`}
              />
            ))}
          </div>

          <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/55 text-white text-[11px] font-semibold z-10">
            {safeIndex + 1} / {sorted.length}
          </div>
        </>
      )}

      {showVideo && (
        <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/55 text-white text-[11px] font-semibold flex items-center gap-1 z-10 pointer-events-none">
          <LuPlay size={11} />
          Video
        </div>
      )}
    </div>
  );
};

export default MediaCarousel;
