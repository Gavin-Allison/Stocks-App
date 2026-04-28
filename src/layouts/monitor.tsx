import { StockChartList } from "../components/monitor/stockChartList";

export const Monitor = ({ 
    symbols, 
    onRemoveStock 
}: { 
    symbols: string[], 
    onRemoveStock: (s: string) => void 
}) => {
    return (
        <StockChartList symbols={symbols} onRemoveStock={onRemoveStock} />
    );
};