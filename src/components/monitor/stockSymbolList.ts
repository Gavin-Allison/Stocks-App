import { FetchStockData } from "../../services/stockData";

const tempList = ["RY.TO", "BNS.TO", "CM.TO"];

// Get stock list. Change to external stocklist when implemented
export const getStockList = () => {
    const savedList = localStorage.getItem("stockList");
    return savedList ? JSON.parse(savedList) : tempList;
}

const StockList: string[] = getStockList();

// Save stock list to local storage whenever it changes
const saveStockList = () => {
    localStorage.setItem("stockList", JSON.stringify(StockList));
}

// Helper to notify React components stock list that updated
const notifyChange = () => {
  window.dispatchEvent(new CustomEvent("stockListUpdate"));
};

// Add a stock to the list after validating it exists in the backend
export const addStockToList = async (ticker: string) => {
    const symbol = ticker.toUpperCase().trim();
    if (StockList.includes(symbol)) {
        // Needs output on UI instead of console log
        console.log("Stock already in list");
        return;
    }

    try {
        // Dont do this, need better way to validate later
        // Also this is bugged and just doesnt work for some reason, needs to be fixed before this can be used
        await FetchStockData(symbol); 
        StockList.push(symbol);
        saveStockList();
        notifyChange();
    } catch (error) {
        // Needs output on UI instead of console log
        console.error("Failed to fetch ticker data:", error);
    }

    console.log(StockList);
};

// Remove a stock from the list
export const removeStockFromList = (symbol: string) => {
    if (!StockList.includes(symbol)) {
        console.log("Stock not in list");
        return;
    }

    const index = StockList.indexOf(symbol);
    StockList.splice(index, 1);
    saveStockList();
    notifyChange();
};
    