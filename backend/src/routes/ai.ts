import { Router } from "express";

import { parsePrompt } from "../controllers/aiParsePrompt"

const router = Router();

router.post('/ai', async (req, res) => {
    const { prompt } = req.body
    const response = await parsePrompt(prompt)

    res.status(200).json(response);
});


export default router;