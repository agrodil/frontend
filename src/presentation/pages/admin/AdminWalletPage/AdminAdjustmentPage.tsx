import { useState, type FC } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LuArrowLeft } from "react-icons/lu";

import Form from "@/presentation/ui/Form";
import Loader from "@/presentation/layout/Loader";
import { useAdminUserSearch } from "@/adapters/hooks/actions/useAdminUserSearch";
import { useAdminAdjustment } from "@/adapters/hooks/actions/useAdminAdjustment";
import { formatUsd } from "@/shared/utils/formatMoney";
import type { AdminUser } from "@/api/clients/admin.api";

import AdminWalletSubnav from "./AdminWalletSubnav";
import AdjustmentUserPicker from "./AdjustmentUserPicker";
import { adjustmentFields } from "./adjustmentFields";
import { adjustmentSchema } from "./adjustmentSchema";

const AdminAdjustmentPage: FC = () => {
  const search = useAdminUserSearch();
  const { submit, submitting, error, result, reset } = useAdminAdjustment();

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSelect = (user: AdminUser) => {
    setSelectedUser(user);
    search.setFoundUserDirectly(user, user.email);
    reset();
  };

  const handleSubmit = async (
    data: Record<string, string | File | File[] | boolean>,
  ) => {
    setFormError(null);
    if (!selectedUser) {
      setFormError("Selecciona un usuario primero.");
      return;
    }
    await submit({
      appUserId: selectedUser.app_user_id,
      usdAmount: Number(String(data.usd_amount).replace(",", ".")),
      reason: String(data.reason ?? "").trim(),
    });
  };

  return (
    <main className="w-[90vw] mx-auto py-[clamp(1.5rem,4vw,3rem)] flex flex-col gap-6">
      <Loader visible={submitting} />

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
            Ajuste manual de saldo
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Corrige el saldo de una cartera. Positivo acredita, negativo
            descuenta.
          </p>
        </div>
      </motion.div>

      <AdminWalletSubnav />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-xl flex flex-col gap-6"
      >
        <AdjustmentUserPicker
          query={search.query}
          onQueryChange={(v) => {
            search.setQuery(v);
            setSelectedUser(null);
          }}
          searching={search.searching}
          foundUser={search.foundUser}
          searchError={search.searchError}
          selectedUser={selectedUser}
          onSelect={handleSelect}
        />

        {result ? (
          <div className="flex flex-col gap-2 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-800">
              Ajuste aplicado.
            </p>
            <p className="text-sm text-green-900/80">
              Nuevo saldo: {formatUsd(result.wallet.balance)}
            </p>
          </div>
        ) : (
          <>
            {(error || formError) && (
              <p className="text-sm text-red-500">{error ?? formError}</p>
            )}
            <Form
              fields={adjustmentFields}
              schema={adjustmentSchema}
              submitLabel="Aplicar ajuste"
              onSubmit={handleSubmit}
              isLoading={submitting}
              singleColumn
            />
          </>
        )}
      </motion.div>
    </main>
  );
};

export default AdminAdjustmentPage;
