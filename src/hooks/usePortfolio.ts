import { useSyncExternalStore } from "react";

import { transactionStore } from "../stores/transactionStore";
import { stockStore } from "../stores/stocksStore";
import type { Transaction } from "../types/transaction";

export const usePortfolio = () => {
    // Saved symbols, tells system what stocks to use
    const symbols = useSyncExternalStore(
        stockStore.subscribe,
        stockStore.getSymbols
    );

    // Saved data for each symbol
    const priceData = useSyncExternalStore(
        stockStore.subscribe,
        stockStore.getPriceData
    );

    // Shared list of transactions for the user
    const transactions = useSyncExternalStore(
        transactionStore.subscribe,
        transactionStore.getTransactions
    );

    // Add stock to list
    const addStock = async (ticker: string) => {
        await stockStore.addStock(ticker);
    };

    // Remove stock from list
    const removeStock = (symbol: string) => {
        stockStore.removeStock(symbol);
    };

    // Add transaction to list
    const addTransaction = (transaction: Transaction) => {
        transactionStore.addTransaction(transaction);
    };

    // Remove transaction from list
    const removeTransaction = (transaction: Transaction) => {
        transactionStore.removeTransaction(transaction);
    };

    return { 
        symbols, 
        priceData, 
        addStock, 
        removeStock, 
        transactions, 
        addTransaction, 
        removeTransaction 
    };
};