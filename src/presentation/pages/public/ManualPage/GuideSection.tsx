import type { FC } from "react";
import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { LuArrowRight, LuInfo, LuLightbulb } from "react-icons/lu";

import InlineMarkdown from "@/presentation/ui/InlineMarkdown";
import type { Guide } from "@/shared/constants/guides";
import { GUIDE_ICONS } from "./guideIcons";

interface GuideSectionProps {
  guide: Guide;
  index: number;
  reduceMotion: boolean;
}

const GuideSection: FC<GuideSectionProps> = ({
  guide,
  index,
  reduceMotion,
}) => {
  const Icon = GUIDE_ICONS[guide.iconKey];
  const headingId = `${guide.id}-titulo`;
  const offset = reduceMotion ? 0 : 16;

  const stepsVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.08 } },
  };
  const stepVariants: Variants = {
    hidden: { opacity: 0, x: reduceMotion ? 0 : -12 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: reduceMotion ? 0 : 0.35, ease: "easeOut" },
    },
  };

  return (
    <motion.section
      id={guide.id}
      aria-labelledby={headingId}
      initial={{ opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
      className="scroll-mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
    >
      <header className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-white"
        >
          <Icon size={24} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Guía {index + 1}
          </p>
          <h2
            id={headingId}
            className="font-avant text-xl font-bold leading-snug text-primary sm:text-2xl"
          >
            {guide.title}
          </h2>
        </div>
      </header>

      {guide.intro && (
        <p className="mt-5 flex gap-3 rounded-xl border border-primary/20 border-l-4 border-l-primary bg-primary/5 p-4 text-gray-700">
          <LuInfo
            aria-hidden="true"
            size={20}
            className="mt-0.5 shrink-0 text-primary"
          />
          <span>{guide.intro}</span>
        </p>
      )}

      <motion.ol
        variants={stepsVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="m-0 mt-6 flex list-none flex-col gap-5 p-0"
      >
        {guide.steps.map((step, i) => (
          <motion.li
            key={step.title}
            variants={stepVariants}
            className="flex gap-4"
          >
            <motion.span
              aria-hidden="true"
              variants={{
                hidden: { scale: reduceMotion ? 1 : 0.6 },
                visible: { scale: 1, transition: { type: "spring" } },
              }}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary"
            >
              {i + 1}
            </motion.span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold leading-snug text-gray-900 sm:text-lg">
                <span className="sr-only">Paso {i + 1}: </span>
                {step.title}
              </h3>
              <p className="mt-1 break-words leading-relaxed text-gray-700">
                <InlineMarkdown text={step.description} />
              </p>
              {step.hint && (
                <p className="mt-3 flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                  <LuLightbulb
                    aria-hidden="true"
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                  <span>
                    <strong className="font-semibold">Consejo: </strong>
                    {step.hint}
                  </span>
                </p>
              )}
            </div>
          </motion.li>
        ))}
      </motion.ol>

      {guide.tips && guide.tips.length > 0 && (
        <ul className="m-0 mt-6 flex list-none flex-col gap-2 p-0">
          {guide.tips.map((tip) => (
            <li
              key={tip}
              className="flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"
            >
              <LuLightbulb
                aria-hidden="true"
                size={18}
                className="mt-0.5 shrink-0"
              />
              <span>
                <InlineMarkdown text={tip} />
              </span>
            </li>
          ))}
        </ul>
      )}

      <motion.div
        className="mt-8"
        whileHover={reduceMotion ? undefined : { scale: 1.02 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      >
        <Link
          to={guide.cta.to}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white no-underline transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto"
        >
          {guide.cta.label}
          <LuArrowRight aria-hidden="true" size={18} />
        </Link>
      </motion.div>
    </motion.section>
  );
};

export default GuideSection;
