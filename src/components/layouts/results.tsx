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

            <div className="flex flex-wrap gap-2 mb-4"></div>

            {/* Portfolio Summary */}
            <div className="flex flex-col mb-4 w-full border border-gray-400 rounded bg-gray-200 p-4">
                <div className="mb-4">
                    <p className="text-gray-600 text-sm">Portfolio Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                        ${portfolioValue.toFixed(2)}
                    </p>
                </div>

                {/* Pie Chart */}
                <div className="mb-4">
                    <StockPieChart assets={chartData} stocks={stocks} />
                </div>

                {/* Holdings */}
                <div className="text-sm space-y-2">
                    <p className="font-semibold text-gray-700 mb-2">Holdings:</p>
                    {Object.entries(currentState.assets).length > 0 ? (
                        <>
                            {Object.entries(currentState.assets).map(([ticker, shares]) => {
                                const price = priceData.find(p => p.symbol === ticker)?.data[availablePriceDate] ?? 0;
                                const value = shares * price;
                                const stock = stocks.find(s => s.ticker === ticker);
                                return (
                                    <div key={ticker} className="flex justify-between items-center text-gray-700">
                                        <div className="flex items-center gap-2">
                                            {stock && (
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: stock.color }}
                                                />
                                            )}
                                            <span>{ticker}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500">
                                                {shares} @ ${price.toFixed(2)}
                                            </div>
                                            <div className="font-semibold">
                                                ${value.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-gray-900">
                                <span>Cash</span>
                                <span>${currentState.cash.toFixed(2)}</span>
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-500 text-xs italic">No holdings at this date</p>
                    )}
                </div>
            </div>
        </div>
    )
}