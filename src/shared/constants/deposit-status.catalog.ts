// Estado de un comprobante de depósito. Coincide con el enum processing_status
// del backend.
//   pending    → en revisión (aún no acreditado, no aparece en el ledger)
//   completed  → verificado y acreditado a la cartera
//   rejected   → rechazado por revisión / conciliación
export type DepositStatus = "pending" | "completed" | "rejected";

export interface DepositStatusMeta {
  label: string;
  badgeClass: string;
}

export const DEPOSIT_STATUS: Record<DepositStatus, DepositStatusMeta> = {
  pending: { label: "En revisión", badgeClass: "bg-amber-50 text-amber-700" },
  completed: { label: "Acreditado", badgeClass: "bg-green-50 text-green-700" },
  rejected: { label: "Rechazado", badgeClass: "bg-red-50 text-red-700" },
};

// Opciones para el <select> de filtro admin. "" = sin filtro.
export const DEPOSIT_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "pending", label: "En revisión" },
  { value: "completed", label: "Acreditados" },
  { value: "rejected", label: "Rechazados" },
];
