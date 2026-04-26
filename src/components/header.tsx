import { addStockToList } from "./monitor/stockSymbolList"

export const Header = () => {
    return (
        <div className="max-w-[var(--layout-width)] h-full flex mx-auto bg-gray-400 border-x border-black">
            <h1 className="text-xl font-bold">
                Header
            </h1>
            <button onClick={() => addStockToList("AAPL")}>
                Add Stock
            </button>
        </div>
    )
}