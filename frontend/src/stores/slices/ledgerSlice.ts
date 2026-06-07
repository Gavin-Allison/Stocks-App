import type { StateCreator } from 'zustand';
import type { LedgerEntry } from '../../types/ledgerEntry';
import type { Transaction } from '../../types/transactionType';
import type { mainSlice } from './mainSlice';
import type { transactionSlice } from './transactionSlice';

/**
 * Validate transaction history and build ledger entries with running cash asset state.
 * Detects errors such as insufficient cash or shares and marks ignored entries.
 */
const validateLedger = (transactions: Transaction[], priceData: {symbol: string, data: Record<string, number>}[]): LedgerEntry[] => {
    let cash = 0;
    const assets: Record<string, number> = {};
    let error = false;
    let errorMessage: string | undefined;
    let ignore = false;

    return transactions.map((t) => {
        let executionAmount: number | undefined;
        let executionPrice: number | undefined;
        let executionCash: number | undefined;

        if (!error) {
            switch(t.type) {
                case "DEPOSIT":
                    cash += t.amount - t.fees;
                    break;

                case "WITHDRAWAL":
                    cash -= t.amount - t.fees;
                    executionCash = t.amount - t.fees;
                    if (cash < 0) {
                        error = true;
                        errorMessage = "Withdrew cash that you do not have";
                    };
                    break;

                case "FBUY":
                    cash -= t.pricePerUnit * t.amount;
                    assets[t.ticker] = (assets[t.ticker] ?? 0) + t.amount;
                    cash -= t.fees;
                    executionAmount = t.amount;
                    executionPrice = t.pricePerUnit;
                    executionCash = t.pricePerUnit * t.amount + t.fees;
                    if (cash < 0) {
                        error = true;
                        errorMessage = "Bought shares with cash you do not have";
                    };
                    break;

                case "FSELL":
                    assets[t.ticker] = (assets[t.ticker] ?? 0) - t.amount;
                    cash += t.pricePerUnit * t.amount;
                    cash -= t.fees;
                    executionAmount = t.amount;
                    executionPrice = t.pricePerUnit;
                    executionCash = t.pricePerUnit * t.amount - t.fees;
                    if (assets[t.ticker] < 0) {
                        error = true;
                        errorMessage = "Sold shares you do not have";
                    };
                    break;

                case "DBUY":
                    const dateBuy = t.date;
                    const priceDataEntryBuy = priceData.find(p => p.symbol.toLowerCase() === t.ticker.toLowerCase());
                    const pricePerShareBuy = priceDataEntryBuy ? priceDataEntryBuy.data[dateBuy] : undefined;

                    if (pricePerShareBuy === undefined) {
                        error = true;
                        errorMessage = "Current price data not found for ticker: " + t.ticker;
                    } else {
                        const moneyToSpend = cash * t.value;
                        const shares = Math.trunc(moneyToSpend / pricePerShareBuy);
                        const leftover = moneyToSpend % pricePerShareBuy;

                        cash -= (moneyToSpend - leftover);
                        assets[t.ticker] = (assets[t.ticker] ?? 0) + shares;
                        cash -= t.fees;

                        executionAmount = shares;
                        executionPrice = pricePerShareBuy;
                        executionCash = (moneyToSpend - leftover) + t.fees;

                        if (cash < 0) {
                            error = true;
                            errorMessage = "Bought shares with cash you do not have";
                        }
                    }
                    break;
                
                case "DSELL":
                    const dateSell = t.date;
                    const priceDataEntrySell = priceData.find(p => p.symbol.toLowerCase() === t.ticker.toLowerCase());
                    const pricePerShareSell= priceDataEntrySell ? priceDataEntrySell.data[dateSell] : undefined;
                    
                    if (pricePerShareSell === undefined) {
                        error = true;
                        errorMessage = "Current price data not found for ticker: " + t.ticker;
                    } else {
                        const sharesToSell = Math.ceil((assets[t.ticker] ?? 0) * t.value);
                        const moneyGained = sharesToSell * pricePerShareSell;
                        
                        cash += moneyGained;
                        assets[t.ticker] = (assets[t.ticker] ?? 0) - sharesToSell;
                        cash -= t.fees;

                        executionAmount = sharesToSell;
                        executionPrice = pricePerShareSell;
                        executionCash = moneyGained - t.fees;
                        
                        if (assets[t.ticker] < 0) {
                            error = true;
                            errorMessage = "Sold shares you do not have";
                        }
                    }
                    break;
            }
        } else {
            ignore = true;
        }

        return {
            transaction: t,
            currentCash: cash,
            currentAssets: { ...assets },
            error: error,
            errorMessage: errorMessage,
            ignore: ignore,
            executionAmount,
            executionPrice,
            executionCash,
        };
    });
};

export interface ledgerSlice {
    getLedger: () => LedgerEntry[];
}

/**
 * Ledger slice that exposes a memoized ledger computation for the transaction history.
 */
export const createLedgerSlice: StateCreator<mainSlice & transactionSlice & ledgerSlice, [], [], ledgerSlice> = (_set, get) => ({
    getLedger: (() => {
        let lastTransactions: Transaction[] | null = null;
        let lastPriceData: {symbol: string, data: Record<string, number>}[] | null = null;
        let lastResult: LedgerEntry[] | null = null;

        return () => {
            const { transactions, priceData } = get();

            if (lastResult && transactions === lastTransactions && priceData === lastPriceData) {
                return lastResult;
            }

            const result = validateLedger(transactions, priceData);
            lastTransactions = transactions;
            lastPriceData = priceData;
            lastResult = result;
            return result;
        };
    })(),
});