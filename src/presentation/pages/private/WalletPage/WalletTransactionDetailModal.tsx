import type { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuX } from "react-icons/lu";
import type { WalletTransactionRow } from "@/api/clients/wallet.api";
import {
  WALLET_TRANSACTION_TYPE,
  type WalletTransactionType,
} from "@/shared/constants/wallet-transaction-type.catalog";
import {
  WALLET_DEBIT_KIND_LABELS,
  type WalletDebitKind,
} from "@/shared/constants/wallet-debit-kind.catalog";
import { formatUsd, formatBs, formatRate } from "@/shared/utils/formatMoney";
import { formatDateTime } from "@/shared/utils/formatDateTime";

type WalletTransactionDetailModalProps = {
  transaction: WalletTransactionRow;
  onClose: () => void;
};

const Field: FC<{ label: string; value: string; mono?: boolean }> = ({
  label,
  value,
  mono,
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
      {label}
    </span>
    <span
      className={`text-sm font-medium text-gray-800 ${mono ? "font-mono text-xs break-all" : ""}`}
    >
      {value}
    </span>
  </div>
);

const WalletTransactionDetailModal: FC<WalletTransactionDetailModalProps> = ({
  transaction: t,
  onClose,
}) => {
  const meta = WALLET_TRANSACTION_TYPE[t.transaction_type as WalletTransactionType];
  const debitKind = t.debit_kind
    ? WALLET_DEBIT_KIND_LABELS[t.debit_kind as WalletDebitKind]
    : null;

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
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-gray-900 text-base">
                Detalle del movimiento
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${meta?.badgeClass ?? "bg-gray-100 text-gray-500"}`}
              >
                {meta?.label ?? t.transaction_type}
              </span>
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

          <div className="px-6 py-5 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Monto USD" value={formatUsd(t.usd_amount)} />
              <Field label="Monto Bs" value={formatBs(t.bs_amount)} />
              <Field label="Tasa" value={formatRate(t.usd_rate)} />
              <Field label="Fecha" value={formatDateTime(t.created_at)} />
              {debitKind && <Field label="Concepto" value={debitKind} />}
            </div>

            <Field label="Descripción" value={t.details || "—"} />

            <div className="grid grid-cols-1 gap-3 border-t border-gray-100 pt-4">
              <Field label="ID movimiento" value={t.wallet_transaction_id} mono />
              {t.deposit_receipt_id && (
                <Field
                  label="ID comprobante"
                  value={t.deposit_receipt_id}
                  mono
                />
              )}
              {t.post_id && (
                <Field label="ID publicación" value={t.post_id} mono />
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WalletTransactionDetailModal;
