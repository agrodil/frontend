// Tipo de cuenta bancaria propia (destino de los depósitos).
//   mobile_payment → identidad = teléfono + cédula + código de banco
//   transfer       → identidad = número de cuenta
export type BankAccountType = "mobile_payment" | "transfer";

export const BANK_ACCOUNT_TYPE_LABELS: Record<BankAccountType, string> = {
  mobile_payment: "Pago móvil",
  transfer: "Transferencia",
};

export const BANK_ACCOUNT_TYPE_OPTIONS: { value: BankAccountType; label: string }[] =
  [
    { value: "mobile_payment", label: "Pago móvil" },
    { value: "transfer", label: "Transferencia" },
  ];
