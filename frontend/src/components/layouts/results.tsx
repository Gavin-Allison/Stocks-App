import { useMemo } from "react";
import { useAppStore } from "../../stores/appStore";
import { StockDatePicker } from "../common/datepicker";
import { StockPieChart } from "../common/pieChart";
import { Panel } from "../common/ui";
import { theme } from "../../styles/tokens";

export const Results = () => {
    const date = useAppStore(s => s.date);
    const setDate = useAppStore(s => s.setDate);
    const priceData = useAppStore(s => s.priceData);
    const stocks = useAppStore(s => s.stocks);
    const getLedger = useAppStore(s => s.getLedger);

    const ledger = useMemo(() => getLedger(), [getLedger]);

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

            {/* Header */}
            <div className="flex items-center justify-between mb-4"> 
                <h1 className="text-xl font-bold">Results</h1>
                <StockDatePicker className="w-38" date={date} onDateChange={setDate} />
            </div>

            {/* Top panel */}
            <Panel muted className="w-full @container">
                
                {/* Metrics */}
                <div className="flex flex-row w-full justify-between items-center mb-4">

                    <div className="mr-4">
                        <p className={`${theme.text.muted} text-sm`}>Portfolio Value</p>
                        <p className={`text-2xl font-bold ${theme.text.primary}`}>
                            ${portfolioValue.toFixed(2)}
                        </p>
                    </div>

                    <div className="text-center hidden @[400px]:block">
                        <p className={`${theme.text.muted} text-sm`}>Total Invested</p>
                        <p className={`text-2xl font-bold ${theme.text.primary}`}>
                            ${(portfolioValue - currentState.cash).toFixed(2)}
                        </p>
                    </div>

                    <div className="text-right ml-4">
                        <p className={`${theme.text.muted} text-sm`}>Total Cash</p>
                        <p className={`text-2xl font-bold ${theme.text.primary}`}>
                            ${currentState.cash.toFixed(2)}
                        </p>
                    </div>

                </div>

                {/* Chart and extras */}
                <div className="flex flex-row w-full items-center justify-between border-t border-gray-300 pt-4">
                    
                    <div className="flex justify-start ml-14">
                        <StockPieChart assets={chartData} stocks={stocks} width={200} height={200} />
                    </div>

                    {/* Side metrics */}
                    <div className="flex flex-col gap-3 text-center hidden @[400px]:inline">
                        <div className="flex flex-col">
                            <p className={`${theme.text.muted} text-xs font-medium`}>Highest Concentration</p>
                            <p className={`text-xl font-bold mb-2 ${theme.text.strong}`}>
                                {highestConcentration.ticker} ({highestConcentration.percentage.toFixed(0)}%)
                            </p>
                            <p className={`${theme.text.muted} text-xs font-medium`}>Total Unique Stocks</p>
                            <p className={`text-xl font-bold ${theme.text.strong}`}>{uniquePositionsCount} Assets</p>
                        </div>
                    </div>

                </div>
            </Panel>

            {/* Holdings list */}
            <Panel className="@container">
            
                <div className="flex flex-col flex-1 min-h-0">
                    
                    {Object.entries(currentState.assets).length > 0 ? (
                        <>
                        {/* Table head */}
                        <div className={`flex justify-between items-center font-semibold ${theme.text.secondary} px-4 pb-2 mt-2 border-b border-gray-400 flex-shrink-0`}>
                            <div className="flex-1 text-center">Asset</div>
                            <div className="flex-1 text-center hidden @[400px]:flex justify-end">% of Assets</div>
                            <div className="flex-1 text-center">Shares</div>
                            <div className="flex-1 text-center">Price</div>
                            <div className="flex-1 text-center whitespace-nowrap">Total Value</div>
                        </div>

                        {/* Holdings List */}
                        <ul className="w-full overflow-y-auto flex-1 min-h-0 px-4">
                            {Object.entries(currentState.assets).map(([ticker, shares]) => {
                                const price = priceData.find(p => p.symbol === ticker)?.data[availablePriceDate] ?? 0;
                                const value = shares * price;
                                const stock = stocks.find(s => s.ticker === ticker);
                                const allocationPercentage = totalAssetValue > 0 ? (value / totalAssetValue) * 100 : 0;

                                return (
                                    <li key={ticker} className={`flex justify-between items-center ${theme.text.secondary} py-2 border-b border-gray-300`}>
                                        
                                        <div className="flex-1 flex items-center gap-2 text-center">
                                            {stock && (
                                                <div
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: stock.color }}
                                                />
                                            )}
                                            <span className={`font-medium ${theme.text.primary}`}>{ticker}</span>
                                        </div>

                                        <div className={`flex-1 text-center ${theme.text.muted} hidden @[400px]:flex justify-end`}>
                                            {allocationPercentage.toFixed(1)}%
                                        </div>

                                        <div className={`flex-1 text-center ${theme.text.muted}`}>
                                            {shares}
                                        </div>

                                        <div className={`flex-1 text-center ${theme.text.muted}`}>
                                            ${price.toFixed(2)}
                                        </div>

                                        <div className={`flex-1 text-center font-semibold ${theme.text.primary}`}>
                                            ${value.toFixed(2)}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col justify-between">
                            <p className={`text-xs italic m-4 ${theme.text.subtle}`}>No holdings at this date</p>
                        </div>
                    )}
                </div>
            </Panel>
        </div>
    );
};