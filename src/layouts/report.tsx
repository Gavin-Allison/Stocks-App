import type { Transaction } from "../types/transaction"

import { Tutorial } from "../components/report/tutorial"
import { Overview } from "../components/report/overview"
import { Transactions } from "../components/report/transactions"
import { Results } from "../components/report/results"

export const Report = ({ 
    tab,
    transactions,
    addTransaction,
    removeTransaction
}: { 
    tab: string,
    transactions: Transaction[],
    addTransaction: (transaction: Transaction) => void,
    removeTransaction: () => void,
}) => {
    if (tab === "Tutorial") {
        return <Tutorial />;
    } else if (tab === "Overview") {
        return <Overview />;
    } else if (tab === "Transactions") {
        return <Transactions 
            transactions={transactions}
            addTransaction={addTransaction}
            removeTransaction={removeTransaction}
        />
    } else {
        return <Results />;
    }
}