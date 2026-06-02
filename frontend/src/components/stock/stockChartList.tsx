import { memo } from "react";
import { useAppStore } from "../../stores/appStore";
import { ChartComponent } from "./stockChart";
import { Panel, Button } from "../common/ui";

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
        <Panel muted={false} className="mb-4 w-full">
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
                <Button onClick={() => removeStock(symbol)} variant="danger" className="px-3">Remove</Button>
            </div>

            <div className="h-[300px] w-full bg-white rounded border border-gray-400 relative [&_a]:hidden">
                <ChartComponent data={priceData} symbol={symbol} lineColor={currentStock?.color} />
            </div>
        </Panel>
    );
});

// List of stock charts
export const StockChartList = () => {
    const { stocks, priceData } = useAppStore();

    return (
        <div className="flex flex-col w-full h-full overflow-y-auto pt-4">
            {/* Empty state */}
            {stocks.length === 0 && (
                <p className="text-gray-500 text-sm italic m-4">No stocks monitored. Add one to get started.</p>
            )}
            {/* Stock chart cards */}
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