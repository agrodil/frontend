import { useState, type FC } from "react";
import { motion } from "framer-motion";
import { LuX, LuLoader } from "react-icons/lu";

import { useAdminUserSearch } from "@/adapters/hooks/actions/useAdminUserSearch";
import { useClaimOrphan } from "@/adapters/hooks/actions/useClaimOrphan";
import { formatBs, formatUsd } from "@/shared/utils/formatMoney";
import type { StatementRow } from "@/api/clients/wallet.api";
import type { AdminUser } from "@/api/clients/admin.api";

import AdjustmentUserPicker from "./AdjustmentUserPicker";

type ClaimOrphanModalProps = {
  orphan: StatementRow;
  bankAccountId: string;
  onClose: () => void;
  onClaimed: (reference: string) => void;
};

const ClaimOrphanModal: FC<ClaimOrphanModalProps> = ({
  orphan,
  bankAccountId,
  onClose,
  onClaimed,
}) => {
  const search = useAdminUserSearch();
  const { submit, submitting, error, result } = useClaimOrphan();

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [date, setDate] = useState(orphan.date ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSelect = (user: AdminUser) => {
    setSelectedUser(user);
    search.setFoundUserDirectly(user, user.email);
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!selectedUser) {
      setFormError("Selecciona el usuario que hizo el pago.");
      return;
    }
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setFormError("Fecha inválida (AAAA-MM-DD).");
      return;
    }
    await submit({
      bankAccountId,
      appUserId: selectedUser.app_user_id,
      reference: orphan.reference,
      amountBs: orphan.amountBs,
      date: date || undefined,
    });
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
        className="bg-white rounded-2xl shadow-xl w-full min-w-0 max-w-md max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">Reclamar pago del extracto</h2>
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
          {result ? (
            <div className="flex flex-col gap-2 rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-800">
                Pago acreditado.
              </p>
              <p className="text-sm text-green-900/80">
                Nuevo saldo: {formatUsd(result.wallet.balance)}
              </p>
              <button
                type="button"
                onClick={() => onClaimed(orphan.reference)}
                className="mt-1 self-start text-sm text-primary font-semibold hover:underline"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide block">
                    Referencia
                  </span>
                  {orphan.reference}
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide block">
                    Monto
                  </span>
                  {formatBs(orphan.amountBs)}
                </div>
              </div>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                  Fecha del pago (opcional)
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>

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

              {(error || formError) && (
                <p className="text-sm text-red-500">{error ?? formError}</p>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-xl bg-primary py-2.5 text-sm font-semibold text-white
                           hover:bg-primary-hover transition-colors disabled:opacity-50
                           flex items-center justify-center gap-2"
              >
                {submitting && <LuLoader size={14} className="animate-spin" />}
                Reclamar y acreditar
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ClaimOrphanModal;
