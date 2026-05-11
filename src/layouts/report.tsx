import type { Transaction } from "../types/transaction"

import { Tutorial } from "../components/report/tutorial"
import { Overview } from "../components/report/overview"
import { Transactions } from "../components/report/transactions"
import { Results } from "../components/report/results"

export const Report = ({ 
    tab,
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
    tab: string,
    symbols: string[],
    transactions: Transaction[],
    priceData: {symbol: string, data: Record<string, number>}[],
    addTransaction: (transaction: Transaction) => void,
    removeTransaction: (transaction: Transaction) => void,
    date: string,
    setDate: (date: string) => void,
    selectedStock: string,
    setSelectedStock: (stock: string) => void,
}) => {
    if (tab === "Tutorial") {
        return <Tutorial />;
    } else if (tab === "Overview") {
        return <Overview />;
    } else if (tab === "Transactions") {
        return <Transactions 
            transactions={transactions}
            priceData={priceData}
            addTransaction={addTransaction}
            removeTransaction={removeTransaction}
            symbols={symbols}
            date={date}
            setDate={setDate}
            selectedStock={selectedStock}
            setSelectedStock={setSelectedStock}
        />
    } else {
        return <Results />;
    }
}