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

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const seriesRef = useRef<any>(null);

    // Initial Setup
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
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
            width: chartContainerRef.current.clientWidth,
            height: 300,
        });
        
        chart.timeScale().fitContent();

        const series = chart.addSeries(AreaSeries, {
            lineColor
        });

        chartRef.current = chart;
        seriesRef.current = series;
    
        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0].contentRect) {
                chart.applyOptions({ width: entries[0].contentRect.width });
            }
        });

        const handleResetZoom = () => {
            chart.timeScale().fitContent();
        };

        series.setData(data);
        resizeObserver.observe(chartContainerRef.current);
        window.addEventListener('dblclick', handleResetZoom);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('dblclick', handleResetZoom);
            chart.remove();
        };
    }, []);

    // Update chart data
    useEffect(() => {
        if (seriesRef.current && data) {
            seriesRef.current.setData(data);
            chartRef.current.timeScale().fitContent();
        }
    }, [data]);

    return <div ref={chartContainerRef} className="w-full h-full" />;
}