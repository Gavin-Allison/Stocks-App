import { type Transaction } from "../types/transaction"

export interface LedgerEntry {
    transaction: Transaction;
    currentCash: number;
    currentAssets: Record<string, number>;
    error?: string
}

export const validateLedger = (transactions: Transaction[]): LedgerEntry[] => {
    // Perform and validate all transactions

    let cash = 0;
    const assets: Record<string, number> = {};
    let errorMessage: string | undefined;
    return transactions.map((t) => {
        return {
            transaction: t,
            currentCash: cash,
            currentAssets: assets,
            error: errorMessage
        };
    });
}
    
    