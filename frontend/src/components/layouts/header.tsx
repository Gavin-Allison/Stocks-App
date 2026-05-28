import { useState } from "react";
import { useAppStore } from "../../stores/appStore";
import Login from "../common/login"

export const Header = () => {
    const [addableStock, setAddableStock] = useState("");
    const [newExpName, setNewExpName] = useState("");
    const { 
        experiments, 
        currentExperiment,
        addExperiment, 
        removeExperiment, 
        swapExperiment, 

        addStock, 
        setReportTab 
    } = useAppStore();

    const handleAdd = () => {
        addStock(addableStock);
        setAddableStock("");
    };

    return (
        <div className="max-w-[var(--layout-width)] h-full flex items-center mx-auto bg-gray-300 border-x border-gray-400 px-4 gap-2">
            <h1 className="text-xl font-bold">Stocks App</h1>

            <div className="relative">
                <button
                    onClick={() => {
                        const menu = document.getElementById("experiment-menu");
                        if (menu) menu.classList.toggle("hidden");
                    }}
                    className="px-3 py-1 bg-gray-200 border border-gray-400 rounded"
                >
                    Experiments
                </button>
                <div
                    id="experiment-menu"
                    className="hidden absolute top-full left-0 mt-1 bg-white border border-gray-400 rounded shadow-lg p-2 min-w-[200px] z-10"
                    onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget)) {
                            e.currentTarget.classList.add("hidden");
                        }
                    }}
                    tabIndex={-1}
                >
                    {experiments.map((exp) => (
                        <div key={exp} className="flex items-center justify-between gap-2 p-1">
                            <button
                                disabled={exp === currentExperiment}
                                onClick={() => {
                                    swapExperiment(exp);
                                    document.getElementById("experiment-menu")?.focus();
                                }}
                                className="px-2 py-1 rounded transition-colors disabled:bg-blue-100 disabled:text-blue-800 disabled:font-bold disabled:cursor-not-allowed hover:bg-gray-100"
                            >
                                {exp}
                            </button>
                            <button 
                                onClick={() => removeExperiment(exp)}
                                className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded transition-colors text-sm font-medium"
                            >
                                x
                            </button>
                        </div>
                    ))}
                    <div className="mt-2 pt-2 border-t flex gap-1">
                        <input
                            type="text"
                            value={newExpName}
                            onChange={(e) => setNewExpName(e.target.value)}
                            placeholder="New name..."
                            className="border border-gray-400 px-1 py-1 rounded w-full text-sm"
                        />
                        <button
                            disabled={!newExpName.trim() || experiments.includes(newExpName.trim())}
                            onClick={(e) => {
                                e.preventDefault();
                                addExperiment(newExpName.trim());
                                setNewExpName("");
                                document.getElementById("experiment-menu")?.focus();
                            }}
                            className="bg-green-600 text-white px-2 py-1 rounded text-sm disabled:bg-gray-400"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>

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
                <button onClick={() => setReportTab("Transactions")} className="px-2 py-1 hover:bg-gray-400 rounded">Transactions</button>
                <button onClick={() => setReportTab("Results")} className="px-2 py-1 hover:bg-gray-400 rounded">Results</button>
            </div>

            <Login></Login>
        </div>
    );
};