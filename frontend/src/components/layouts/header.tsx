import { useState, useCallback, useEffect } from "react";
import { useAppStore } from "../../stores/appStore";
import Login from "../common/login";
import { Button } from "../common/ui";
import { theme } from "../../styles/tokens";
import { VerifyStockExists } from "../../services/getStockData"; 

/**
 * Application header with experiment controls, stock input, report tab navigation, and login.
 */
export const Header = () => {
    const [addableStock, setAddableStock] = useState("");
    const [newExpName, setNewExpName] = useState("");
    
    // Validation states
    const [isValidating, setIsValidating] = useState(false);
    const [stockExists, setStockExists] = useState<boolean | null>(null);

    const experiments = useAppStore(s => s.experiments);
    const currentExperiment = useAppStore(s => s.currentExperiment);
    const addExperiment = useAppStore(s => s.addExperiment);
    const removeExperiment = useAppStore(s => s.removeExperiment);
    const swapExperiment = useAppStore(s => s.swapExperiment);
    const addStock = useAppStore(s => s.addStock);
    const setReportTab = useAppStore(s => s.setReportTab);
    const reportTab = useAppStore(s => s.reportTab);

    // Stock validation
    useEffect(() => {
        const ticker = addableStock.trim().toUpperCase();
        
        if (!ticker) {
            setStockExists(null);
            setIsValidating(false);
            return;
        }

        setIsValidating(true);
        setStockExists(null);

        const timer = setTimeout(async () => {
            const exists = await VerifyStockExists(ticker);
            setStockExists(exists);
            setIsValidating(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [addableStock]);

    const handleAdd = useCallback(() => {
        addStock(addableStock);
        setAddableStock("");
    }, [addStock, addableStock]);

    return (
        <div className={`max-w-[var(--layout-width)] h-full flex items-center mx-auto ${theme.layout.headerBg} border-x ${theme.layout.headerBorder} px-4 gap-2`}>
            <div className="flex flex-col @5xl:flex-row gap-3 shrink min-w-0">
                <div className="flex flex-row gap-2 items-center shrink-0">
                    <h1 className={`text-xl font-bold mr-5.5 whitespace-nowrap ${theme.text.secondary}`}>Backtesting App</h1>

                    {/* Isolated positioning anchor for the Experiments dropdown */}
                    <div className="relative">
                        <Button
                            variant="light"
                            onClick={() => {
                                const menu = document.getElementById("experiment-menu");
                                if (menu) menu.classList.toggle("hidden");
                            }}
                            className="px-2"
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
                                        variant={exp === currentExperiment ? "primary" : "light"}
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
                </div>

                {/* Add stock container */}
                <div className="flex flex-col justify-center shrink min-w-0">
                    <div className="flex flex-row gap-2 items-center">
                        {/* Add stock input */}
                        <input
                            type="text"
                            value={addableStock}
                            onChange={(e) => setAddableStock(e.target.value)}
                            placeholder="Ticker (e.g. AAPL)"
                            className={`${theme.input.base} text-sm px-2 py-1 w-[200px] shrink min-w-[60px] ${
                                stockExists === false ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                            }`}
                        />
                        
                        <Button 
                            onClick={handleAdd} 
                            disabled={!addableStock.trim() || isValidating || stockExists === false} 
                            className="px-3 shrink-0" 
                            variant="primary"
                        >
                            {isValidating ? 'Checking...' : 'Add Stock'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Spacer */}
            <div className="flex-grow"></div>

            <div className="flex flex-col-reverse @5xl:flex-row gap-2 items-end @5xl:items-center shrink-0">
                {/* Navigation buttons */}
                <div className="flex gap-2">
                    <Button 
                        onClick={() => setReportTab("CHARTS")} 
                        className={`px-2 ${reportTab === "CHARTS" ? "" : "@2xl:hidden"}`}
                        variant={reportTab === "CHARTS" ? "primary" : "light"}
                    >
                        Charts
                    </Button>
                    <Button 
                        onClick={() => setReportTab("TRANSACTIONS")} 
                        className="px-2" 
                        variant={reportTab === "TRANSACTIONS" ? "primary" : "light"}
                    >
                        Transactions
                    </Button>
                    <Button 
                        onClick={() => setReportTab("RESULTS")} 
                        className="px-2" 
                        variant={reportTab === "RESULTS" ? "primary" : "light"}
                    >
                        Results
                    </Button>
                </div>

                {/* Authentication */}
                <Login></Login>
            </div>
        </div>
    );
};