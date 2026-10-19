import { useEffect, useRef, useState, type FC } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LuCheck, LuChevronDown } from "react-icons/lu";

import type { SelectOption } from "@/presentation/interfaces/ui/FormProps";

interface PillsFieldProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  optional?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const GAP = 8; // separación disparador ↔ panel
const MAX_PANEL_H = 256;

const PillsField: FC<PillsFieldProps> = ({
  options,
  value,
  onChange,
  label,
  optional,
  placeholder = "Selecciona una opción",
  disabled,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  // Rect del disparador en coords de viewport. El panel se pinta en un portal a
  // <body> con position:fixed para que NINGÚN ancestro con overflow lo recorte.
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => String(o.value) === value);

  const measure = () => {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
  };

  const toggle = () => {
    if (!open) measure();
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    // El panel es fixed: si el usuario hace scroll o cambia el tamaño, hay que
    // re-medir para que siga pegado al disparador.
    const reposition = () => measure();

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  const spaceBelow = rect ? window.innerHeight - rect.bottom : 0;
  const spaceAbove = rect ? rect.top : 0;
  const dropUp =
    !!rect && spaceBelow < MAX_PANEL_H + GAP && spaceAbove > spaceBelow;
  const panelMaxH = Math.min(
    MAX_PANEL_H,
    Math.max(120, (dropUp ? spaceAbove : spaceBelow) - GAP - 8),
  );

  return (
    <div
      ref={rootRef}
      className={`relative flex flex-col gap-1.5 ${className}`}
    >
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {optional && (
            <span className="italic text-gray-500 font-thin">
              {" "}
              {"(opcional)"}
            </span>
          )}
        </label>
      )}

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        className={`cursor-pointer flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 text-left text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          open
            ? "border-primary bg-primary/5"
            : "border-gray-200 bg-gray-100 hover:border-primary/40"
        }`}
      >
        <span className="flex min-w-0 flex-col">
          <span
            className={`truncate font-semibold ${
              selected ? "text-gray-800" : "text-gray-400"
            }`}
          >
            {selected ? selected.label : placeholder}
          </span>
          {selected?.sublabel && (
            <span className="truncate text-xs text-gray-500">
              {selected.sublabel}
            </span>
          )}
        </span>
        <LuChevronDown
          size={18}
          className={`shrink-0 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && rect && (
            <motion.ul
              ref={panelRef}
              role="listbox"
              initial={{ opacity: 0, y: dropUp ? 8 : -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: dropUp ? 8 : -8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                position: "fixed",
                left: rect.left,
                width: rect.width,
                maxHeight: panelMaxH,
                ...(dropUp
                  ? { bottom: window.innerHeight - rect.top + GAP }
                  : { top: rect.bottom + GAP }),
              }}
              className="z-[100] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl"
            >
              {options.map((opt) => {
                const active = String(opt.value) === value;
                return (
                  <li key={opt.value} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(String(opt.value));
                        setOpen(false);
                      }}
                      className={`cursor-pointer flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-semibold">
                          {opt.label}
                        </span>
                        {opt.sublabel && (
                          <span
                            className={`truncate text-xs ${
                              active ? "text-primary/80" : "text-gray-500"
                            }`}
                          >
                            {opt.sublabel}
                          </span>
                        )}
                      </span>
                      {active && <LuCheck size={16} className="shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};

export default PillsField;
