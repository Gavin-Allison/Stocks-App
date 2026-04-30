import { StockChartList } from "../components/monitor/stockChartList";

export const Monitor = ({ 
    symbols, 
    priceData,
    onRemoveStock 
}: { 
    symbols: string[], 
    priceData: Record<string, any[]>
    onRemoveStock: (s: string) => void 
}) => {
    return (
        <StockChartList symbols={symbols} priceData={priceData} onRemoveStock={onRemoveStock} />
    );
};