import { Router } from "express";
import { pool } from "../config/db";

const router = Router();

// The "Large Pull" - gets all active stocks and transactions for a tab
router.get('/:experiment_name/data', async (req, res) => {
    const { experiment_name } = req.params;
    const { user_email } = req.query;

    try {
        // 1. Get the transactions
        const txQuery = `
            SELECT t.id, t.ticker, t.transaction_date, t.type, t.details
            FROM transactions t
            JOIN experiments e ON t.experiment_id = e.id
            JOIN users u ON e.user_id = u.id
            WHERE u.email = $1 AND e.name = $2
            ORDER BY t.transaction_date DESC;
        `;
        
        // 2. Get the active stocks linked to this tab
        const stockQuery = `
            SELECT es.ticker
            FROM experiment_stocks es
            JOIN experiments e ON es.experiment_id = e.id
            JOIN users u ON e.user_id = u.id
            WHERE u.email = $1 AND e.name = $2;
        `;

        const [txResult, stockResult] = await Promise.all([
        pool.query(txQuery, [user_email, experiment_name]),
        pool.query(stockQuery, [user_email, experiment_name])
        ]);

        res.status(200).json({
        transactions: txResult.rows,
        activeStocks: stockResult.rows.map(row => row.ticker)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load experiment dashboard" });
    }
});

// Adds a stock to an experiment tab (handles upserting everything automatically)
router.post('/stocks', async (req, res) => {
    const { user_email, experiment_name, ticker } = req.body;

    try {
        // This CTE ensures the experiment tab exists, ensures the stock exists in the dictionary, 
        // and finally creates the link in the junction table, all in one DB round-trip.
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
        
        await pool.query(query, [user_email, experiment_name, ticker]);
        res.status(200).json({ success: true, ticker });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add stock to experiment" });
    }
});

// Removes a stock link from an experiment
router.delete('/stocks', async (req, res) => {
    const { user_email, experiment_name, ticker } = req.body;

    try {
        const query = `
            DELETE FROM experiment_stocks
            WHERE ticker = $1
            AND experiment_id = (
                SELECT e.id FROM experiments e
                JOIN users u ON e.user_id = u.id
                WHERE u.email = $2 AND e.name = $3
            );
        `;
        const result = await pool.query(query, [ticker, user_email, experiment_name]);
        
        if (result.rowCount === 0) {
        return res.status(404).json({ error: "Stock not found in this experiment" });
        }
        
        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to remove stock" });
    }
});

export default router;