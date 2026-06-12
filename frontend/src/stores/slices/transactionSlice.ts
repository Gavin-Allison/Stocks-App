import type { StateCreator } from 'zustand';
import type { Transaction } from '../../types/transactionType';
import { fetchCreateTransaction, removeTransaction } from '../../services/apiDB';
import { fetchPromptResponse } from '../../services/apiAI';

// Tell this file what external fields it's allowed to expect
interface MainSliceDependencies {
    selectedStock: string;
    date: string;
    priceData: { symbol: string; data: Record<string, number> }[];
}

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
    tradeOrCash: "TRADE" | "CASH" | "AI";
    fixedOrDynamic: "FIXED" | "DYNAMIC";
    repeatScheduleOpen: boolean;
    repeatFrequency: "NONE" | "YEARLY" | "MONTHLY" | "EVERY_X_DAYS";
    repeatIntervalDays: number;
    repeatOccurrences: number;
    currentPrice: number;
    errorMessage?: string;
    prompt: string;
    promptResponse: string;
    promptLoading: boolean;

    setNumStocks: (value: number) => void;
    setRepeatScheduleOpen: (open: boolean) => void;
    setPercentOfCash: (value: number) => void;
    setTradeFee: (value: number) => void;
    setCashAmount: (value: number) => void;
    setCashFee: (value: number) => void;
    setSelectedBatchId: (value: string | null) => void;
    setTradeOrCash: (value: "TRADE" | "CASH" | "AI") => void;
    setFixedOrDynamic: (value: "FIXED" | "DYNAMIC") => void;
    setCurrentPrice: (value: number) => void;
    setRepeatFrequency: (frequency: "NONE" | "YEARLY" | "MONTHLY" | "EVERY_X_DAYS") => void;
    setRepeatIntervalDays: (value: number) => void;
    setRepeatOccurrences: (value: number) => void;
    setPromptLoading: (value: boolean) => void;

    addTransaction: (transaction: Transaction) => void;
    addTransactionBatch: (transactions: Transaction[]) => void;
    removeTransaction: (transaction: Transaction) => Promise<void>;
    removeTransactionBatch: (batchId: string) => Promise<void>;
    setPrompt: (newPrompt: string) => void;
    getPromptResponse: (prompt: string) => Promise<void>;
    commitTransaction: (transaction: Transaction) => Promise<void>;
    commitTransactionBatch: (batchId: string) => Promise<void>;
}

/**
 * Persist only committed transactions to local storage when operating offline.
 */
const saveTransactions = (transactions: Transaction[]) => {
    const commitedTransactions = transactions.filter((t) => t.committed === true);
    localStorage.setItem("transactions", JSON.stringify(commitedTransactions));
};

/**
 * Transaction state slice for creating, updating, committing, removing,
 * and generating transactions, including AI transactions and repeat scheduling.
 */
export const createTransactionSlice: StateCreator<transactionSlice & MainSliceDependencies, [], [], transactionSlice> = (set, get) => ({
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
    repeatScheduleOpen: false,
    currentPrice: 0,
    repeatFrequency: "NONE",
    repeatIntervalDays: 1,
    repeatOccurrences: 1,
    errorMessage: undefined,
    prompt: "",
    promptResponse: "",
    promptLoading: false,

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
    setTradeOrCash: (value: "TRADE" | "CASH" | "AI") => set({ tradeOrCash: value }),
    setFixedOrDynamic: (value: "FIXED" | "DYNAMIC") => set({ fixedOrDynamic: value }),
    setCurrentPrice: (value: number) => set({ currentPrice: value }),
    setRepeatScheduleOpen: (open: boolean) => set({ repeatScheduleOpen: open }),
    setRepeatFrequency: (frequency) => set({ repeatFrequency: frequency }),
    setRepeatIntervalDays: (value: number) => set({ repeatIntervalDays: value }),
    setRepeatOccurrences: (value: number) => set({ repeatOccurrences: value }),
    setPromptLoading: (value: boolean) => set({ promptLoading: value }),

    /**
     * Insert a single transaction into the ledger, preserving chronological order.
     */
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

    /**
     * Insert a batch of transactions into the ledger and sort by date.
     */
    addTransactionBatch: (transactions: Transaction[]) => {
        set((state) => {
            const newTransactions = [...state.transactions, ...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            return { 
                transactions: newTransactions,
                draftBatchCount: state.draftBatchCount + transactions.length 
            };
        });
    },

    /**
     * Remove an individual transaction and keep local or server state in sync.
     */
    removeTransaction: async (transaction: Transaction) => {
        const email = localStorage.getItem("userEmail");

        if (email && transaction.committed) {
            try {
                await removeTransaction(transaction.id);
            } catch (err) {
                console.error("Failed to delete transaction from DB", err);
            }
        }

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

    /**
     * Remove all transactions in a batch, handling both local and remote deletion.
     */
    removeTransactionBatch: async (batchId: string) => {
        const email = localStorage.getItem("userEmail");
        const toRemove = get().transactions.filter(t => t.batchId === batchId);

        if (email) {
            await Promise.all(toRemove.map(async (t) => {
                if (t.committed) {
                    try {
                        await removeTransaction(t.id);
                    } catch (err) {
                        console.error("Failed to delete batch transaction from DB", err);
                    }
                }
            }));
        }

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


    setPrompt: (newPrompt: string) => set({ prompt: newPrompt}),
    /**
     * Send the prompt to the AI backend and add the resulting draft transactions.
     */
    getPromptResponse: async (prompt: string) => {
        try {
            const { 
                selectedStock, 
                date, 
                priceData, 
                addTransaction, 
                addTransactionBatch 
            } = get();

            set({ promptLoading: true, promptResponse: "" });
            
            const stockData = priceData.find((p) => p.symbol === selectedStock)?.data ?? {};
            const response = await fetchPromptResponse({
                prompt,
                selectedStock,
                priceData: stockData,
                date,
            });

            console.log("AI Response:", response);

            if (!Array.isArray(response)) {
                set({ promptResponse: `AI did not return a transaction list: ${JSON.stringify(response)}` });
                return;
            }

            const normalizedTransactions = response.map((t) => ({
                ...t,
                id: crypto.randomUUID(),
                batchId: t.batchId ?? "Preview",
                committed: false,
            }));

            if (normalizedTransactions.length === 1) {
                addTransaction(normalizedTransactions[0]);
            } else if (normalizedTransactions.length > 1) {
                addTransactionBatch(normalizedTransactions);
            }

            set({ promptResponse: `AI added ${normalizedTransactions.length} draft transaction(s).` });
        } catch (err) {
            console.error("Failed to fetch AI transactions:", err);
            set({ promptResponse: err instanceof Error ? err.message : String(err) });
        } finally {
            set({ promptLoading: false });
        }
    },

    /**
     * Commit a draft transaction to the backend database and mark it committed.
     */
    commitTransaction: async (transaction: Transaction) => {
        const email = localStorage.getItem("userEmail");
        const currentExperiment = (get() as any).currentExperiment || "Default";
        
        if (email) {
            const { date, type, id, batchId, committed, ...rawDetails } = transaction;
            let ticker = null;
            
            if ('ticker' in rawDetails) {
                ticker = (rawDetails as any).ticker;
                delete (rawDetails as any).ticker;
            }

            try {
                const newBatchId = crypto.randomUUID();
                await fetchCreateTransaction(email, currentExperiment, id, ticker, date, type, rawDetails, newBatchId);
           
                set((state) => {
                    
                    const newTransactions = state.transactions.map((t) => 
                        t.id === transaction.id ? { ...t, batchId: newBatchId, committed: true } : t
                    );
                    
                    saveTransactions(newTransactions);
                    
                    return { 
                        transactions: newTransactions,
                        draftBatchCount: state.draftBatchCount - 1 
                    };
                });
           
            } catch (err) {
                console.error("Failed to commit transaction to DB", err);
            }
        }
    },

    /**
     * Commit an entire draft batch of transactions to the backend and mark them committed.
     */
    commitTransactionBatch: async (batchId: string) => {
        const email = localStorage.getItem("userEmail");
        const currentExperiment = (get() as any).currentExperiment || "Default";
        const newBatchId = crypto.randomUUID();
        
        const toCommit = get().transactions.filter(t => t.batchId === batchId);

        if (email) {
            await Promise.all(toCommit.map(async (t) => {
                const { date, type, id, batchId: currentBatchId, committed, ...rawDetails } = t;
                let ticker = null;
                
                if ('ticker' in rawDetails) {
                    ticker = (rawDetails as any).ticker;
                    delete (rawDetails as any).ticker;
                }

                try {
                    await fetchCreateTransaction(email, currentExperiment, id, ticker, date, type, rawDetails, newBatchId);
                } catch (err) {
                    console.error("Failed to commit batch transaction", err);
                }
            }));
        }

        set((state) => {
            const newTransactions = state.transactions.map((t) => 
                t.batchId === batchId 
                    ? { ...t, batchId: newBatchId, committed: true } 
                    : t
            );
            
            saveTransactions(newTransactions);
            
            return { transactions: newTransactions, draftBatchCount: 0 };
        });
    },
});