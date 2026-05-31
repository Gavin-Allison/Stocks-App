import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const colorSchema = z.object({
    name: z.string().describe("Name of the color in uppercase."),
});

const colorsSchema = z.object({
    colors: z.array(colorSchema).describe("The list of colors"),
});

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });

const testprompt = `
    Please extract the colors from the following text.
    blue
`;

export const parsePrompt = async (prompt: string) => {

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: testprompt,
        config: {
        responseMimeType: "application/json",
        responseJsonSchema: colorsSchema.toJSONSchema(),
        },
    });

    if (!response.text) {
        throw new Error("No text returned from model");
    }

    const colors = colorsSchema.parse(JSON.parse(response.text));
    console.log(colors);

    return {
        color: String(colors) || "Failed",
        prompt: testprompt
    };
};