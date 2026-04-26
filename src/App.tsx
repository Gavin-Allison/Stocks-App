import { Header } from "./components/header";
import { Monitor } from "./components/monitor";
import { Report } from "./components/report";


export default function App() {
    const layout: React.CSSProperties & { [key: string]: any } = {
        "--layout-width": "1600px",
    }

    return (
        <div className="flex h-screen w-full flex-col" style={layout}>

            <div className="h-16 w-full flex-none border-b border-black">
                <Header />
            </div>

            <div className="flex flex-1 justify-center overflow-y-hidden @container">
                <main className="max-w-[var(--layout-width)] w-full flex mx-auto">
                
                    {/* Left Column*/}
                    <section className="flex-1 overflow-y-scroll bg-gray-200 border-r border-black">
                        <Monitor />
                    </section>

                    {/* Right Column */}
                    <section className="w-0 @2xl:w-64 @5xl:w-128 flex-none bg-gray-300 border-r border-black">
                        <Report />
                    </section>

                </main>
            </div>
        </div>
    )
}