import { StockChartList } from "../components/monitor/stockChartList";

export const Monitor = ({ 
    symbols, 
    priceData,
    onRemoveStock,
    date,
    setDate,
    selectedStock,
    setSelectedStock
}: { 
    symbols: string[], 
    priceData: {symbol: string, data: Record<string, number>}[],
    onRemoveStock: (s: string) => void,
    date: string,
    setDate: (date: string) => void,
    selectedStock: string,
    setSelectedStock: (stock: string) => void
}) => {
    return (
        <StockChartList symbols={symbols} priceData={priceData} onRemoveStock={onRemoveStock} date={date} setDate={setDate} selectedStock={selectedStock} setSelectedStock={setSelectedStock} />
    );
};