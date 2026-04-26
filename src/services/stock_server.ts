import express from "express";
import cors from "cors";

import YahooFinance from "yahoo-finance2";

const yahoo_finance = new YahooFinance();

const app = express();
app.use(cors());

app.get('/stock_history', async (req, res) => {
  const { symbol } = req.query;
  
  try {
    const five_years = Math.floor(Date.now() / 1000) - (5 * 365 * 24 * 60 * 60);
    const result = await yahoo_finance.chart(symbol as string, { 
      period1: five_years, 
      interval: '1d' 
    });

    if (!result.quotes) {
      return res.status(404).json({ error: "No data found" });
    }

    const formattedData = result.quotes.map(quote => ({
      time: quote.date.toISOString().split('T')[0],
      value: quote.adjClose || quote.close
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(3001, () => console.log('Proxy running on port 3001'));


