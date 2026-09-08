// Tipos de movimiento del ledger de la cartera. Coinciden con el enum
// transaction_type del backend.
//   deposit    → abono verificado de un comprobante de pago móvil
//   debit      → cobro de publicación o renovación
//   adjustment → corrección manual del saldo (firmada)
export type WalletTransactionType = "deposit" | "debit" | "adjustment";

export interface WalletTransactionTypeMeta {
  label: string;
  badgeClass: string;
  // Signo con el que afecta al saldo, para pintarlo. adjustment depende del
  // monto (viene firmado), así que se resuelve en el componente.
  sign: "+" | "-" | "±";
}

export const WALLET_TRANSACTION_TYPE: Record<
  WalletTransactionType,
  WalletTransactionTypeMeta
> = {
  deposit: { label: "Depósito", badgeClass: "bg-green-50 text-green-700", sign: "+" },
  debit: { label: "Cobro", badgeClass: "bg-red-50 text-red-700", sign: "-" },
  adjustment: {
    label: "Ajuste",
    badgeClass: "bg-amber-50 text-amber-700",
    sign: "±",
  },
};

// Opciones para el <select> de filtro. "" = sin filtro.
export const WALLET_TRANSACTION_TYPE_OPTIONS: { value: string; label: string }[] =
  [
    { value: "", label: "Todos" },
    { value: "deposit", label: "Depósitos" },
    { value: "debit", label: "Cobros" },
    { value: "adjustment", label: "Ajustes" },
  ];
