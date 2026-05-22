import { useMemo } from "react";
import { useAppStore } from "../../stores/appStore"
import { StockDatePicker } from "../common/datepicker"
import { StockPieChart } from "../common/pieChart";

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

    return (
        <div className="flex flex-col w-full h-full p-4">

            {/* Header with date picker */}
            <div className="flex items-center justify-between mb-4"> 
                <h1 className="text-xl font-bold">Results</h1>
                <StockDatePicker className="w-38" date={date} onDateChange={setDate} />
            </div>

            {/* Top Box: Portfolio Summary and Pie Chart */}
            <div className="flex flex-col mb-4 w-full border border-gray-400 rounded bg-gray-200 p-4">
                <div className="flex flex-row w-full justify-between items-center mb-6">

                    <div className="mr-4">
                        <p className="text-gray-600 text-sm">Portfolio Value</p>
                        <p className="text-2xl font-bold text-gray-900">
                            ${portfolioValue.toFixed(2)}
                        </p>
                    </div>

                    <div className="text-center">
                        <p className="text-gray-600 text-sm">Total Invested</p>
                        <p className="text-2xl font-bold text-gray-900">
                            ${(portfolioValue-currentState.cash).toFixed(2)}
                        </p>
                    </div>

                    <div className="text-right ml-4">
                        <p className="text-gray-600 text-sm">Total Cash</p>
                        <p className="text-2xl font-bold text-gray-900">
                            ${currentState.cash.toFixed(2)}
                        </p>
                    </div>

                </div>

                {/* Pie Chart */}
                <div className="mb-4">
                    <StockPieChart assets={chartData} stocks={stocks} />
                </div>
            </div>

            {/* Bottom Box: Holdings List styled like LedgerList containers but preserving your original grid structure */}
            <div className="flex flex-col w-full border border-gray-400 rounded bg-gray-200 flex-1 min-h-0">
                <div className="flex flex-col flex-1 min-h-0">
                    <p className="font-semibold text-gray-700 m-4 mb-2 flex-shrink-0">Holdings:</p>
                    
                    {Object.entries(currentState.assets).length > 0 ? (
                        <>
                            {/* Scrollable list using your exact original 2-column layout mapping inside list items */}
                            <ul className="w-full overflow-y-auto flex-1 min-h-0 px-4">
                                {Object.entries(currentState.assets).map(([ticker, shares]) => {
                                    const price = priceData.find(p => p.symbol === ticker)?.data[availablePriceDate] ?? 0;
                                    const value = shares * price;
                                    const stock = stocks.find(s => s.ticker === ticker);
                                    return (
                                        <li key={ticker} className="grid grid-cols-2 items-center text-gray-700 py-2 border-b border-gray-300">
                                            {/* Left Column: Color Dot & Ticker */}
                                            <div className="flex items-center gap-2">
                                                {stock && (
                                                    <div
                                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: stock.color }}
                                                    />
                                                )}
                                                <span className="font-medium">{ticker}</span>
                                            </div>

                                            {/* Right Column: Pricing Breakdown & Total Value */}
                                            <div className="grid grid-cols-2 text-right">
                                                <div className="text-gray-500">
                                                    {shares} at ${price.toFixed(2)}
                                                </div>
                                                <div className="font-semibold text-gray-900">
                                                    ${value.toFixed(2)}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            {/* Cash anchored underneath the scrollable list */}
                            <div className="border-t border-gray-400 bg-gray-200 p-4 flex justify-between font-semibold text-gray-900 flex-shrink-0">
                                <span>Cash</span>
                                <span>${currentState.cash.toFixed(2)}</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col justify-between">
                            <p className="text-gray-500 text-xs italic m-4">No holdings at this date</p>
                            <div className="border-t border-gray-400 bg-gray-200 p-4 flex justify-between font-semibold text-gray-900">
                                <span>Cash</span>
                                <span>${currentState.cash.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}