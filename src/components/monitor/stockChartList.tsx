import { useState, useEffect, memo } from "react";
import { ChartComponent } from "./stockChart";
import { FetchStockData } from "../../services/stockData";

// Stock chart item using fetched data
const StockChart = memo(({ symbol, onRemove }: { symbol: string, onRemove: (s: string) => void }) => {
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch Data, load until fetched
    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await FetchStockData(symbol);
                if (isMounted) setChartData(data);
            } catch (e) {
                console.error("Failed to load", symbol);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, [symbol]);

    return (
        <div className="p-4 border-b border-gray-300 bg-white shadow-sm mb-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">{symbol} Analysis</h3>
                <button 
                    onClick={() => onRemove(symbol)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                >
                    Remove
                </button>
            </div>

            <div className="h-[300px] w-full bg-gray-50 rounded border relative [&_a]:hidden">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">Loading...</div>
                ) : (
                    <ChartComponent data={chartData} />
                )}
            </div>
        </div>
    );
});

// List of stock charts
export const StockChartList = ({ 
    symbols, 
    onRemoveStock
}: { 
    symbols: string[], 
    onRemoveStock: (s: string) => void 
}) => {

    return (
        <div className="flex flex-col gap-2">
            {symbols.length === 0 && (
                <p className="text-gray-500 text-center py-10">No stocks monitored. Add one to get started.</p>
            )}
            {symbols.map((symbol) => (
                <StockChart 
                    key={symbol} 
                    symbol={symbol} 
                    onRemove={onRemoveStock} 
                />
            ))}
        </div>
    );
};