import { StockChartList } from "../components/monitor/stockChartList";

export const Monitor = ({ 
    symbols, 
    priceData,
    onRemoveStock 
}: { 
    symbols: string[], 
    priceData: {symbol: string, data: Record<string, number>}[],
    onRemoveStock: (s: string) => void 
}) => {
    return (
        <StockChartList symbols={symbols} priceData={priceData} onRemoveStock={onRemoveStock} />
    );
};