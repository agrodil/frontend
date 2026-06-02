import { motion, AnimatePresence } from "framer-motion";
import type { FC } from "react";
import { LuCheck } from "react-icons/lu";

interface PostSaleActionsModalProps {
  postTitle: string;
  onDeactivate: () => Promise<void>;
  onEdit: () => void;
  onSkip: () => void;
  loading: boolean;
}

const PostSaleActionsModal: FC<PostSaleActionsModalProps> = ({
  postTitle,
  onDeactivate,
  onEdit,
  onSkip,
  loading,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && !loading && onSkip()}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <LuCheck size={26} className="text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">¡Venta registrada!</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              ¿Qué deseas hacer con la publicación{" "}
              <span className="font-semibold text-gray-700">{postTitle}</span>?
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onDeactivate}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Desactivando…" : "Desactivar publicación"}
            </button>
            <button
              type="button"
              onClick={onEdit}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              Editar publicación
            </button>
            <button
              type="button"
              onClick={onSkip}
              disabled={loading}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Dejar como está
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PostSaleActionsModal;
