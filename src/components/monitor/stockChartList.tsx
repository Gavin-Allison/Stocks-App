import { memo } from "react";
import { ChartComponent } from "./stockChart";

// Stock chart item using fetched data
const StockChart = memo(({ 
    symbol, 
    priceData,
    onRemove 
}: { 
    symbol: string,
    priceData: any[]
    onRemove: (s: string) => void 
}) => {
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
                <ChartComponent data={priceData} />
            </div>
        </div>
    );
});

// List of stock charts
export const StockChartList = ({ 
    symbols, 
    priceData, 
    onRemoveStock
}: { 
    symbols: string[],
    priceData: Record<string, any[]>,
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
                    priceData={priceData[symbol]} 
                    onRemove={onRemoveStock} 
                />
            ))}
        </div>
    );
};