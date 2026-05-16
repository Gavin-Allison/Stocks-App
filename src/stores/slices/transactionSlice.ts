import type { StateCreator } from 'zustand';

export interface transactionSlice {
    numStocks: number;
    percentOfCash: number;
    tradeFee: number;
    cashAmount: number;
    cashFee: number;
    draftBatchId: string | null;
    selectedBatchId: string | null;
    tradeOrCash: "TRADE" | "CASH";
    fixedOrDynamic: "FIXED" | "DYNAMIC";

    setNumStocks: (value: number) => void;
    setPercentOfCash: (value: number) => void;
    setTradeFee: (value: number) => void;
    setCashAmount: (value: number) => void;
    setCashFee: (value: number) => void;
    setDraftBatchId: (value: string | null) => void;
    setSelectedBatchId: (value: string | null) => void;
    setTradeOrCash: (value: "TRADE" | "CASH") => void;
    setFixedOrDynamic: (value: "FIXED" | "DYNAMIC") => void;
    
}

export const createTransactionSlice: StateCreator<transactionSlice, [], [], transactionSlice> = (set, get) => ({
    numStocks: 1,
    percentOfCash: 20,
    tradeFee: 10,
    cashAmount: 100,
    cashFee: 10,
    draftBatchId: null,
    selectedBatchId: null,
    tradeOrCash: "TRADE",
    fixedOrDynamic: "FIXED",

    setNumStocks: (value: number) => set({ numStocks: value }),
    setPercentOfCash: (value: number) => set({ percentOfCash: value }),
    setTradeFee: (value: number) => set({ tradeFee: value }),
    setCashAmount: (value: number) => set({ cashAmount: value }),
    setCashFee: (value: number) => set({ cashFee: value }),
    setDraftBatchId: (value: string | null) => set({ draftBatchId: value }),
    setSelectedBatchId: (value: string | null) => set({ selectedBatchId: value }),
    setTradeOrCash: (value: "TRADE" | "CASH") => set({ tradeOrCash: value }),
    setFixedOrDynamic: (value: "FIXED" | "DYNAMIC") => set({ fixedOrDynamic: value }),
});