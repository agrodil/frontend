import { useState, type FC, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuChevronLeft, LuChevronRight, LuPlay } from "react-icons/lu";

import type { MediaCarouselProps } from "@/interfaces/components/MediaCarouselProps.interface";

const isVideo = (mime: string | undefined, name?: string) =>
  mime?.startsWith("video/") || /\.(mp4|webm|mov|m4v|ogg)$/i.test(name ?? "");

const MediaCarousel: FC<MediaCarouselProps> = ({
  items,
  fallbackImg,
  alt,
  className,
}) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const preloadedRef = useRef<Set<string>>(new Set());
  const isVideoPlayingRef = useRef(false);

  const sorted = [...items].sort((a, b) => {
    if (a.is_main_file !== b.is_main_file) return a.is_main_file ? -1 : 1;
    return (a.display_order ?? 0) - (b.display_order ?? 0);
  });

  const hasItems = sorted.length > 0;
  const safeIndex = Math.min(index, Math.max(sorted.length - 1, 0));
  const current = hasItems ? sorted[safeIndex] : null;
  const fallbackIsVideo = fallbackImg
    ? isVideo(undefined, fallbackImg.split("?")[0])
    : false;

  // Precargar imágenes siguiente y anterior
  useEffect(() => {
    if (!hasItems) return;

    const nextIndex = (safeIndex + 1) % sorted.length;
    const prevIndex = (safeIndex - 1 + sorted.length) % sorted.length;

    [nextIndex, prevIndex].forEach((idx) => {
      const item = sorted[idx];

      if (!item) return;

      const isItemVideo = isVideo(item.mime_type, item.app_file_name);

      if (
        !isItemVideo &&
        item.url &&
        !preloadedRef.current.has(item.app_file_id)
      ) {
        const img = new Image();
        img.src = item.url;
        preloadedRef.current.add(item.app_file_id);
      }
    });
  }, [safeIndex, sorted, hasItems]);

  // Auto slide cada 4 segundos
  useEffect(() => {
    if (!hasItems || sorted.length <= 1) return;

    const interval = setInterval(() => {
      // No avanzar si el video está en reproducción
      if (!isVideoPlayingRef.current) {
        setDirection(1);
        setIndex((i) => (i + 1) % sorted.length);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [hasItems, sorted.length]);

  const next = () => {
    setDirection(1);
    setIndex((i) => (i + 1) % sorted.length);
  };
  const prev = () => {
    setDirection(-1);
    setIndex((i) => (i - 1 + sorted.length) % sorted.length);
  };

  const variants = {
    enter: (dir: number) => ({ x: dir * 100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -100, opacity: 0 }),
  };

  if (!hasItems) {
    return (
      <div className={`relative w-full h-full bg-gray-100 ${className ?? ""}`}>
        {fallbackImg && fallbackIsVideo ? (
          <video
            src={fallbackImg}
            controls
            playsInline
            className="absolute inset-0 w-full h-full object-contain bg-black"
          />
        ) : fallbackImg ? (
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

  const showVideo =
    current && isVideo(current.mime_type, current.app_file_name);

  return (
    <div
      className={`relative w-full h-full bg-black/5 ${className ?? ""}`}
      style={{ contain: "layout style paint" }}
    >
      <AnimatePresence mode="wait" custom={direction}>
        {current && showVideo ? (
          <motion.video
            key={current.app_file_id}
            src={current.url}
            controls
            playsInline
            autoPlay
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            onPlay={() => {
              isVideoPlayingRef.current = true;
            }}
            onPause={() => {
              isVideoPlayingRef.current = false;
            }}
            onEnded={() => {
              isVideoPlayingRef.current = false;
            }}
            className="absolute inset-0 w-full h-full object-contain bg-black"
          />
        ) : current ? (
          <motion.img
            key={current.app_file_id}
            src={current.url}
            alt={alt}
            loading="eager"
            decoding="async"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
      </AnimatePresence>

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
