import { useState, useEffect } from 'react';
import { FetchStockData } from '../services/stockData';

const defaultList = ["RY.TO", "BNS.TO", "CM.TO"];

export const usePortfolio = () => {
    // Saved symbols, tells system what stocks to use
    const [symbols, setSymbols] = useState<string[]>(() => {
        const saved = localStorage.getItem("stockList");
        return saved ? JSON.parse(saved) : defaultList;
    });

    // Saved data for each symbol
    const [priceData, setPriceData] = useState<Record<string, any[]>>({});

    // Initial loading of saved symbols
    useEffect(() => {
        const getData = async () => {
            const data: Record<string, any[]> = {};
            for (const s of symbols) {
                data[s] = await FetchStockData(s);
            }
            setPriceData(data);
        };
        getData();
    }, []);

    // Save list in local storage
    useEffect(() => {
        localStorage.setItem("stockList", JSON.stringify(symbols));
    })

    // Add stock to list
    const addStock = async (ticker: string) => {
        const symbol = ticker.toUpperCase().trim();
        if (symbols.includes(symbol)) return;

        const data = await FetchStockData(symbol)
        setPriceData(prev => ({ ...prev, [symbol]: data }));
        setSymbols(prev => [...prev, symbol]);
    };

    // Remove stock from list
    const removeStock = (symbol: string) => {
        setSymbols(prev => prev.filter(s => s !== symbol));

        setPriceData(prev => {
        const newData = { ...prev };
        delete newData[symbol];
        return newData;
    });
    };

    return { symbols, priceData, addStock, removeStock };
}

