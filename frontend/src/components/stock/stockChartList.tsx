import { memo } from "react";
import { useAppStore } from "../../stores/appStore";
import { ChartComponent } from "./stockChart";
import { Panel, Button } from "../common/ui";
import { theme } from "../../styles/tokens";

// Stock chart item using fetched data
const StockChart = memo(({
    symbol,
    priceData,
    color,
    onRemove,
}: {
    symbol: string,
    priceData: any[],
    color?: string,
    onRemove: (s: string) => void,
}) => {
    return (
        <Panel muted={false} className="mb-4 w-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {color && (
                        <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                        />
                    )}
                    <h3 className={`font-bold text-xl ${theme.text.primary}`}>{symbol}</h3>
                </div>
                <Button onClick={() => onRemove(symbol)} variant="danger" className="px-3">Remove</Button>
            </div>

            <div className="h-[300px] w-full bg-white relative [&_a]:hidden">
                <ChartComponent data={priceData} symbol={symbol} lineColor={color} />
            </div>
        </Panel>
    );
});

// List of stock charts
export const StockChartList = () => {
    const stocks = useAppStore(s => s.stocks);
    const priceData = useAppStore(s => s.priceData);
    const removeStock = useAppStore(s => s.removeStock);

    return (
        <div className="flex flex-col w-full h-full overflow-y-auto pt-4">
            {/* Empty state */}
            {stocks.length === 0 && (
                <p className={`text-sm italic m-4 ${theme.text.subtle}`}>No stocks monitored. Add one to get started.</p>
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
                        color={stock.color}
                        onRemove={removeStock}
                    />
                );
            })}
        </div>
    );
};