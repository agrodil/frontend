import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LuX, LuMessageCircle } from "react-icons/lu";
import { useAuth } from "@/adapters/hooks/common/useAuth";
import type { PurchaseRequest } from "@/api/interfaces/responses/PurchaseRequest.interface";
import { sales } from "@/shared/constants/sale-types.catalog";
import { purchaseStatuses } from "@/shared/constants/purchase-status.catalog";

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("es-VE", { dateStyle: "medium" }) : "—";

const Field: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
      {label}
    </span>
    <span className="text-sm font-medium text-gray-800">{value}</span>
  </div>
);

interface TransactionDetailModalProps {
  transaction: PurchaseRequest;
  onClose: () => void;
}

const TransactionDetailModal: FC<TransactionDetailModalProps> = ({
  transaction: t,
  onClose,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const status = purchaseStatuses[t.purchase_status_id];
  const statusColors: Record<string, string> = {
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-500",
  };

  const price =
    t.price_per_kg != null
      ? `US $${Number(t.price_per_kg).toFixed(2)} / kg`
      : t.price_per_unit != null
        ? `US $${Number(t.price_per_unit).toFixed(2)} / ud`
        : "—";

  const otherUserId =
    user?.id === t.seller_id ? t.buyer_id : t.seller_id;

  const handleGoToChat = () => {
    navigate("/notifications", { state: { openChatWith: otherUserId } });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-gray-900 text-base truncate max-w-64">
                {t.livestock_post_name}
              </h2>
              {status && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusColors[status.color] ?? statusColors.gray}`}
                >
                  {status.label}
                </span>
              )}
            </div>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent shrink-0"
            >
              <LuX size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 flex flex-col gap-5">
            {/* Partes */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Vendedor" value={t.seller_name} />
              <Field label="Comprador" value={t.buyer_name} />
            </div>

            {/* Post info */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tipo de venta" value={sales[t.sale_type_id] ?? "—"} />
              <Field label="Precio" value={price} />
              {t.breed_name && (
                <Field label="Raza dominante" value={t.breed_name} />
              )}
              {t.avg_weight_kg != null && (
                <Field
                  label="Peso promedio"
                  value={`${Number(t.avg_weight_kg).toFixed(2)} kg`}
                />
              )}
              <Field
                label="Cantidad solicitada"
                value={String(t.requested_quantity)}
              />
              <Field label="ID publicación" value={t.livestock_post_id} />
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Fecha solicitud" value={formatDate(t.request_date)} />
              <Field
                label="Fecha resolución"
                value={formatDate(t.resolution_date)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <button
              type="button"
              onClick={handleGoToChat}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-xl py-3 text-sm hover:bg-primary-hover transition-colors cursor-pointer border-0"
            >
              <LuMessageCircle size={16} />
              Ir al chat
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TransactionDetailModal;
