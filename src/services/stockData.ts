// Fetches stock data from the backend server for a given symbol
export const FetchStockData = async (symbol: string) => {
  try {
    const response = await fetch(`http://localhost:3001/stock_history?symbol=${symbol}`);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("FetchStockData failed:", err);
    return [];
  }
};