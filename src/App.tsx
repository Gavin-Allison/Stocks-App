import { useEffect } from "react";

import { useAppStore } from "./stores/appStore";

import { Header } from "./layouts/header";
import { Monitor } from "./layouts/monitor";
import { Report } from "./layouts/report";


export default function App() {
    const layout: React.CSSProperties & { [key: string]: any } = {
        "--layout-width": "1600px",
    }
    const { initialize } = useAppStore();

    // Initialize portfolio data
    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <div className="flex h-screen w-full flex-col" style={layout}>

            {/* Header */}
            <div className="h-16 w-full flex-none border-b border-gray-400">
                <Header />
            </div>

            {/* Main (two columns) */}
            <div className="flex flex-1 justify-center overflow-y-hidden @container">
                <main className="max-w-[var(--layout-width)] w-full flex mx-auto">

                    {/* Left Column*/}
                    <section className="flex-1 overflow-y-scroll bg-gray-100 border-r border-gray-400">
                        <Monitor />
                    </section>

                    {/* Right Column */}
                    <section className="w-0 @2xl:w-96 @5xl:w-132 flex-none bg-white border-r border-gray-400">
                        <Report />
                    </section>

                </main>
            </div>
        </div>
    )
}