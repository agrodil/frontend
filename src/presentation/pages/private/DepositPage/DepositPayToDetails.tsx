import { useState, type FC } from "react";
import { LuCopy, LuCheck } from "react-icons/lu";
import Button from "@/presentation/ui/Button";
import type { BankAccountRow } from "@/api/clients/wallet.api";

type DepositPayToDetailsProps = {
  account: BankAccountRow;
  onBack: () => void;
  onContinue: () => void;
};

const CopyRow: FC<{ label: string; value: string | null }> = ({
  label,
  value,
}) => {
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  const copy = () => {
    void navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
          {label}
        </span>
        <span className="text-sm font-medium text-gray-800 truncate">
          {value}
        </span>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copiar ${label}`}
        className="shrink-0 w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center
                   hover:bg-gray-50 transition-colors cursor-pointer text-gray-500"
      >
        {copied ? (
          <LuCheck size={15} className="text-green-600" />
        ) : (
          <LuCopy size={15} />
        )}
      </button>
    </div>
  );
};

const DepositPayToDetails: FC<DepositPayToDetailsProps> = ({
  account,
  onBack,
  onContinue,
}) => (
  <div className="flex flex-col gap-5">
    <p className="text-sm text-gray-500">
      Haz el pago móvil a estos datos. Guarda la captura del comprobante: la
      necesitarás en el siguiente paso.
    </p>

    <div className="rounded-xl border border-gray-200 px-4">
      <CopyRow label="Titular" value={account.account_name} />
      <CopyRow label="Banco" value={account.bank_name} />
      <CopyRow label="Código de banco" value={account.bank_code} />
      <CopyRow label="Teléfono" value={account.phone_number} />
      <CopyRow label="Cédula / RIF" value={account.cedula} />
    </div>

    <div className="flex items-center gap-3">
      <Button
        label="Cambiar cuenta"
        variant="secondary"
        size="sm"
        onClick={onBack}
        className="shrink-0"
      />
      <Button
        label="Ya hice el pago"
        variant="primary"
        size="sm"
        onClick={onContinue}
        className="shrink-0"
      />
    </div>
  </div>
);

export default DepositPayToDetails;
