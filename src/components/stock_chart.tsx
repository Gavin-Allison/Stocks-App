export const fetch_stock_data = async (symbol: string) => {
  const response = await fetch(`http://localhost:3001/stock_history?symbol=${symbol}`);
  return await response.json();
};