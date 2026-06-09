import React, { useEffect, useRef, useState } from 'react';
import { AreaSeries, HistogramSeries, createChart, ColorType } from 'lightweight-charts';
import { useAppStore } from '../../stores/appStore';
import { theme } from '../../styles/tokens';

/**
 * Renders a single lightweight stock chart with a transaction volume overlay.
 * Applies selection, zoom, and date interactions to the chart.
 */
export const ChartComponent = React.memo(({
    data,
    symbol,
    lineColor,
    colors: {
        backgroundColor = theme.chart.background,
        textColor = theme.chart.text,
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
    const setDate = useAppStore(state => state.setDate);
    const setSelectedStock = useAppStore(state => state.setSelectedStock);
    const transactions = useAppStore(state => state.transactions);
    const date = useAppStore(state => state.date);

    const [lineX, setLineX] = useState<number | null>(null);
    const [scrollPos, setScrollPos] = useState(0);
    const [visibleSize, setVisibleSize] = useState(0);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const seriesRef = useRef<any>(null);
    const volumeSeriesRef = useRef<any>(null);
    const isAdjustingRef = useRef(false);
    const initialZoomDoneRef = useRef(false);

    // Refs for stable access in effects/listeners
    const dataRef = useRef(data);
    useEffect(() => { dataRef.current = data; }, [data]);
    const symbolRef = useRef(symbol);
    useEffect(() => { symbolRef.current = symbol; }, [symbol]);

    // Chart initialization
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            handleScroll: { mouseWheel: true, pressedMouseMove: false, horzTouchDrag: true, vertTouchDrag: false },
            handleScale: { mouseWheel: false, pinch: true, axisPressedMouseMove: { time: true, price: false } },
            timeScale: { fixLeftEdge: true, fixRightEdge: true },
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

        chart.priceScale('').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });
        chart.priceScale('right').applyOptions({ scaleMargins: { top: 0.1, bottom: 0.2 } });

        chartRef.current = chart;
        seriesRef.current = series;
        volumeSeriesRef.current = volumeSeries;

        chart.subscribeClick((param) => {
            const t = param.time || (param.point ? chart.timeScale().coordinateToTime(param.point.x) : null);
            if (!t) return;
            const dateStr = typeof t === 'string' ? t 
                : typeof t === 'object' && t !== null && 'year' in t ? `${t.year}-${String(t.month).padStart(2, '0')}-${String(t.day).padStart(2, '0')}`
                : new Date(Number(t) * 1000).toISOString().split('T')[0];
            setDate(dateStr);
            setSelectedStock(symbolRef.current);
        });
    
        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0].contentRect) chart.applyOptions({ width: entries[0].contentRect.width });
        });

        const handleResetZoom = () => {
            const d = dataRef.current;
            if (d?.length > 630) {
                chart.timeScale().setVisibleLogicalRange({ from: (d.length - 630) as any, to: d.length as any });
            } else {
                chart.timeScale().fitContent();
            }
        };

        chart.timeScale().subscribeVisibleLogicalRangeChange((newRange) => {
            if (!newRange || isAdjustingRef.current) return;
            const size = newRange.to - newRange.from;
            if (size > 630) {
                isAdjustingRef.current = true;
                chart.timeScale().setVisibleLogicalRange({ from: (newRange.to - 630) as any, to: newRange.to as any });
                setTimeout(() => { isAdjustingRef.current = false; }, 0);
                return;
            }
            setScrollPos(newRange.from);
            setVisibleSize(size);
        });

        const handleWheelZoom = (e: WheelEvent) => {
            if (e.shiftKey) {
                e.preventDefault();
                chart.applyOptions({ handleScale: { mouseWheel: true } });
            } else {
                chart.applyOptions({ handleScale: { mouseWheel: false } });
            }
        };

        resizeObserver.observe(chartContainerRef.current);
        chartContainerRef.current.addEventListener('dblclick', handleResetZoom);
        chartContainerRef.current.addEventListener('wheel', handleWheelZoom, { passive: false });

        return () => {
            resizeObserver.disconnect();
            chart.remove();
        };
    // Dependencies are now primitives or stable references
    }, [backgroundColor, lineColor, textColor]);

    // Update series/volume
    useEffect(() => {
        if (!seriesRef.current || !data?.length) return;
        seriesRef.current.setData(data);

        if (!initialZoomDoneRef.current) {
            if (data.length > 630) chartRef.current.timeScale().setVisibleLogicalRange({ from: (data.length - 630) as any, to: data.length as any });
            else chartRef.current.timeScale().fitContent();
            initialZoomDoneRef.current = true;
        }
        
        if (volumeSeriesRef.current && transactions) {
            const volumeMap = new Map<string, { volume: number, net: number }>();
            transactions.forEach((tx: any) => {
                if (tx.ticker !== symbol) return;
                const amount = tx.type.startsWith('F') ? tx.amount : tx.value;
                const isBuy = tx.type === 'FBUY' || tx.type === 'DBUY';
                const entry = volumeMap.get(tx.date) || { volume: 0, net: 0 };
                entry.volume += amount;
                entry.net += isBuy ? amount : -amount;
                volumeMap.set(tx.date, entry);
            });

            const volumeData = Array.from(volumeMap.keys()).sort().map(dateStr => {
                const day = volumeMap.get(dateStr)!;
                return { time: dateStr, value: day.volume, color: day.net >= 0 ? '#26a69a' : '#ef5350' };
            });
            volumeSeriesRef.current.setData(volumeData);
        }
    }, [data, transactions, symbol]);

    // Date line sync
    useEffect(() => {
        if (!chartRef.current || !date) { setLineX(null); return; }
        const updateLinePosition = () => setLineX(chartRef.current.timeScale().timeToCoordinate(date));
        updateLinePosition();
        chartRef.current.timeScale().subscribeVisibleTimeRangeChange(updateLinePosition);
        chartRef.current.timeScale().subscribeVisibleLogicalRangeChange(updateLinePosition);
        return () => {
            chartRef.current?.timeScale().unsubscribeVisibleTimeRangeChange(updateLinePosition);
            chartRef.current?.timeScale().unsubscribeVisibleLogicalRangeChange(updateLinePosition);
        };
    }, [date, data]);

    const maxScroll = Math.max(0, (data?.length || 0) - visibleSize);

    return (
        <div className={`relative ${theme.panel.muted} w-full h-full rounded ${theme.panel.border} overflow-hidden`}>
            {maxScroll > 0 && (
                <div className="absolute top-2 left-4 right-24 z-5 pointer-events-none">
                    <input type="range" className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer pointer-events-auto"
                        min={0} max={maxScroll} step="any" value={Math.min(scrollPos, maxScroll)}
                        onChange={(e) => chartRef.current?.timeScale().setVisibleLogicalRange({ from: Number(e.target.value) as any, to: (Number(e.target.value) + visibleSize) as any })}
                        style={{ accentColor: lineColor || '#2196F3' }} />
                </div>
            )}
            <div ref={chartContainerRef} className="w-full h-full" />
            {lineX !== null && (
                <div className="absolute top-0 pointer-events-none" style={{ left: `${lineX}px`, height: '260px', borderLeft: `2px dashed ${lineColor || '#2196F3'}`, transform: 'translateX(-50%)', zIndex: 5 }} />
            )}
        </div>
    );
}, (prev, next) => prev.data === next.data && prev.symbol === next.symbol);