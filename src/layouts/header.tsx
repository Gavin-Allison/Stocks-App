import { useState } from "react";

// Bar at top
export const Header = ({ 
    setReportTab, 
    onAddStock 
}: { 
    setReportTab: (tab: string) => void,
    onAddStock: (symbol: string) => void 
}) => {
    const [addableStock, setAddableStock] = useState("");

    // When text inputted and button clicked at stock based on text
    const handleAdd = () => {
        onAddStock(addableStock);
        setAddableStock("");
    };

    return (
        <div className="max-w-[var(--layout-width)] h-full flex items-center mx-auto bg-gray-400 border-x border-black px-4 gap-2">
            <h1 className="text-xl font-bold">Header</h1>
            
            <input
                type="text"
                value={addableStock}
                onChange={(e) => setAddableStock(e.target.value)}
                placeholder="Ticker (e.g. AAPL)"
                className="border border-gray-300 px-2 py-1"
            />

            <button 
                onClick={handleAdd}
                className="bg-blue-600 text-white px-3 py-1 rounded"
            >
                Add Stock
            </button>

            <div className="flex-grow"></div>

            <div className="flex gap-2">
                <button onClick={() => setReportTab("Tutorial")}>Tutorial</button>
                <button onClick={() => setReportTab("Overview")}>Overview</button>
                <button onClick={() => setReportTab("Transactions")}>Transactions</button>
                <button onClick={() => setReportTab("Results")}>Results</button>
            </div>
        </div>
    );
};