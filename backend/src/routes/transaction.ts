import { Router } from "express";
import { pool } from "../config/db";

const router = Router();

// Logs a transaction (Cash transactions will pass 'ticker' as null here)
router.post('/', async (req, res) => {
    const { user_email, experiment_name, ticker, transaction_date, type, details } = req.body;

    try {
        const query = `
            INSERT INTO transactions (experiment_id, ticker, transaction_date, type, details)
            SELECT e.id, $3, $4, $5, $6
            FROM experiments e
            JOIN users u ON e.user_id = u.id
            WHERE u.email = $1 AND e.name = $2
            RETURNING *;
        `;
        
        const result = await pool.query(query, [user_email, experiment_name, ticker, transaction_date, type, details]);
        
        if (result.rows.length === 0) {
        return res.status(404).json({ error: "Experiment tab not found for user" });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to log transaction" });
    }
});

// Removes a transaction by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = `DELETE FROM transactions WHERE id = $1 RETURNING id;`;
        const result = await pool.query(query, [id]);
        
        if (result.rowCount === 0) {
        return res.status(404).json({ error: "Transaction not found" });
        }
        
        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete transaction" });
    }
});

export default router;