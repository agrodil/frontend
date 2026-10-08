import { useEffect, useState, type FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { LuChevronLeft } from "react-icons/lu";

import { guides, manualSubtitle, manualTitle } from "@/shared/constants/guides";
import GuideCard from "./GuideCard";
import GuideSection from "./GuideSection";

// Escala del tamaño de letra. Se aplica al <html> para que todo el texto
// (que usa rem) crezca junto, y se restaura al salir de la página.
const TEXT_SIZES = [
  { label: "A", name: "Letra normal", percent: 100 },
  { label: "A+", name: "Letra grande", percent: 115 },
  { label: "A++", name: "Letra muy grande", percent: 130 },
] as const;

const STORAGE_KEY = "agrodil.manual.textSize";

const readStoredSize = (): number => {
  try {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    return stored >= 0 && stored < TEXT_SIZES.length ? stored : 0;
  } catch {
    return 0;
  }
};

const ManualPage: FC = () => {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const goBack = () =>
    window.history.length > 1 ? navigate(-1) : navigate("/");

  const reduceMotion = useReducedMotion() ?? false;
  const [sizeIndex, setSizeIndex] = useState<number>(readStoredSize);

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.fontSize;
    root.style.fontSize = `${TEXT_SIZES[sizeIndex].percent}%`;
    return () => {
      root.style.fontSize = previous;
    };
  }, [sizeIndex]);

  const changeSize = (index: number) => {
    setSizeIndex(index);
    try {
      localStorage.setItem(STORAGE_KEY, String(index));
    } catch {
      // Sin almacenamiento: la preferencia dura solo esta visita.
    }
  };

  const scrollToGuide = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
    });
    window.history.replaceState(null, "", `#${id}`);
  };

  // Entrada directa por /manual#ancla (p. ej. desde un enlace externo).
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const timer = window.setTimeout(
      () => document.getElementById(id)?.scrollIntoView(),
      100,
    );
    return () => window.clearTimeout(timer);
  }, [hash]);

  const listVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.08 } },
  };
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.35, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-sm font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <LuChevronLeft aria-hidden="true" size={18} />
            Volver
          </button>

          <div role="group" aria-label="Tamaño de letra" className="flex gap-2">
            {TEXT_SIZES.map((size, i) => (
              <button
                key={size.label}
                type="button"
                onClick={() => changeSize(i)}
                aria-label={size.name}
                aria-pressed={sizeIndex === i}
                className={`min-h-11 min-w-11 cursor-pointer rounded-lg border px-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  sizeIndex === i
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 bg-white text-primary hover:border-primary/50"
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        <motion.header
          initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
          className="mb-8 mt-6"
        >
          <h1 className="font-avant text-2xl font-bold tracking-wide text-primary sm:text-4xl">
            {manualTitle}
          </h1>
          <p className="mt-2 text-gray-600 sm:text-lg">{manualSubtitle}</p>
        </motion.header>

        <nav aria-label="Guías disponibles" className="mb-10">
          <h2 className="mb-3 text-lg font-bold text-gray-900">
            ¿Qué quieres hacer?
          </h2>
          <motion.ul
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="m-0 flex list-none flex-col gap-3 p-0"
          >
            {guides.map((guide, i) => (
              <GuideCard
                key={guide.id}
                guide={guide}
                index={i}
                variants={cardVariants}
                reduceMotion={reduceMotion}
                onSelect={scrollToGuide}
              />
            ))}
          </motion.ul>
        </nav>

        <div className="flex flex-col gap-8">
          {guides.map((guide, i) => (
            <GuideSection
              key={guide.id}
              guide={guide}
              index={i}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default ManualPage;
