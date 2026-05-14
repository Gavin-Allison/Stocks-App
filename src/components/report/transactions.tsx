import { useMemo, useState } from "react"
import { useAppStore } from "../../stores/appStore"

import { StockDatePicker } from "../common/datepicker"
import { validateLedger } from "../../stores/ledger"

import type { Transaction } from "../../types/transaction"

export const Transactions = () => {
    const { stocks, transactions, priceData, date, selectedStock, setDate, setSelectedStock, addTransaction, removeTransaction, getStockPriceAtDate } = useAppStore()

    const [numStocks, setNumStocks] = useState<number>(1);
    const [tradeFee, setTradeFee] = useState<number>(10);
    const [cashFee, setCashFee] = useState<number>(10);
    const [draftTransactions, setDraftTransactions] = useState<Transaction[]>([]);

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

    function formatTransaction(transaction: Transaction): string {
        switch (transaction.type) {
            case 'FBUY':
            case 'FSELL':
            return `${transaction.ticker}, ${transaction.amount} shares at ${transaction.pricePerUnit.toFixed(2)}`;

            case 'DBUY':
            case 'DSELL':
            return `${transaction.ticker}, ${transaction.value * 100}%`;

            case 'DEPOSIT':
            case 'WITHDRAWAL':
            return `$${transaction.amount}`;

            case 'DIVIDEND':
            return `${transaction.ticker}, $${transaction.amount}, (${transaction.isReinvested ? 'reinvested' : 'cash'})`;

            default:
            return `Unknown transaction type`;
        }
    }

    const draftTransactionIds = new Set(draftTransactions.map((t) => t.id));

    const ledgerItems = previewLedger.map((entry) => {
        const isDraft = draftTransactionIds.has(entry.transaction.id);
        return (
            <li key={entry.transaction.id} className={`m-1 flex justify-between items-center py-1 border-b border-gray-300 ${isDraft ? 'text-red-700 bg-red-50' : ''}`}>
                <span>
                    {`${entry.transaction.date}, `}
                    {`${entry.transaction.type}, `}
                    {`$${entry.currentCash.toFixed(2)}, `}
                    {formatTransaction(entry.transaction)}
                </span>
                <button
                    onClick={() => isDraft ? setDraftTransactions(prev => prev.filter((t) => t.id !== entry.transaction.id)) : removeTransaction(entry.transaction)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                >
                    Remove
                </button>
            </li>
        );
    });

    const errorOutput = previewLedger.find(e => e.error)?.errorMessage || "No errors";

    const handleAddTransaction = (details: any) => {
        const transaction: Transaction = {
            ...details,
            id: crypto.randomUUID(),
            date: date,
        }
        setDraftTransactions((prev) => {
            const insertionIndex = prev.findIndex((t) => t.date > transaction.date);
            if (insertionIndex === -1) {
                return [...prev, transaction];
            }
            return [...prev.slice(0, insertionIndex), transaction, ...prev.slice(insertionIndex)];
        });
    }

    const handleSubmitTransactions = () => {
        draftTransactions.forEach((transaction) => addTransaction(transaction));
        setDraftTransactions([]);
    }

    return (
        <div className="flex flex-col w-full h-full p-4">

            {/* Header with date picker */}
            <div className="flex items-center justify-between mb-4"> 
                <h1 className="text-xl font-bold mb-4">Transactions</h1>
                <StockDatePicker className="w-38" date={date} onDateChange={setDate} />
            </div>
            
            {/* Transaction buttons and inputs */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => handleAddTransaction({ type: "FBUY", ticker: selectedStock, amount: numStocks, pricePerUnit: currentPrice, fees: tradeFee })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Buy #</button>
                <button onClick={() => handleAddTransaction({ type: "FSELL", ticker: selectedStock, amount: numStocks, pricePerUnit: currentPrice, fees: tradeFee })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Sell #</button>
                <button onClick={() => handleAddTransaction({ type: "DBUY", ticker: selectedStock, value: 0.2, fees: cashFee })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Buy %</button>
                <button onClick={() => handleAddTransaction({ type: "DSELL", ticker: selectedStock, value: 0.2, fees: cashFee })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Sell %</button>
                <button onClick={() => handleAddTransaction({ type: "DEPOSIT", amount: 100, fees: cashFee })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Deposit</button>
                <button onClick={() => handleAddTransaction({ type: "WITHDRAWAL", amount: 100, fees: cashFee })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Withdraw</button>
            </div>

            {/* Input fields for transaction details */}
            <div className="mb-4 w-full h-1/2 gap-2 border border-gray-400 rounded bg-gray-200">
                <div className="flex gap-2 p-2">
                    {/* Dropdown to select stock for transaction */}
                    <select value={selectedStock} onChange={(e) => setSelectedStock(e.target.value)} className="bg-white border border-gray-400 rounded">
                        {stocks.map((stock) => (
                            <option key={stock.ticker} value={stock.ticker}>
                                {stock.ticker}
                            </option>
                        ))}
                    </select>

                    {/* Input field for number of stocks */}
                    <input
                        type="number"
                        value={numStocks}
                        onChange={(e) => setNumStocks(Number(e.target.value))}
                        placeholder="Number of Stocks"
                        className="w-24 bg-white border border-gray-400 rounded"
                    />

                    {/* Input fields for trade fee and cash fee */}
                    <input
                        type="number"
                        value={tradeFee}
                        onChange={(e) => setTradeFee(Number(e.target.value))}
                        placeholder="Trade Fee"
                        className="w-24 bg-white border border-gray-400 rounded"
                    />
                    <input
                        type="number"
                        value={cashFee}
                        onChange={(e) => setCashFee(Number(e.target.value))}
                        placeholder="Cash Fee"
                        className="w-24 bg-white border border-gray-400 rounded"
                    />
                </div>

                <div>
                    <h1 className="ml-2 text-lg font-bold">Current Price: ${currentPrice.toFixed(2)}</h1>
                </div>

                {/* Button to submit pending transactions */}
                <button 
                    onClick={handleSubmitTransactions}
                    disabled={draftTransactions.length === 0}
                    className="ml-2 mr-2 bg-green-600 disabled:bg-gray-400 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                    Submit Pending ({draftTransactions.length})
                </button>
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