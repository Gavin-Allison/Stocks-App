import { useMemo, useState } from "react"
import { useAppStore } from "../../stores/appStore"

import { StockDatePicker } from "../common/datepicker"
import { validateLedger } from "../../stores/ledger"

import type { LedgerEntry } from "../../types/ledgerEntry"
import type { Transaction } from "../../types/transaction"

export const Transactions = () => {
    const { stocks, transactions, priceData, date, selectedStock, setDate, setSelectedStock, addTransaction, removeTransaction, getStockPriceAtDate } = useAppStore()

    const [numStocks, setNumStocks] = useState<number>(1);
    const [percentOfCash, setPercentOfCash] = useState<number>(20);
    const [tradeFee, setTradeFee] = useState<number>(10);
    const [cashAmount, setCashAmount] = useState<number>(100);
    const [cashFee, setCashFee] = useState<number>(10);
    const [draftTransactions, setDraftTransactions] = useState<Transaction[]>([]);
    const [draftBatchId, setDraftBatchId] = useState<string | null>(null);
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    const [tradeOrCash, setTradeOrCash] = useState<"TRADE" | "CASH">("TRADE");
    const [fixedOrDynamic, setFixedOrDynamic] = useState<"FIXED" | "DYNAMIC">("FIXED");

    const currentPrice = getStockPriceAtDate(selectedStock, date) || 0;

    // Helper function to combine two sorted transaction lists into one sorted list
    const combineSortedTransactions = (left: Transaction[], right: Transaction[]) => {
        const combined: Transaction[] = [];
        let i = 0;
        let j = 0;

        while (i < left.length && j < right.length) {
            if (left[i].date <= right[j].date) {
                combined.push(left[i]);
                i += 1;
            } else {
                combined.push(right[j]);
                j += 1;
            }
        }

        return combined.concat(left.slice(i), right.slice(j));
    };

    const previewLedger = useMemo(() => {
        const combinedTransactions = combineSortedTransactions(transactions, draftTransactions);
        return validateLedger(combinedTransactions, priceData);
    }, [transactions, draftTransactions, priceData]);

    const handleAddTransaction = (details: any) => {
        const batchId = draftBatchId ?? crypto.randomUUID();
        if (!draftBatchId) setDraftBatchId(batchId);

        const transaction: Transaction = {
            ...details,
            id: crypto.randomUUID(),
            date,
            batchId,
        };

        setDraftTransactions((prev) => {
            const insertionIndex = prev.findIndex((t) => t.date > transaction.date);
            if (insertionIndex === -1) return [...prev, transaction];
            return [...prev.slice(0, insertionIndex), transaction, ...prev.slice(insertionIndex)];
        });
    }

    const handleSubmitTransactions = () => {
        draftTransactions.forEach((transaction) => addTransaction(transaction));
        setDraftTransactions([]);
        setDraftBatchId(null);
    }

    const handleRemoveHighlightedBatch = () => {
        if (!selectedBatchId) return;
        transactions.filter((t) => t.batchId === selectedBatchId).forEach(removeTransaction);
        setSelectedBatchId(null);
    }

    const handleCommitSingleTransaction = (transaction: Transaction) => {
        addTransaction(transaction);
        setDraftTransactions((prev) => prev.filter((t) => t.id !== transaction.id));
    }

    const highlightedBatchCount = selectedBatchId
        ? transactions.filter((t) => t.batchId === selectedBatchId).length
        : 0;

    function formatTransaction(entry: LedgerEntry): string {
        const transaction = entry.transaction;

        switch (transaction.type) {
            case 'FBUY':
            case 'FSELL':
                return `${transaction.type === 'FBUY' ? 'Bought' : 'Sold'} ${transaction.amount} share(s) for $${(transaction.amount * transaction.pricePerUnit).toFixed(2)}`;
            case 'DBUY':
            case 'DSELL':
                return `${transaction.type === 'DBUY' ? 'Bought' : 'Sold'} ${entry.executionAmount ?? 0} share(s) for $${((entry.executionAmount ?? 0) * (entry.executionPrice ?? 0)).toFixed(2)} (${(transaction.value * 100)}%)`;
            case 'DEPOSIT':
            case 'WITHDRAWAL':
                return `${transaction.type === 'DEPOSIT' ? 'DEPOSIT,' : 'WITHDRAW,'} $${transaction.amount.toFixed(2)}`;
            default:
                return `Unknown transaction type`;
        }
    }

    const draftTransactionIds = new Set(draftTransactions.map((t) => t.id));

    const ledgerItems = previewLedger.map((entry) => {
        const isDraft = draftTransactionIds.has(entry.transaction.id);
        const isBatchHighlighted = !isDraft && selectedBatchId !== null && entry.transaction.batchId === selectedBatchId;

        return (
            <li
                key={entry.transaction.id}
                className={`m-1 grid grid-cols-1 md:grid-cols-12 items-start md:items-center py-2 border-b border-gray-300 ${isDraft ? 'text-red-700 bg-red-50' : ''} ${isBatchHighlighted ? 'text-blue-700 bg-blue-50' : ''}`}
            >
                <div className="flex flex-col gap-1 w-full md:col-span-8">
                    <div>
                        <span className={entry.transaction.date === date ? "text-green-600" : ""}>
                            {`${entry.transaction.date}, `}
                        </span>
                        <span>
                            {entry.transaction.type === 'FBUY' || entry.transaction.type === 'FSELL' ? `${entry.transaction.ticker} Share Price: $${entry.transaction.pricePerUnit.toFixed(2)}` : entry.transaction.type === 'DBUY' || entry.transaction.type === 'DSELL' ? `${entry.transaction.ticker} Share Price: $${entry.executionPrice?.toFixed(2) ?? 'N/A'}` : ""}
                        </span>
                    </div>

                    <span>
                        {`$${entry.currentCash.toFixed(2)}, `}
                        {formatTransaction(entry)}
                    </span>
                    <span className={`text-xs ${isDraft ? 'text-red-600' : 'text-gray-500'}`}>
                        {`Batch ${entry.transaction.batchId}`}
                    </span>
                </div>

                <div className="md:col-span-1"> 
                    <span className={`text-lg font-medium text-red-600 ${entry.error ? 'visible' : 'invisible'}`}>
                        Error
                    </span>
                </div>


                <div className="flex flex-col gap-2 mt-2 md:mt-0 justify-end w-full md:w-24 md:col-span-3 md:justify-self-end">
                    {!isDraft ? (
                        <button
                            onClick={() => setSelectedBatchId(isBatchHighlighted ? null : entry.transaction.batchId)}
                            className="px-3 py-1 bg-white text-gray-700 rounded hover:bg-gray-100 transition-colors text-sm font-medium"
                        >
                            {isBatchHighlighted ? 'Clear' : 'Select'}
                        </button>
                    ) : (
                        <button
                            onClick={() => handleCommitSingleTransaction(entry.transaction)}
                            className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors text-sm font-medium"
                        >
                            Commit
                        </button>
                    )}
                    <button
                        onClick={() => isDraft ? setDraftTransactions(prev => prev.filter((t) => t.id !== entry.transaction.id)) : removeTransaction(entry.transaction)}
                        className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded transition-colors text-sm font-medium"
                    >
                        Remove
                    </button>
                </div>
            </li>
        );
    });

    const tradeInputs = (
        <div className="flex flex-col w-full gap-2 p-2">
            <div className="flex flex-row w-full items-center justify-between text-gray-700"> 
                <div className="flex flex-row">
                    <h1>Select Stock: </h1>
                    {/* Dropdown to select stock for transaction */}
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

                {/* Input field for number of stocks/percentage of cash */}
                {fixedOrDynamic === "FIXED" ? (
                    <div className="flex text-gray-700">
                        <h1>Number of Stocks: </h1>
                        <input
                            type="number"
                            value={numStocks}
                            onChange={(e) => setNumStocks(Number(e.target.value))}
                            className="w-16 bg-white border border-gray-400 rounded ml-2"
                        />
                        <button onClick={() => setFixedOrDynamic("DYNAMIC")} className="flex w-6 ml-2 items-center justify-center bg-gray-300 rounded hover:bg-gray-400">#</button>
                    </div>
                ) : (
                    <div className="flex text-gray-700">
                        <h1>Percentage of Cash: </h1>
                        <input
                            type="number"
                            value={percentOfCash}
                            onChange={(e) => setPercentOfCash(Number(e.target.value))}
                            className="w-16 bg-white border border-gray-400 rounded ml-2"
                        />
                        <button onClick={() => setFixedOrDynamic("FIXED")} className="flex w-6 ml-2 justify-center bg-gray-300 rounded hover:bg-gray-400">%</button>
                    </div>
                )}
            </div>

            {/* Input field for trade fee */}
            <div className="flex text-gray-700">
                <h1>Trade Fee: </h1>
                <input
                    type="number"
                    value={tradeFee}
                    onChange={(e) => setTradeFee(Number(e.target.value))}
                    className="w-24 bg-white border border-gray-400 rounded ml-2"
                />
            </div>

            <div className="flex gap-2">
                {fixedOrDynamic === "FIXED" ? (
                    <>
                        <button onClick={() => handleAddTransaction({ type: "FBUY", ticker: selectedStock, amount: numStocks, pricePerUnit: currentPrice, fees: tradeFee })} className="bg-blue-600 text-white w-16 py-1 rounded hover:bg-blue-700">Buy #</button>
                        <button onClick={() => handleAddTransaction({ type: "FSELL", ticker: selectedStock, amount: numStocks, pricePerUnit: currentPrice, fees: tradeFee })} className="bg-blue-600 text-white w-16 py-1 rounded hover:bg-blue-700">Sell #</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => handleAddTransaction({ type: "DBUY", ticker: selectedStock, value: percentOfCash/100, fees: tradeFee })} className="bg-blue-600 text-white w-16 py-1 rounded hover:bg-blue-700">Buy %</button>
                        <button onClick={() => handleAddTransaction({ type: "DSELL", ticker: selectedStock, value: percentOfCash/100, fees: cashFee })} className="bg-blue-600 text-white w-16 py-1 rounded hover:bg-blue-700">Sell %</button>
                    </>
                )}
            </div>
        </div>
    );

    const cashInputs = (
        <div className="flex flex-col gap-2 m-2">
            {/* Input field for cash amount */}
            <div className="flex text-gray-700">
                <h1>Cash Amount: </h1>
                <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(Number(e.target.value))}
                    className="w-24 bg-white border border-gray-400 rounded ml-2"
                />
            </div>

            {/* Input field for cash fee */}
            <div className="flex text-gray-700">
                <h1>Cash Fee: </h1>
                <input
                    type="number"
                    value={cashFee}
                    onChange={(e) => setCashFee(Number(e.target.value))}
                    className="w-24 bg-white border border-gray-400 rounded ml-2"
                />
            </div>

            <div className="flex gap-2">
                <button onClick={() => handleAddTransaction({ type: "DEPOSIT", amount: cashAmount, fees: cashFee })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Deposit</button>
                <button onClick={() => handleAddTransaction({ type: "WITHDRAWAL", amount: cashAmount, fees: cashFee })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Withdraw</button>
            </div>
        </div>
    );

    const errorOutput = previewLedger.find(e => e.error)?.errorMessage || "No errors";

    return (
        <div className="flex flex-col w-full h-full p-4">

            {/* Header with date picker */}
            <div className="flex items-center justify-between"> 
                <h1 className="text-xl font-bold">Transactions</h1>
                <button onClick={() => setTradeOrCash("TRADE")} className="bg-blue-600 text-white px-5 py-1 rounded hover:bg-blue-700">Trade</button>
                <button onClick={() => setTradeOrCash("CASH")} className="bg-blue-600 text-white px-5 py-1 rounded hover:bg-blue-700">Cash</button>
                <StockDatePicker className="w-38" date={date} onDateChange={setDate} />
            </div>
            
            {/* Transaction buttons and inputs */}
            <div className="flex flex-wrap gap-2 mb-4">

            </div>

            {/* Input fields for transaction details */}
            <div className="flex flex-col mb-4 w-full h-1/2 border border-gray-400 rounded bg-gray-200 justify-between">
                <div className="flex w-full h-full">
                    <div className="w-full">
                        {tradeOrCash === "TRADE" ? tradeInputs : cashInputs}
                    </div>
                </div>

                {/* Current stock price and submit button */}
                <div className="flex items-center justify-between p-2">
                    <h1 className="text-lg font-bold">
                        Share Price: ${currentPrice.toFixed(2)} 
                    </h1>

                    <div className="flex gap-2">
                        <button 
                            onClick={handleSubmitTransactions}
                            disabled={draftTransactions.length === 0}
                            className="bg-green-600 disabled:bg-gray-400 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                            Submit Pending ({draftTransactions.length})
                        </button>
                        <button
                            onClick={handleRemoveHighlightedBatch}
                            disabled={!selectedBatchId}
                            className="bg-red-600 disabled:bg-gray-400 text-white px-2 py-1 rounded hover:bg-red-700"
                        >
                            Remove Batch ({highlightedBatchCount})
                        </button>
                    </div>
                </div>
            </div>

            {/* Ledger */}
            <div className="flex flex-col w-full h-full overflow-y-scroll border border-gray-400 rounded bg-gray-200">
                <ul className="w-full pb-48" >
                    {ledgerItems}
                </ul>
            </div>

            <div className="mt-4 text-red-600">{errorOutput}</div>
        </div>
    )
}