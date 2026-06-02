import { type Transaction } from "./transactionType"

export interface LedgerEntry {
    transaction: Transaction;
    currentCash: number;
    currentAssets: Record<string, number>;
    executionAmount?: number;
    executionPrice?: number;
    executionCash?: number;
    error: boolean;
    errorMessage?: string;
    ignore: boolean;
}