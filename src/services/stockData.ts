// Fetches stock data from the backend server for a given symbol
export const FetchStockData = async (symbol: string) => {
  const response = await fetch(`http://localhost:3001/stock_history?symbol=${symbol}`);
  return await response.json();
};