import { useEffect, useRef, useState, type FC, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuChevronDown } from "react-icons/lu";

export interface ActionMenuItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "primary" | "danger";
  icon?: ReactNode;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  triggerLabel?: string;
  align?: "left" | "right";
  className?: string;
}

const ActionMenu: FC<ActionMenuProps> = ({
  items,
  triggerLabel = "Opciones",
  align = "right",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const toggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropUp(window.innerHeight - rect.bottom < 260);
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const itemColor = (variant: ActionMenuItem["variant"]): string => {
    if (variant === "danger") return "text-red-600 hover:bg-red-50";
    if (variant === "primary")
      return "text-primary font-semibold hover:bg-green-50";
    return "text-gray-600 hover:bg-gray-100";
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
        className={`cursor-pointer flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
          open
            ? "border-primary bg-green-50 text-primary"
            : "border-primary bg-white text-primary hover:bg-green-50"
        }`}
      >
        {triggerLabel}
        <LuChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="menu"
            initial={{ opacity: 0, y: dropUp ? 8 : -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropUp ? 8 : -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute z-50 min-w-[12rem] max-h-72 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl ${
              align === "right" ? "right-0" : "left-0"
            } ${dropUp ? "bottom-full mb-2" : "top-full mt-2"}`}
          >
            {items.map((item) => (
              <li key={item.label} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    item.onClick();
                  }}
                  className={`cursor-pointer flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${itemColor(
                    item.variant,
                  )}`}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  {item.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActionMenu;
