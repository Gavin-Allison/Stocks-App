import { useMemo } from "react";
import { useAppStore } from "../../stores/appStore";

import { TradeInputs } from "../transactions/tradeInputs";
import { CashInputs } from "../transactions/cashInputs";
import { LedgerList } from "../transactions/ledgerList";

import { StockDatePicker } from "../common/datepicker";
import { validateLedger } from "../../stores/ledger";

import type { Transaction } from "../../types/transaction";

export const Transactions = () => {
    const { 
        // Global state
        transactions, 
        priceData, 
        date, 
        setDate, 
        selectedStock, 
        addTransaction, 
        removeTransactionBatch,
        commitTransactionBatch,

        // Local UI state
        tradeOrCash,
        setTradeOrCash,
        fixedOrDynamic,
        numStocks,
        percentOfCash,
        tradeFee,
        cashAmount,
        cashFee,
        draftBatchId,
        draftBatchCount,
        setDraftBatchId,
        selectedBatchId,
        selectedBatchCount,
        currentPrice
    } = useAppStore();

    const ledger = useMemo(() => {
        return validateLedger(transactions, priceData);
    }, [transactions, priceData]);

    const handleAddTransaction = (details: any) => {
        const batchId = draftBatchId ?? crypto.randomUUID();
        if (!draftBatchId) setDraftBatchId(batchId);

            const transaction: Transaction = {
                ...details,
                id: crypto.randomUUID(),
                date,
                batchId,
                committed: false,
            };

            addTransaction(transaction);
    };

    return (
        <div className="flex flex-col w-full h-full p-4">

            {/* Header with date picker */}
            <div className="flex items-center justify-between"> 
                <h1 className="text-xl font-bold">Transactions</h1>
                <button onClick={() => setTradeOrCash("TRADE")} className="bg-blue-600 text-white px-5 py-1 rounded hover:bg-blue-700">Trade</button>
                <button onClick={() => setTradeOrCash("CASH")} className="bg-blue-600 text-white px-5 py-1 rounded hover:bg-blue-700">Cash</button>
                <StockDatePicker className="w-38" date={date} onDateChange={setDate} />
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4"></div>

            {/* Input fields for transaction details */}
            <div className="flex flex-col mb-4 w-full h-1/2 border border-gray-400 rounded bg-gray-200 justify-between">
                
                {tradeOrCash === "TRADE" ? <TradeInputs /> : <CashInputs />}
                
                {/* Execution and Submission Management */}
                <div className="flex items-center justify-between p-2">
                    <div className="flex gap-2">
                        {tradeOrCash === "CASH" ? (
                            <>
                                <button onClick={() => handleAddTransaction({ type: "DEPOSIT", amount: cashAmount, fees: cashFee })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Deposit</button>
                                <button onClick={() => handleAddTransaction({ type: "WITHDRAWAL", amount: cashAmount, fees: cashFee })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Withdraw</button>
                            </>
                        ) : fixedOrDynamic === "FIXED" ? (
                            <>
                                <button onClick={() => handleAddTransaction({ type: "FBUY", ticker: selectedStock, amount: numStocks, pricePerUnit: currentPrice, fees: tradeFee })} className="bg-blue-600 text-white w-20 py-1 rounded hover:bg-blue-700">Buy #</button>
                                <button onClick={() => handleAddTransaction({ type: "FSELL", ticker: selectedStock, amount: numStocks, pricePerUnit: currentPrice, fees: tradeFee })} className="bg-blue-600 text-white w-20 py-1 rounded hover:bg-blue-700">Sell #</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => handleAddTransaction({ type: "DBUY", ticker: selectedStock, value: percentOfCash / 100, fees: tradeFee })} className="bg-blue-600 text-white w-20 py-1 rounded hover:bg-blue-700">Buy %</button>
                                <button onClick={() => handleAddTransaction({ type: "DSELL", ticker: selectedStock, value: percentOfCash / 100, fees: cashFee })} className="bg-blue-600 text-white w-20 py-1 rounded hover:bg-blue-700">Sell %</button>
                            </>
                        )}                     
                    </div>

                    <div className="flex gap-2">
                        <button 
                            onClick={() => commitTransactionBatch(draftBatchId!)}
                            disabled={draftBatchCount === 0}
                            className="bg-green-600 disabled:bg-gray-400 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                            Submit Pending ({draftBatchCount})
                        </button>
                        <button
                            onClick={() => removeTransactionBatch(selectedBatchId!)}
                            disabled={selectedBatchCount === 0}
                            className="bg-red-600 disabled:bg-gray-400 text-white px-2 py-1 rounded hover:bg-red-700"
                        >
                            Remove Batch ({selectedBatchCount})
                        </button>
                    </div>
                </div>
            </div>

            {/* Ledger */}
            <LedgerList ledger={ledger} />

            {/* Error Output */}
            <div className="mt-4 text-red-600">{ledger.find(e => e.error)?.errorMessage || "No errors"}</div>
        </div>
    );
};