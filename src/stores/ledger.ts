import { type LedgerEntry } from "../types/ledgerEntry";
import { type Transaction } from "../types/transaction"

export const validateLedger = (transactions: Transaction[]): LedgerEntry[] => {
    // Perform and validate all transactions

    let cash = 0;
    const assets: Record<string, number> = {};
    let error = false;
    let errorMessage: string | undefined;

    return transactions.map((t) => {
        // When a transaction errors do not worry about transactions that come after
        if (!error) {
            switch(t.type) {
                case "DEPOSIT":
                    cash += t.amount - t.fees
                    break;
                case "WITHDRAWAL":
                    cash -= t.amount - t.fees
                    if (cash < 0) {
                        error = true
                        errorMessage = "Withdrawing cash that you don't have"
                    }
                    break;
            }

            
        }

        return {
            transaction: t,
            currentCash: cash,
            currentAssets: assets,
            error: error,
            errorMessage: errorMessage
        };
    });
}
    
    