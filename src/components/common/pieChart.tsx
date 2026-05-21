import { PieChart } from '@mui/x-charts/PieChart';

export const StockPieChart = ({ 
    assets, 
}: { 
    assets: Record<string, number>; 
}) => {
    // Transform { AAPL: 70, GOOG: 30 } into [{ id: 'AAPL', value: 70, label: 'AAPL' }, ...]
    const chartData = Object.entries(assets).map(([label, value]) => ({
        id: label,
        value: value,
        label: label,
    }));
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