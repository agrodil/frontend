import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LuChevronLeft } from "react-icons/lu";

import type { LegalDocument } from "@/shared/constants/legal";

function isHeading(block: string): boolean {
  if (block.includes("\n")) return false;
  const text = block.trim();
  if (text.length === 0 || text.length > 80) return false;
  if (/^\d+(\.\d+)*[.)]?\s+\S/.test(text)) return true;
  if (
    text === text.toUpperCase() &&
    /[A-ZÁÉÍÓÚÑ]/.test(text) &&
    !text.endsWith(".")
  )
    return true;
  return false;
}

const LegalPage: FC<LegalDocument> = ({ title, lastUpdated, content }) => {
  const navigate = useNavigate();
  const goBack = () =>
    window.history.length > 1 ? navigate(-1) : navigate("/");

  const blocks = content.trim().split(/\n\s*\n/);
  const formattedDate = new Intl.DateTimeFormat("es-VE", {
    dateStyle: "long",
  }).format(new Date(`${lastUpdated}T00:00:00`));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-5 py-8">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1 text-primary hover:text-primary-hover transition-colors bg-transparent border-0 cursor-pointer p-0 text-sm font-medium"
        >
          <LuChevronLeft size={18} />
          Volver
        </button>

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-10 mt-4"
        >
          <h1 className="font-avant font-bold text-2xl sm:text-3xl text-primary tracking-wide">
            {title}
          </h1>
          <p className="text-xs text-gray-400 mt-2 mb-8">
            Última actualización: {formattedDate}
          </p>

          <div className="flex flex-col gap-4 text-[15px] leading-relaxed">
            {blocks.map((block, i) =>
              isHeading(block) ? (
                <h2
                  key={i}
                  className="font-semibold text-lg text-primary mt-4 first:mt-0"
                >
                  {block.trim()}
                </h2>
              ) : (
                <p key={i} className="whitespace-pre-line text-gray-700">
                  {block}
                </p>
              ),
            )}
          </div>
        </motion.article>
      </div>
    </div>
  );
};

export default LegalPage;
