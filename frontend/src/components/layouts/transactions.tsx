import { useAppStore } from "../../stores/appStore";

import { TradeInputs } from "../transactions/tradeInputs";
import { CashInputs } from "../transactions/cashInputs";
import { PromptInputs } from "../transactions/promptInputs";
import { RepeatSchedule } from "../transactions/repeatSchedule";
import { LedgerList } from "../transactions/ledgerList";

import { StockDatePicker } from "../common/datepicker";

import type { Transaction } from "../../types/transaction";

export const Transactions = () => {
    const { 
        // Global state 
        date, 
        setDate, 
        selectedStock, 
        addTransaction, 
        addTransactionBatch,
        removeTransactionBatch,
        commitTransactionBatch,
        getLedger,

        // Local UI state
        tradeOrCash,
        setTradeOrCash,
        fixedOrDynamic,
        numStocks,
        percentOfCash,
        tradeFee,
        cashAmount,
        cashFee,
        repeatFrequency,
        repeatIntervalDays,
        repeatOccurrences,
        draftBatchCount,
        selectedBatchId,
        selectedBatchCount,
        currentPrice,
        prompt,
        getPromptResponse
    } = useAppStore();

    const addMonths = (dateValue: Date, months: number) => {
        const result = new Date(dateValue);
        const day = result.getDate();
        result.setDate(1);
        result.setMonth(result.getMonth() + months);
        const daysInMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
        result.setDate(Math.min(day, daysInMonth));
        return result;
    };

    const addYears = (dateValue: Date, years: number) => {
        const result = new Date(dateValue);
        const day = result.getDate();
        const month = result.getMonth();
        result.setFullYear(result.getFullYear() + years);
        const daysInMonth = new Date(result.getFullYear(), month + 1, 0).getDate();
        result.setDate(Math.min(day, daysInMonth));
        return result;
    };

    const buildScheduledTransactions = (details: any) => {
        const occurrences = repeatFrequency === "NONE" ? 1 : Math.max(1, repeatOccurrences);
        const startDate = new Date(date);
        const result: Transaction[] = [];

        for (let index = 0; index < occurrences; index += 1) {
            const occurrence = new Date(startDate);
            if (repeatFrequency === "MONTHLY") {
                const nextDate = addMonths(startDate, index);
                occurrence.setTime(nextDate.getTime());
            } else if (repeatFrequency === "YEARLY") {
                const nextDate = addYears(startDate, index);
                occurrence.setTime(nextDate.getTime());
            } else if (repeatFrequency === "EVERY_X_DAYS") {
                occurrence.setDate(startDate.getDate() + repeatIntervalDays * index);
            }

            result.push({
                ...details,
                id: crypto.randomUUID(),
                date: occurrence.toISOString().split("T")[0],
                batchId: "Preview",
                committed: false,
            });
        }

        return result;
    };

    const handleAddTransaction = (details: any) => {
        const scheduledTransactions = buildScheduledTransactions(details);

        if (scheduledTransactions.length === 1) {
            addTransaction(scheduledTransactions[0]);
        } else {
            addTransactionBatch(scheduledTransactions);
        }
    };

    const ledger = getLedger();

    return (
        <div className="flex flex-col w-full h-full p-4">

            {/* Header with date picker */}
            <div className="flex items-center justify-between"> 
                <h1 className="text-xl font-bold">Transactions</h1>
                <button onClick={() => setTradeOrCash("TRADE")} className="bg-blue-600 text-white px-5 py-1 rounded hover:bg-blue-700">Trade</button>
                <button onClick={() => setTradeOrCash("CASH")} className="bg-blue-600 text-white px-5 py-1 rounded hover:bg-blue-700">Cash</button>
                <button onClick={() => setTradeOrCash("AI")} className="bg-blue-600 text-white px-5 py-1 rounded hover:bg-blue-700">AI</button>
                <StockDatePicker className="w-38" date={date} onDateChange={setDate} />
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4"></div>

            {/* Input fields for transaction details */}
            <div className="flex flex-col mb-4 w-full border border-gray-400 rounded bg-gray-200 p-4">
                
                <>
                    {tradeOrCash === "TRADE" && <> <TradeInputs /> <RepeatSchedule /> </>}
                    {tradeOrCash === "CASH" && <> <CashInputs /><RepeatSchedule /> </>}
                    {tradeOrCash === "AI" && <PromptInputs />}
                </>

                {/* Execution and Submission Management */}
                <div className="flex items-center justify-between p-2">
                    <div className="flex gap-2">
                        {tradeOrCash === "AI" ? (
                            <button
                                onClick={(() => getPromptResponse(prompt))}
                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                            >
                                Submit
                            </button>
                        ) : tradeOrCash === "CASH" ? (
                            <>
                                <button onClick={() => handleAddTransaction({ id: crypto.randomUUID(), type: "DEPOSIT", amount: cashAmount, fees: cashFee })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                                    Deposit
                                </button>
                                <button onClick={() => handleAddTransaction({ id: crypto.randomUUID(), type: "WITHDRAWAL", amount: cashAmount, fees: cashFee })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                                    Withdraw
                                </button>
                            </>
                    ) : fixedOrDynamic === "FIXED" ? (
                            <>
                                <button onClick={() => handleAddTransaction({ id: crypto.randomUUID(), type: "FBUY", ticker: selectedStock, amount: numStocks, pricePerUnit: currentPrice, fees: tradeFee })} className="bg-blue-600 text-white w-20 py-1 rounded hover:bg-blue-700">
                                    Buy #
                                </button>
                                <button onClick={() => handleAddTransaction({ id: crypto.randomUUID(), type: "FSELL", ticker: selectedStock, amount: numStocks, pricePerUnit: currentPrice, fees: tradeFee })} className="bg-blue-600 text-white w-20 py-1 rounded hover:bg-blue-700">
                                    Sell #
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => handleAddTransaction({ id: crypto.randomUUID(), type: "DBUY", ticker: selectedStock, value: percentOfCash / 100, fees: tradeFee })} className="bg-blue-600 text-white w-20 py-1 rounded hover:bg-blue-700">
                                    Buy %
                                </button>
                                <button onClick={() => handleAddTransaction({ id: crypto.randomUUID(), type: "DSELL", ticker: selectedStock, value: percentOfCash / 100, fees: cashFee })} className="bg-blue-600 text-white w-20 py-1 rounded hover:bg-blue-700">
                                    Sell %
                                </button>
                            </>
                        )}                  
                    </div>

                    <div className="flex gap-2">
                        <button 
                            onClick={() => commitTransactionBatch("Preview")}
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