import type { StateCreator } from 'zustand';
import type { Transaction } from '../../types/transaction';

export interface transactionSlice {
    transactions: Transaction[];

    numStocks: number;
    percentOfCash: number;
    tradeFee: number;
    cashAmount: number;
    cashFee: number;
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

const saveTransactions = (transactions: Transaction[]) => {
    const commitedTransactions = transactions.filter((t) => t.committed === true)
    localStorage.setItem("transactions", JSON.stringify(commitedTransactions));
};

export const createTransactionSlice: StateCreator<transactionSlice, [], [], transactionSlice> = (set) => ({
    transactions: (() => {
        const saved = JSON.parse(localStorage.getItem("transactions") || "[]") as Transaction[];
        return saved.map((t) => ({ ...t, batchId: t.batchId ?? t.id ?? crypto.randomUUID() }));
    })(),

    numStocks: 1,
    percentOfCash: 20,
    tradeFee: 10,
    cashAmount: 100,
    cashFee: 10,
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
    setSelectedBatchId: (value: string | null) => {
        set((state) => {
            if (state.selectedBatchId === value) {
                return { selectedBatchId: null, selectedBatchCount: 0 };
            } else {
                const selectedBatchCount = state.transactions.filter((t) => t.batchId === value).length;
                return { selectedBatchId: value, selectedBatchCount };
            }
        }); 
    },
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
            return { 
                transactions: newTransactions,
                draftBatchCount: state.draftBatchCount + 1 
            };
        });
    },

    // Add transaction batch
    addTransactionBatch: (transactions: Transaction[]) => {
        set((state) => {
            const newTransactions = [...state.transactions, ...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            return { 
                transactions: newTransactions,
                draftBatchCount: state.draftBatchCount + transactions.length 
            };
        });
    },

    // Remove transaction
    removeTransaction: (transaction: Transaction) => {
        set((state) => {
            const newTransactions = state.transactions.filter((t) => t.id !== transaction.id);
            saveTransactions(newTransactions);
            
            let nextDraftBatchCount = state.draftBatchCount;
            if (transaction.batchId === "Preview") {
                nextDraftBatchCount -= 1;
            }

            let nextSelectedBatchCount = state.selectedBatchCount;
            let nextSelectedBatchId = state.selectedBatchId;
            if (transaction.batchId === state.selectedBatchId) {
                nextSelectedBatchCount -= 1;
                if (nextSelectedBatchCount === 0) {
                    nextSelectedBatchId = null;
                }
            }

            return { 
                transactions: newTransactions,
                draftBatchCount: nextDraftBatchCount,
                selectedBatchId: nextSelectedBatchId,
                selectedBatchCount: nextSelectedBatchCount
            };
        });
    },

    // Remove transaction batch
    removeTransactionBatch: (batchId: string) => {
        set((state) => {
            const newTransactions = state.transactions.filter((t) => t.batchId !== batchId);
            saveTransactions(newTransactions);
            
            let nextDraftBatchCount = state.draftBatchCount;
            if (batchId === "Preview") {
                nextDraftBatchCount = 0;
            }

            let nextSelectedBatchCount = state.selectedBatchCount;
            let nextSelectedBatchId = state.selectedBatchId;
            if (batchId === state.selectedBatchId) {
                nextSelectedBatchCount = 0;
                nextSelectedBatchId = null;
            }

            return { 
                transactions: newTransactions,
                draftBatchCount: nextDraftBatchCount,
                selectedBatchId: nextSelectedBatchId,
                selectedBatchCount: nextSelectedBatchCount
            };
        });
    },

    // Commit transaction
    commitTransaction: (transaction: Transaction) => {
        set((state) => {
            const newBatchId = crypto.randomUUID();
            const newTransactions = state.transactions.map((t) => t.id === transaction.id ? { ...t, batchId: newBatchId, committed: true } : t);
            saveTransactions(newTransactions);
            return { 
                transactions: newTransactions,
                draftBatchCount: state.draftBatchCount - 1 
            };
        });
    },

    // Commit transaction batch
    commitTransactionBatch: (batchId: string) => {
        set((state) => {
            const newBatchId = crypto.randomUUID();
            const newTransactions = state.transactions.map((t) => t.batchId === batchId ? { ...t, batchId: newBatchId, committed: true } : t);
            saveTransactions(newTransactions);
            return { transactions: newTransactions, draftBatchCount: 0 };
        });
    },
});