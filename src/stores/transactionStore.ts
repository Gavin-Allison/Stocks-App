import type { Transaction } from "../types/transaction";

let transactions: Transaction[] = JSON.parse(localStorage.getItem("transactions") || "[]");
const listeners = new Set<() => void>();

export const transactionStore = {
    // Getters
    getTransactions() {
        return transactions;
    },

    // Subscription logic for React
    subscribe(listener: () => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    // Add transaction to list
    addTransaction(transaction: Transaction) {
        const index = transactions.findIndex(t => t.date > transaction.date);

        if (index === -1) {
            transactions = [...transactions, transaction];
        } else {
            transactions = [
                ...transactions.slice(0, index),
                transaction,
                ...transactions.slice(index)
            ];
        }
        this.emitChange();
    },

    // Remove transaction from list
    removeTransaction(transaction: Transaction) {
        transactions = transactions.filter(t => t.id !== transaction.id);
        this.emitChange();
    },

    emitChange() {
        localStorage.setItem("transactions", JSON.stringify(transactions));
        listeners.forEach(l => l());
    }
};