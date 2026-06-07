import React, { useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Button, Panel } from '../common/ui';
import { theme } from '../../styles/tokens';
import type { LedgerEntry } from '../../types/ledgerEntry';

type LedgerRowProps = {
    entry: LedgerEntry;
    date: string;
    selectedBatchId: string | null;
    onSelectBatch: (batchId: string | null) => void;
    onCommit: (t: any) => void;
    onRemove: (t: any) => void;
};

const LedgerRow = React.memo(function LedgerRow({ 
    entry, 
    date, 
    selectedBatchId, 
    onSelectBatch, 
    onCommit, 
    onRemove 
}: LedgerRowProps) {
    const isDraft = !entry.transaction.committed;
    const isBatchHighlighted = !isDraft && selectedBatchId !== null && entry.transaction.batchId === selectedBatchId;

    // Full description for standard view
    const formatTransaction = useCallback((entry: LedgerEntry) => {
        const transaction = entry.transaction as any;
        switch (transaction.type) {
            case 'FBUY': case 'FSELL':
                return `${transaction.type === 'FBUY' ? 'Bought' : 'Sold'} ${transaction.amount} share(s) for $${(transaction.amount * transaction.pricePerUnit).toFixed(2)}`;
            case 'DBUY': case 'DSELL':
                return `${transaction.type === 'DBUY' ? 'Bought' : 'Sold'} ${entry.executionAmount ?? 0} share(s) for $${((entry.executionAmount ?? 0) * (entry.executionPrice ?? 0)).toFixed(2)} (${(transaction.value * 100)}%)`;
            case 'DEPOSIT': case 'WITHDRAWAL':
                return `${transaction.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'} $${transaction.amount.toFixed(2)}`;
            default: return `Unknown transaction type`;
        }
    }, []);

    // Condensed description for shrunk view
    const formatShortTransaction = useCallback((entry: LedgerEntry) => {
        const transaction = entry.transaction as any;
        switch (transaction.type) {
            case 'FBUY': case 'FSELL':
                return `${transaction.type === 'FBUY' ? 'Bought' : 'Sold'} ${transaction.amount} for $${(transaction.amount * transaction.pricePerUnit).toFixed(2)}`;
            case 'DBUY': case 'DSELL':
                return `${transaction.type === 'DBUY' ? 'Bought' : 'Sold'} ${entry.executionAmount ?? 0} for $${((entry.executionAmount ?? 0) * (entry.executionPrice ?? 0)).toFixed(2)}`;
            case 'DEPOSIT': case 'WITHDRAWAL':
                return `${transaction.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'} $${transaction.amount.toFixed(2)}`;
            default: return `Unknown`;
        }
    }, []);

    const price = (entry.transaction.type === 'FBUY' || entry.transaction.type === 'FSELL') 
        ? (entry.transaction as any).pricePerUnit 
        : (entry.executionPrice ?? 0);

    return (
        <div className="px-1">
            <div className={`flex items-center gap-4 py-2 border-b border-gray-300 @container ${isDraft ? 'text-red-700 bg-red-50' : ''} ${isBatchHighlighted ? 'text-blue-700 bg-blue-50' : ''}`}>
                
                <div className="flex flex-col flex-grow min-w-0">
                    {/* Top row: Date + Ticker */}
                    <div className="whitespace-nowrap">
                        <span className={`${entry.transaction.date === date ? theme.text.success : ''}`}>
                            <span className="hidden @[400px]:inline">{`${entry.transaction.date}, `}</span>
                            {/* Short date YY/MM/DD for mobile */}
                            <span className="inline @[400px]:hidden">{`${entry.transaction.date.slice(2).replace(/-/g, '/')}, `}</span>

                            {(entry.transaction.type === 'FBUY' || entry.transaction.type === 'FSELL' || entry.transaction.type === 'DBUY' || entry.transaction.type === 'DSELL') && (
                                <>
                                    <span className="hidden @[400px]:inline">{`${entry.transaction.ticker} Share Price: $${price.toFixed(2)}`}</span>
                                    <span className="inline @[400px]:hidden">{`${entry.transaction.ticker}: $${price.toFixed(2)}`}</span>
                                </>
                            )}
                        </span>
                    </div>

                    {/* Middle row: Cash + Transaction details (layout shifts based on container width) */}
                    <div className="flex flex-col gap-1 @[400px]:flex-row whitespace-nowrap">
                        <span className="hidden @[400px]:inline">
                            {`$${entry.currentCash.toFixed(2)}, ${formatTransaction(entry)}`}
                        </span>

                        <span className="inline @[400px]:hidden">{`Cash: $${entry.currentCash.toFixed(2)},`}</span>
                        <span className="inline @[400px]:hidden">{formatShortTransaction(entry)}</span>
                    </div>

                    <span className={`mt-1 text-xs whitespace-nowrap hidden @[400px]:block ${isDraft ? theme.text.danger : theme.text.subtle}`}>
                        {`Batch ${entry.transaction.batchId}`}
                    </span>
                </div>

                {/* Status indicator */}
                <div className="flex-shrink-0 w-12 text-center">
                    <span className={`text-lg font-medium ${entry.ignore ? `${theme.text.primary} visible` : entry.error ? `${theme.text.danger} visible` : 'invisible'}`}>
                        {entry.ignore ? '━' : 'Error'}
                    </span>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 flex-shrink-0 w-24">
                    {!isDraft ? (
                        <Button
                            onClick={() => onSelectBatch(isBatchHighlighted ? null : entry.transaction.batchId)}
                            variant="light"
                            className="px-3"
                        >
                            {isBatchHighlighted ? 'Clear' : 'Select'}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => onCommit(entry.transaction)}
                            variant="success"
                            className="px-3"
                        >
                            Commit
                        </Button>
                    )}

                    <Button
                        onClick={() => onRemove(entry.transaction)}
                        variant="danger"
                        className="px-3"
                    >
                        Remove
                    </Button>
                </div>
            </div>
        </div>
    );
});

export const LedgerList = ({ ledger }: { ledger: LedgerEntry[] }) => {
    const selectedBatchId = useAppStore(state => state.selectedBatchId);
    const setSelectedBatchId = useAppStore(state => state.setSelectedBatchId);
    const removeTransaction = useAppStore(state => state.removeTransaction);
    const commitTransaction = useAppStore(state => state.commitTransaction);
    const date = useAppStore(state => state.date);

    if (!ledger || ledger.length === 0) {
        return <Panel muted className="h-full p-2">No transactions</Panel>;
    }

    return (
        <div className="flex-1 min-h-0 w-full @container flex flex-col">
            <Panel muted className="flex flex-col flex-1 p-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto min-h-0">
                    {ledger.map((entry, index) => (
                        <LedgerRow 
                            key={entry.transaction.id ?? index} 
                            entry={entry}
                            date={date}
                            selectedBatchId={selectedBatchId}
                            onSelectBatch={setSelectedBatchId}
                            onCommit={commitTransaction}
                            onRemove={removeTransaction}
                        />
                    ))}
                </div>
            </Panel>
        </div>
    );
};