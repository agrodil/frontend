import { motion, AnimatePresence } from "framer-motion";
import type { FC } from "react";
import { LuX } from "react-icons/lu";

interface ConfirmSaleModalProps {
  postTitle: string;
  quantity: number;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  loading: boolean;
}

const ConfirmSaleModal: FC<ConfirmSaleModalProps> = ({
  postTitle,
  quantity,
  onConfirm,
  onClose,
  loading,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg font-bold text-gray-900 leading-snug">
              Confirmar venta
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Cerrar"
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent shrink-0 disabled:opacity-40"
            >
              <LuX size={18} />
            </button>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            ¿Confirmas la venta de{" "}
            <span className="font-semibold text-gray-900">{postTitle}</span>?
            Se registrará una transacción por{" "}
            <span className="font-semibold text-gray-900">
              {quantity} {quantity === 1 ? "unidad" : "unidades"}
            </span>
            .
          </p>

          <p className="text-xs text-gray-400">
            Esta acción no se puede deshacer una vez confirmada.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Confirmando…" : "Sí, confirmar"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmSaleModal;
