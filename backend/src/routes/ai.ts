import { Router } from "express";

import { parseTransactionPrompt } from "../controllers/aiParsePrompt"

const router = Router();

router.post('/ai', async (req, res) => {
    const { prompt, selectedStock, priceData, date } = req.body;
    const response = await parseTransactionPrompt({
        promptText: prompt,
        selectedStock,
        priceData,
        transactionDate: date,
    });

    res.status(200).json(response);
});


export default router;