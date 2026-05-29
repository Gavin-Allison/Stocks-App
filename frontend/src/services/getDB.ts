import type { Transaction } from "../types/transaction";
import * as API from './apiDB';

/**
 * Handles the login flow and saves the user info.
 */
export const handleLogin = async (email: string) => {
    const userData = await API.fetchUserLogin(email);
    localStorage.setItem('userEmail', userData.email);
    return userData;
};

/**
 * Loads a user's entire experiment dashboard.
 */
export const loadDashboard = async (experimentName: string) => {
    const email = localStorage.getItem('userEmail');
    if (!email) throw new Error("User not logged in");

    return await API.fetchExperimentData(email, experimentName);
};

/**
 * Links a stock to the user's experiment tab.
 */
export const addStockToTab = async (experimentName: string, ticker: string) => {
    const email = localStorage.getItem('userEmail');
    if (!email) throw new Error("User not logged in");

    const cleanTicker = ticker.toUpperCase().trim();

    return await API.fetchAddStockToExperiment(email, experimentName, cleanTicker);
    };

/**
 * Processes a typed Transaction and logs it to the DB.
 */
export const logTransaction = async (experimentName: string, transaction: Transaction) => {
    const email = localStorage.getItem('userEmail');
    if (!email) throw new Error("User not logged in");

    const { id, date, type, batchId, ...rawDetails } = transaction;

    let ticker: string | null = null;
    const details = { ...rawDetails };

        
    if ('ticker' in details) {
        ticker = (details as any).ticker;
        delete (details as any).ticker;
    }

    return await API.fetchCreateTransaction(
        email,
        experimentName,
        id,
        ticker,
        date,
        type,
        details,
        batchId
    );
};

