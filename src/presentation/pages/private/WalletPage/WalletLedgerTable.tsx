import type { FC } from "react";
import { LuLoader } from "react-icons/lu";
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

type WalletLedgerTableProps = {
  items: WalletTransactionRow[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelect: (row: WalletTransactionRow) => void;
};

// Signo con el que el movimiento afecta al saldo, para pintar el monto USD.
function signedUsd(row: WalletTransactionRow): { text: string; cls: string } {
  const n = Number(row.usd_amount);
  if (row.transaction_type === "deposit") {
    return { text: `+${formatUsd(row.usd_amount)}`, cls: "text-green-600" };
  }
  if (row.transaction_type === "debit") {
    return { text: `-${formatUsd(row.usd_amount)}`, cls: "text-red-600" };
  }
  // adjustment: ya viene firmado
  if (n < 0) return { text: formatUsd(row.usd_amount), cls: "text-red-600" };
  return { text: `+${formatUsd(row.usd_amount)}`, cls: "text-green-600" };
}

const WalletLedgerTable: FC<WalletLedgerTableProps> = ({
  items,
  loading,
  loadingMore,
  error,
  hasMore,
  onLoadMore,
  onSelect,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LuLoader size={26} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500 py-4">{error}</p>;
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-10 text-center">
        No tienes movimientos registrados.
      </p>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-gray-500 border-b border-gray-200">
            <th className="font-semibold px-4 py-3 text-xs uppercase tracking-wide">
              Fecha
            </th>
            <th className="font-semibold px-4 py-3 text-xs uppercase tracking-wide">
              Tipo
            </th>
            <th className="font-semibold px-4 py-3 text-xs uppercase tracking-wide">
              Detalle
            </th>
            <th className="font-semibold px-4 py-3 text-xs uppercase tracking-wide whitespace-nowrap">
              Monto USD
            </th>
            <th className="font-semibold px-4 py-3 text-xs uppercase tracking-wide whitespace-nowrap">
              Monto Bs
            </th>
            <th className="font-semibold px-4 py-3 text-xs uppercase tracking-wide whitespace-nowrap">
              Tasa
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((row) => {
            const meta =
              WALLET_TRANSACTION_TYPE[
                row.transaction_type as WalletTransactionType
              ];
            const debitKind = row.debit_kind
              ? WALLET_DEBIT_KIND_LABELS[row.debit_kind as WalletDebitKind]
              : null;
            const usd = signedUsd(row);
            return (
              <tr
                key={row.wallet_transaction_id}
                onClick={() => onSelect(row)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {formatDateTime(row.created_at)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${meta?.badgeClass ?? "bg-gray-100 text-gray-500"}`}
                  >
                    {meta?.label ?? row.transaction_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                  {debitKind ? `${debitKind} · ` : ""}
                  {row.details}
                </td>
                <td
                  className={`px-4 py-3 font-semibold whitespace-nowrap ${usd.cls}`}
                >
                  {usd.text}
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {formatBs(row.bs_amount)}
                </td>
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                  {formatRate(row.usd_rate)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {hasMore && (
        <div className="flex justify-center py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline disabled:opacity-50"
          >
            {loadingMore && <LuLoader size={14} className="animate-spin" />}
            {loadingMore ? "Cargando..." : "Cargar más"}
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletLedgerTable;
