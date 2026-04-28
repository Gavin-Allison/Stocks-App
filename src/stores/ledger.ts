import { type Transaction } from "../types/transaction"

export interface LedgerEntry {
    transaction: Transaction;
    currentCash: number;
    currentAssets: number;
    error?: string
}

export const validateLedger = (): void => {
    // TODO: function that performs and validates all transactions 
}
    
    