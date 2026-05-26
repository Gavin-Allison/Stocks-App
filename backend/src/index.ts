import express from "express";
import cors from "cors";
import { Pool } from "pg";
import * as dotenv from 'dotenv';

import YahooFinance from "yahoo-finance2";

const App = express();
App.use(cors());
App.use(express.json());

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const YahooFinanceInstance = new YahooFinance();

App.get('/api/stock_history', async (Req, Res) => {
    const { symbol } = Req.query;

    try {
        // Fetch 5 years of daily data
        const FiveYears = Math.floor(Date.now() / 1000) - (5 * 365 * 24 * 60 * 60);
        const Result = await YahooFinanceInstance.chart(symbol as string, { 
        period1: FiveYears, 
        interval: '1d' 
        });

        if (!Result.quotes) {
        return Res.status(404).json({ error: "No data found" });
        }

        // Format data for the chart
        const FormattedData: Record<string, number> = {};
        Result.quotes.forEach(Quote => {
            const price = Quote.adjClose || Quote.close;
            if (typeof price === 'number') {
                FormattedData[Quote.date.toISOString().split('T')[0]] = price;
            }
        });

        Res.json(FormattedData);
    } catch (Error) {
        Res.status(500).json({ error: "Failed to fetch data" });
    }
});

// On login save the email to know which user to get data for
App.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // "ON CONFLICT" handles the logic: if email exists, just return the existing record
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

App.listen(3001, () => console.log('Proxy running on port 3001'));