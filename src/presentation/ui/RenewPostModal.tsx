import { useState, type FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuX } from "react-icons/lu";
import type { SelectOption } from "@/presentation/interfaces/ui/FormProps";
import { formatUsd } from "@/shared/utils/formatMoney";

interface RenewPostModalProps {
  postTitle: string;
  plans: SelectOption[];
  planPrices: Record<string, number>;
  onConfirm: (postingFeeId: string) => Promise<void>;
  onClose: () => void;
  loading: boolean;
  error: string | null;
}

// Confirmación de renovación de un post vencido: elegir plan + aviso de
// cobro antes de disparar el debito. Calcada de ConfirmSaleModal.tsx.
const RenewPostModal: FC<RenewPostModalProps> = ({
  postTitle,
  plans,
  planPrices,
  onConfirm,
  onClose,
  loading,
  error,
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  const price = selected != null ? planPrices[selected] : undefined;

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
              Renovar publicación
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
            <span className="font-semibold text-gray-900">{postTitle}</span>{" "}
            está vencida. Elige un plan para renovarla — se cobrará a tu
            cartera.
          </p>

          <div className="flex flex-col gap-2">
            {plans.map((plan) => (
              <label
                key={plan.value}
                className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-colors ${
                  selected === plan.value
                    ? "border-amber-400 bg-amber-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="postingFeeId"
                    checked={selected === plan.value}
                    onChange={() => setSelected(String(plan.value))}
                    disabled={loading}
                    className="cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-gray-900">
                    {plan.label}
                  </span>
                </div>
                {plan.sublabel && (
                  <span className="text-xs text-gray-500">
                    {plan.sublabel}
                  </span>
                )}
              </label>
            ))}
          </div>

          {price !== undefined && (
            <p className="text-sm text-gray-600 leading-relaxed">
              Precio del plan:{" "}
              <span className="font-semibold text-gray-900">
                {formatUsd(price)}
              </span>
              . Se cobrará a tu cartera — si es tu primera renovación con esta
              misma duración, el descuento se aplica automáticamente al
              confirmar.
            </p>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

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
              onClick={() => selected && onConfirm(selected)}
              disabled={loading || !selected}
              className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Renovando…" : "Confirmar y pagar"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RenewPostModal;
