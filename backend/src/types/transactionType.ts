import { z } from "zod";

const baseSchema = {
    id: z.literal(1).describe("Unique identifier for the transaction. Leave this as the number 1, the frontend will replace it."),
    date: z.string().describe("ISO timestamp or date string. Do not create transactions that are dated before 5 years ago or in the future. If the prompt asks for transactions in that date range, do not return transactions for those out-of-range dates. Still return the transactions that are within the acceptable date range."),
    batchId: z.literal("Preview").describe("The batch ID group. 'Preview' indicates uncommitted transactions"),
    committed: z.literal(false).describe("Indicates if the transaction is finalized and committed to the ledger"),
};

export const transactionSchema = z.discriminatedUnion("type", [
    // Fixed Trade
    z.object({
        ...baseSchema,
        type: z.literal("FBUY").describe("Fixed Buy trade type. Exactly the string 'FBUY'"),
        ticker: z.string().describe("Stock/Asset ticker symbol in uppercase"),
        amount: z.number().describe("Exact number of shares bought"),
        pricePerUnit: z.number().describe("Exact price paid per unit"),
        fees: z.number().describe("Transaction fees incurred"),
    }),
    z.object({
        ...baseSchema,
        type: z.literal("FSELL").describe("Fixed Sell trade type. Exactly the string 'FSELL'"),
        ticker: z.string().describe("Stock/Asset ticker symbol in uppercase"),
        amount: z.number().describe("Exact number of shares sold"),
        pricePerUnit: z.number().describe("Exact price received per unit"),
        fees: z.number().describe("Transaction fees incurred"),
    }),

    // Fixed Cash
    z.object({
        ...baseSchema,
        type: z.literal("DEPOSIT").describe("Cash deposit type. Exactly the string 'DEPOSIT'"),
        amount: z.number().describe("Exact dollar amount deposited"),
        fees: z.number().describe("Deposit processing fees"),
    }),
    z.object({
        ...baseSchema,
        type: z.literal("WITHDRAWAL").describe("Cash withdrawal type. Exactly the string 'WITHDRAWAL'"),
        amount: z.number().describe("Exact dollar amount withdrawn"),
        fees: z.number().describe("Withdrawal processing fees"),
    }),

    // Dynamic Trade
    z.object({
        ...baseSchema,
        type: z.literal("DBUY").describe("Dynamic Percentage Buy type. Exactly the string 'DBUY'"),
        ticker: z.string().describe("Stock/Asset ticker symbol in uppercase"),
        value: z.number().describe("Percentage value as a decimal (e.g., 0.20 for 20%)"),
        fees: z.number().describe("Transaction fees"),
    }),
    z.object({
        ...baseSchema,
        type: z.literal("DSELL").describe("Dynamic Percentage Sell type. Exactly the string 'DSELL'"),
        ticker: z.string().describe("Stock/Asset ticker symbol in uppercase"),
        value: z.number().describe("Percentage value as a decimal (e.g., 0.20 for 20%)"),
        fees: z.number().describe("Transaction fees"),
    }),

    // Dividend Action
    z.object({
        ...baseSchema,
        type: z.literal("DIVIDEND").describe("Dividend cash receipt type. Exactly the string 'DIVIDEND'"),
        ticker: z.string().describe("Stock/Asset ticker symbol in uppercase"),
        amount: z.number().describe("Cash dividend amount received"),
        isReinvested: z.boolean().describe("True if it triggers a secondary fixed buy"),
    }),
]);

export type Transaction = z.infer<typeof transactionSchema>;