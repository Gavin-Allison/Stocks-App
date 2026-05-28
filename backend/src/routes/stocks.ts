import { Router } from "express";
import YahooFinance from "yahoo-finance2";

const router = Router();
const YahooFinanceInstance = new YahooFinance();

router.get('/history', async (Req, Res) => {
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

export default router;