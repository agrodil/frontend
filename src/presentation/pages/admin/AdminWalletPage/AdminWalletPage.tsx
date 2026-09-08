import { useState, type FC } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LuArrowLeft, LuLoader, LuWallet } from "react-icons/lu";

import { useAdminDeposits } from "@/adapters/hooks/actions/useAdminDeposits";
import {
  DEPOSIT_STATUS,
  DEPOSIT_STATUS_OPTIONS,
  type DepositStatus,
} from "@/shared/constants/deposit-status.catalog";
import { formatUsd, formatBs } from "@/shared/utils/formatMoney";
import { formatDateTime } from "@/shared/utils/formatDateTime";
import type { DepositReceiptDetailRow } from "@/api/clients/wallet.api";

import AdminWalletSubnav from "./AdminWalletSubnav";
import DepositReviewModal from "./DepositReviewModal";

const AdminWalletPage: FC = () => {
  const {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    statusFilter,
    setStatusFilter,
    loadMore,
    reviewDeposit,
  } = useAdminDeposits();

  const [selected, setSelected] = useState<DepositReceiptDetailRow | null>(null);

  return (
    <main className="w-[90vw] mx-auto py-[clamp(1.5rem,4vw,3rem)] flex flex-col gap-6">
      {selected && (
        <DepositReviewModal
          deposit={selected}
          onClose={() => setSelected(null)}
          onReview={reviewDeposit}
        />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center gap-4"
      >
        <Link
          to="/admin"
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center
                     hover:bg-gray-50 transition-colors shrink-0"
        >
          <LuArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-primary font-black text-[clamp(1.25rem,2.5vw,2rem)]">
            Billetera
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Depósitos, ajustes, cuentas y conciliación
          </p>
        </div>
      </motion.div>

      <AdminWalletSubnav />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-w-0"
      >
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <LuWallet size={18} className="text-primary" />
            Comprobantes
            {loading && (
              <LuLoader size={16} className="text-gray-400 animate-spin ml-1" />
            )}
          </div>
          <select
            value={statusFilter ?? ""}
            onChange={(e) =>
              setStatusFilter(
                e.target.value ? (e.target.value as DepositStatus) : null,
              )
            }
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm cursor-pointer
                       focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {DEPOSIT_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-gray-400">No hay comprobantes.</p>
        )}

        {!loading && items.length > 0 && (
          <div className="w-full min-w-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="font-semibold py-2 pr-4">Fecha</th>
                  <th className="font-semibold py-2 pr-4">Usuario</th>
                  <th className="font-semibold py-2 pr-4">Referencia</th>
                  <th className="font-semibold py-2 pr-4 whitespace-nowrap">
                    Monto USD
                  </th>
                  <th className="font-semibold py-2 pr-4 whitespace-nowrap">
                    Monto Bs
                  </th>
                  <th className="font-semibold py-2 pr-4">Estado</th>
                  <th className="font-semibold py-2">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((d) => {
                  const status =
                    DEPOSIT_STATUS[d.deposit_status as DepositStatus];
                  return (
                    <tr
                      key={d.deposit_receipt_id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="py-2.5 pr-4 text-gray-400 whitespace-nowrap">
                        {formatDateTime(d.created_at)}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-800 max-w-40 truncate">
                        {d.depositor_name ?? d.app_user_id}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-600 whitespace-nowrap">
                        {d.reference_number ?? "—"}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-700 whitespace-nowrap">
                        {formatUsd(d.amount_usd)}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-500 whitespace-nowrap">
                        {formatBs(d.amount_bs)}
                      </td>
                      <td className="py-2.5 pr-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full text-xs font-semibold px-2.5 py-1 ${status?.badgeClass ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {status?.label ?? d.deposit_status}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <button
                          type="button"
                          onClick={() => setSelected(d)}
                          className="text-primary cursor-pointer text-xs font-semibold hover:underline whitespace-nowrap"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && hasMore && (
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="mt-4 self-center mx-auto flex items-center gap-1.5 text-sm text-primary
                       font-medium hover:underline disabled:opacity-50"
          >
            {loadingMore && <LuLoader size={14} className="animate-spin" />}
            {loadingMore ? "Cargando..." : "Cargar más"}
          </button>
        )}
      </motion.div>
    </main>
  );
};

export default AdminWalletPage;
