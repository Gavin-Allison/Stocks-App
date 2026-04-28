import { useState, useEffect } from 'react';

const defaultList = ["RY.TO", "BNS.TO", "CM.TO"];

export const useStockSymbolList = () => {
    const [symbols, setSymbols] = useState<string[]>(() => {
        const saved = localStorage.getItem("stockList");
        return saved ? JSON.parse(saved) : defaultList;
    });

    // Save list in local storage
    useEffect(() => {
        localStorage.setItem("stockList", JSON.stringify(symbols));
    })

    // Add stock to list
    const addStock = (ticker: string) => {
        const symbol = ticker.toUpperCase().trim();
        if (symbols.includes(symbol)) return;
        setSymbols(prev => [...prev, symbol]);
    };

    // Remove stock from list
    const removeStock = (symbol: string) => {
        setSymbols(prev => prev.filter(s => s !== symbol));
    };

    return { symbols, addStock, removeStock };
}

