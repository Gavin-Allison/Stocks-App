import { create } from 'zustand';
import { FetchStockData } from '../services/stockData';
import type { Transaction } from '../types/transaction';

// Stock interface for saving
interface Stock {
    ticker: string;
    color: string;
}

const defaultStocks: Stock[] = [
    { ticker: "RY.TO", color: "hsl(210, 100%, 50%)" },
    { ticker: "BMO.TO", color: "hsl(0, 92%, 49%)" },
    { ticker: "CM.TO", color: "hsl(30, 79%, 49%)" },
];

interface AppState {
    // Portfolio data
    stocks: Stock[];
    priceData: { symbol: string; data: Record<string, number> }[];
    transactions: Transaction[];

    // UI state
    reportTab: string;
    date: string;
    selectedStock: string;

    // Actions
    initialize: () => Promise<void>;
    addStock: (symbol: string) => Promise<void>;
    removeStock: (symbol: string) => void;
    addTransaction: (transaction: Transaction) => void;
    removeTransaction: (transaction: Transaction) => void;
    setReportTab: (tab: string) => void;
    setDate: (date: string) => void;
    setSelectedStock: (stock: string) => void;
    getStockPriceAtDate: (ticker: string, date: string) => number | null;
}

export const useAppStore = create<AppState>((set, get) => ({
    // Initial state
    stocks: JSON.parse(localStorage.getItem("stockList") || JSON.stringify(defaultStocks)),
    priceData: [],
    transactions: (() => {
        const saved = JSON.parse(localStorage.getItem("transactions") || "[]") as Transaction[];
        return saved.map((t) => ({ ...t, batchId: t.batchId ?? t.id ?? crypto.randomUUID() }));
    })(),
    reportTab: 'Tutorial',
    date: new Date().toISOString().split('T')[0],
    selectedStock: '',

    // Initialize portfolio data
    initialize: async () => {
        const { stocks, selectedStock } = get();
        const data: { symbol: string; data: Record<string, number> }[] = [];
        for (const stock of stocks) {
            const fetchedData = await FetchStockData(stock.ticker);
            data.push({ symbol: stock.ticker, data: fetchedData });
        }
        
        // Set initial selected stock if not already set
        const newSelectedStock = !selectedStock && stocks.length > 0 ? stocks[0].ticker : selectedStock;
        set({ priceData: data, selectedStock: newSelectedStock });
    },

    // Add stock
    addStock: async (ticker: string) => {
        const stock = { ticker: ticker.toUpperCase().trim(), color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)` };
        const { stocks } = get();
        if (stocks.includes(stock)) return;
        const data = await FetchStockData(stock.ticker);
        set((state) => {
            const newStocks = [...state.stocks, stock];
            localStorage.setItem("stockList", JSON.stringify(newStocks));
            return {
                stocks: newStocks,
                priceData: [...state.priceData, { symbol: stock.ticker, data }],
                selectedStock: stock.ticker,
            };
        });
    },

    // Remove stock
    removeStock: (symbol: string) => {
        set((state) => {
            const newStocks = state.stocks.filter((s) => s.ticker !== symbol);
            const newPriceData = state.priceData.filter((p) => p.symbol !== symbol);
            let newSelectedStock = state.selectedStock;
            
            if (state.selectedStock === symbol) {
                // If we're removing the selected stock, select the first remaining stock or empty string
                newSelectedStock = newStocks.length > 0 ? newStocks[0].ticker : '';
            }
            
            localStorage.setItem("stockList", JSON.stringify(newStocks));
            return {
                stocks: newStocks,
                priceData: newPriceData,
                selectedStock: newSelectedStock,
            };
        });
    },

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
            localStorage.setItem("transactions", JSON.stringify(newTransactions));
            return { transactions: newTransactions };
        });
    },

    // Remove transaction
    removeTransaction: (transaction: Transaction) => {
        set((state) => {
            const newTransactions = state.transactions.filter((t) => t.id !== transaction.id);
            localStorage.setItem("transactions", JSON.stringify(newTransactions));
            return { transactions: newTransactions };
        });
    },

    // UI actions
    setReportTab: (tab) => set({ reportTab: tab }),
    setDate: (date) => set({ date }),
    setSelectedStock: (stock) => set({ selectedStock: stock }),
    
    getStockPriceAtDate: (ticker: string, date: string) => {
        const { priceData } = get();
        const stockData = priceData.find((p) => p.symbol === ticker);
        return stockData ? stockData.data[date] : null;
    },
}));
