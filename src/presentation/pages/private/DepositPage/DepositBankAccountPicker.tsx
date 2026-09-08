import type { FC } from "react";
import { LuLoader, LuSmartphone, LuChevronRight } from "react-icons/lu";
import type { BankAccountRow } from "@/api/clients/wallet.api";

type DepositBankAccountPickerProps = {
  accounts: BankAccountRow[];
  loading: boolean;
  error: string | null;
  onSelect: (account: BankAccountRow) => void;
};

const DepositBankAccountPicker: FC<DepositBankAccountPickerProps> = ({
  accounts,
  loading,
  error,
  onSelect,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-14">
        <LuLoader size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500 py-4">{error}</p>;
  }

  if (accounts.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-10 text-center">
        No hay cuentas de pago móvil disponibles por ahora.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-500">
        Elige la cuenta a la que vas a hacer (o hiciste) el pago móvil.
      </p>
      {accounts.map((acc) => (
        <button
          key={acc.bank_account_id}
          type="button"
          onClick={() => onSelect(acc)}
          className="flex items-center gap-3 w-full text-left border border-gray-200 rounded-xl p-4
                     hover:border-primary/40 hover:bg-gray-50 transition-colors cursor-pointer bg-white"
        >
          <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center shrink-0">
            <LuSmartphone size={18} />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-semibold text-gray-900 text-sm truncate">
              {acc.account_name}
            </span>
            <span className="text-xs text-gray-500 truncate">
              {acc.bank_name ?? "Banco"} · {acc.phone_number ?? ""}
            </span>
          </div>
          <LuChevronRight size={18} className="text-gray-300 shrink-0" />
        </button>
      ))}
    </div>
  );
};

export default DepositBankAccountPicker;
