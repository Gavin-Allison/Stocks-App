import { FetchStockData } from "./stockChart";

// This is a hardcoded list of stocks to display in the chart list
export const StockList: string[] = ["RY.TO", "BNS.TO", "CM.TO"];

// Get stock list. Change to external stocklist when implemented
export const getStockList = () => [...StockList]

// Helper to notify React components stock list that updated
const notifyChange = () => {
  window.dispatchEvent(new CustomEvent("stockListUpdate"));
};

// Add a stock to the list after validating it exists in the backend
export const addStockToList = async (symbol: string) => {
    if (StockList.includes(symbol)) {
        // Needs output on UI instead of console log
        console.log("Stock already in list");
        return;
    }

    try {
        // Dont do this, need better way to validate later
        await FetchStockData(symbol); 
        StockList.push(symbol);
        notifyChange();
    } catch (error) {
        // Needs output on UI instead of console log
        console.error("Failed to fetch ticker data:", error);
    }

    console.log(StockList);
};

// Remove a stock from the list
export const removeStockFromList = (symbol: string) => {
    const index = StockList.indexOf(symbol);
    StockList.splice(index, 1);
    notifyChange();
};
    