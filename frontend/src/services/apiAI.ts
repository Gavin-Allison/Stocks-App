const API_BASE =  import.meta.env.API_BASE || "/api"

export interface PromptRequest {
    prompt: string;
    selectedStock?: string;
    priceData?: Record<string, number>;
    date?: string;
}

/**
 * Sends ai prompt to backend
 */
export const fetchPromptResponse = async (payload: PromptRequest) => {
    const response = await fetch(`${API_BASE}/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
};