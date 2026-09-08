import { useState, type FC } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LuArrowLeft, LuLoader } from "react-icons/lu";

import Button from "@/presentation/ui/Button";
import { useAdminBankAccounts } from "@/adapters/hooks/actions/useAdminBankAccounts";
import {
  BANK_ACCOUNT_TYPE_LABELS,
  type BankAccountType,
} from "@/shared/constants/bank-account-type.catalog";
import type { BankAccountRow } from "@/api/clients/wallet.api";

import AdminWalletSubnav from "./AdminWalletSubnav";
import BankAccountFormModal from "./BankAccountFormModal";
import DeleteBankAccountConfirm from "./DeleteBankAccountConfirm";

const identity = (a: BankAccountRow) =>
  a.account_type === "mobile_payment"
    ? [a.phone_number, a.cedula, a.bank_code].filter(Boolean).join(" · ")
    : (a.account_number ?? "—");

const AdminBankAccountsPage: FC = () => {
  const { accounts, loading, error, create, remove } = useAdminBankAccounts();
  const [showForm, setShowForm] = useState(false);
  const [toDelete, setToDelete] = useState<BankAccountRow | null>(null);

  return (
    <main className="w-[90vw] mx-auto py-[clamp(1.5rem,4vw,3rem)] flex flex-col gap-6">
      {showForm && (
        <BankAccountFormModal
          onClose={() => setShowForm(false)}
          onCreate={create}
        />
      )}
      {toDelete && (
        <DeleteBankAccountConfirm
          account={toDelete}
          onCancel={() => setToDelete(null)}
          onConfirm={remove}
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
            Cuentas bancarias
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Cuentas propias donde los usuarios depositan
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
          <span className="font-bold text-gray-900">Cuentas</span>
          <Button
            label="Agregar cuenta"
            variant="primary"
            size="sm"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5"
          />
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <LuLoader size={22} className="text-gray-400 animate-spin" />
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && accounts.length === 0 && (
          <p className="text-sm text-gray-400">No hay cuentas registradas.</p>
        )}

        {!loading && accounts.length > 0 && (
          <div className="w-full min-w-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="font-semibold py-2 pr-4">Tipo</th>
                  <th className="font-semibold py-2 pr-4">Titular</th>
                  <th className="font-semibold py-2 pr-4">Banco</th>
                  <th className="font-semibold py-2 pr-4">Identidad</th>
                  <th className="font-semibold py-2">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr
                    key={a.bank_account_id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="py-2.5 pr-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1">
                        {BANK_ACCOUNT_TYPE_LABELS[
                          a.account_type as BankAccountType
                        ] ?? a.account_type}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-800 max-w-40 truncate">
                      {a.account_name}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600 whitespace-nowrap">
                      {a.bank_name ?? "—"}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-500 whitespace-nowrap">
                      {identity(a)}
                    </td>
                    <td className="py-2.5">
                      <button
                        type="button"
                        onClick={() => setToDelete(a)}
                        className="text-red-500 cursor-pointer text-xs font-semibold hover:underline whitespace-nowrap"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </main>
  );
};

export default AdminBankAccountsPage;
