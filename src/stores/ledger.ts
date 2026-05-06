import { type LedgerEntry } from "../types/ledgerEntry";
import { type Transaction } from "../types/transaction"

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
    
    