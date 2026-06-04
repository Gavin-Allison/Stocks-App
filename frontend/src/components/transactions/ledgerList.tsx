import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { FixedSizeList } from 'react-window';
import type { ListChildComponentProps } from 'react-window';
import { useAppStore } from '../../stores/appStore';
import { Button, Panel } from '../common/ui';
import { theme } from '../../styles/tokens';
import type { LedgerEntry } from '../../types/ledgerEntry';

const ROW_HEIGHT = 88;

type RowData = {
    ledger: LedgerEntry[];
    selectedBatchId: string | null;
    date: string;
    onSelectBatch: (batchId: string | null) => void;
    onCommit: (t: any) => void;
    onRemove: (t: any) => void;
};

const Row = React.memo(function Row({ index, style, data }: ListChildComponentProps<RowData>) {
    const entry = data.ledger[index];
    const isDraft = !entry.transaction.committed;
    const isBatchHighlighted = !isDraft && data.selectedBatchId !== null && entry.transaction.batchId === data.selectedBatchId;

    const formatTransaction = useCallback((entry: LedgerEntry) => {
        const transaction = entry.transaction as any;
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
    }, []);

    return (
        <div style={style} className="px-1">
            <div className={`grid grid-cols-1 md:grid-cols-12 items-start md:items-center py-2 border-b border-gray-300 ${isDraft ? 'text-red-700 bg-red-50' : ''} ${isBatchHighlighted ? 'text-blue-700 bg-blue-50' : ''}`}>
                <div className="flex flex-col gap-1 w-full md:col-span-8">
                    <div>
                        <span className={entry.transaction.date === data.date ? theme.text.success : ''}>
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

                    <span>
                        {`$${entry.currentCash.toFixed(2)}, `}
                        {formatTransaction(entry)}
                    </span>

                    <span className={`text-xs ${isDraft ? theme.text.danger : theme.text.subtle}`}>
                        {`Batch ${entry.transaction.batchId}`}
                    </span>
                </div>

                <div className="md:col-span-1 flex justify-end md:justify-center w-full md:w-auto">
                    <span className={`text-lg font-medium ${entry.ignore ? `${theme.text.primary} visible` : entry.error ? `${theme.text.danger} visible` : 'invisible'}`}>
                        {entry.ignore ? '━' : 'Error'}
                    </span>
                </div>

                <div className="flex flex-col gap-2 mt-2 md:mt-0 justify-end w-full md:w-24 md:col-span-3 md:justify-self-end">
                    {!isDraft ? (
                        <Button
                            onClick={() => data.onSelectBatch(isBatchHighlighted ? null : entry.transaction.batchId)}
                            variant="light"
                            className="px-3"
                        >
                            {isBatchHighlighted ? 'Clear' : 'Select'}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => data.onCommit(entry.transaction)}
                            variant="success"
                            className="px-3"
                        >
                            Commit
                        </Button>
                    )}

                    <Button
                        onClick={() => data.onRemove(entry.transaction)}
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

    const [containerHeight, setContainerHeight] = useState(300);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.contentRect.height) {
                    setContainerHeight(entry.contentRect.height);
                }
            }
        });
        
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const onSelectBatch = useCallback((batchId: string | null) => setSelectedBatchId(batchId), [setSelectedBatchId]);
    const onCommit = useCallback((t: any) => commitTransaction(t), [commitTransaction]);
    const onRemove = useCallback((t: any) => removeTransaction(t), [removeTransaction]);

    const itemData = useMemo<RowData>(() => ({ ledger, selectedBatchId, date, onSelectBatch, onCommit, onRemove }), [ledger, selectedBatchId, date, onSelectBatch, onCommit, onRemove]);

    if (!ledger || ledger.length === 0) {
        return <Panel muted className="h-full p-2">No transactions</Panel>;
    }

    return (
        <div className="relative h-full w-full min-h-0 mb-4">
            <div ref={containerRef} className="absolute inset-0">
                <Panel muted className="h-full p-0">
                    <FixedSizeList
                        height={containerHeight}
                        itemCount={ledger.length}
                        itemSize={ROW_HEIGHT}
                        width="100%"
                        itemData={itemData}
                    >
                        {Row}
                    </FixedSizeList>
                </Panel>
            </div>
        </div>
    );
};