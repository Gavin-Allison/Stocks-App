import { useMemo, useState } from "react"

import { StockDatePicker } from "../common/datepicker"
import { validateLedger } from "../../stores/ledger"

import type { Transaction } from "../../types/transaction"

export const Transactions = ({
    symbols,
    transactions,
    priceData,
    addTransaction,
    removeTransaction,
    date,
    setDate,
    selectedStock,
    setSelectedStock
}: {
    symbols: string[],
    transactions: Transaction[]
    priceData: {symbol: string, data: Record<string, number>}[],
    addTransaction: (transaction: Transaction) => void
    removeTransaction: (transaction: Transaction) => void,
    date: string,
    setDate: (date: string) => void,
    selectedStock: string,
    setSelectedStock: (stock: string) => void
}) => {

    const [tradeFee, setTradeFee] = useState<number>(10);
    const [cashFee, setCashFee] = useState<number>(10);

    const ledger = useMemo(() => validateLedger(transactions, priceData), [transactions, priceData]);

    function formatTransaction(transaction: Transaction): string {
        switch (transaction.type) {
            case 'FBUY':
            case 'FSELL':
            return `${transaction.ticker}, ${transaction.amount} shares at ${transaction.pricePerUnit}`;
            
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

    const ledgerItems = ledger.map((entry) => (
        <li key={entry.transaction.id} className="flex justify-between items-center py-1">
            <span>
                {`${entry.transaction.date}, `}
                {`${entry.transaction.type}, `}
                {`$${entry.currentCash}, `}
                {formatTransaction(entry.transaction)}
            </span>
            <button onClick={() => removeTransaction(entry.transaction)} className="text-red-600 hover:text-red-800 ml-2">Remove</button>
        </li>
    ));

    const errorOutput = ledger.find(e => e.error)?.errorMessage || "No errors";

    const handleAddTransaction = (details: any) => {
        const transaction: Transaction = {
            ...details,
            id: crypto.randomUUID(),
            date: date,
        }
        addTransaction(transaction)
    }

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Transactions</h1>
            <div className="flex flex-nowrap gap-2 mb-4">
                <StockDatePicker className="w-36 border border-gray-300 rounded" date={date} onDateChange={setDate} />

                {/* Dropdown to select stock for transaction */}
                <select value={selectedStock} onChange={(e) => setSelectedStock(e.target.value)} className="border border-gray-300 rounded">
                    {symbols.map((symbol) => (
                        <option key={symbol} value={symbol}>
                            {symbol}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    value={tradeFee}
                    onChange={(e) => setTradeFee(Number(e.target.value))}
                    placeholder="Trade Fee"
                    className="w-24 border border-gray-300 rounded"
                />
                <input
                    type="number"
                    value={cashFee}
                    onChange={(e) => setCashFee(Number(e.target.value))}
                    placeholder="Cash Fee"
                    className="w-24 border border-gray-300 rounded"
                />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => handleAddTransaction({ type: "FBUY", ticker: selected, amount: 1, pricePerUnit: 100, fees: tradeFee })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Buy #</button>
                <button onClick={() => handleAddTransaction({ type: "FSELL", ticker: selected, amount: 1, pricePerUnit: 100, fees: tradeFee })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Sell #</button>
                <button onClick={() => handleAddTransaction({ type: "DBUY", ticker: selected, value: 0.2, fees: cashFee })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Buy %</button>
                <button onClick={() => handleAddTransaction({ type: "DSELL", ticker: selected, value: 0.2, fees: cashFee })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Sell %</button>
                <button onClick={() => handleAddTransaction({ type: "DEPOSIT", amount: 100, fees: cashFee })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Deposit</button>
                <button onClick={() => handleAddTransaction({ type: "WITHDRAWAL", amount: 100, fees: cashFee })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Withdraw</button>
            </div>
            <ul className="space-y-1">
                {ledgerItems}
            </ul>
            <div className="mt-4 text-red-600">{errorOutput}</div>
        </div>
    )
}