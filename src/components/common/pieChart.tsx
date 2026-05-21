import { PieChart } from '@mui/x-charts/PieChart';

export const StockPieChart = ({ 
    assets, 
}: { 
    assets: Record<string, number>; 
}) => {
    // Transform { Apple: 70, Google: 30 } into [{ id: 'Apple', value: 70, label: 'Apple' }, ...]
    const chartData = Object.entries(assets).map(([label, value]) => ({
        id: label,
        value: value,
        label: label,
    }));

    return (
        <PieChart
            series={[
                {
                    data: chartData,
                },
            ]}
        />
    );
};