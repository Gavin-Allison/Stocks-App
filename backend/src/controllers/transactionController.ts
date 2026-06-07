import { Request, Response } from "express";
import { transactionRepository } from "../repositories/transactionRepository";

export class TransactionController {
    /**
     * Create a new transaction record for the current user experiment.
     */
    async createTransaction(req: Request, res: Response): Promise<void> {
        try {
            const { user_email, id, batch_id, ticker, experiment_name, transaction_date, type, details } = req.body;

            const transaction = await transactionRepository.createTransaction(
                id,
                batch_id,
                user_email,
                experiment_name,
                ticker,
                transaction_date,
                type,
                details
            );

            res.status(200).json(transaction);
        } catch (error: any) {
            const status = error.message.includes("Experiment not found") ? 404 : 500;
            const message = error.message.includes("Experiment not found") ? "Experiment tab not found for user" : "Failed to log transaction";
            res.status(status).json({ error: message });
        }
    }

    /**
     * Delete a transaction by its ID and return a success flag.
     */
    async deleteTransaction(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const removed = await transactionRepository.deleteTransaction(id as string);

            if (!removed) {
                res.status(404).json({ error: "Transaction not found" });
                return;
            }

            res.status(200).json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: "Failed to delete transaction" });
        }
    }
}

export const transactionController = new TransactionController();
