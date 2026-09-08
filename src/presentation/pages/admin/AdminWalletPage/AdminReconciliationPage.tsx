import { useState, type FC } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LuArrowLeft, LuLoader } from "react-icons/lu";

import Button from "@/presentation/ui/Button";
import { useAdminBankAccounts } from "@/adapters/hooks/actions/useAdminBankAccounts";
import { useReconciliation } from "@/adapters/hooks/actions/useReconciliation";
import type { StatementRow } from "@/api/clients/wallet.api";

import AdminWalletSubnav from "./AdminWalletSubnav";
import ReconciliationReportView from "./ReconciliationReportView";
import ClaimOrphanModal from "./ClaimOrphanModal";

const AdminReconciliationPage: FC = () => {
  const { accounts, loading: accountsLoading } = useAdminBankAccounts();
  const { run, running, error, result, reset } = useReconciliation();

  const [bankAccountId, setBankAccountId] = useState("");
  const [day, setDay] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [claiming, setClaiming] = useState<StatementRow | null>(null);
  const [claimedRefs, setClaimedRefs] = useState<Set<string>>(new Set());

  const mobileAccounts = accounts.filter(
    (a) => a.account_type === "mobile_payment",
  );

  const canRun = bankAccountId && file && !running;

  const handleRun = () => {
    if (!bankAccountId || !file) return;
    void run({ bankAccountId, day: day || undefined, file });
  };

  return (
    <main className="w-[90vw] mx-auto py-[clamp(1.5rem,4vw,3rem)] flex flex-col gap-6">
      {claiming && (
        <ClaimOrphanModal
          orphan={claiming}
          bankAccountId={bankAccountId}
          onClose={() => setClaiming(null)}
          onClaimed={(ref) => {
            setClaimedRefs((prev) => new Set(prev).add(ref));
            setClaiming(null);
          }}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center gap-4"
      >
        <Link
          to="/admin/wallet"
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center
                     hover:bg-gray-50 transition-colors shrink-0"
        >
          <LuArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-primary font-black text-[clamp(1.25rem,2.5vw,2rem)]">
            Conciliación de extracto
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Sube el "Detalle de cuenta" de Mercantil. Se aplica automáticamente.
          </p>
        </div>
      </motion.div>

      <AdminWalletSubnav />

      {/* Formulario de subida */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4 max-w-xl"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
            Cuenta bancaria
          </span>
          <select
            value={bankAccountId}
            onChange={(e) => setBankAccountId(e.target.value)}
            disabled={accountsLoading}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm cursor-pointer
                       focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          >
            <option value="">Selecciona una cuenta…</option>
            {mobileAccounts.map((a) => (
              <option key={a.bank_account_id} value={a.bank_account_id}>
                {a.account_name} · {a.bank_name ?? ""}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
            Día (opcional; por defecto hoy)
          </span>
          <input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
            Archivo del extracto (.xlsx)
          </span>
          <input
            type="file"
            accept=".xlsx,.zip"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10
                       file:px-3 file:py-1.5 file:text-primary file:font-semibold file:cursor-pointer"
          />
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center gap-3">
          <Button
            label={running ? "Procesando…" : "Procesar"}
            variant="primary"
            size="sm"
            onClick={handleRun}
            disabled={!canRun}
          />
          {running && (
            <LuLoader size={16} className="animate-spin text-primary" />
          )}
          {result && (
            <button
              type="button"
              onClick={() => {
                reset();
                setFile(null);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Limpiar
            </button>
          )}
        </div>
      </motion.div>

      {/* Reporte */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-w-0"
        >
          <ReconciliationReportView
            data={{
              ...result,
              report: {
                ...result.report,
                orphanInStatement: result.report.orphanInStatement.filter(
                  (o) => !claimedRefs.has(o.reference),
                ),
              },
            }}
            onClaim={setClaiming}
          />
        </motion.div>
      )}
    </main>
  );
};

export default AdminReconciliationPage;
