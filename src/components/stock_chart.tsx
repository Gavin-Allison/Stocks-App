import { AreaSeries, createChart } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

// Fetches stock data from the backend server for a given symbol
export const FetchStockData = async (symbol: string) => {
  const response = await fetch(`http://localhost:3001/stock_history?symbol=${symbol}`);
  return await response.json();
};

// React component that renders a stock chart using the Lightweight Charts library
export const ChartComponent = props => {
    const {
        data,
        colors: {
            backgroundColor = 'white',
            lineColor = '#2962FF',
            textColor = 'black',
            areaTopColor = '#2962FF',
            areaBottomColor = 'rgba(41, 98, 255, 0.28)',
        } = {},
    } = props;

    const ChartContainerRef = useRef<HTMLDivElement>(null);

    // Set up the chart when the component mounts and clean up when it unmounts
    useEffect(() => {
        if (!ChartContainerRef.current) return;
        
        ChartContainerRef.current.innerHTML = ''; 

        const Chart = createChart(ChartContainerRef.current, {
            width: ChartContainerRef.current.clientWidth,
            height: 300,
        });
        
        Chart.timeScale().fitContent();

        // Handle window resize to make the chart responsive
        const HandleResize = () => {
            if (ChartContainerRef.current) {
                Chart.applyOptions({ width: ChartContainerRef.current.clientWidth });
            }
        };

        const NewSeries = Chart.addSeries(AreaSeries, {
            lineColor,
            topColor: areaTopColor,
            bottomColor: areaBottomColor,
        });
        
        NewSeries.setData(data);

        window.addEventListener('resize', HandleResize);

        return () => {
            window.removeEventListener('resize', HandleResize);
            Chart.remove();
        };
    }, [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]);

    return <div ref={ChartContainerRef} />;
}