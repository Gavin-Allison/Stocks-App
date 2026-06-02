import { pool } from "../config/db";

export interface TransactionRecord {
    id: string;
    batch_id: string;
    experiment_id: number;
    ticker: string | null;
    transaction_date: string;
    type: string;
    details: Record<string, any>;
}

export class TransactionRepository {
    async createTransaction(
        id: string,
        batchId: string,
        userEmail: string,
        experimentName: string,
        ticker: string | null,
        transactionDate: string,
        type: string,
        details: Record<string, any>
    ): Promise<TransactionRecord> {
        const query = `
            INSERT INTO transactions (id, batch_id, experiment_id, ticker, transaction_date, type, details)
            SELECT $2, $3, e.id, $5, $6, $7, $8::jsonb
            FROM experiments e
            JOIN users u ON e.user_id = u.id
            WHERE u.email = $1 AND e.name = $4
            RETURNING *;
        `;
        
        const result = await pool.query(query, [
            userEmail,
            id,
            batchId,
            experimentName,
            ticker,
            transactionDate,
            type,
            JSON.stringify(details),
        ]);
        
        if (result.rows.length === 0) {
            throw new Error("Experiment not found for user");
        }
        
        return result.rows[0];
    }

    async deleteTransaction(id: string): Promise<boolean> {
        const query = `DELETE FROM transactions WHERE id = $1 RETURNING id;`;
        const result = await pool.query(query, [id]);
        return result.rowCount ? result.rowCount > 0 : false;
    }

    async getTransactionsByExperiment(
        userEmail: string,
        experimentName: string
    ): Promise<TransactionRecord[]> {
        const query = `
            SELECT t.id, t.ticker, t.transaction_date, t.type, t.details, t.batch_id
            FROM transactions t
            JOIN experiments e ON t.experiment_id = e.id
            JOIN users u ON e.user_id = u.id
            WHERE u.email = $1 AND e.name = $2
            ORDER BY t.transaction_date ASC;
        `;
        
        const result = await pool.query(query, [userEmail, experimentName]);
        return result.rows;
    }
}

export const transactionRepository = new TransactionRepository();
