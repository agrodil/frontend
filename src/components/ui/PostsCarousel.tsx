import { useState, type FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import CardPost from "./CardPost";
import type { CardPostProps } from "../../interfaces/components/CardPostProps";

interface PostsCarouselProps {
  posts: CardPostProps[];
  visibleCount?: number;
}

const PostsCarousel: FC<PostsCarouselProps> = ({ posts, visibleCount = 3 }) => {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);

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

  const variants = {
    enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -60, opacity: 0 }),
  };

  return (
    <div className="relative">
      {/* Cards */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${visibleCount}, minmax(0, 1fr))`,
          }}
        >
          {currentPosts.map((post, i) => (
            <CardPost key={i} {...post} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => go(-1)}
          disabled={!canPrev}
          aria-label="Anterior"
          className="p-2 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-primary hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <LuChevronLeft size={20} />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
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

        <button
          onClick={() => go(1)}
          disabled={!canNext}
          aria-label="Siguiente"
          className="p-2 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-primary hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <LuChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default PostsCarousel;
