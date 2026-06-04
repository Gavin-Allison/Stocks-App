import { useEffect } from "react";
import { theme } from "./styles/tokens";

import { useAppStore } from "./stores/appStore";

import { Header } from "./components/layouts/header";
import { Report } from "./components/layouts/report";
import { StockChartList } from "./components/stock/stockChartList";


export default function App() {
    const layout: React.CSSProperties & { [key: string]: any } = {
        "--layout-width": "1600px",
    }
    const initialize = useAppStore(s => s.initialize);

    // Initialize portfolio data
    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <div className="flex h-screen w-full flex-col" style={layout}>

            {/* Header */}
            <div className={`h-16 w-full flex-none border-b ${theme.layout.headerBorder}`}>
                <Header />
            </div>

            {/* Main (two columns) */}
            <div className="flex flex-1 justify-center overflow-y-hidden @container">
                <main className="max-w-[var(--layout-width)] w-full flex mx-auto">

                    {/* Left Column*/}
                    <section className={`flex-1 overflow-y-scroll ${theme.layout.sectionBg} border-r ${theme.layout.sectionBorder}`}>
                        <StockChartList />
                    </section>

                    {/* Right Column */}
                    <section className={`w-0 @2xl:w-96 @5xl:w-140 flex-none ${theme.layout.panelBg} border-r ${theme.layout.sectionBorder}`}>
                        <Report />
                    </section>

                </main>
            </div>
        </div>
    )
}