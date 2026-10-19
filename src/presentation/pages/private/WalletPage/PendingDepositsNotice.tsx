import type { FC } from "react";
import { LuClock } from "react-icons/lu";
import type { DepositReceiptDetailRow } from "@/api/clients/wallet.api";
import { formatBs } from "@/shared/utils/formatMoney";
import { formatDateTime } from "@/shared/utils/formatDateTime";

type PendingDepositsNoticeProps = {
  deposits: DepositReceiptDetailRow[];
};

// Depósitos aún en revisión: no están en el ledger todavía. Se listan aparte
// para que el usuario sepa que su comprobante fue recibido.
const PendingDepositsNotice: FC<PendingDepositsNoticeProps> = ({ deposits }) => {
  if (deposits.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
        <LuClock size={16} />
        Depósitos en revisión ({deposits.length})
      </div>
      <ul className="flex flex-col gap-2 list-none m-0 p-0">
        {deposits.map((d) => (
          <li
            key={d.deposit_receipt_id}
            className="flex items-center justify-between text-sm text-amber-900/80"
          >
            <span className="truncate">
              Ref. {d.reference_number ?? "—"} · {formatDateTime(d.created_at)}
            </span>
            <span className="font-medium whitespace-nowrap ml-3">
              {formatBs(d.amount_bs)}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-amber-700/80">
        Verificamos tu comprobante manualmente. Cuando se acredite, aparecerá en
        el historial y tu saldo se actualizará.
      </p>
    </div>
  );
};

export default PendingDepositsNotice;
