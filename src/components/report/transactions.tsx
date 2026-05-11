import { useMemo } from "react"

import { StockDatePicker } from "../common/datepicker"
import { validateLedger } from "../../stores/ledger"

import type { Transaction } from "../../types/transaction"

export const Transactions = ({
    transactions,
    priceData,
    addTransaction,
    removeTransaction
}: {
    transactions: Transaction[]
    priceData: {symbol: string, data: Record<string, number>}[],
    addTransaction: (transaction: Transaction) => void
    removeTransaction: (transaction: Transaction) => void
}) => {

    const ledger = useMemo(() => validateLedger(transactions, priceData), [transactions, priceData]);

    function formatTransaction(transaction: Transaction): string {
        switch (transaction.type) {
            case 'FBUY':
            case 'FSELL':
            return `${transaction.type}, ${transaction.ticker}, ${transaction.amount} shares at ${transaction.pricePerUnit}`;
            
            case 'DBUY':
            case 'DSELL':
            return `${transaction.type}, ${transaction.ticker}, ${transaction.value * 100}%`;

            case 'DEPOSIT':
            case 'WITHDRAWAL':
            return `${transaction.type}, $${transaction.amount}`;

            case 'DIVIDEND':
            return `${transaction.type}, ${transaction.ticker}, $${transaction.amount}, (${transaction.isReinvested ? 'reinvested' : 'cash'})`;

            default:
            return `Unknown transaction type`;
        }
    }

    const ledgerItems = ledger.map((entry) => (
        <li key={entry.transaction.id} className="flex justify-between items-center py-1">
            <span>
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
            date: "2024-10-25",
        }
        addTransaction(transaction)
    }

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Transactions</h1>
            <div><StockDatePicker /></div>
            <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => handleAddTransaction({ type: "FBUY", ticker: "CM.TO", amount: 1, pricePerUnit: 100, fees: 10 })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Buy Flat</button>
                <button onClick={() => handleAddTransaction({ type: "FSELL", ticker: "CM.TO", amount: 1, pricePerUnit: 100, fees: 10 })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Sell</button>
                <button onClick={() => handleAddTransaction({ type: "DEPOSIT", amount: 100, fees: 10 })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Deposit</button>
                <button onClick={() => handleAddTransaction({ type: "WITHDRAWAL", amount: 100, fees: 10 })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Withdraw</button>
                <button onClick={() => handleAddTransaction({ type: "DBUY", ticker: "CM.TO", value: 0.2, fees: 10 })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Buy %</button>
                <button onClick={() => handleAddTransaction({ type: "DSELL", ticker: "CM.TO", value: 0.2, fees: 10 })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Sell %</button>
            </div>
            <ul className="space-y-1">
                {ledgerItems}
            </ul>
            <div className="mt-4 text-red-600">{errorOutput}</div>
        </div>
    )
}