import { useState, useEffect, useRef, type FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import CardPost from "./CardPost";
import type { CardPostProps } from "../../interfaces/components/CardPostProps";

interface PostsCarouselProps {
  posts: CardPostProps[];
  visibleCount?: number;
  onCardClick?: (postId: string) => void;
}

const PostsCarousel: FC<PostsCarouselProps> = ({
  posts,
  visibleCount = 3,
  onCardClick,
}) => {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    const bar = progressBarRef.current;
    if (!el || !bar) return;
    const max = el.scrollWidth - el.clientWidth;
    const progress = max > 0 ? el.scrollLeft / max : 0;
    bar.style.width = `${progress * 100}%`;
  };

  const totalPages = Math.ceil(posts.length / visibleCount);
  const currentPosts = posts.slice(
    page * visibleCount,
    page * visibleCount + visibleCount,
  );

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  const go = (dir: 1 | -1) => {
    setDirection(dir);
    setPage((p) => p + dir);
  };

  useEffect(() => {
    if (totalPages <= 1) return;
    const id = setInterval(() => {
      setDirection(1);
      setPage((p) => (p + 1) % totalPages);
    }, 5000);
    return () => clearInterval(id);
  }, [page, totalPages]);

  const variants = {
    enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -60, opacity: 0 }),
  };

  return (
    <div className="relative">
      {/* Mobile: horizontal scroll */}
      <div className="lg:hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-3 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {posts.map((post, i) => (
            <div
              key={i}
              className="snap-start shrink-0 w-[30vw] sm:w-[28vw] md:w-[26vw] py-4"
            >
              <CardPost
                {...post}
                onClick={() => post.id && onCardClick?.(post.id)}
              />
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200 rounded-full mx-4 mt-1">
          <div
            ref={progressBarRef}
            className="h-1 w-0 bg-primary rounded-full transition-all duration-150"
          />
        </div>
      </div>

      {/* Desktop: paginated with buttons */}
      <div className="hidden lg:block">
        <div className="relative flex items-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={!canPrev}
            aria-label="Anterior"
            className="shrink-0 p-4 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-primary hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <LuChevronLeft size={24} />
          </button>

          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={page}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="flex justify-between gap-8 p-8"
              >
                {currentPosts.map((post, i) => (
                  <CardPost
                    key={i}
                    {...post}
                    onClick={() => post.id && onCardClick?.(post.id)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            disabled={!canNext}
            aria-label="Siguiente"
            className="shrink-0 p-4 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-primary hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <LuChevronRight size={24} />
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              type="button"
              key={i}
              onClick={() => {
                setDirection(i > page ? 1 : -1);
                setPage(i);
              }}
              aria-label={`Página ${i + 1}`}
              className={`rounded-full transition-all duration-300 cursor-pointer border-0 ${
                i === page
                  ? "w-5 h-2 bg-primary"
                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostsCarousel;
