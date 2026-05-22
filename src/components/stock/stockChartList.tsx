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
        <div className="flex flex-col mb-4 w-full border border-gray-400 rounded bg-white p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {currentStock && (
                        <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: currentStock.color }}
                        />
                    )}
                    <h3 className="font-bold text-xl text-gray-900">{symbol}</h3>
                </div>
                <button 
                    onClick={() => removeStock(symbol)}
                    className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded transition-colors text-sm font-medium"
                >
                    Remove
                </button>
            </div>

            <div className="h-[300px] w-full bg-white rounded border border-gray-400 relative [&_a]:hidden">
                <ChartComponent data={priceData} symbol={symbol} lineColor={currentStock?.color} />
            </div>
        </div>
    );
});

// List of stock charts
export const StockChartList = () => {
    const { stocks, priceData } = useAppStore();

    return (
        <div className="flex flex-col w-full h-full overflow-y-auto">
            {stocks.length === 0 && (
                <p className="text-gray-500 text-sm italic m-4">No stocks monitored. Add one to get started.</p>
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