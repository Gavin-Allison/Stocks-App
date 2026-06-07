import { useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';

/**
 * AI prompt input area for generating draft transactions from natural language.
 */
export const PromptInputs = () => {
    const prompt = useAppStore(s => s.prompt);
    const setPrompt = useAppStore(s => s.setPrompt);
    const promptResponse = useAppStore(s => s.promptResponse);

    const onChange = useCallback((e: any) => setPrompt(String(e.target.value)), [setPrompt]);

    return (
        <div className="h-31.25 ml-2 mr-2 flex flex-col">
            <textarea
                value={prompt}
                onChange={onChange}
                placeholder={"Enter a prompt to generate transactions,\ne.g. 'From 2024 to 2025 on the 1st every month, spend 20% of my current cash on AAPL. Sell at the end of every month.'"}
                className="w-full flex-1 p-2 text-sm bg-white border border-gray-400 rounded resize-none focus:outline-none JSON"
            />
            <div className="mt-1">
                {promptResponse}
            </div>
        </div>
    );
};