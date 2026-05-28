import { AreaSeries, HistogramSeries, createChart, ColorType } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../stores/appStore';

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
    const { transactions, date, setDate, setSelectedStock } = useAppStore();
    const [lineX, setLineX] = useState<number | null>(null);
    const [scrollPos, setScrollPos] = useState(0);
    const [visibleSize, setVisibleSize] = useState(0);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const seriesRef = useRef<any>(null);
    const volumeSeriesRef = useRef<any>(null);
    const isAdjustingRef = useRef(false);

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

        const series = chart.addSeries(AreaSeries, {
            lineColor,
            topColor: lineColor?.replace('hsl', 'hsla').replace(')', ', 0.5)'),
            bottomColor: "rgba(255, 255, 255, 0)",
        });

        const volumeSeries = chart.addSeries(HistogramSeries, {
            priceScaleId: '',
            lastValueVisible: false,
            priceLineVisible: false,
        });

        chart.priceScale('').applyOptions({
            scaleMargins: {
                top: 0.85,
                bottom: 0,
            },
        });

        chartRef.current = chart;
        seriesRef.current = series;
        volumeSeriesRef.current = volumeSeries;

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
            if (data && data.length > 630) {
                chart.timeScale().setVisibleLogicalRange({
                    from: (data.length - 630) as any,
                    to: data.length as any
                });
            } else {
                chart.timeScale().fitContent();
            }
        };

        chart.timeScale().subscribeVisibleLogicalRangeChange((newRange) => {
            if (!newRange || isAdjustingRef.current) return;

            const size = newRange.to - newRange.from;

            if (size > 630) {
                isAdjustingRef.current = true;
                chart.timeScale().setVisibleLogicalRange({
                    from: (newRange.to - 630) as any,
                    to: newRange.to as any
                });
                setTimeout(() => { isAdjustingRef.current = false; }, 0);
                return;
            }

            setScrollPos(newRange.from);
            setVisibleSize(size);
        });

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
            if (data.length > 630) {
                chart.timeScale().setVisibleLogicalRange({
                    from: (data.length - 630) as any,
                    to: data.length as any
                });
            } else {
                chart.timeScale().fitContent();
            }
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

    useEffect(() => {
        if (seriesRef.current && data && data.length > 0) {
            seriesRef.current.setData(data);
            
            if (volumeSeriesRef.current && transactions) {
                const volumeMap = new Map<string, { volume: number, net: number }>();
                
                transactions.forEach((tx: any) => {
                    if (!('ticker' in tx) || tx.ticker !== symbol) return;
                    
                    let amount = 0;
                    let isBuy = true;
                    
                    if (tx.type === 'FBUY') { amount = tx.amount; }
                    else if (tx.type === 'FSELL') { amount = tx.amount; isBuy = false; }
                    else if (tx.type === 'DBUY') { amount = tx.value; }
                    else if (tx.type === 'DSELL') { amount = tx.value; isBuy = false; }
                    else return;

                    if (!volumeMap.has(tx.date)) {
                        volumeMap.set(tx.date, { volume: 0, net: 0 });
                    }
                    
                    const dayData = volumeMap.get(tx.date)!;
                    dayData.volume += amount;
                    dayData.net += isBuy ? amount : -amount;
                });

                const volumeData: any[] = [];
                let lastVol = -1;
                let lastIsBuy = false;
                let alt = false;

                Array.from(volumeMap.keys()).sort().forEach(dateStr => {
                    const dayData = volumeMap.get(dateStr)!;
                    if (dayData.volume > 0) {
                        const isBuy = dayData.net >= 0;
                        
                        if (dayData.volume === lastVol && isBuy === lastIsBuy) {
                            alt = !alt;
                        } else {
                            alt = false;
                        }
                        
                        lastVol = dayData.volume;
                        lastIsBuy = isBuy;

                        volumeData.push({
                            time: dateStr,
                            value: dayData.volume,
                            color: isBuy ? (alt ? '#4db6ac' : '#26a69a') : (alt ? '#e57373' : '#ef5350'),
                        });
                    }
                });

                volumeSeriesRef.current.setData(volumeData);
            }
        }
    }, [data, transactions, symbol]);

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

    const maxScroll = Math.max(0, (data?.length || 0) - visibleSize);

    return (
        <div className="relative w-full h-full">
            {maxScroll > 0 && (
                <div className="absolute top-2 left-4 right-24 z-2 pointer-events-none">
                    <input
                        type="range"
                        className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer pointer-events-auto"
                        min={0}
                        max={maxScroll}
                        step="any"
                        value={Math.min(scrollPos, maxScroll)}
                        onChange={(e) => {
                            const newFrom = Number(e.target.value);
                            const newTo = newFrom + visibleSize;
                            setScrollPos(newFrom);
                            if (chartRef.current) {
                                chartRef.current.timeScale().setVisibleLogicalRange({
                                    from: newFrom as any,
                                    to: newTo as any
                                });
                            }
                        }}
                        style={{ accentColor: lineColor || '#2196F3' }}
                    />
                </div>
            )}
            <div ref={chartContainerRef} className="w-full h-full" />
            {lineX !== null && lineX >= 0 && chartContainerRef.current && lineX <= chartContainerRef.current.clientWidth && (
                <div
                    className="absolute top-0 pointer-events-none"
                    style={{
                        left: `${lineX}px`,
                        height: '260px',
                        borderLeft: `2px dashed ${lineColor || '#2196F3'}`,
                        transform: 'translateX(-50%)',
                        zIndex: 5,
                    }}
                />
            )}
        </div>
    );
}