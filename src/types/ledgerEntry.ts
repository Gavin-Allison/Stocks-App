import { type Transaction } from "../types/transaction"

export interface LedgerEntry {
    transaction: Transaction;
    currentCash: number;
    currentAssets: Record<string, number>;
    error: boolean;
    errorMessage?: string;
    ignore: boolean;
}