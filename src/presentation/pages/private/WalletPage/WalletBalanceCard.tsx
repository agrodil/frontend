import type { FC } from "react";
import { motion } from "framer-motion";
import { LuWallet } from "react-icons/lu";
import Button from "@/presentation/ui/Button";
import { formatUsd } from "@/shared/utils/formatMoney";

type WalletBalanceCardProps = {
  balance: string | null;
  updatedAt?: string | null;
  loading: boolean;
  onDeposit: () => void;
};

const WalletBalanceCard: FC<WalletBalanceCardProps> = ({
  balance,
  updatedAt,
  loading,
  onDeposit,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="bg-white rounded-2xl border border-gray-200 shadow-sm
               px-[clamp(1.25rem,4vw,2.5rem)] py-[clamp(1.25rem,3vw,2rem)]
               flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
  >
    <div className="flex items-center gap-4">
      <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center shrink-0">
        <LuWallet size={22} />
      </div>
      <div className="flex flex-col">
        <span className="text-gray-400 text-xs uppercase font-semibold tracking-wide">
          Saldo disponible
        </span>
        <span className="text-primary font-black text-[clamp(1.6rem,4vw,2.5rem)] leading-tight">
          {loading ? "…" : formatUsd(balance)}
        </span>
        {updatedAt && (
          <span className="text-gray-400 text-xs mt-0.5">
            Actualizado{" "}
            {new Date(updatedAt).toLocaleString("es-VE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>

    <Button
      label="Depositar"
      variant="primary"
      size="md"
      onClick={onDeposit}
      className="shrink-0 flex items-center gap-2 justify-center"
    />
  </motion.div>
);

export default WalletBalanceCard;
