// Fetches stock data from the backend server for a given symbol
export const FetchStockData = async (symbol: string): Promise<Record<string, number>> => {
  try {
    const response = await fetch(`http://localhost:3002/api/stock_history?symbol=${symbol}`);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const rawData = await response.json();
    
    // Get all dates and sort them to find the start and end
    const dates = Object.keys(rawData).sort();
    if (dates.length === 0) return {};

    const filledData: Record<string, number> = {};
    let lastValue = rawData[dates[0]]; // Track the last known price
    
    // Parse start and end dates 
    // Note: Appending 'T00:00:00Z' forces UTC so local timezones don't shift the day backwards
    const start = new Date(`${dates[0]}T00:00:00Z`);
    const end = new Date(`${dates[dates.length - 1]}T00:00:00Z`);
    const current = new Date(start);

    // Iterate until we reach the end date
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      
      if (rawData[dateStr] !== undefined) {
        lastValue = rawData[dateStr];
      }
      
      // Assign the value (either the actual value or the carried-over value)
      filledData[dateStr] = lastValue;
      
      current.setUTCDate(current.getUTCDate() + 1);
    }
    console.log(filledData)
    return filledData;
  } catch (err) {
    console.error("FetchStockData failed:", err);
    return {};
  }
};


/**
 * Verifies if a given stock symbol exists in the backend database.
 */
export const VerifyStockExists = async (symbol: string): Promise<boolean> => {
    try {
        const response = await fetch(`http://localhost:3002/api/stock_exists?symbol=${symbol}`);

        if (!response.ok) {
            if (response.status === 404) {
                return false;
            }
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        return data.exists === true; 

    } catch (err) {
        console.error(`VerifyStockExists failed for ${symbol}:`, err);
        return false; 
    }
  };