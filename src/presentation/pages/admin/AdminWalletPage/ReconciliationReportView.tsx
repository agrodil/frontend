import type { FC } from "react";
import type {
  StatementReconciliationResult,
  StatementRow,
  ApplyItemResult,
} from "@/api/clients/wallet.api";
import { formatBs } from "@/shared/utils/formatMoney";
import ReconciliationSection from "./ReconciliationSection";

type ReconciliationReportViewProps = {
  data: StatementReconciliationResult;
  onClaim: (row: StatementRow) => void;
};

const Stat: FC<{ label: string; value: number; cls?: string }> = ({
  label,
  value,
  cls,
}) => (
  <div className="flex flex-col items-center px-4 py-2">
    <span className={`text-xl font-black ${cls ?? "text-gray-900"}`}>
      {value}
    </span>
    <span className="text-[11px] text-gray-500 uppercase tracking-wide">
      {label}
    </span>
  </div>
);

const th = "text-left font-semibold py-1.5 pr-4 text-xs uppercase tracking-wide";
const td = "py-1.5 pr-4 whitespace-nowrap";

const applyStatusLabel: Record<ApplyItemResult["status"], string> = {
  applied: "Aplicado",
  skipped: "Omitido",
  error: "Error",
};

const ReconciliationReportView: FC<ReconciliationReportViewProps> = ({
  data,
  onClaim,
}) => {
  const { statement, report, approve, revert, summary } = data;
  const applyById = new Map<string, ApplyItemResult>(
    [...approve, ...revert].map((r) => [r.deposit_receipt_id, r]),
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Resumen */}
      <div className="flex flex-wrap items-center justify-around rounded-xl border border-gray-200 bg-gray-50 divide-x divide-gray-200">
        <Stat label="Líneas extracto" value={statement.count} />
        <Stat label="Aplicados" value={summary.applied} cls="text-green-700" />
        <Stat label="Omitidos" value={summary.skipped} cls="text-gray-500" />
        <Stat label="Errores" value={summary.error} cls="text-red-600" />
      </div>

      {/* Aplicado automáticamente */}
      <ReconciliationSection
        title="Auto-aprobados"
        count={report.toAutoApprove.length}
        tone="applied"
        defaultOpen
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-black/5">
              <th className={th}>Comprobante</th>
              <th className={th}>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {report.toAutoApprove.map((id) => (
              <tr key={id} className="border-b border-black/5 last:border-0">
                <td className={`${td} font-mono text-xs`}>{id}</td>
                <td className={td}>
                  {applyStatusLabel[applyById.get(id)?.status ?? "applied"]}
                  {applyById.get(id)?.message
                    ? ` · ${applyById.get(id)?.message}`
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReconciliationSection>

      <ReconciliationSection
        title="Emparejados por monto"
        count={report.matchedByAmount.length}
        tone="applied"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-black/5">
              <th className={th}>Ref. depósito</th>
              <th className={th}>Ref. extracto</th>
              <th className={th}>Monto</th>
            </tr>
          </thead>
          <tbody>
            {report.matchedByAmount.map((m) => (
              <tr
                key={m.deposit_receipt_id}
                className="border-b border-black/5 last:border-0"
              >
                <td className={td}>{m.reference}</td>
                <td className={td}>{m.statementReference}</td>
                <td className={td}>{formatBs(m.amountBs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReconciliationSection>

      <ReconciliationSection
        title="Revertidos (ausentes del extracto)"
        count={report.toRevert.length}
        tone="review"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-black/5">
              <th className={th}>Referencia</th>
              <th className={th}>Monto</th>
              <th className={th}>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {report.toRevert.map((r) => (
              <tr
                key={r.deposit_receipt_id}
                className="border-b border-black/5 last:border-0"
              >
                <td className={td}>{r.reference}</td>
                <td className={td}>{formatBs(r.amountBs)}</td>
                <td className={td}>
                  {applyStatusLabel[
                    applyById.get(r.deposit_receipt_id)?.status ?? "applied"
                  ]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReconciliationSection>

      {/* Requiere revisión */}
      <ReconciliationSection
        title="Monto no coincide"
        count={report.amountMismatch.length}
        tone="review"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-black/5">
              <th className={th}>Referencia</th>
              <th className={th}>En depósito</th>
              <th className={th}>En extracto</th>
            </tr>
          </thead>
          <tbody>
            {report.amountMismatch.map((m) => (
              <tr
                key={m.deposit_receipt_id}
                className="border-b border-black/5 last:border-0"
              >
                <td className={td}>{m.reference}</td>
                <td className={td}>{formatBs(m.dbAmountBs)}</td>
                <td className={td}>{formatBs(m.statementAmountBs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReconciliationSection>

      <ReconciliationSection
        title="Pendientes sin conciliar"
        count={report.unmatchedPending.length}
        tone="review"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-black/5">
              <th className={th}>Referencia</th>
              <th className={th}>Monto</th>
            </tr>
          </thead>
          <tbody>
            {report.unmatchedPending.map((u) => (
              <tr
                key={u.deposit_receipt_id}
                className="border-b border-black/5 last:border-0"
              >
                <td className={td}>{u.reference}</td>
                <td className={td}>{formatBs(u.amountBs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReconciliationSection>

      <ReconciliationSection
        title="Ambiguos por monto"
        count={report.ambiguousAmount.length}
        tone="review"
      >
        <ul className="text-sm flex flex-col gap-2 list-none m-0 p-0">
          {report.ambiguousAmount.map((a) => (
            <li key={a.deposit.deposit_receipt_id}>
              Depósito ref. {a.deposit.reference} ({formatBs(a.deposit.amountBs)})
              → candidatos:{" "}
              {a.candidates.map((c) => c.reference).join(", ")}
            </li>
          ))}
        </ul>
      </ReconciliationSection>

      <ReconciliationSection
        title="Rechazados presentes en el extracto"
        count={report.rejectedButInStatement.length}
        tone="review"
      >
        <ul className="text-sm flex flex-col gap-1 list-none m-0 p-0">
          {report.rejectedButInStatement.map((r) => (
            <li key={r.deposit_receipt_id}>Referencia {r.reference}</li>
          ))}
        </ul>
      </ReconciliationSection>

      {/* Sin correspondencia */}
      <ReconciliationSection
        title="Huérfanos en el extracto"
        count={report.orphanInStatement.length}
        tone="orphan"
        defaultOpen
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-black/5">
              <th className={th}>Referencia</th>
              <th className={th}>Monto</th>
              <th className={th}>Fecha</th>
              <th className={th}>
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {report.orphanInStatement.map((o) => (
              <tr
                key={o.reference}
                className="border-b border-black/5 last:border-0"
              >
                <td className={td}>{o.reference}</td>
                <td className={td}>{formatBs(o.amountBs)}</td>
                <td className={td}>{o.date ?? "—"}</td>
                <td className={td}>
                  <button
                    type="button"
                    onClick={() => onClaim(o)}
                    className="text-primary cursor-pointer text-xs font-semibold hover:underline"
                  >
                    Reclamar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReconciliationSection>
    </div>
  );
};

export default ReconciliationReportView;
