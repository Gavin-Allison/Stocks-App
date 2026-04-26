import { AreaSeries, createChart, ColorType } from 'lightweight-charts';
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
            backgroundColor = '#e5e7eb',
            lineColor = 'green',
            textColor = 'black',
        } = {},
    } = props;

    const ChartContainerRef = useRef<HTMLDivElement>(null);

    // Set up the chart when the component mounts and clean up when it unmounts
    useEffect(() => {
        if (!ChartContainerRef.current) return;
        
        ChartContainerRef.current.innerHTML = ''; 

        const Chart = createChart(ChartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
            },
            handleScale: {
                mouseWheel: false,
                pinch: true,
                axisPressedMouseMove: true,
            },
            width: ChartContainerRef.current.clientWidth,
            height: 300,
        });
        
        Chart.timeScale().fitContent();

        const NewSeries = Chart.addSeries(AreaSeries, {
            lineColor
        });
        
        const handleResize = () => {
            if (ChartContainerRef.current) {
                Chart.applyOptions({ width: ChartContainerRef.current.clientWidth });
            }
        };

        const handleResetZoom = () => {
            Chart.timeScale().fitContent();
        };


        NewSeries.setData(data);
        window.addEventListener('dblclick', handleResetZoom);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('dblclick', handleResetZoom);
            Chart.remove();
        };
    }, [data, backgroundColor, lineColor, textColor]);

    return <div ref={ChartContainerRef} />;
}