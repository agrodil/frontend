import { useState, type FC } from "react";
import { motion } from "framer-motion";
import { LuX } from "react-icons/lu";

import Form from "@/presentation/ui/Form";
import type { CreateBankAccountInput } from "@/api/clients/wallet.api";
import type { BankAccountType } from "@/shared/constants/bank-account-type.catalog";

import { bankAccountFields } from "./bankAccountFields";
import { bankAccountSchema } from "./bankAccountSchema";

type BankAccountFormModalProps = {
  onClose: () => void;
  onCreate: (input: CreateBankAccountInput) => Promise<string | null>;
};

// Convierte los valores del Form (todos string) al DTO, quitando vacíos.
function toInput(
  data: Record<string, string | File | File[] | boolean>,
): CreateBankAccountInput {
  const s = (k: string) => {
    const v = data[k];
    return typeof v === "string" && v.trim() ? v.trim() : undefined;
  };
  return {
    account_type: (data.account_type as BankAccountType) ?? "mobile_payment",
    account_name: String(data.account_name ?? "").trim(),
    bank_name: s("bank_name"),
    phone_number: s("phone_number"),
    cedula: s("cedula"),
    bank_code: s("bank_code"),
    account_number: s("account_number"),
  };
}

const BankAccountFormModal: FC<BankAccountFormModalProps> = ({
  onClose,
  onCreate,
}) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    data: Record<string, string | File | File[] | boolean>,
  ) => {
    setSaving(true);
    setError(null);
    const err = await onCreate(toInput(data));
    setSaving(false);
    if (err) setError(err);
    else onClose();
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
          <h2 className="font-bold text-gray-900">Nueva cuenta bancaria</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <LuX size={18} />
          </button>
        </div>
        <div className="p-5">
          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
          <Form
            fields={bankAccountFields}
            schema={bankAccountSchema}
            submitLabel="Crear cuenta"
            onSubmit={handleSubmit}
            isLoading={saving}
            singleColumn
          />
        </div>
      </motion.div>
    </div>
  );
};

export default BankAccountFormModal;
