import { StockChartList } from "./components/stockChartList";

export default function App() {
    const layout: React.CSSProperties & { [key: string]: any } = {
        "--layout-width": "1600px",
    }

    return (
        <div className="flex h-screen w-full flex-col" style={layout}>

        <div className="h-16 w-full flex-none border-b border-black">
            <header className="max-w-[var(--layout-width)] h-full flex mx-auto bg-gray-500 border-x border-black">
            <h1>Top Bar</h1>
            </header>
        </div>

        <div className="flex flex-1 justify-center overflow-y-hidden @container">
            <main className="max-w-[var(--layout-width)] w-full flex mx-auto">
            
            {/* Left Column*/}
            <section className="flex-1 overflow-y-scroll border-r border-black">
                <div className="bg-gray-300">
                    <h1>Left Column</h1>
                </div>
                
                <div className="bg-gray-200">
                    <StockChartList />
                </div>
            </section>

            {/* Right Column */}
            <section className="w-0 @4xl:w-64 @6xl:w-128 flex-none bg-gray-300 border-r border-black">

            </section>

            </main>
        </div>
        </div>
    )
    }