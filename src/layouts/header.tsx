import { useState } from "react";
import { useAppStore } from "../stores/appStore";

// Bar at top
export const Header = () => {
    const [addableStock, setAddableStock] = useState("");
    const { addStock, setReportTab } = useAppStore();

    // When text inputted and button clicked at stock based on text
    const handleAdd = () => {
        addStock(addableStock);
        setAddableStock("");
    };

    return (
        <div className="max-w-[var(--layout-width)] h-full flex items-center mx-auto bg-gray-300 border-x border-gray-400 px-4 gap-2">
            <h1 className="text-xl font-bold">Stocks App</h1>

            <input
                type="text"
                value={addableStock}
                onChange={(e) => setAddableStock(e.target.value)}
                placeholder="Ticker (e.g. AAPL)"
                className="border border-gray-400 px-2 py-1 rounded"
            />

            <button
                onClick={handleAdd}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
                Add Stock
            </button>

            <div className="flex-grow"></div>

            <div className="flex gap-2">
                <button onClick={() => setReportTab("Tutorial")} className="px-2 py-1 hover:bg-gray-400 rounded">Tutorial</button>
                <button onClick={() => setReportTab("Overview")} className="px-2 py-1 hover:bg-gray-400 rounded">Overview</button>
                <button onClick={() => setReportTab("Transactions")} className="px-2 py-1 hover:bg-gray-400 rounded">Transactions</button>
                <button onClick={() => setReportTab("Results")} className="px-2 py-1 hover:bg-gray-400 rounded">Results</button>
            </div>
        </div>
    );
};