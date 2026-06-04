
import { useState, useCallback } from "react";
import { useAppStore } from "../../stores/appStore";
import Login from "../common/login"
import { Button } from "../common/ui";
import { theme } from "../../styles/tokens";

export const Header = () => {
    const [addableStock, setAddableStock] = useState("");
    const [newExpName, setNewExpName] = useState("");
    const experiments = useAppStore(s => s.experiments);
    const currentExperiment = useAppStore(s => s.currentExperiment);
    const addExperiment = useAppStore(s => s.addExperiment);
    const removeExperiment = useAppStore(s => s.removeExperiment);
    const swapExperiment = useAppStore(s => s.swapExperiment);
    const addStock = useAppStore(s => s.addStock);
    const setReportTab = useAppStore(s => s.setReportTab);

    const handleAdd = useCallback(() => {
        addStock(addableStock);
        setAddableStock("");
    }, [addStock, addableStock]);

    return (
        <div className={`max-w-[var(--layout-width)] h-full flex items-center mx-auto ${theme.layout.headerBg} border-x ${theme.layout.headerBorder} px-4 gap-2`}>
            <h1 className={`text-xl font-bold ${theme.text.secondary}`}>Stocks App</h1>

            {/* Experiment menu and selection */}
            <div className="relative">
                <Button
                    variant="light"
                    onClick={() => {
                        const menu = document.getElementById("experiment-menu");
                        if (menu) menu.classList.toggle("hidden");
                    }}
                    className="px-3"
                >
                    Experiments
                </Button>
                <div
                    id="experiment-menu"
                    className={`hidden absolute top-full left-0 mt-1 ${theme.panel.regular} ${theme.panel.border} rounded shadow-lg p-2 min-w-[200px] z-10`}
                    onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget)) {
                            e.currentTarget.classList.add("hidden");
                        }
                    }}
                    tabIndex={-1}
                >
                    {experiments.map((exp) => (
                        <div key={exp} className="flex items-center justify-between gap-2 p-1">
                            <Button
                                disabled={exp === currentExperiment}
                                onClick={() => {
                                    swapExperiment(exp);
                                    document.getElementById("experiment-menu")?.focus();
                                }}
                                variant="light"
                                className="px-2"
                            >
                                {exp}
                            </Button>
                            <Button
                                onClick={() => removeExperiment(exp)}
                                className="px-3"
                                variant="danger"
                            >
                                x
                            </Button>
                        </div>
                    ))}
                    {/* Add new experiment input */}
                    <div className="mt-2 pt-2 border-t flex gap-1">
                        <input
                            type="text"
                            value={newExpName}
                            onChange={(e) => setNewExpName(e.target.value)}
                            placeholder="New name..."
                            className={`${theme.input.base} px-1 py-1 w-full text-sm`}
                        />
                        <Button
                            disabled={!newExpName.trim() || experiments.includes(newExpName.trim())}
                            onClick={(e) => {
                                e.preventDefault();
                                addExperiment(newExpName.trim());
                                setNewExpName("");
                                document.getElementById("experiment-menu")?.focus();
                            }}
                            className="px-2"
                            variant="success"
                        >
                            Add
                        </Button>
                    </div>
                </div>
            </div>

            {/* Add stock input */}
            <input
                type="text"
                value={addableStock}
                onChange={(e) => setAddableStock(e.target.value)}
                placeholder="Ticker (e.g. AAPL)"
                className={`${theme.input.base} text-sm px-2 py-1`}
            />
            
            <Button onClick={handleAdd} className="px-3" variant="primary">Add Stock</Button>

            {/* Spacer */}
            <div className="flex-grow"></div>

            {/* Navigation buttons */}
            <div className="flex gap-2">
                <Button onClick={() => setReportTab("Transactions")} className="px-2" variant="light">Transactions</Button>
                <Button onClick={() => setReportTab("Results")} className="px-2" variant="light">Results</Button>
            </div>

            {/* Authentication */}
            <Login></Login>
        </div>
    );
};