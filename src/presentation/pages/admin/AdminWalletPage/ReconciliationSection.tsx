import { useState, type FC, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuChevronDown } from "react-icons/lu";

type Tone = "applied" | "review" | "orphan" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  applied: "bg-green-50 text-green-800 border-green-200",
  review: "bg-amber-50 text-amber-800 border-amber-200",
  orphan: "bg-red-50 text-red-800 border-red-200",
  neutral: "bg-gray-50 text-gray-700 border-gray-200",
};

type ReconciliationSectionProps = {
  title: string;
  count: number;
  tone?: Tone;
  defaultOpen?: boolean;
  children: ReactNode;
};

// Bloque colapsable del reporte de conciliación. Vacío → no renderiza nada.
const ReconciliationSection: FC<ReconciliationSectionProps> = ({
  title,
  count,
  tone = "neutral",
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  if (count === 0) return null;

  return (
    <div className={`rounded-xl border ${TONE_CLASS[tone]}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold cursor-pointer"
      >
        <span>
          {title} ({count})
        </span>
        <LuChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 overflow-x-auto">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReconciliationSection;
