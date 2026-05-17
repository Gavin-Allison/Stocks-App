import { useAppStore } from '../../stores/appStore';
import type { LedgerEntry } from '../../types/ledgerEntry';

export const LedgerList = ({ ledger }: { ledger: LedgerEntry[] }) => {
    const {
        date,
        selectedBatchId,
        setSelectedBatchId,
        removeTransaction,
        commitTransaction,
    } = useAppStore();

    {/* Function to format transaction details for display */}
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

    return (
        <div className="flex flex-col w-full h-full overflow-y-scroll border border-gray-400 rounded bg-gray-200">
            <ul className="w-full pb-48">
                {ledger.map((entry) => {
                    const isDraft = !entry.transaction.committed;
                    const isBatchHighlighted = !isDraft && selectedBatchId !== null && entry.transaction.batchId === selectedBatchId;

                    return (
                        <li
                            key={entry.transaction.id}
                            className={`m-1 grid grid-cols-1 md:grid-cols-12 items-start md:items-center py-2 border-b border-gray-300 ${isDraft ? 'text-red-700 bg-red-50' : ''} ${isBatchHighlighted ? 'text-blue-700 bg-blue-50' : ''}`}
                        >
                            {/* Column 1: Transaction details */}
                            <div className="flex flex-col gap-1 w-full md:col-span-8">
                                {/* Row 1: Date and Stock Price (if applicable) */}
                                <div>
                                    <span className={entry.transaction.date === date ? "text-green-600" : ""}>
                                        {`${entry.transaction.date}, `}
                                    </span>
                                    <span>
                                        {entry.transaction.type === 'FBUY' || entry.transaction.type === 'FSELL' 
                                            ? `${entry.transaction.ticker} Share Price: $${entry.transaction.pricePerUnit.toFixed(2)}` 
                                            : entry.transaction.type === 'DBUY' || entry.transaction.type === 'DSELL' 
                                            ? `${entry.transaction.ticker} Share Price: $${entry.executionPrice?.toFixed(2) ?? 'N/A'}` 
                                            : ""}
                                    </span>
                                </div>

                                {/* Row 2: Transaction Details */}
                                <span>
                                    {`$${entry.currentCash.toFixed(2)}, `}
                                    {formatTransaction(entry)}
                                </span>

                                {/* Row 3: Batch ID and Error Indicator */}
                                <span className={`text-xs ${isDraft ? 'text-red-600' : 'text-gray-500'}`}>
                                    {`Batch ${entry.transaction.batchId}`}
                                </span>
                            </div>

                            {/* Column 2: Error Indicator */}
                            <div className="md:col-span-1 flex justify-end md:justify-center w-full md:w-auto"> 
                                <span className={`text-lg font-medium ${entry.ignore ? 'text-black visible' : entry.error ? 'text-red-600 visible' : 'invisible'}`}>
                                    {entry.ignore ? '━' : 'Error'}
                                </span>
                            </div>


                            {/* Column 3: Action Buttons */}
                            <div className="flex flex-col gap-2 mt-2 md:mt-0 justify-end w-full md:w-24 md:col-span-3 md:justify-self-end">
                                {/* For committed transactions, show Select/Clear Batch button. For drafts, show Commit button. Always show Remove button. */}
                                {!isDraft ? (
                                    <button
                                        onClick={() => setSelectedBatchId(isBatchHighlighted ? null : entry.transaction.batchId)}
                                        className="px-3 py-1 bg-white text-gray-700 rounded hover:bg-gray-100 transition-colors text-sm font-medium"
                                    >
                                        {isBatchHighlighted ? 'Clear' : 'Select'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => commitTransaction(entry.transaction)}
                                        className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors text-sm font-medium"
                                    >
                                        Commit
                                    </button>
                                )}

                                {/* Remove transaction button */}
                                <button
                                    onClick={() => removeTransaction(entry.transaction)}
                                    className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded transition-colors text-sm font-medium"
                                >
                                    Remove
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};