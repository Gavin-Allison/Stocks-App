import YahooFinance from "yahoo-finance2";

export class StockRepository {
    private yahooFinance: InstanceType<typeof YahooFinance>;

    constructor() {
        this.yahooFinance = new YahooFinance();
    }

    async getStockHistory(symbol: string, years: number = 5): Promise<Record<string, number>> {
        // Calculate the date range for the specified number of years
        const fiveYearsAgo = Math.floor(Date.now() / 1000) - years * 365 * 24 * 60 * 60;
        
        const result = await this.yahooFinance.chart(symbol, {
            period1: fiveYearsAgo,
            interval: "1d",
        });

        if (!result.quotes || result.quotes.length === 0) {
            throw new Error(`No data found for symbol: ${symbol}`);
        }

        // Format data for the chart
        const formattedData: Record<string, number> = {};
        result.quotes.forEach((quote: any) => {
            const price = quote.adjClose || quote.close;
            if (typeof price === "number") {
                formattedData[quote.date.toISOString().split("T")[0]] = price;
            }
        });

        return formattedData;
    }
}

export const stockRepository = new StockRepository();
