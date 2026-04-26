import { useState, useEffect, memo } from "react";
import { FetchStockData, ChartComponent } from "./stockChart";
import { getStockList, removeStockFromList} from "./stockSymbolList";

// Takes a stock item and renders a chart for it
const StockChart = memo(({ symbol }: { symbol: string }) => {
    const [chartData, setChartData] = useState<any[]>([]);

    // Fetch stock data when the symbol changes
    useEffect(() => {
        const getDataFromSymbol = async () => {
            try {
                const data = await FetchStockData(symbol);
                setChartData(data);
            } catch (error) {
                console.error("Error fetching stock data:", error);
            }
        };
    getDataFromSymbol();
    }, [symbol]);

    return (
        <div className="p-4 border-b border-gray-300">
            <div className="flex">
            <div className="mb-2 font-bold">
                {symbol} Chart____
            </div>

            <button onClick={() => removeStockFromList(symbol)}>
                Remove Stock
            </button>
            </div>

            <div className="h-[300px] w-full bg-white [&_a]:hidden">
                {chartData.length > 0 && <ChartComponent data={chartData} />}
            </div>
        </div>
    )
});

// Main component that renders the list of stock charts
export const StockChartList = () => {
    const [symbols, setSymbols] = useState<string[]>(getStockList());
    useEffect(() => {
        // Listen for stock list updates and refresh the symbols state when it changes
        const handleStockListUpdate = () => {
            setSymbols(getStockList());
        };

        window.addEventListener("stockListUpdate", handleStockListUpdate);
        return () => {
            window.removeEventListener("stockListUpdate", handleStockListUpdate);
        };
    }, []);

    return (
        <>
        {symbols.map((symbol) => (
            <StockChart key={symbol} symbol={symbol} />
        ))}
        </>
    );
};
