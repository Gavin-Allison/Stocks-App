import { useState, useEffect, memo } from "react";
import { FetchStockData, ChartComponent } from "./stockChart";

// This is a hardcoded list of stocks to display in the chart list
const StockList: string[] = [
    "RY.TO",
    "BNS.TO",
    "CM.TO"
];

export const removeStockFromList = (symbol: string) => {
    const index = StockList.indexOf(symbol);
    StockList.splice(index, 1);
};
    
// Interface for a stock item for the chart list
interface StockItem {
    id: number;
    symbol: string;
    chartData: any[];
};

// Convert current stocks to a list of chart items with data fetched from the backend
const useCurrentStocks = () => {
  const [chartList, setChartList] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
        try {
            // Fetch data for all stocks in parallel and put into results
            const results: StockItem[] = await Promise.all(
                StockList.map(async (symbol, index) => ({
                    id: index,
                    symbol: symbol,
                    chartData: await FetchStockData(symbol),
                }))
            );
            
            setChartList(results);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching stock data:", error);
        }
    };

    loadData();
  }, []);

  return { chartList, loading };
};

// Takes a stock item and renders a chart for it
const StockItemChart = memo(({ item }: { item: StockItem }) => {
    return (
        <div className="p-4 border-b border-gray-300">
            <div className="mb-2 font-bold">
                {item.symbol} Chart
            </div>
            <div className="h-[300px] w-full bg-white [&_a]:hidden">
                <ChartComponent data={item.chartData} />
            </div>
        </div>
    )
});

// Main component that renders the list of stock charts
export const StockChartList = () => {
    const { chartList, loading } = useCurrentStocks();

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div>
            {chartList.map((item) => (
                <StockItemChart key={item.id} item={item} />
            ))}
        </div>
    );
};
