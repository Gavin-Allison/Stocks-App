import { PieChart } from '@mui/x-charts/PieChart';
import type { Stock } from '../../types/stock'

export const StockPieChart = ({ 
    assets, 
    stocks
}: { 
    assets: Record<string, number>; 
    stocks: Stock[]
}) => {
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
                    arcLabel: (item) => {
                        if (!totalValue) return "";
                        const percentage = (item.value / totalValue) * 100;
                        return percentage >= 5 ? `${percentage.toFixed(0)}%` : "";
                    },
                    valueFormatter: (item) => {
                        if (!totalValue) return "";
                        const percentage = (item.value / totalValue) * 100;
                        return `$${item.value.toFixed(2)} (${percentage.toFixed(1)}%)`;
                    },
                    highlightScope: { fade: 'global', highlight: 'item' },
                },
            ]}
            hideLegend={true}
            skipAnimation
            width={200}
            height={200}
        />
    );
};