import { useEffect, useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Input, Button } from '../common/ui';
import { theme } from '../../styles/tokens';

/**
 * Trade input fields for managed buy/sell values and stock selection.
 */
export const TradeInputs = () => {
    const stocks = useAppStore(s => s.stocks);
    const selectedStock = useAppStore(s => s.selectedStock);
    const setSelectedStock = useAppStore(s => s.setSelectedStock);
    const fixedOrDynamic = useAppStore(s => s.fixedOrDynamic);
    const setFixedOrDynamic = useAppStore(s => s.setFixedOrDynamic);
    const numStocks = useAppStore(s => s.numStocks);
    const setNumStocks = useAppStore(s => s.setNumStocks);
    const percentOfCash = useAppStore(s => s.percentOfCash);
    const setPercentOfCash = useAppStore(s => s.setPercentOfCash);
    const tradeFee = useAppStore(s => s.tradeFee);
    const setTradeFee = useAppStore(s => s.setTradeFee);
    const currentPrice = useAppStore(s => s.currentPrice);
    const setCurrentPrice = useAppStore(s => s.setCurrentPrice);
    const date = useAppStore(s => s.date);
    const getStockPriceAtDate = useAppStore(s => s.getStockPriceAtDate);

    /**
     * Update the currently displayed stock price after stock or date changes.
     */
    useEffect(() => {
        if (selectedStock && date) {
            const price = getStockPriceAtDate(selectedStock, date);
            setCurrentPrice(price || 0);
        }
    }, [selectedStock, date, getStockPriceAtDate, setCurrentPrice]);

    const onSelectStock = useCallback((e: any) => setSelectedStock(e.target.value), [setSelectedStock]);
    const onNumStocks = useCallback((e: any) => setNumStocks(Number(e.target.value)), [setNumStocks]);
    const onPercentOfCash = useCallback((e: any) => setPercentOfCash(Number(e.target.value)), [setPercentOfCash]);
    const onTradeFee = useCallback((e: any) => setTradeFee(Number(e.target.value)), [setTradeFee]);

    return (
        <div className={`grid grid-cols-2 gap-2 m-2 ${theme.text.secondary} w-full items-center`}>
            {/* Row 1: Stock Selection and Price */}
            <div className="flex items-center gap-2">
                <h1>Select Stock:</h1>
                <select 
                    value={selectedStock} 
                    onChange={onSelectStock} 
                    className={`${theme.input.base} px-1 h-[26px]`}
                >
                    {stocks.map((stock) => (
                        <option key={stock.ticker} value={stock.ticker}>
                            {stock.ticker}
                        </option>
                    ))}
                </select>
            </div>
            
            <h1 className="text-right justify-self-end">
                Share Price: ${currentPrice.toFixed(2)} 
            </h1>

            {/* Row 2: Input Toggle and Trade Fee */}
            <div className="flex items-center gap-2">
                {fixedOrDynamic === "FIXED" ? (
                    <>
                        <h1 className="min-w-[140px]">Number of Stocks:</h1>
                        <Input
                            type="number"
                            value={numStocks}
                            onChange={onNumStocks}
                            className="w-16"
                        />
                        <Button onClick={() => setFixedOrDynamic("DYNAMIC")} className="px-2 text-center" variant="muted">#</Button>
                    </>
                ) : (
                    <>
                        <h1 className="min-w-[140px]">Percentage of Cash:</h1>
                        <Input
                            type="number"
                            value={percentOfCash}
                            onChange={onPercentOfCash}
                            className="w-16"
                        />
                        <Button onClick={() => setFixedOrDynamic("FIXED")} className="px-2 text-center" variant="muted">%</Button>
                    </>
                )}
            </div>

            {/* Trade Fee */}
            <div className="flex items-center gap-2 justify-self-end">
                <h1>Trade Fee:</h1>
                        <Input
                            type="number"
                            value={tradeFee}
                            onChange={onTradeFee}
                            className="w-16"
                        />
            </div>
        </div>
    );
};