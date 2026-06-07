import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import { transactionSchema, type Transaction } from "../types/transactionType";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });
const model = ai.models;

const transactionListSchema = z.array(transactionSchema);

interface ParseTransactionPayload {
    promptText: string;
    selectedStock?: string;
    priceData?: Record<string, number>;
    transactionDate?: string;
}

/**
 * Send the user prompt to Gemini, validate the returned JSON schema,
 * and normalize transaction results for the app.
 */
const parseTransactionPrompt = async (payload: ParseTransactionPayload): Promise<Transaction[]> => {
    const { promptText, selectedStock, priceData, transactionDate } = payload;

    const priceDataContext = selectedStock && priceData
        ? `\nSelected stock: ${selectedStock}\nAvailable price data for ${selectedStock}: ${JSON.stringify(priceData)}\n`
        : "";

    const defaultDateContext = transactionDate
        ? `If the prompt does not specify an explicit date, use ${transactionDate} as the transaction date.`
        : "";

    const response = await model.generateContent({
        model: "gemini-2.5-flash",
        contents: `${promptText}${priceDataContext}\n${defaultDateContext}`,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: transactionListSchema.toJSONSchema() as any,
            temperature: 0,
            systemInstruction:
                "You are an intelligent financial ledger assistant. Extract ALL financial transactions from the user prompt and return only valid JSON. Output a JSON array of transaction objects that exactly match the schema. Do not include any markdown, explanation, or text outside the JSON array. Use uppercase ticker symbols. Set committed to false and batchId to \"Preview\" when possible. Use YYYY-MM-DD date format. For DBUY and DSELL, use value as a decimal (for example 0.2 for 20%). If DBUY/DSELL is returned, choose a date from provided price data if available. Only use the confirmed fields required by each transaction type.",
        },
    });

    if (!response.text) {
        throw new Error("No data returned from Gemini.");
    }

    let rawJson: unknown;

    try {
        rawJson = JSON.parse(response.text);
    } catch (parseError) {
        console.error("Failed to parse Gemini JSON response:", response.text, parseError);
        throw parseError;
    }

    try {
        const verifiedTransactions = transactionListSchema.parse(rawJson);
        const sortedTransactions = verifiedTransactions.sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        console.log(sortedTransactions);
        return sortedTransactions;
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("Zod validation error:", error);

            if (Array.isArray(rawJson)) {
                error.issues.forEach((issue) => {
                    const elementIndex = typeof issue.path[0] === "number" ? issue.path[0] : null;
                    if (elementIndex !== null && rawJson[elementIndex] !== undefined) {
                        console.error(`Error at array index [${elementIndex}]:`, issue.message);
                        console.error("Offending item data:", JSON.stringify(rawJson[elementIndex], null, 2));
                    } else {
                        console.error(`Error path: ${issue.path.join(".")}`, issue.message);
                    }
                });
            }
        } else {
            console.error("Unexpected error:", error);
        }
        throw error;
    }
};

export class AiController {
    /**
     * Handle AI prompt requests from the frontend and return parsed transactions.
     */
    async parseTransactionPrompt(req: Request, res: Response): Promise<void> {
        try {
            const { prompt, selectedStock, priceData, date } = req.body;
            const response = await parseTransactionPrompt({
                promptText: prompt,
                selectedStock,
                priceData,
                transactionDate: date,
            });
            res.status(200).json(response);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const aiController = new AiController();
