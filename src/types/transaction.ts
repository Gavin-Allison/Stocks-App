// Shared properties for every single entry in the ledger
interface BaseTransaction {
    id: string;
    date: Date;
    batchId?: string;
}

interface FixedTrade extends BaseTransaction {
    type: 'BUY' | 'SELL';
    ticker: string;
    amount: number;       // Exact number of shares
    pricePerUnit: number; // Exact price paid
    fees: number;
}

interface FixedCash extends BaseTransaction {
    type: 'DEPOSIT' | 'WITHDRAWAL';
    amount: number;       // Exact dollar amount
    fees: number;
}

interface DynamicTrade extends BaseTransaction {
    type: 'BUY' | 'SELL';
    ticker: string;
    value: number; // e.g., 0.20 for 20%

    resolvedAmount?: number; 
    resolvedPrice?: number;
}

interface DividendAction extends BaseTransaction {
    type: 'DIVIDEND';
    ticker: string;
    amount: number; // Cash received
    isReinvested: boolean; // If true, triggers a secondary Fixed Buy
}

// Master Type
export type Transaction = FixedTrade | FixedCash | DynamicTrade | DividendAction;