import { useState, type FC } from "react";
import { motion } from "framer-motion";
import { LuX, LuLoader } from "react-icons/lu";
import type {
  DepositReceiptDetailRow,
  DepositReviewResult,
} from "@/api/clients/wallet.api";
import { DEPOSIT_STATUS, type DepositStatus } from "@/shared/constants/deposit-status.catalog";
import { formatUsd, formatBs } from "@/shared/utils/formatMoney";
import { formatDateTime } from "@/shared/utils/formatDateTime";

type DepositReviewModalProps = {
  deposit: DepositReceiptDetailRow;
  onClose: () => void;
  onReview: (
    id: string,
    status: "completed" | "rejected",
  ) => Promise<DepositReviewResult>;
};

const Field: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
      {label}
    </span>
    <span className="text-sm font-medium text-gray-800 break-words">
      {value}
    </span>
  </div>
);

const DepositReviewModal: FC<DepositReviewModalProps> = ({
  deposit: d,
  onClose,
  onReview,
}) => {
  const [saving, setSaving] = useState<"completed" | "rejected" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<DepositReviewResult | null>(null);

  const status = DEPOSIT_STATUS[d.deposit_status as DepositStatus];

  const handle = async (next: "completed" | "rejected") => {
    setSaving(next);
    setError(null);
    try {
      const result = await onReview(d.deposit_receipt_id, next);
      setDone(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo procesar el depósito.",
      );
    } finally {
      setSaving(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full min-w-0 max-w-lg max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">Revisar comprobante</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <LuX size={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {done ? (
            <div className="flex flex-col gap-3 py-2">
              <p className="text-sm font-semibold text-gray-900">
                {done.transaction
                  ? "Depósito acreditado."
                  : "Depósito rechazado."}
              </p>
              <Field
                label="Nuevo saldo del usuario"
                value={formatUsd(done.wallet.balance)}
              />
              {done.transaction && (
                <Field
                  label="Movimiento generado"
                  value={`${formatUsd(done.transaction.usd_amount)} · ${done.transaction.details}`}
                />
              )}
              <button
                type="button"
                onClick={onClose}
                className="mt-2 self-start text-sm text-primary font-semibold hover:underline"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full text-xs font-semibold px-2.5 py-1 ${status?.badgeClass ?? "bg-gray-100 text-gray-700"}`}
                >
                  {status?.label ?? d.deposit_status}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDateTime(d.created_at)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Usuario" value={d.depositor_name ?? d.app_user_id} />
                <Field label="Referencia" value={d.reference_number ?? "—"} />
                <Field label="Monto USD" value={formatUsd(d.amount_usd)} />
                <Field label="Monto Bs" value={formatBs(d.amount_bs)} />
              </div>

              {d.deposit_receipt_image_url && (
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                    Comprobante
                  </span>
                  <a
                    href={d.deposit_receipt_image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-1.5 rounded-xl overflow-hidden border border-gray-100"
                  >
                    <img
                      src={d.deposit_receipt_image_url}
                      alt="Comprobante de depósito"
                      className="w-full max-w-full max-h-80 object-contain bg-gray-50"
                    />
                  </a>
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              {d.deposit_status === "pending" ? (
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handle("completed")}
                    disabled={saving !== null}
                    className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white
                               hover:bg-primary-hover transition-colors disabled:opacity-50
                               flex items-center justify-center gap-2"
                  >
                    {saving === "completed" && (
                      <LuLoader size={14} className="animate-spin" />
                    )}
                    Aprobar
                  </button>
                  <button
                    type="button"
                    onClick={() => handle("rejected")}
                    disabled={saving !== null}
                    className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white
                               hover:bg-red-600 transition-colors disabled:opacity-50
                               flex items-center justify-center gap-2"
                  >
                    {saving === "rejected" && (
                      <LuLoader size={14} className="animate-spin" />
                    )}
                    Rechazar
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  Este comprobante ya fue procesado.
                </p>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DepositReviewModal;
