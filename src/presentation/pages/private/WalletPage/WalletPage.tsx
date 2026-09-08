import { useEffect, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LuArrowLeft } from "react-icons/lu";

import { useAuth } from "@/adapters/hooks/common/useAuth";
import { useWallet } from "@/adapters/hooks/actions/useWallet";
import { useWalletTransactions } from "@/adapters/hooks/actions/useWalletTransactions";
import { useMyDeposits } from "@/adapters/hooks/actions/useMyDeposits";
import { WALLET_TRANSACTION_TYPE_OPTIONS } from "@/shared/constants/wallet-transaction-type.catalog";
import type { WalletTransactionType } from "@/shared/constants/wallet-transaction-type.catalog";
import type { WalletTransactionRow } from "@/api/clients/wallet.api";

import WalletBalanceCard from "./WalletBalanceCard";
import WalletLedgerTable from "./WalletLedgerTable";
import WalletTransactionDetailModal from "./WalletTransactionDetailModal";
import PendingDepositsNotice from "./PendingDepositsNotice";

const WalletPage: FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const { wallet, loading: walletLoading } = useWallet();
  const ledger = useWalletTransactions();
  const pendingDeposits = useMyDeposits("pending");

  const [selected, setSelected] = useState<WalletTransactionRow | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
  }, [authLoading, user, navigate]);

  if (authLoading || !user) return null;

  return (
    <>
      <main className="flex-1 w-[90vw] mx-auto py-[clamp(1.5rem,4vw,3rem)] flex flex-col gap-[clamp(1rem,2.5vw,1.75rem)]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center gap-4"
        >
          <button
            type="button"
            onClick={() => navigate("/me")}
            aria-label="Volver"
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center
                       hover:bg-gray-50 transition-colors shrink-0 bg-white cursor-pointer"
          >
            <LuArrowLeft size={18} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-primary font-black text-[clamp(1.25rem,2.5vw,2rem)]">
              Mi billetera
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Saldo, movimientos y depósitos por pago móvil
            </p>
          </div>
        </motion.div>

        <WalletBalanceCard
          balance={wallet?.balance ?? null}
          updatedAt={wallet?.updated_at}
          loading={walletLoading}
          onDeposit={() => navigate("/wallet/depositar")}
        />

        {!pendingDeposits.loading && (
          <PendingDepositsNotice deposits={pendingDeposits.items} />
        )}

        {/* Historial */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-w-0 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-bold text-gray-900">Historial de movimientos</h2>
            <select
              value={ledger.typeFilter ?? ""}
              onChange={(e) =>
                ledger.setTypeFilter(
                  e.target.value
                    ? (e.target.value as WalletTransactionType)
                    : null,
                )
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {WALLET_TRANSACTION_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <WalletLedgerTable
            items={ledger.items}
            loading={ledger.loading}
            loadingMore={ledger.loadingMore}
            error={ledger.error}
            hasMore={ledger.hasMore}
            onLoadMore={ledger.loadMore}
            onSelect={setSelected}
          />
        </motion.div>
      </main>

      {selected && (
        <WalletTransactionDetailModal
          transaction={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
};

export default WalletPage;
