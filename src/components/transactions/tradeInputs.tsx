import { useAppStore } from '../../stores/appStore';

export const TradeInputs = () => {
    const { 
        stocks, 
        selectedStock,
        setSelectedStock, 
        fixedOrDynamic,
        setFixedOrDynamic,
        numStocks,
        setNumStocks,
        percentOfCash,
        setPercentOfCash,
        tradeFee,
        setTradeFee,
        currentPrice,
    } = useAppStore();

    return (
        <div className="grid grid-cols-2 gap-4 p-2 text-gray-700 w-full items-center">
            {/* Row 1: Stock Selection and Price */}
            <div className="flex items-center gap-2">
                <h1>Select Stock:</h1>
                <select 
                    value={selectedStock} 
                    onChange={(e) => setSelectedStock(e.target.value)} 
                    className="bg-white border border-gray-400 rounded px-1"
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
                        <h1 className="min-w-[120px]">Number of Stocks:</h1>
                        <input
                            type="number"
                            value={numStocks}
                            onChange={(e) => setNumStocks(Number(e.target.value))}
                            className="w-16 bg-white border border-gray-400 rounded"
                        />
                        <button onClick={() => setFixedOrDynamic("DYNAMIC")} className="w-6 bg-gray-300 rounded hover:bg-gray-400">#</button>
                    </>
                ) : (
                    <>
                        <h1 className="min-w-[120px]">Percentage of Cash:</h1>
                        <input
                            type="number"
                            value={percentOfCash}
                            onChange={(e) => setPercentOfCash(Number(e.target.value))}
                            className="w-16 bg-white border border-gray-400 rounded"
                        />
                        <button onClick={() => setFixedOrDynamic("FIXED")} className="w-6 bg-gray-300 rounded hover:bg-gray-400">%</button>
                    </>
                )}
            </div>

            {/* Trade Fee */}
            <div className="flex items-center gap-2 justify-self-end">
                <h1>Trade Fee:</h1>
                <input
                    type="number"
                    value={tradeFee}
                    onChange={(e) => setTradeFee(Number(e.target.value))}
                    className="w-16 bg-white border border-gray-400 rounded"
                />
            </div>
        </div>
    );
};