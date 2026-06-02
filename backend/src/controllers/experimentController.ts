import { Request, Response } from "express";
import { experimentRepository } from "../repositories/experimentRepository";

export class ExperimentController {
    async getExperimentData(req: Request, res: Response): Promise<void> {
        try {
            const { experiment_name } = req.params;
            const { user_email } = req.query;
            const userEmail = Array.isArray(user_email)
                ? typeof user_email[0] === "string"
                    ? user_email[0]
                    : undefined
                : typeof user_email === "string"
                ? user_email
                : undefined;

            if (!userEmail) {
                res.status(400).json({ error: "User email is required" });
                return;
            }

            const data = await experimentRepository.getExperimentData(
                userEmail,
                experiment_name as string
            );

            res.status(200).json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async addStock(req: Request, res: Response): Promise<void> {
        try {
            const { user_email, experiment_name, ticker } = req.body;
            await experimentRepository.addStockToExperiment(
                user_email,
                experiment_name,
                ticker
            );
            res.status(200).json({ success: true, ticker });
        } catch (error: any) {
            res.status(500).json({ error: "Failed to add stock to experiment" });
        }
    }

    async removeStock(req: Request, res: Response): Promise<void> {
        try {
            const { user_email, experiment_name, ticker } = req.body;
            const removed = await experimentRepository.removeStockFromExperiment(
                user_email,
                experiment_name,
                ticker
            );

            if (!removed) {
                res.status(404).json({ error: "Stock not found in this experiment" });
                return;
            }

            res.status(200).json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const experimentController = new ExperimentController();

