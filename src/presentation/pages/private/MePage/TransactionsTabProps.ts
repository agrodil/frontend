import type { UseMyTransactionsResult } from "@/adapters/hooks/actions/useMyTransactions";
import type { PurchaseRequest } from "@/api/interfaces/responses/PurchaseRequest.interface";

export interface TransactionsTabProps {
  transactions: UseMyTransactionsResult;
  onSelectTransaction: (transaction: PurchaseRequest) => void;
}
