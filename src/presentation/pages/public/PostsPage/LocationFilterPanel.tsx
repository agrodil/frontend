import { useState, type FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuChevronDown } from "react-icons/lu";
import LocationSelects from "@/presentation/ui/LocationSelects";
import type { LocationFilterPanelProps } from "./LocationFilterPanelProps";

const LocationFilterPanel: FC<LocationFilterPanelProps> = ({
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-transparent border-0 cursor-pointer text-left"
      >
        <span className="text-xs font-bold text-primary uppercase tracking-wide">
          Filtrar por ubicación
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-primary shrink-0"
        >
          <LuChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <LocationSelects
                value={value}
                onChange={onChange}
                stateLabel="Estado"
                townshipLabel="Municipio"
                emptyOptionLabel="Todos"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationFilterPanel;
