const API_BASE = "http://localhost:3003/api"

/**
 * Sends ai prompt to backend
 */
export const fetchPromptResponse = async (prompt: string) => {
    const response = await fetch(`${API_BASE}/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
    });
    return response.json();
};