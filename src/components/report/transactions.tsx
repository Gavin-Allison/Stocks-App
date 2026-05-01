import type { Transaction } from "../../types/transaction"

export const Transactions = ({
    transactions,
    addTransaction,
    removeTransaction
}: {
    transactions: Transaction[]
    addTransaction: (transaction: Transaction) => void
    removeTransaction: () => void
}) => {

    const transactionsItems = transactions.map((transaction: any) => (
        <li key={transaction.id}>
            {transaction.id},
            {transaction.type},
            {transaction.ticker},
            {transaction.amount},
            {transaction.pricePerUnit},
            {transaction.fees}
        </li>
    ));

    const handleAddTransaction = (details: any) => {
        const transaction: Transaction = {
            ...details,
            id: crypto.randomUUID(),
            date: new Date(),
        }
        addTransaction(transaction)
    }

    return (
        <>  
        <h1>Transactions</h1>
        <button onClick={() => handleAddTransaction({ type: "BUY", ticker: "CM.TO", amount: 1, pricePerUnit: 100, fees: 10 })}>add </button>
        <button onClick={() => removeTransaction()}>remove</button>
        <ul>{transactionsItems}</ul>
        </>
        
        
    )
}