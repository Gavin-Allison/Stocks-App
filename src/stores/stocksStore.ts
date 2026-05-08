import { FetchStockData } from "../services/stockData";

const defaultList = ["RY.TO", "BNS.TO", "CM.TO"];

let symbols: string[] = (() => {
    const saved = localStorage.getItem("stockList");
    return saved ? JSON.parse(saved) : defaultList;
})();

let priceData: Record<string, any[]> = {};
const listeners = new Set<() => void>();

export const stockStore = {
    // Getters
    getSymbols() {
        return symbols;
    },

    getPriceData() {
        return priceData;
    },

    // Subscription
    subscribe(listener: () => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    // Initial loading of saved symbols
    async initialize() {
        const data: Record<string, any[]> = {};
        for (const s of symbols) {
            data[s] = await FetchStockData(s);
        }
        priceData = data;
        this.emitChange();
    },

    // Add stock to list
    async addStock(ticker: string) {
        const symbol = ticker.toUpperCase().trim();
        if (symbols.includes(symbol)) return;

        const data = await FetchStockData(symbol);
        priceData = { ...priceData, [symbol]: data };
        symbols = [...symbols, symbol];
        this.emitChange();
    },

    // Remove stock from list
    removeStock(symbol: string) {
        symbols = symbols.filter(s => s !== symbol);
        const newData = { ...priceData };
        delete newData[symbol];
        priceData = newData;
        this.emitChange();
    },

    emitChange() {
        localStorage.setItem("stockList", JSON.stringify(symbols));
        listeners.forEach(l => l());
    }
};

// Start initial fetch
stockStore.initialize();