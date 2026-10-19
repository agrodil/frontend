import { useId, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { LuChevronDown, LuChevronLeft, LuMail } from "react-icons/lu";

import InlineMarkdown from "@/presentation/ui/InlineMarkdown";
import { faqDocument, type FaqItem } from "@/shared/constants/faqs";

interface FaqEntryProps extends FaqItem {
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  variants: Variants;
  reduceMotion: boolean;
}

const FaqEntry: FC<FaqEntryProps> = ({
  index,
  question,
  answer,
  isOpen,
  onToggle,
  variants,
  reduceMotion,
}) => {
  const panelId = useId();

  return (
    <motion.li
      variants={variants}
      className={`rounded-2xl border bg-white transition-colors duration-200 ${
        isOpen
          ? "border-primary/40 shadow-sm"
          : "border-gray-200 hover:border-primary/30"
      }`}
    >
      <h2>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full cursor-pointer items-start gap-3 rounded-2xl border-0 bg-transparent p-4 text-left sm:items-center sm:gap-4 sm:p-5"
        >
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-200 ${
              isOpen ? "bg-primary text-white" : "bg-primary/10 text-primary"
            }`}
          >
            {index + 1}
          </span>
          <span className="flex-1 text-[15px] font-semibold leading-snug text-gray-900 sm:text-base">
            {question}
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            className="mt-1 shrink-0 text-primary sm:mt-0"
          >
            <LuChevronDown size={20} />
          </motion.span>
        </button>
      </h2>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="break-words px-4 pb-5 pl-4 text-[15px] leading-relaxed text-gray-700 sm:pl-[68px] sm:pr-5">
              <InlineMarkdown text={answer} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
};

const FaqPage: FC = () => {
  const navigate = useNavigate();
  const goBack = () =>
    window.history.length > 1 ? navigate(-1) : navigate("/");

  const reduceMotion = useReducedMotion() ?? false;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const { title, subtitle, items, contactEmail } = faqDocument;

  const listVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.06 },
    },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.35, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
        >
          <LuChevronLeft size={18} />
          Volver
        </button>

        <motion.header
          initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
          className="mb-8 mt-6"
        >
          <h1 className="font-avant text-2xl font-bold tracking-wide text-primary sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">{subtitle}</p>
        </motion.header>

        <motion.ul
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="m-0 flex list-none flex-col gap-3 p-0"
        >
          {items.map((item, i) => (
            <FaqEntry
              key={item.question}
              index={i}
              {...item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              variants={itemVariants}
              reduceMotion={reduceMotion}
            />
          ))}
        </motion.ul>

        <motion.aside
          initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
          className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div>
            <p className="font-semibold text-gray-900">
              ¿No encontraste tu respuesta?
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Escríbenos y te ayudamos con tu consulta.
            </p>
          </div>
          <a
            href={`mailto:${contactEmail}`}
            className="inline-flex max-w-full items-center gap-2 break-all rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-primary-hover"
          >
            <LuMail size={16} className="shrink-0" />
            {contactEmail}
          </a>
        </motion.aside>
      </div>
    </div>
  );
};

export default FaqPage;
