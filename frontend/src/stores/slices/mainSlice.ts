import type { StateCreator } from 'zustand';
import { FetchStockData } from '../../services/getStockData';
import type { Stock } from '../../types/stockType';
import type { Transaction } from '../../types/transactionType';
import { loadDashboard, addStockToTab } from '../../services/getDB';
import { removeStockFromTab } from '../../services/apiDB';

export interface mainSlice {
    stocks: Stock[];
    priceData: { symbol: string; data: Record<string, number> }[];
    transactions: Transaction[]; 
    reportTab: string;
    date: string;
    selectedStock: string;
    currentExperiment: string;
    experiments: string[];
    initialize: () => Promise<void>;
    addStock: (symbol: string) => Promise<void>;
    removeStock: (symbol: string) => Promise<void>; 
    setReportTab: (tab: string) => void;
    setDate: (date: string) => void;
    setSelectedStock: (stock: string) => void;
    getStockPriceAtDate: (ticker: string, date: string) => number | null;
    addExperiment: (experiment: string) => void;
    removeExperiment: (experiment: string) => void;
    swapExperiment: (experiment: string) => Promise<void>; 
}

export const createMainSlice: StateCreator<mainSlice, [], [], mainSlice> = (set, get) => ({
    stocks: JSON.parse(localStorage.getItem("stockList") || JSON.stringify([])),
    priceData: [],
    transactions: [],
    reportTab: 'Tutorial',
    date: new Date().toISOString().split('T')[0],
    selectedStock: '',
    currentExperiment: "Default",
    experiments: ["Default"],

    initialize: async () => {
        const email = localStorage.getItem('userEmail');
        let initialExperiment = get().currentExperiment;

        if (email) {
            try {
                const dbData = await loadDashboard(initialExperiment);
                
                const safeExperimentList = dbData.experimentList || [];
                const newExperiments = safeExperimentList.length > 0 
                    ? safeExperimentList 
                    : [initialExperiment];
                
                const activeStocks = dbData.activeStocks.map((ticker: string) => ({
                    ticker,
                    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
                }));

                const data: { symbol: string; data: Record<string, number> }[] = [];
                for (const stock of activeStocks) {
                    const fetchedData = await FetchStockData(stock.ticker);
                    data.push({ symbol: stock.ticker, data: fetchedData });
                }

                const formattedTransactions = (dbData.transactions || []).map((t: any) => ({
                    ...t,
                    ...t.details,
                    id: String(t.id),
                    date: t.transaction_date ? t.transaction_date.split('T')[0] : t.date,
                    batchId: t.batch_id ?? String(t.id) ?? crypto.randomUUID(),
                    committed: true 
                })) as Transaction[];

                const newSelectedStock = activeStocks.length > 0 ? activeStocks[0].ticker : '';

                set({ 
                    stocks: activeStocks, 
                    priceData: data, 
                    transactions: formattedTransactions,
                    experiments: newExperiments,
                    selectedStock: newSelectedStock 
                });
                return; 
            } catch (err) {
                console.error(err);
            }
        }

        const { stocks, selectedStock } = get();
        const data: { symbol: string; data: Record<string, number> }[] = [];
        for (const stock of stocks) {
            const fetchedData = await FetchStockData(stock.ticker);
            data.push({ symbol: stock.ticker, data: fetchedData });
        }
        const newSelectedStock = !selectedStock && stocks.length > 0 ? stocks[0].ticker : selectedStock;
        set({ priceData: data, selectedStock: newSelectedStock });
    },

    addStock: async (ticker: string) => {
        const cleanTicker = ticker.toUpperCase().trim();
        const { stocks, currentExperiment } = get();
        
        if (stocks.some(s => s.ticker === cleanTicker)) return;

        const email = localStorage.getItem('userEmail');
        if (email) {
            await addStockToTab(currentExperiment, cleanTicker);
        }

        const newStock = { ticker: cleanTicker, color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)` };
        const data = await FetchStockData(cleanTicker);
        
        set((state) => {
            const newStocks = [...state.stocks, newStock];
            if (!email) localStorage.setItem("stockList", JSON.stringify(newStocks));
            
            return {
                stocks: newStocks,
                priceData: [...state.priceData, { symbol: cleanTicker, data }],
                selectedStock: cleanTicker,
            };
        });
    },

    removeStock: async (symbol: string) => {
        const email = localStorage.getItem('userEmail');
        const { currentExperiment } = get();

        if (email) {
            await removeStockFromTab(currentExperiment, symbol);
        }

        set((state) => {
            const newStocks = state.stocks.filter((s) => s.ticker !== symbol);
            const newPriceData = state.priceData.filter((p) => p.symbol !== symbol);
            let newSelectedStock = state.selectedStock;
            
            if (state.selectedStock === symbol) {
                newSelectedStock = newStocks.length > 0 ? newStocks[0].ticker : '';
            }
            
            if (!email) localStorage.setItem("stockList", JSON.stringify(newStocks));
            
            return {
                stocks: newStocks,
                priceData: newPriceData,
                selectedStock: newSelectedStock,
            };
        });
    },

    swapExperiment: async (experiment: string) => {
        set({ currentExperiment: experiment });

        const email = localStorage.getItem('userEmail');
        if (!email) return;

        try {
            const dbData = await loadDashboard(experiment);

            const activeStocks = dbData.activeStocks.map((ticker: string) => ({
                ticker,
                color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
            }));

            const priceDataArray: { symbol: string; data: Record<string, number> }[] = [];
            for (const stock of activeStocks) {
                const fetchedData = await FetchStockData(stock.ticker);
                priceDataArray.push({ symbol: stock.ticker, data: fetchedData });
            }

            const formattedTransactions = (dbData.transactions || []).map((t: any) => ({
                ...t,
                ...t.details,
                id: String(t.id),
                date: t.transaction_date ? t.transaction_date.split('T')[0] : t.date,
                batchId: t.batch_id ?? crypto.randomUUID(),
                committed: true 
            })) as Transaction[];

            const newSelectedStock = activeStocks.length > 0 ? activeStocks[0].ticker : '';

            set({
                stocks: activeStocks,
                priceData: priceDataArray,
                transactions: formattedTransactions,
                selectedStock: newSelectedStock
            });
        } catch (err) {
            console.error(err);
        }
    },

    setReportTab: (tab) => set({ reportTab: tab }),
    setDate: (date) => set({ date }),
    setSelectedStock: (stock) => set({ selectedStock: stock }),
    
    getStockPriceAtDate: (ticker: string, date: string) => {
        const { priceData } = get();
        const stockData = priceData.find((p) => p.symbol === ticker);
        return stockData ? stockData.data[date] : null;
    },

    addExperiment: (experiment: string) => {
        set((state) => ({ experiments: [...state.experiments, experiment] }));
    },

    removeExperiment: (experiment: string) => {
        set((state) => ({
            experiments: state.experiments.filter((e) => e !== experiment)
        }));
    },
});