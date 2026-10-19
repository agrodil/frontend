import { type FC, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LuChevronLeft, LuChevronDown, LuInfo } from "react-icons/lu";

import InlineMarkdown from "@/presentation/ui/InlineMarkdown";
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

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const scrollToId = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

const BULLET = /^[-*]\s+/;
const ORDERED = /^\d+\.\s+/;

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderBlock(block: string, key: number): ReactNode {
  const lines = block.split("\n").map((l) => l.trimEnd());
  const first = lines[0].trim();

  const hashes = /^(#{1,3})\s+(.*)$/.exec(first);
  if (hashes && lines.length === 1) {
    const text = hashes[2];
    return (
      <h2
        key={key}
        id={slugify(text)}
        className={`scroll-mt-6 text-primary mt-4 first:mt-0 ${
          hashes[1].length === 1 ? "font-bold text-xl" : "font-semibold text-lg"
        }`}
      >
        {text}
      </h2>
    );
  }

  if (lines.every((l) => l.trim().startsWith(">"))) {
    const text = lines.map((l) => l.trim().replace(/^>\s?/, "")).join(" ");
    return (
      <aside
        key={key}
        className="flex gap-3 rounded-xl border border-primary/20 border-l-4 border-l-primary bg-primary/5 p-4 text-gray-700"
      >
        <LuInfo size={18} className="text-primary shrink-0 mt-0.5" />
        <p>
          <InlineMarkdown text={text} />
        </p>
      </aside>
    );
  }

  if (lines.every((l) => BULLET.test(l.trim()))) {
    return (
      <ul
        key={key}
        className="list-disc pl-6 flex flex-col gap-2 text-gray-700"
      >
        {lines.map((l, i) => (
          <li key={i}>
            <InlineMarkdown text={l.trim().replace(BULLET, "")} />
          </li>
        ))}
      </ul>
    );
  }

  if (lines.every((l) => ORDERED.test(l.trim()))) {
    return (
      <ol
        key={key}
        className="list-decimal pl-6 flex flex-col gap-2 text-gray-700"
      >
        {lines.map((l, i) => (
          <li key={i}>
            <InlineMarkdown text={l.trim().replace(ORDERED, "")} />
          </li>
        ))}
      </ol>
    );
  }

  if (lines.length >= 2 && lines.every((l) => l.trim().startsWith("|"))) {
    const rows = lines.filter((l) => !/^\|[\s:|-]+\|?$/.test(l.trim()));
    const [head, ...body] = rows.map(splitRow);
    return (
      <div
        key={key}
        className="overflow-x-auto rounded-xl border border-gray-200"
      >
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50 text-primary">
            <tr>
              {head.map((cell, i) => (
                <th key={i} className="px-4 py-3 font-semibold align-top">
                  <InlineMarkdown text={cell} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {body.map((row, r) => (
              <tr key={r} className="border-t border-gray-200">
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className={`px-4 py-3 align-top ${c === 0 ? "font-medium text-gray-900 sm:w-1/3" : ""}`}
                  >
                    <InlineMarkdown text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (isHeading(block)) {
    return (
      <h2
        key={key}
        className="font-semibold text-lg text-primary mt-4 first:mt-0"
      >
        {block.trim()}
      </h2>
    );
  }

  return (
    <p key={key} className="whitespace-pre-line text-gray-700">
      <InlineMarkdown text={block} />
    </p>
  );
}

const TableOfContents: FC<{ items: { id: string; text: string }[] }> = ({
  items,
}) => (
  <details className="group mb-8 rounded-xl border border-gray-200 bg-gray-50/60">
    <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-primary [&::-webkit-details-marker]:hidden">
      Índice ({items.length} secciones)
      <LuChevronDown
        size={18}
        className="transition-transform group-open:rotate-180"
      />
    </summary>
    <ol className="flex flex-col gap-1 px-4 pb-4 text-sm">
      {items.map(({ id, text }) => (
        <li key={id}>
          <a
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToId(id);
            }}
            className="text-gray-600 hover:text-primary transition-colors"
          >
            {text}
          </a>
        </li>
      ))}
    </ol>
  </details>
);

const LegalPage: FC<LegalDocument> = ({ title, lastUpdated, content }) => {
  const navigate = useNavigate();
  const goBack = () =>
    window.history.length > 1 ? navigate(-1) : navigate("/");

  const blocks = content.trim().split(/\n\s*\n/);
  const tocItems = blocks.flatMap((b) => {
    const m = /^##\s+(.*)$/.exec(b.trim());
    return m && !b.includes("\n") ? [{ id: slugify(m[1]), text: m[1] }] : [];
  });
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

          {tocItems.length >= 4 && <TableOfContents items={tocItems} />}

          <div className="flex flex-col gap-4 text-[15px] leading-relaxed">
            {blocks.map(renderBlock)}
          </div>
        </motion.article>
      </div>
    </div>
  );
};

export default LegalPage;
