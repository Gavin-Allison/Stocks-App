import type { StateCreator } from 'zustand';
import { FetchStockData } from '../../services/getStockData';
import type { Stock } from '../../types/stock'

const defaultStocks: Stock[] = [
    { ticker: "RY.TO", color: "hsl(210, 100%, 50%)" },
    { ticker: "BMO.TO", color: "hsl(0, 92%, 49%)" },
    { ticker: "CM.TO", color: "hsl(30, 79%, 49%)" },
];

export interface mainSlice {
    // portfolio data
    stocks: Stock[];
    priceData: { symbol: string; data: Record<string, number> }[];

    // UI state
    reportTab: string;
    date: string;
    selectedStock: string;

    // Actions
    initialize: () => Promise<void>;
    addStock: (symbol: string) => Promise<void>;
    removeStock: (symbol: string) => void;

    setReportTab: (tab: string) => void;
    setDate: (date: string) => void;
    setSelectedStock: (stock: string) => void;
    getStockPriceAtDate: (ticker: string, date: string) => number | null;
}

export const createMainSlice: StateCreator<mainSlice, [], [], mainSlice> = (set, get) => ({
    // Initial state
    stocks: JSON.parse(localStorage.getItem("stockList") || JSON.stringify(defaultStocks)),
    priceData: [],
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

    // UI actions
    setReportTab: (tab) => set({ reportTab: tab }),
    setDate: (date) => set({ date }),
    setSelectedStock: (stock) => set({ selectedStock: stock }),
    
    getStockPriceAtDate: (ticker: string, date: string) => {
        const { priceData } = get();
        const stockData = priceData.find((p) => p.symbol === ticker);
        return stockData ? stockData.data[date] : null;
    },
});