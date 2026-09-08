// Sub-tipo de un movimiento 'debit'. Coincide con el enum debit_kind del
// backend. Solo aplica a filas 'debit' (null en deposit / adjustment).
export type WalletDebitKind = "publish" | "renewal";

export const WALLET_DEBIT_KIND_LABELS: Record<WalletDebitKind, string> = {
  publish: "Publicación",
  renewal: "Renovación",
};
