import type { FC } from "react";
import { motion, type Variants } from "framer-motion";
import { LuChevronRight } from "react-icons/lu";

import type { Guide } from "@/shared/constants/guides";
import { GUIDE_ICONS } from "./guideIcons";

interface GuideCardProps {
  guide: Guide;
  index: number;
  variants: Variants;
  reduceMotion: boolean;
  onSelect: (id: string) => void;
}

const GuideCard: FC<GuideCardProps> = ({
  guide,
  index,
  variants,
  reduceMotion,
  onSelect,
}) => {
  const Icon = GUIDE_ICONS[guide.iconKey];

  return (
    <motion.li variants={variants}>
      <motion.a
        href={`#${guide.id}`}
        onClick={(e) => {
          e.preventDefault();
          onSelect(guide.id);
        }}
        whileHover={reduceMotion ? undefined : { y: -3 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        className="flex min-h-20 items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 no-underline shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-5"
      >
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <Icon size={24} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase tracking-wide text-primary">
            Guía {index + 1}
          </span>
          <span className="block text-base font-bold leading-snug sm:text-lg">
            {guide.title}
          </span>
          <span className="block text-sm text-gray-600">{guide.summary}</span>
        </span>
        <LuChevronRight
          aria-hidden="true"
          size={22}
          className="shrink-0 text-primary"
        />
      </motion.a>
    </motion.li>
  );
};

export default GuideCard;
