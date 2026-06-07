import { pool } from "../config/db";

export interface ExperimentData {
    transactions: any[];
    activeStocks: string[];
    experimentList: string[];
}

export class ExperimentRepository {
    /**
     * Load experiment data including transactions, tracked stocks, and experiment list.
     */
    async getExperimentData(userEmail: string, experimentName: string): Promise<ExperimentData> {
        const txQuery = `
            SELECT t.id, t.ticker, t.transaction_date, t.type, t.details, t.batch_id
            FROM transactions t
            JOIN experiments e ON t.experiment_id = e.id
            JOIN users u ON e.user_id = u.id
            WHERE u.email = $1 AND e.name = $2
            ORDER BY t.transaction_date ASC;
        `;
        
        const stockQuery = `
            SELECT es.ticker
            FROM experiment_stocks es
            JOIN experiments e ON es.experiment_id = e.id
            JOIN users u ON e.user_id = u.id
            WHERE u.email = $1 AND e.name = $2;
        `;

        const listQuery = `
            SELECT e.name 
            FROM experiments e
            JOIN users u ON e.user_id = u.id
            WHERE u.email = $1;
        `;

        const [txResult, stockResult, listResult] = await Promise.all([
            pool.query(txQuery, [userEmail, experimentName]),
            pool.query(stockQuery, [userEmail, experimentName]),
            pool.query(listQuery, [userEmail]),
        ]);

        return {
            transactions: txResult.rows,
            activeStocks: stockResult.rows.map((row) => row.ticker),
            experimentList: listResult.rows.map((row) => row.name),
        };
    }

    /**
     * Add a stock to an experiment tab, creating the experiment and stock record if needed.
     */
    async addStockToExperiment(
        userEmail: string,
        experimentName: string,
        ticker: string
    ): Promise<void> {
        const query = `
            WITH target_user AS (
                SELECT id FROM users WHERE email = $1
            ),
            target_experiment AS (
                INSERT INTO experiments (user_id, name)
                SELECT id, $2 FROM target_user
                ON CONFLICT (user_id, name) DO UPDATE SET name = EXCLUDED.name
                RETURNING id
            ),
            upsert_stock AS (
                INSERT INTO stocks (ticker) VALUES ($3)
                ON CONFLICT (ticker) DO NOTHING
            )
            INSERT INTO experiment_stocks (experiment_id, ticker)
            SELECT (SELECT id FROM target_experiment), $3
            ON CONFLICT DO NOTHING
            RETURNING *;
        `;
        
        await pool.query(query, [userEmail, experimentName, ticker]);
    }

    /**
     * Remove a stock association from the specified experiment.
     */
    async removeStockFromExperiment(
        userEmail: string,
        experimentName: string,
        ticker: string
    ): Promise<boolean> {
        const query = `
            DELETE FROM experiment_stocks
            WHERE ticker = $1
            AND experiment_id = (
                SELECT e.id FROM experiments e
                JOIN users u ON e.user_id = u.id
                WHERE u.email = $2 AND e.name = $3
            );
        `;
        const result = await pool.query(query, [ticker, userEmail, experimentName]);
        return result.rowCount ? result.rowCount > 0 : false;
    }
}

export const experimentRepository = new ExperimentRepository();
