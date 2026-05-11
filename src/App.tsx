import { useState } from "react";

import { usePortfolio } from "./hooks/usePortfolio";

import { Header } from "./layouts/header";
import { Monitor } from "./layouts/monitor";
import { Report } from "./layouts/report";


export default function App() {
    const layout: React.CSSProperties & { [key: string]: any } = {
        "--layout-width": "1600px",
    }
    const { symbols, priceData, addStock, removeStock, transactions, addTransaction, removeTransaction } = usePortfolio();
    const [ reportTab, setReportTab ] = useState<string>("Tutorial")
    const [ date, setDate ] = useState<string>(new Date().toISOString().split('T')[0])
    const [ selectedStock, setSelectedStock ] = useState<string>(symbols[0] || "")

    return (
        <div className="flex h-screen w-full flex-col" style={layout}>

            {/* Header */}
            <div className="h-16 w-full flex-none border-b border-gray-400">
                <Header 
                    setReportTab={setReportTab} 
                    onAddStock={addStock}
                />
            </div>

            {/* Main (two columns) */}
            <div className="flex flex-1 justify-center overflow-y-hidden @container">
                <main className="max-w-[var(--layout-width)] w-full flex mx-auto">
                
                    {/* Left Column*/}
                    <section className="flex-1 overflow-y-scroll bg-gray-100 border-r border-gray-400">
                        <Monitor 
                            symbols={symbols} 
                            priceData={priceData}
                            onRemoveStock={removeStock}
                            date={date}
                            setDate={setDate}
                            selectedStock={selectedStock}
                            setSelectedStock={setSelectedStock}
                        />
                    </section>

                    {/* Right Column */}
                    <section className="w-0 @2xl:w-64 @5xl:w-128 flex-none bg-gray-200 border-r border-gray-400">
                        <Report 
                            tab={reportTab}
                            symbols={symbols}
                            priceData={priceData}
                            transactions={transactions}
                            addTransaction={addTransaction}
                            removeTransaction={removeTransaction}
                            date={date}
                            setDate={setDate}
                            selectedStock={selectedStock}
                            setSelectedStock={setSelectedStock}
                        />
                    </section>

                </main>
            </div>
        </div>
    )
}