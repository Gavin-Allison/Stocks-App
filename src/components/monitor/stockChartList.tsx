import { memo } from "react";
import { useAppStore } from "../../stores/appStore";
import { ChartComponent } from "./stockChart";

// Stock chart item using fetched data
const StockChart = memo(({
    symbol,
    priceData,
}: {
    symbol: string,
    priceData: any[],
}) => {
    const { stocks, removeStock } = useAppStore();
    const currentStock = stocks.find(s => s.ticker === symbol);

    return (
        <div className="p-4 border border-gray-400 bg-white mb-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">{symbol} Analysis</h3>
                <button 
                    onClick={() => removeStock(symbol)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                >
                    Remove
                </button>
            </div>

            <div className="h-[300px] w-full bg-gray-100 rounded border border-gray-400 relative [&_a]:hidden">
                <ChartComponent data={priceData} symbol={symbol} lineColor={currentStock?.color} />
            </div>
        </div>
    );
});

// List of stock charts
export const StockChartList = () => {
    const { stocks, priceData } = useAppStore();

    return (
        <div className="flex flex-col gap-2">
            {stocks.length === 0 && (
                <p className="text-gray-500 text-center py-10">No stocks monitored. Add one to get started.</p>
            )}
            {stocks.map((stock) => {
                const stockData = priceData.find(p => p.symbol === stock.ticker)?.data || {};
                const dataArray = Object.entries(stockData).map(([time, value]) => ({time, value}));
                return (
                    <StockChart 
                        key={stock.ticker} 
                        symbol={stock.ticker}
                        priceData={dataArray}
                    />
                );
            })}
        </div>
    );
};