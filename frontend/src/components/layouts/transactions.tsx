import React from 'react';
import { useAppStore } from "../../stores/appStore";

import { TradeInputs } from "../transactions/tradeInputs";
import { CashInputs } from "../transactions/cashInputs";
import { PromptInputs } from "../transactions/promptInputs";
import { RepeatSchedule } from "../transactions/repeatSchedule";
import { LedgerList } from "../transactions/ledgerList";

import { StockDatePicker } from "../common/datepicker";
import { Button, Panel } from "../common/ui";

import type { Transaction } from "../../types/transactionType";

export const Transactions = () => {
    const date = useAppStore(s => s.date);
    const setDate = useAppStore(s => s.setDate);
    const selectedStock = useAppStore(s => s.selectedStock);
    const addTransaction = useAppStore(s => s.addTransaction);
    const addTransactionBatch = useAppStore(s => s.addTransactionBatch);
    const removeTransactionBatch = useAppStore(s => s.removeTransactionBatch);
    const commitTransactionBatch = useAppStore(s => s.commitTransactionBatch);
    const getLedger = useAppStore(s => s.getLedger);

    const tradeOrCash = useAppStore(s => s.tradeOrCash);
    const setTradeOrCash = useAppStore(s => s.setTradeOrCash);
    const fixedOrDynamic = useAppStore(s => s.fixedOrDynamic);
    const numStocks = useAppStore(s => s.numStocks);
    const percentOfCash = useAppStore(s => s.percentOfCash);
    const tradeFee = useAppStore(s => s.tradeFee);
    const cashAmount = useAppStore(s => s.cashAmount);
    const cashFee = useAppStore(s => s.cashFee);
    const repeatFrequency = useAppStore(s => s.repeatFrequency);
    const repeatIntervalDays = useAppStore(s => s.repeatIntervalDays);
    const repeatOccurrences = useAppStore(s => s.repeatOccurrences);
    const draftBatchCount = useAppStore(s => s.draftBatchCount);
    const selectedBatchId = useAppStore(s => s.selectedBatchId);
    const selectedBatchCount = useAppStore(s => s.selectedBatchCount);
    const currentPrice = useAppStore(s => s.currentPrice);
    const prompt = useAppStore(s => s.prompt);
    const getPromptResponse = useAppStore(s => s.getPromptResponse);
    const getStockPriceAtDate = useAppStore(s => s.getStockPriceAtDate);

    const transactions = useAppStore(s => s.transactions);
    const priceData = useAppStore(s => s.priceData);

    const ledger = React.useMemo(() => getLedger(), [transactions, priceData, getLedger]);

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

            const occurrenceDate = occurrence.toISOString().split("T")[0];
            const dateSpecificPrice = (details.type === 'FBUY' || details.type === 'FSELL')
                ? getStockPriceAtDate(details.ticker, occurrenceDate) ?? details.pricePerUnit
                : details.pricePerUnit;

            result.push({
                ...details,
                id: crypto.randomUUID(),
                date: occurrenceDate,
                pricePerUnit: dateSpecificPrice,
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

    

    return (
        <div className="flex flex-col w-full h-full p-4">

            {/* Header with date picker */}
                        <div className="flex items-center justify-between"> 
                                <h1 className="text-xl font-bold">Transactions</h1>
                                <div className="flex gap-2">
                                    <Button onClick={() => setTradeOrCash("TRADE")} className="px-5">Trade</Button>
                                    <Button onClick={() => setTradeOrCash("CASH")} className="px-5">Cash</Button>
                                    <Button onClick={() => setTradeOrCash("AI")} className="px-5">AI</Button>
                                </div>
                                <StockDatePicker className="w-38" date={date} onDateChange={setDate} />
                        </div>
            
            <div className="flex flex-wrap gap-2 mb-4"></div>

            {/* Input fields for transaction details */}
            <Panel muted className="w-full">
                
                <>
                    {tradeOrCash === "TRADE" && <> <TradeInputs /> <RepeatSchedule /> </>}
                    {tradeOrCash === "CASH" && <> <CashInputs /><RepeatSchedule /> </>}
                    {tradeOrCash === "AI" && <PromptInputs />}
                </>

                {/* Execution and Submission Management */}
                <div className="flex items-center justify-between p-2">
                    <div className="flex gap-2">
                        {tradeOrCash === "AI" ? (
                            <Button onClick={() => getPromptResponse(prompt)}>Submit</Button>
                        ) : tradeOrCash === "CASH" ? (
                            <>
                                <Button onClick={() => handleAddTransaction({ id: crypto.randomUUID(), type: "DEPOSIT", amount: cashAmount, fees: cashFee })}>Deposit</Button>
                                <Button onClick={() => handleAddTransaction({ id: crypto.randomUUID(), type: "WITHDRAWAL", amount: cashAmount, fees: cashFee })}>Withdraw</Button>
                            </>
                    ) : fixedOrDynamic === "FIXED" ? (
                            <>
                                <Button onClick={() => handleAddTransaction({ id: crypto.randomUUID(), type: "FBUY", ticker: selectedStock, amount: numStocks, pricePerUnit: currentPrice, fees: tradeFee })} className="w-20">Buy #</Button>
                                <Button onClick={() => handleAddTransaction({ id: crypto.randomUUID(), type: "FSELL", ticker: selectedStock, amount: numStocks, pricePerUnit: currentPrice, fees: tradeFee })} className="w-20">Sell #</Button>
                            </>
                        ) : (
                            <>
                                <Button onClick={() => handleAddTransaction({ id: crypto.randomUUID(), type: "DBUY", ticker: selectedStock, value: percentOfCash / 100, fees: tradeFee })} className="w-20">Buy %</Button>
                                <Button onClick={() => handleAddTransaction({ id: crypto.randomUUID(), type: "DSELL", ticker: selectedStock, value: percentOfCash / 100, fees: cashFee })} className="w-20">Sell %</Button>
                            </>
                        )}                  
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={() => commitTransactionBatch("Preview")} className="px-2" disabled={draftBatchCount === 0} variant="success">Submit Pending ({draftBatchCount})</Button>
                        <Button onClick={() => removeTransactionBatch(selectedBatchId!)} className="px-2" disabled={selectedBatchCount === 0} variant="danger">Remove Batch ({selectedBatchCount})</Button>
                    </div>
                </div>
            </Panel>

            {/* Ledger */}
            <LedgerList ledger={ledger} />

            {/* Error Output */}
            <div className="text-red-600">{ledger.find(e => e.error)?.errorMessage || "No errors"}</div>
        </div>    
    );
};