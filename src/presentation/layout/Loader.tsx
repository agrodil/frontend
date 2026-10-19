import type { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LoaderProps } from "@/presentation/interfaces/layout/LoaderProps";

const Loader: FC<LoaderProps> = ({ visible, text }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        key="loader"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center gap-4"
        >
          <svg
            className="animate-spin w-12 h-12 text-primary"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
            />
          </svg>
          <span className="text-primary font-avant font-medium text-sm tracking-wide">
            {text || "Cargando..."}
          </span>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default Loader;
