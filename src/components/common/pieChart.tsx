import { PieChart } from '@mui/x-charts/PieChart';
import type { Stock } from '../../types/stock'

export const StockPieChart = ({ 
    assets, 
    stocks
}: { 
    assets: Record<string, number>; 
    stocks: Stock[]
}) => {
    // Transform { AAPL: 70, GOOG: 30 } into [{ id: 'AAPL', value: 70, label: 'AAPL' }, ...]
    const chartData = Object.entries(assets).map(([label, value]) => {

        const stockConfig = stocks.find((stock: Stock) => stock.ticker === label);

        return {
            id: label,
            value: value,
            label: label,
            color: stockConfig ? stockConfig.color : "hsl(0, 0%, 50%)"
        };
    });
    
    const totalValue = Object.values(assets).reduce((a, b) => a + b, 0);

return (
        <PieChart
            series={[
                {
                    data: chartData,
                    arcLabel: (item) => `${((item.value / totalValue) * 100).toFixed(0)}%`,
                },
            ]}
            skipAnimation
            width={200}
            height={200}
        />
    );
};