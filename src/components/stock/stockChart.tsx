import { AreaSeries, createChart, ColorType } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
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
    const { date, setDate, setSelectedStock } = useAppStore();
    const [lineX, setLineX] = useState<number | null>(null);

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
                mouseWheel: false,
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

        // Custom handler to safely swap wheel behaviors on Shift key check
        const handleWheelZoom = (e: WheelEvent) => {
            if (e.shiftKey) {
                e.preventDefault();
                chart.applyOptions({
                    handleScale: { mouseWheel: true }
                });
            } else {
                chart.applyOptions({
                    handleScale: { mouseWheel: false }
                });
            }
        };

        if (data && data.length > 0) {
            series.setData(data);
        }
        resizeObserver.observe(chartContainerRef.current);
        window.addEventListener('dblclick', handleResetZoom);
        
        const container = chartContainerRef.current;
        container.addEventListener('wheel', handleWheelZoom, { passive: false });

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('dblclick', handleResetZoom);
            container.removeEventListener('wheel', handleWheelZoom);
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

    useEffect(() => {
        if (!chartRef.current || !date) {
            setLineX(null);
            return;
        }

        const updateLinePosition = () => {
            const x = chartRef.current.timeScale().timeToCoordinate(date);
            setLineX(x);
        };

        updateLinePosition();

        chartRef.current.timeScale().subscribeVisibleTimeRangeChange(updateLinePosition);
        chartRef.current.timeScale().subscribeVisibleLogicalRangeChange(updateLinePosition);

        return () => {
            if (chartRef.current) {
                chartRef.current.timeScale().unsubscribeVisibleTimeRangeChange(updateLinePosition);
                chartRef.current.timeScale().unsubscribeVisibleLogicalRangeChange(updateLinePosition);
            }
        };
    }, [date, data]);

    return (
        <div className="relative w-full h-full">
            <div ref={chartContainerRef} className="w-full h-full" />
            {lineX !== null && lineX >= 0 && chartContainerRef.current && lineX <= chartContainerRef.current.clientWidth && (
                <div
                    className="absolute top-0 pointer-events-none"
                    style={{
                        left: `${lineX}px`,
                        height: '260px',
                        borderLeft: `2px dashed ${lineColor || '#2196F3'}`,
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                    }}
                />
            )}
        </div>
    );
}