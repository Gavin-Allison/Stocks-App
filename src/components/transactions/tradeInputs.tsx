import { useAppStore } from '../../stores/appStore';

export const TradeInputs = () => {
    const { 
        stocks, 
        date,
        selectedStock,
        setSelectedStock, 
        getStockPriceAtDate,
        fixedOrDynamic,
        setFixedOrDynamic,
        numStocks,
        setNumStocks,
        percentOfCash,
        setPercentOfCash,
        tradeFee,
        setTradeFee,
    } = useAppStore();

    const currentPrice = getStockPriceAtDate(selectedStock, date) || 0;
    
    return (
        <div className="flex flex-col w-full gap-2 p-2">
            <div className="flex flex-row w-full items-center justify-between text-gray-700"> 
                <div className="flex flex-row">
                    <h1>Select Stock: </h1>
                    <select 
                        value={selectedStock} 
                        onChange={(e) => setSelectedStock(e.target.value)} 
                        className="w-26 bg-white border border-gray-400 rounded ml-2"
                    >
                        {stocks.map((stock) => (
                            <option key={stock.ticker} value={stock.ticker}>
                                {stock.ticker}
                            </option>
                        ))}
                    </select>
                </div>
                
                <h1 className="">
                    Share Price: ${currentPrice.toFixed(2)} 
                </h1>
            </div>

            <div className="flex flex-row w-full items-center justify-between text-gray-700">                
                {fixedOrDynamic === "FIXED" ? (
                    <div className="flex text-gray-700 items-center">
                        <h1 className="w-36">Number of Stocks: </h1>
                        <input
                            type="number"
                            value={numStocks}
                            onChange={(e) => setNumStocks(Number(e.target.value))}
                            className="w-16 bg-white border border-gray-400 rounded"
                        />
                        <button onClick={() => setFixedOrDynamic("DYNAMIC")} className="flex w-6 ml-2 items-center justify-center bg-gray-300 rounded hover:bg-gray-400">#</button>
                    </div>
                ) : (
                    <div className="flex text-gray-700 items-center">
                        <h1 className="w-36">Percentage of Cash: </h1>
                        <input
                            type="number"
                            value={percentOfCash}
                            onChange={(e) => setPercentOfCash(Number(e.target.value))}
                            className="w-16 bg-white border border-gray-400 rounded"
                        />
                        <button onClick={() => setFixedOrDynamic("FIXED")} className="flex w-6 ml-2 justify-center bg-gray-300 rounded hover:bg-gray-400">%</button>
                    </div>
                )}

                <div className="flex text-gray-700">
                    <h1>Trade Fee: </h1>
                    <input
                        type="number"
                        value={tradeFee}
                        onChange={(e) => setTradeFee(Number(e.target.value))}
                        className="w-16 bg-white border border-gray-400 rounded ml-2"
                    />
                </div>
            </div>
        </div>
    )
};