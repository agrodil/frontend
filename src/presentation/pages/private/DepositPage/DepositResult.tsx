import type { FC } from "react";
import { motion } from "framer-motion";
import { LuCircleCheck, LuClock } from "react-icons/lu";
import Button from "@/presentation/ui/Button";

type DepositResultProps = {
  status: "pending" | "completed";
  onGoWallet: () => void;
  onGoHome: () => void;
};

const DepositResult: FC<DepositResultProps> = ({
  status,
  onGoWallet,
  onGoHome,
}) => {
  const completed = status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center gap-4 py-6"
    >
      {completed ? (
        <LuCircleCheck size={56} className="text-green-500" />
      ) : (
        <LuClock size={56} className="text-amber-500" />
      )}
      <div>
        <h2 className="text-lg font-bold text-gray-900">
          {completed ? "¡Depósito acreditado!" : "Depósito en revisión"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {completed
            ? "Tu saldo ya fue actualizado."
            : "Recibimos tu comprobante. Lo verificamos y, al acreditarse, tu saldo se actualizará."}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <Button
          label="Ir a mi billetera"
          variant="primary"
          onClick={onGoWallet}
          className="w-full"
        />
        <Button
          label="Volver al inicio"
          variant="secondary"
          onClick={onGoHome}
          className="w-full"
        />
      </div>
    </motion.div>
  );
};

export default DepositResult;
