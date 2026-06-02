import { useMemo } from "react";
import { useAppStore } from "../../stores/appStore";
import { StockDatePicker } from "../common/datepicker";
import { StockPieChart } from "../common/pieChart";
import { Panel } from "../common/ui";

export const Results = () => {
    const {
        date,
        setDate,
        priceData,
        stocks,
        getLedger,
    } = useAppStore();

    const ledger = getLedger();

    const ledgerAtDate = useMemo(() => {
        return ledger.filter(entry => entry.transaction.date <= date);
    }, [ledger, date]);

    const currentState = useMemo(() => {
        if (ledgerAtDate.length === 0) {
            return { assets: {}, cash: 0 };
        }
        const lastEntry = ledgerAtDate[ledgerAtDate.length - 1];
        return {
            assets: lastEntry.currentAssets,
            cash: lastEntry.currentCash,
            error: lastEntry.error,
            errorMessage: lastEntry.errorMessage,
        };
    }, [ledgerAtDate]);

    const availablePriceDate = useMemo(() => {
        if (!priceData || priceData.length === 0) return date;
        
        const dates = priceData[0]?.data ? Object.keys(priceData[0].data).sort() : [];
        if (dates.length === 0) return date;
        
        if (dates.includes(date)) return date;
        
        const selectedTime = new Date(date).getTime();
        let closestDate = dates[0];
        let minDiff = Math.abs(new Date(closestDate).getTime() - selectedTime);
        
        for (const d of dates) {
            const diff = Math.abs(new Date(d).getTime() - selectedTime);
            if (diff < minDiff) {
                minDiff = diff;
                closestDate = d;
            }
        }
        
        return closestDate;
    }, [priceData, date]);

    const portfolioValue = useMemo(() => {
        let totalValue = currentState.cash;
        Object.entries(currentState.assets).forEach(([ticker, shares]) => {
            const price = priceData.find(p => p.symbol === ticker)?.data[availablePriceDate] ?? 0;
            totalValue += shares * price;
        });
        return totalValue;
    }, [currentState, priceData, availablePriceDate]);

    const chartData = useMemo(() => {
        const data: Record<string, number> = {};
        Object.entries(currentState.assets).forEach(([ticker, shares]) => {
            const price = priceData.find(p => p.symbol === ticker)?.data[availablePriceDate] ?? 0;
            data[ticker] = shares * price;
        });
        return data;
    }, [currentState, priceData, availablePriceDate]);

    const uniquePositionsCount = useMemo(() => {
        return Object.keys(currentState.assets).length;
    }, [currentState.assets]);

    const totalAssetValue = useMemo(() => {
        return Object.values(chartData).reduce((sum, val) => sum + val, 0);
    }, [chartData]);

    const highestConcentration = useMemo(() => {
        if (uniquePositionsCount === 0 || portfolioValue === 0) {
            return { ticker: "None", percentage: 0 };
        }

        let maxTicker = "None";
        let maxValue = 0;

        Object.entries(chartData).forEach(([ticker, val]) => {
            if (val > maxValue) {
                maxValue = val;
                maxTicker = ticker;
            }
        });

        const divisor = totalAssetValue > 0 ? totalAssetValue : portfolioValue;
        const pct = (maxValue / divisor) * 100;

        return { ticker: maxTicker, percentage: pct };
    }, [chartData, portfolioValue, uniquePositionsCount, totalAssetValue]);

    return (
        <div className="flex flex-col w-full h-full p-4">

            {/* Header with date picker */}
            <div className="flex items-center justify-between mb-4"> 
                <h1 className="text-xl font-bold">Results</h1>
                <StockDatePicker className="w-38" date={date} onDateChange={setDate} />
            </div>

            {/* Top Box: Portfolio Summary and Balanced Layout segment */}
            <Panel muted className="w-full">
                
                {/* Row 1: Original Summary Figures */}
                <div className="flex flex-row w-full justify-between items-center mb-4">

                    <div className="mr-4">
                        <p className="text-gray-600 text-sm">Portfolio Value</p>
                        <p className="text-2xl font-bold text-gray-900">
                            ${portfolioValue.toFixed(2)}
                        </p>
                    </div>

                    <div className="text-center">
                        <p className="text-gray-600 text-sm">Total Invested</p>
                        <p className="text-2xl font-bold text-gray-900">
                            ${(portfolioValue - currentState.cash).toFixed(2)}
                        </p>
                    </div>

                    <div className="text-right ml-4">
                        <p className="text-gray-600 text-sm">Total Cash</p>
                        <p className="text-2xl font-bold text-gray-900">
                            ${currentState.cash.toFixed(2)}
                        </p>
                    </div>

                </div>

                {/* Row 2: 2-Column Layout (Pie Chart Left / Metrics Right) */}
                <div className="flex flex-row w-full items-center justify-between border-t border-gray-300 pt-4">
                    
                    {/* Left Column: Centered Pie Chart Container */}
                    <div className="flex justify-start pr-4 ml-8">
                        <StockPieChart assets={chartData} stocks={stocks} />
                    </div>

                    {/* Right Column: Stacked Metric Callouts */}
                    <div className="flex flex-col gap-3 text-right">
                        <div>
                            <p className="text-gray-600 text-xs font-medium">Highest Concentration</p>
                            <p className="text-xl font-bold text-gray-800">
                                {highestConcentration.ticker} ({highestConcentration.percentage.toFixed(0)}%)
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-xs font-medium">Total Unique Stocks</p>
                            <p className="text-xl font-bold text-gray-800">{uniquePositionsCount} Assets</p>
                        </div>
                    </div>

                </div>
            </Panel>

            {/* Bottom Box: Holdings List container */}
            <Panel>
            
                <div className="flex flex-col flex-1 min-h-0">
                    
                    {Object.entries(currentState.assets).length > 0 ? (
                        <>
                            {/* Header Line with perfectly equal spaces between individual titles */}
                            <div className="flex justify-between items-center font-semibold text-gray-700 px-4 pb-2 mt-2 border-b border-gray-400 flex-shrink-0">
                                <div className="flex-1 text-left">Asset</div>
                                <div className="flex-1 text-right">% of Assets</div>
                                <div className="flex-1 text-right">Shares</div>
                                <div className="flex-1 text-right">Price</div>
                                <div className="flex-1 text-right">Total Value</div>
                            </div>

                            {/* Scrollable list */}
                            <ul className="w-full overflow-y-auto flex-1 min-h-0 px-4">
                                {Object.entries(currentState.assets).map(([ticker, shares]) => {
                                    const price = priceData.find(p => p.symbol === ticker)?.data[availablePriceDate] ?? 0;
                                    const value = shares * price;
                                    const stock = stocks.find(s => s.ticker === ticker);
                                    const allocationPercentage = totalAssetValue > 0 ? (value / totalAssetValue) * 100 : 0;

                                    return (
                                        <li key={ticker} className="flex justify-between items-center text-gray-700 py-2 border-b border-gray-300">
                                            {/* Column 1: Color Dot & Ticker */}
                                            <div className="flex-1 flex items-center gap-2 text-left">
                                                {stock && (
                                                    <div
                                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: stock.color }}
                                                    />
                                                )}
                                                <span className="font-medium text-gray-900">{ticker}</span>
                                            </div>

                                            {/* Column 2: Allocation % */}
                                            <div className="flex-1 text-right text-gray-600">
                                                {allocationPercentage.toFixed(1)}%
                                            </div>

                                            {/* Column 3: Shares count */}
                                            <div className="flex-1 text-right text-gray-600">
                                                {shares}
                                            </div>

                                            {/* Column 4: Current Price */}
                                            <div className="flex-1 text-right text-gray-600">
                                                ${price.toFixed(2)}
                                            </div>

                                            {/* Column 5: Total Value */}
                                            <div className="flex-1 text-right font-semibold text-gray-900">
                                                ${value.toFixed(2)}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col justify-between">
                            <p className="text-gray-500 text-xs italic m-4">No holdings at this date</p>
                        </div>
                    )}
                </div>
            </Panel>
        </div>
    );
};