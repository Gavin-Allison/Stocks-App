import type { Transaction } from "../../types/transaction"

export const Transactions = ({
    transactions,
    addTransaction,
    removeTransaction
}: {
    transactions: Transaction[]
    addTransaction: () => void
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

    return (
        <>  
        <h1>Transactions</h1>
        <button onClick={() => addTransaction()}>add </button>
        <button onClick={() => removeTransaction()}>remove</button>
        <ul>{transactionsItems}</ul>
        </>
        
        
    )
}