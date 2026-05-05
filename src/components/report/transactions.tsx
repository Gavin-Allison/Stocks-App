import type { Transaction } from "../../types/transaction"

export const Transactions = ({
    transactions,
    addTransaction,
    removeTransaction
}: {
    transactions: Transaction[]
    addTransaction: (transaction: Transaction) => void
    removeTransaction: (transaction: Transaction) => void
}) => {

    function formatTransaction(transaction: Transaction): string {
        switch (transaction.type) {
            case 'BUY':
            case 'SELL':
            if ('amount' in transaction) {
                return `${transaction.type}, ${transaction.ticker}, ${transaction.amount} shares at ${transaction.pricePerUnit}`;
            }
            return `${transaction.type}, ${transaction.ticker}, ${transaction.value * 100}%`;

            case 'DEPOSIT':
            case 'WITHDRAWAL':
            return `${transaction.type}, $${transaction.amount}`;

            case 'DIVIDEND':
            return `${transaction.type}, ${transaction.ticker}, $${transaction.amount}, (${transaction.isReinvested ? 'reinvested' : 'cash'})`;
        }
    }

    const transactionsItems = transactions.map((transaction: any) => (
        <li key={transaction.id}>
            {formatTransaction(transaction)}
            <button onClick={() => removeTransaction(transaction)}>, Remove</button>
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
        <button onClick={() => handleAddTransaction({ type: "BUY", ticker: "CM.TO", amount: 1, pricePerUnit: 100, fees: 10 })}>buy flat</button>
        <button onClick={() => handleAddTransaction({ type: "SELL", ticker: "CM.TO", amount: 1, pricePerUnit: 100, fees: 10 })}>sell </button>
        <button onClick={() => handleAddTransaction({ type: "DEPOSIT", amount: 100, fees: 10 })}>deposit </button>
        <button onClick={() => handleAddTransaction({ type: "WITHDRAWAL", amount: 100, fees: 10 })}>withdraw </button>
        <button onClick={() => handleAddTransaction({ type: "BUY", ticker: "CM.TO", value: 0.2, fees: 10 })}>buy % </button>
        <button onClick={() => handleAddTransaction({ type: "SELL", ticker: "CM.TO", value: 0.2, fees: 10 })}>sell % </button>
        <ul>{transactionsItems}</ul>
        </>
        
        
    )
}