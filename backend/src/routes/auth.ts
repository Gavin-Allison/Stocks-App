import { Router } from "express";
import { pool } from "../config/db";

const router = Router();

// On login save the email to know which user to get data for
// Route updated to /api/users to match the frontend fetcher
router.post('/users', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        const query = `
            INSERT INTO users (email) 
            VALUES ($1) 
            ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
            RETURNING *;
        `;
        
        const result = await pool.query(query, [email]);
        
        // Return the user object (including the unique ID) to the frontend
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error during login" });
    }
});

export default router;