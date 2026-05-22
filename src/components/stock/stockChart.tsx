import { AreaSeries, createChart, ColorType } from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import { useAppStore } from '../../stores/appStore';

// React component that renders a stock chart using the Lightweight Charts library
export const ChartComponent = ({
    data,
    symbol,
    lineColor,
    colors: {
        backgroundColor = '#e5e7eb',
        textColor = 'black',
    } = {},
}: {
    data: any[];
    symbol: string;
    lineColor?: string;
    colors?: {
        backgroundColor?: string;
        textColor?: string;
    };
}) => {
    const { setDate, setSelectedStock } = useAppStore();

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
                pressedMouseMove: false,
                horzTouchDrag: true,
                vertTouchDrag: false,
            },
            handleScale: {
                mouseWheel: true,
                pinch: true,
                axisPressedMouseMove: {
                    time: true,
                    price: false,
                },
            },
            timeScale: {
                fixLeftEdge: true,
                fixRightEdge: true,
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
        });
        
        chart.timeScale().fitContent();

        const series = chart.addSeries(AreaSeries, {
            lineColor,
            topColor: lineColor?.replace('hsl', 'hsla').replace(')', ', 0.5)'),
            bottomColor: "rgba(255, 255, 255, 0)",
        });

        chartRef.current = chart;
        seriesRef.current = series;

        chart.subscribeClick((param) => {
            if (param.time) {
                let timestamp;
                if (typeof param.time === 'string') {
                    timestamp = Date.parse(param.time);
                } else {
                    timestamp = Number(param.time) * 1000;
                }
                const dateStr = new Date(timestamp).toISOString().split('T')[0];
                setDate(dateStr);
                setSelectedStock(symbol);
            }
        });
    
        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0].contentRect) {
                chart.applyOptions({ width: entries[0].contentRect.width });
            }
        });

        const handleResetZoom = () => {
            chart.timeScale().fitContent();
        };

        if (data && data.length > 0) {
            series.setData(data);
        }
        resizeObserver.observe(chartContainerRef.current);
        window.addEventListener('dblclick', handleResetZoom);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('dblclick', handleResetZoom);
            chart.remove();
        };
    }, [setDate, setSelectedStock, symbol, data, backgroundColor, lineColor, textColor]);

    // Update chart data
    useEffect(() => {
        if (seriesRef.current && data && data.length > 0) {
            seriesRef.current.setData(data);
            chartRef.current.timeScale().fitContent();
        }
    }, [data]);

    return <div ref={chartContainerRef} className="w-full h-full" />;
}