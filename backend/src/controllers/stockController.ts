import { Request, Response } from "express";
import { stockRepository } from "../repositories/stockRepository";

export class StockController {
    /**
     * Retrieve historical stock price data for the given symbol.
     */
    async getStockHistory(req: Request, res: Response): Promise<void> {
        try {
            const { symbol } = req.query;
            const symbolString = Array.isArray(symbol)
                ? typeof symbol[0] === "string"
                    ? symbol[0]
                    : undefined
                : typeof symbol === "string"
                ? symbol
                : undefined;

            if (!symbolString) {
                res.status(400).json({ error: "Stock symbol is required" });
                return;
            }

            const history = await stockRepository.getStockHistory(symbolString);
            res.status(200).json(history);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const stockController = new StockController();
