const API_BASE = "http://localhost:3003/api"

/**
 * Creates or logs in a user.
 */
export const fetchUserLogin = async (email: string) => {
    const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    return response.json();
};

/**
 * Loads all stocks and transactions for an experiment tab (The "Large Pull").
 */
export const fetchExperimentData = async (userEmail: string, experimentName: string) => {
    // Using query params for GET requests
    const response = await fetch(`${API_BASE}/experiments/${experimentName}/data?user_email=${encodeURIComponent(userEmail)}`);
    return response.json();
};

/**
 * Adds a new stock to an experiment tab (Upserts the stock, then links it).
 */
export const fetchAddStockToExperiment = async (userEmail: string, experimentName: string, ticker: string) => {
    const response = await fetch(`${API_BASE}/experiments/stocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: userEmail, experiment_name: experimentName, ticker }),
    });
    return response.json();
};

/**
 * Logs a single transaction.
 */
export const fetchCreateTransaction = async (
    userEmail: string, 
    experimentName: string, 
    id: string,
    ticker: string | null, 
    date: string, 
    type: string, 
    details: Record<string, any>,
    batch_id: string
) => {
    const response = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_email: userEmail,
            experiment_name: experimentName,
            id: id,
            ticker: ticker, 
            transaction_date: date,
            type: type,
            details: details,
            batch_id: batch_id
        }),
    });
    return response.json();
};

/**
 * Removes a specific stock from the experiment tab.
 * Note: This only deletes the link in experiment_stocks, not the stock itself.
 */
export const removeStockFromTab = async (experimentName: string, ticker: string) => {
    const email = localStorage.getItem('userEmail');
    if (!email) throw new Error("User not logged in");

    const response = await fetch(`${API_BASE}/experiments/stocks`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: email, experiment_name: experimentName, ticker }),
    });
    return response.json();
};

/**
 * Removes a specific transaction by its ID.
 */
export const removeTransaction = async (transactionId: string) => {
    const response = await fetch(`${API_BASE}/transactions/${transactionId}`, {
        method: 'DELETE',
    });
    return response.json();
};