import type { StateCreator } from 'zustand';
import type { Transaction } from '../../types/transaction';

export interface transactionSlice {
    transactions: Transaction[];

    numStocks: number;
    percentOfCash: number;
    tradeFee: number;
    cashAmount: number;
    cashFee: number;
    draftBatchId: string | null;
    draftBatchCount: number;
    selectedBatchId: string | null;
    selectedBatchCount: number;
    tradeOrCash: "TRADE" | "CASH";
    fixedOrDynamic: "FIXED" | "DYNAMIC";
    currentPrice: number;

    setNumStocks: (value: number) => void;
    setPercentOfCash: (value: number) => void;
    setTradeFee: (value: number) => void;
    setCashAmount: (value: number) => void;
    setCashFee: (value: number) => void;
    setDraftBatchId: (value: string | null) => void;
    setSelectedBatchId: (value: string | null) => void;
    setTradeOrCash: (value: "TRADE" | "CASH") => void;
    setFixedOrDynamic: (value: "FIXED" | "DYNAMIC") => void;
    setCurrentPrice: (value: number) => void;

    addTransaction: (transaction: Transaction) => void;
    addTransactionBatch: (transactions: Transaction[]) => void;
    removeTransaction: (transaction: Transaction) => void;
    removeTransactionBatch: (batchId: string) => void;
    commitTransaction: (transaction: Transaction) => void;
    commitTransactionBatch: (batchId: string) => void;
}

export const createTransactionSlice: StateCreator<transactionSlice, [], [], transactionSlice> = (set, get) => ({
    transactions: (() => {
        const saved = JSON.parse(localStorage.getItem("transactions") || "[]") as Transaction[];
        return saved.map((t) => ({ ...t, batchId: t.batchId ?? t.id ?? crypto.randomUUID() }));
    })(),

    numStocks: 1,
    percentOfCash: 20,
    tradeFee: 10,
    cashAmount: 100,
    cashFee: 10,
    draftBatchId: null,
    draftBatchCount: 0,
    selectedBatchId: null,
    selectedBatchCount: 0,
    tradeOrCash: "TRADE",
    fixedOrDynamic: "FIXED",
    currentPrice: 0,
    errorMessage: undefined,

    setNumStocks: (value: number) => set({ numStocks: value }),
    setPercentOfCash: (value: number) => set({ percentOfCash: value }),
    setTradeFee: (value: number) => set({ tradeFee: value }),
    setCashAmount: (value: number) => set({ cashAmount: value }),
    setCashFee: (value: number) => set({ cashFee: value }),
    setDraftBatchId: (value: string | null) => set({ draftBatchId: value }),
    setSelectedBatchId: (value: string | null) => set({ selectedBatchId: value }),
    setTradeOrCash: (value: "TRADE" | "CASH") => set({ tradeOrCash: value }),
    setFixedOrDynamic: (value: "FIXED" | "DYNAMIC") => set({ fixedOrDynamic: value }),
    setCurrentPrice: (value: number) => set({ currentPrice: value }),

    // Add transaction
    addTransaction: (transaction: Transaction) => {
        set((state) => {
            const index = state.transactions.findIndex(t => t.date > transaction.date);
            const newTransactions = index === -1
                ? [...state.transactions, transaction]
                : [
                    ...state.transactions.slice(0, index),
                    transaction,
                    ...state.transactions.slice(index)
                  ];
            state.draftBatchCount += 1;
            return { transactions: newTransactions };
        });
    },

    // Add transaction batch
    addTransactionBatch: (transactions: Transaction[]) => {
        set((state) => {
            const newTransactions = [...state.transactions, ...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            state.draftBatchCount += transactions.length;
            return { transactions: newTransactions };
        });
    },

    // Remove transaction
    removeTransaction: (transaction: Transaction) => {
        set((state) => {
            const newTransactions = state.transactions.filter((t) => t.id !== transaction.id);
            localStorage.setItem("transactions", JSON.stringify(newTransactions));
            state.draftBatchCount -= 1;
            return { transactions: newTransactions };
        });
    },

    // Remove transaction batch
    removeTransactionBatch: (batchId: string) => {
        set((state) => {
            const newTransactions = state.transactions.filter((t) => t.batchId !== batchId);
            localStorage.setItem("transactions", JSON.stringify(newTransactions));
            state.draftBatchCount -= state.transactions.filter((t) => t.batchId === batchId).length;
            return { transactions: newTransactions };
        });
    },

    // Commit transaction
    commitTransaction: (transaction: Transaction) => {
        set((state) => {
            const newTransactions = state.transactions.map((t) => t.id === transaction.id ? { ...t, committed: true } : t);
            localStorage.setItem("transactions", JSON.stringify(newTransactions));

            // If this was the last draft in the batch, clear the draftBatchId
            const remainingDrafts = state.transactions.filter(
                (t) => !t.committed && t.batchId === state.draftBatchId && t.id !== transaction.id
            );
            if (remainingDrafts.length === 0) {
                state.setDraftBatchId(null);
            }

            return { transactions: newTransactions };
        });
    },

    // Commit transaction batch
    commitTransactionBatch: (batchId: string) => {
        set((state) => {
            const newTransactions = state.transactions.map((t) => t.batchId === batchId ? { ...t, committed: true } : t);
            localStorage.setItem("transactions", JSON.stringify(newTransactions));
            if (batchId === state.draftBatchId) {
                state.setDraftBatchId(null);
            }
            if (batchId === state.selectedBatchId) {
                state.setSelectedBatchId(null);
            }
            return { transactions: newTransactions };
        });
    },
    
});