import type { FC } from "react";
import { motion } from "framer-motion";
import { LuLoader, LuPowerOff } from "react-icons/lu";
import Button from "@/presentation/ui/Button.tsx";
import { sales } from "@/shared/constants/sale-types.catalog";
import { purchaseStatuses } from "@/shared/constants/purchase-status.catalog";
import type { TransactionsTabProps } from "./TransactionsTabProps";

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("es-VE", { dateStyle: "short" }) : "—";

const statusColors: Record<string, string> = {
  yellow: "bg-yellow-100 text-yellow-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-500",
};

const TransactionsTab: FC<TransactionsTabProps> = ({
  transactions,
  onSelectTransaction,
}) => (
  <>
    <h2 className="text-primary font-bold text-[clamp(1.2rem,1.8vw,1.5rem)]">
      Historial de transacciones
    </h2>

    {transactions.loading ? (
      <div className="flex justify-center py-16">
        <LuLoader size={28} className="animate-spin text-gray-400" />
      </div>
    ) : transactions.transactions.length === 0 ? (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400"
      >
        <LuPowerOff size={40} strokeWidth={1.2} />
        <p className="text-sm font-medium">
          No tienes transacciones registradas
        </p>
      </motion.div>
    ) : (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="overflow-x-auto rounded-xl border border-gray-200"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Vendedor
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Comprador
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Publicación
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Tipo
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Solicitud
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Resolución
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.transactions.map((tx) => {
              const status = purchaseStatuses[tx.purchase_status_id];
              return (
                <tr
                  key={tx.purchase_request_id}
                  onClick={() => onSelectTransaction(tx)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-gray-800 font-medium max-w-36 truncate">
                    {tx.seller_name}
                  </td>
                  <td className="px-4 py-3 text-gray-800 max-w-36 truncate">
                    {tx.buyer_name}
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-44 truncate">
                    {tx.post_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {sales[tx.sale_type_id] ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(tx.request_date)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(tx.resolution_date)}
                  </td>
                  <td className="px-4 py-3">
                    {status && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusColors[status.color] ?? statusColors.gray}`}
                      >
                        {status.label}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {transactions.pagination?.hasMore && (
          <div className="flex justify-center py-4 border-t border-gray-100">
            <Button
              label={transactions.loadingMore ? "Cargando..." : "Ver más"}
              variant="secondary"
              size="sm"
              disabled={transactions.loadingMore}
              onClick={transactions.loadMore}
            />
            {transactions.loadingMore && (
              <LuLoader
                size={16}
                className="animate-spin text-primary ml-2 self-center"
              />
            )}
          </div>
        )}
      </motion.div>
    )}
  </>
);

export default TransactionsTab;
