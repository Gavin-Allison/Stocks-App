import { create } from 'zustand';
import { FetchStockData } from '../services/stockData';
import type { Transaction } from '../types/transaction';

interface AppState {
  // Portfolio data
  symbols: string[];
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
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  symbols: JSON.parse(localStorage.getItem("stockList") || '["RY.TO", "BNS.TO", "CM.TO"]'),
  priceData: [],
  transactions: JSON.parse(localStorage.getItem("transactions") || "[]"),
  reportTab: 'Tutorial',
  date: new Date().toISOString().split('T')[0],
  selectedStock: '',

  // Initialize portfolio data
  initialize: async () => {
    const { symbols } = get();
    const data: { symbol: string; data: Record<string, number> }[] = [];
    for (const symbol of symbols) {
      const fetchedData = await FetchStockData(symbol);
      data.push({ symbol, data: fetchedData });
    }
    set({ priceData: data });
  },

  // Add stock
  addStock: async (ticker: string) => {
    const symbol = ticker.toUpperCase().trim();
    const { symbols } = get();
    if (symbols.includes(symbol)) return;

    const data = await FetchStockData(symbol);
    set((state) => {
      const newSymbols = [...state.symbols, symbol];
      localStorage.setItem("stockList", JSON.stringify(newSymbols));
      return {
        symbols: newSymbols,
        priceData: [...state.priceData, { symbol, data }],
        selectedStock: symbol,
      };
    });
  },

  // Remove stock
  removeStock: (symbol: string) => {
    set((state) => {
      const newSymbols = state.symbols.filter((s) => s !== symbol);
      const newPriceData = state.priceData.filter((p) => p.symbol !== symbol);
      let newSelectedStock = state.selectedStock;
      
      if (state.selectedStock === symbol) {
        // If we're removing the selected stock, select the first remaining stock or empty string
        newSelectedStock = newSymbols.length > 0 ? newSymbols[0] : '';
      }
      
      localStorage.setItem("stockList", JSON.stringify(newSymbols));
      return {
        symbols: newSymbols,
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
}));
