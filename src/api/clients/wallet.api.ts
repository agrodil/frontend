import { fetchWithAuth } from "../fetchWithAuth";
import type { DepositStatus } from "@/shared/constants/deposit-status.catalog";
import type {
  WalletTransactionType,
} from "@/shared/constants/wallet-transaction-type.catalog";
import type { WalletDebitKind } from "@/shared/constants/wallet-debit-kind.catalog";
import type { BankAccountType } from "@/shared/constants/bank-account-type.catalog";

// ── Tipos de respuesta (filas del backend: snake_case; NUMERIC como string) ──

export interface UserWalletRow {
  user_wallet_id: string;
  app_user_id: string;
  balance: string; // USD, moneda contable; puede ser negativo (sobregiro)
  created_at: string;
  updated_at: string;
}

export interface BankAccountRow {
  bank_account_id: string;
  account_type: BankAccountType;
  account_name: string;
  bank_name: string | null;
  account_number: string | null; // presente en transfer
  phone_number: string | null; // presente en mobile_payment
  cedula: string | null; // presente en mobile_payment
  bank_code: string | null; // presente en mobile_payment
  created_at: string;
  updated_at: string;
}

export interface WalletTransactionRow {
  wallet_transaction_id: string;
  user_wallet_id: string;
  app_user_id: string;
  transaction_type: WalletTransactionType;
  deposit_receipt_id: string | null;
  post_id: string | null;
  debit_kind: WalletDebitKind | null;
  posting_fee_id: string | null;
  usd_rate_history_id: string;
  usd_rate: string;
  usd_amount: string;
  bs_amount: string;
  details: string;
  created_by: string | null;
  created_at: string;
}

export type DepositMethod = "cash" | "transfer" | "mobile_payment";

export interface DepositReceiptDetailRow {
  deposit_receipt_id: string;
  app_user_id: string;
  bank_account_id: string | null;
  reference_number: string | null;
  deposit_method: DepositMethod;
  deposit_status: DepositStatus;
  deposit_receipt_image_url: string | null;
  usd_rate_history_id: string;
  amount_usd: string;
  amount_bs: string;
  created_at: string;
  updated_at: string;
  depositor_name?: string;
}

export interface WalletPagination {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export interface WalletTransactionListResult {
  items: WalletTransactionRow[];
  pagination: WalletPagination;
}

export interface DepositListResult {
  items: DepositReceiptDetailRow[];
  pagination: WalletPagination;
}

export interface DepositResult {
  depositReceiptId: string;
  status: "pending" | "completed";
}

// Resultado de aprobar/rechazar un comprobante o de reclamar un huérfano.
// `transaction` es null cuando se rechazó.
export interface DepositReviewResult {
  deposit: DepositReceiptDetailRow;
  wallet: UserWalletRow;
  transaction: WalletTransactionRow | null;
}

export interface AdjustmentResult {
  wallet: UserWalletRow;
  transaction: WalletTransactionRow | null;
}

export interface CreateBankAccountInput {
  account_type: BankAccountType;
  account_name: string;
  bank_name?: string;
  account_number?: string; // requerido para transfer
  phone_number?: string; // requerido para mobile_payment
  cedula?: string; // requerido para mobile_payment
  bank_code?: string; // requerido para mobile_payment
}

// ── Conciliación contra extracto ──

export interface StatementRow {
  reference: string;
  amountBs: number;
  date?: string;
  description?: string;
}

export interface ApplyItemResult {
  deposit_receipt_id: string;
  status: "applied" | "skipped" | "error";
  message?: string;
}

export interface ReconciliationReport {
  toAutoApprove: string[];
  amountMismatch: {
    deposit_receipt_id: string;
    reference: string;
    dbAmountBs: number;
    statementAmountBs: number;
  }[];
  matchedByAmount: {
    deposit_receipt_id: string;
    reference: string;
    amountBs: number;
    statementReference: string;
  }[];
  ambiguousAmount: {
    deposit: { deposit_receipt_id: string; reference: string; amountBs: number };
    candidates: { reference: string; amountBs: number }[];
  }[];
  unmatchedPending: {
    deposit_receipt_id: string;
    reference: string;
    amountBs: number;
  }[];
  toRevert: {
    deposit_receipt_id: string;
    reference: string;
    amountBs: number;
  }[];
  rejectedButInStatement: { deposit_receipt_id: string; reference: string }[];
  orphanInStatement: StatementRow[];
}

export interface StatementReconciliationResult {
  statement: { rows: StatementRow[]; count: number };
  report: ReconciliationReport;
  approve: ApplyItemResult[];
  revert: ApplyItemResult[];
  summary: { applied: number; skipped: number; error: number; total: number };
}

export interface ClaimOrphanInput {
  bankAccountId: string;
  appUserId: string;
  reference: string;
  amountBs: number;
  date?: string;
}

// ── Helper de respuesta (desenvuelve { data } y traduce errores comunes) ──

async function readData<T>(response: Response, ctx: string): Promise<T> {
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (response.status === 429) {
      throw new Error("Demasiados intentos seguidos, espera unos segundos.");
    }
    if (response.status === 501) {
      throw new Error("Método de depósito no disponible.");
    }
    throw new Error(
      `[wallet.${ctx}] (${response.status})${body ? `: ${body}` : ""}`,
    );
  }
  const json = await response.json();
  return (json.data ?? json) as T;
}

// ── Usuario ────────────────────────────────────────────────────────────────

export const walletApi = {
  // Saldo de la cartera del usuario autenticado. 404 (sin cartera) → null.
  getWallet: async (): Promise<UserWalletRow | null> => {
    const response = await fetchWithAuth("/wallet");
    if (response.status === 404) return null;
    return readData(response, "getWallet");
  },

  // Cuentas propias donde depositar, filtradas por tipo.
  getBankAccounts: async (
    type: BankAccountType,
  ): Promise<BankAccountRow[]> => {
    const response = await fetchWithAuth(`/wallet/bank-accounts?type=${type}`);
    return readData(response, "getBankAccounts");
  },

  // Alta de comprobante de pago móvil (multipart). El motor OCR decide si
  // auto-aprueba (status "completed") o lo deja "pending" para revisión.
  createDeposit: async (fd: FormData): Promise<DepositResult> => {
    const response = await fetchWithAuth("/wallet/deposit", {
      method: "POST",
      body: fd,
    });
    return readData(response, "createDeposit");
  },

  // Historial del ledger (movimientos ya acreditados). `type` opcional.
  getTransactions: async (params: {
    type?: WalletTransactionType | null;
    limit: number;
    offset: number;
  }): Promise<WalletTransactionListResult> => {
    const qs = new URLSearchParams({
      limit: String(params.limit),
      offset: String(params.offset),
    });
    if (params.type) qs.set("type", params.type);
    const response = await fetchWithAuth(`/transactions?${qs}`);
    return readData(response, "getTransactions");
  },

  getTransaction: async (id: string): Promise<WalletTransactionRow> => {
    const response = await fetchWithAuth(`/transactions/${id}`);
    return readData(response, "getTransaction");
  },

  // Mis comprobantes de depósito (incluye los "pending" que aún no están en el
  // ledger). `status` opcional.
  getMyDeposits: async (params: {
    status?: DepositStatus | null;
    limit: number;
    offset: number;
  }): Promise<DepositListResult> => {
    const qs = new URLSearchParams({
      limit: String(params.limit),
      offset: String(params.offset),
    });
    if (params.status) qs.set("status", params.status);
    const response = await fetchWithAuth(`/wallet/deposits/mine?${qs}`);
    return readData(response, "getMyDeposits");
  },

  // ── Admin ────────────────────────────────────────────────────────────────

  // Cola de comprobantes para revisión manual. `status` opcional.
  listDeposits: async (params: {
    status?: DepositStatus | null;
    limit: number;
    offset: number;
  }): Promise<DepositListResult> => {
    const qs = new URLSearchParams({
      limit: String(params.limit),
      offset: String(params.offset),
    });
    if (params.status) qs.set("status", params.status);
    const response = await fetchWithAuth(`/wallet/deposits?${qs}`);
    return readData(response, "listDeposits");
  },

  // Aprueba (acredita la cartera) o rechaza un comprobante pendiente.
  reviewDeposit: async (
    id: string,
    status: "completed" | "rejected",
  ): Promise<DepositReviewResult> => {
    const response = await fetchWithAuth(`/wallet/deposits/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (response.status === 409) {
      throw new Error("Este depósito ya fue procesado.");
    }
    return readData(response, "reviewDeposit");
  },

  // Ajuste manual de saldo (usd_amount firmado; el backend calcula los Bs).
  createAdjustment: async (input: {
    appUserId: string;
    usdAmount: number;
    reason: string;
  }): Promise<AdjustmentResult> => {
    const response = await fetchWithAuth("/wallet/adjustments", {
      method: "POST",
      body: JSON.stringify({
        app_user_id: input.appUserId,
        usd_amount: input.usdAmount,
        reason: input.reason,
      }),
    });
    return readData(response, "createAdjustment");
  },

  // Saldo de la cartera de cualquier usuario.
  getUserWallet: async (userId: string): Promise<UserWalletRow> => {
    const response = await fetchWithAuth(`/wallet/${userId}`);
    return readData(response, "getUserWallet");
  },

  createBankAccount: async (
    input: CreateBankAccountInput,
  ): Promise<BankAccountRow> => {
    const response = await fetchWithAuth("/wallet/bank-accounts", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (response.status === 409) {
      throw new Error("Ya existe una cuenta con esa identidad.");
    }
    return readData(response, "createBankAccount");
  },

  deleteBankAccount: async (id: string): Promise<void> => {
    const response = await fetchWithAuth(`/wallet/bank-accounts/${id}`, {
      method: "DELETE",
    });
    if (response.status === 409) {
      throw new Error(
        "La cuenta tiene comprobantes asociados y no se puede eliminar.",
      );
    }
    await readData(response, "deleteBankAccount");
  },

  // Sube el XLSX del extracto y aplica auto-aprobaciones + reversas. La
  // respuesta trae el diagnóstico completo + lo ejecutado.
  runReconciliation: async (
    fd: FormData,
  ): Promise<StatementReconciliationResult> => {
    const response = await fetchWithAuth("/wallet/reconciliation", {
      method: "POST",
      body: fd,
    });
    return readData(response, "runReconciliation");
  },

  // Registra + acredita un pago del extracto que no tiene comprobante.
  claimOrphan: async (
    input: ClaimOrphanInput,
  ): Promise<DepositReviewResult> => {
    const body: Record<string, unknown> = {
      bank_account_id: input.bankAccountId,
      app_user_id: input.appUserId,
      reference: input.reference,
      amount_bs: input.amountBs,
    };
    if (input.date) body.date = input.date;
    const response = await fetchWithAuth("/wallet/reconciliation/claim", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (response.status === 409) {
      throw new Error("Este comprobante ya fue reclamado.");
    }
    if (response.status === 404) {
      throw new Error("Cuenta o usuario no encontrado.");
    }
    return readData(response, "claimOrphan");
  },
};
