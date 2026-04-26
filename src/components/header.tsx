import { useState } from "react";
import { addStockToList } from "./monitor/stockSymbolList"

export const Header = ({setReportTab}: {setReportTab: (tab: string) => void}) => {
    const [addableStock, setAddableStock] = useState<string>("");

    return (
        <div className="max-w-[var(--layout-width)] h-full flex mx-auto bg-gray-400 border-x border-black">
            <h1 className="text-xl font-bold">
                Header
            </h1>
            <input
                type="text"
                value={addableStock}
                onChange={(e) => setAddableStock(e.target.value)}
                className="border border-gray-300"
            ></input>

            <button onClick={() => addStockToList(addableStock)}>
                Add Stock
            </button>

            {/* empty space filler div remove later */}
            <div className="flex-grow"></div>

            <button onClick={() => setReportTab("Tutorial")}>
                Tutorial
            </button>
            <button onClick={() => setReportTab("Overview")}>
                Overview
            </button>
            <button onClick={() => setReportTab("Results")}>
                Results
            </button>

        </div>
    )
}