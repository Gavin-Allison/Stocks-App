import express from "express";
import cors from "cors";

import YahooFinance from "yahoo-finance2";

const App = express();
App.use(cors());

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
    const FormattedData = Result.quotes.map(Quote => ({
    time: Quote.date.toISOString().split('T')[0],
    value: Quote.adjClose || Quote.close
    }));

    Res.json(FormattedData);
} catch (Error) {
    Res.status(500).json({ error: "Failed to fetch data" });
}
});

App.listen(3001, () => console.log('Proxy running on port 3001'));