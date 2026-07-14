import type { FC } from "react";
import { motion } from "framer-motion";
import { LuLoader } from "react-icons/lu";

type ConfirmModalProps = {
  count: number;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal: FC<ConfirmModalProps> = ({
  count,
  loading,
  onConfirm,
  onCancel,
}) => (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
    >
      <h3 className="font-bold text-gray-900 text-lg mb-2">
        Eliminar mensajes
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        ¿Eliminar <span className="font-semibold text-red-600">{count}</span>{" "}
        mensaje{count !== 1 ? "s" : ""}? Esta acción no se puede deshacer.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold
                     text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white
                     hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <LuLoader size={14} className="animate-spin" />}
          Eliminar
        </button>
      </div>
    </motion.div>
  </div>
);

export default ConfirmModal;
