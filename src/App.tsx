import { useEffect, useState } from "react";
import { FetchStockData, ChartComponent } from "./components/stock_chart";

export default function App() {
  const layout: React.CSSProperties & { [key: string]: any } = {
    "--layout-width": "1600px",
  }

  const [tempList, setTempList] = useState<any[]>([]);

  useEffect(() => {
    const testFetch = async () => {
      const data = await FetchStockData("AAPL");
      const list = [{
        id: 0,
        stock: "AAPL Chart",
        chartData: data
      }];
      setTempList(list);
    };

    testFetch();
  }, []);

  const tempListItems = tempList.map((item) => (
    <div key={item.id} className="p-4 border-b border-gray-300">
      <div className="mb-2 font-bold">{item.stock}</div>
      <div className="h-[300px] w-full bg-white [&_a]:hidden">
        <ChartComponent data={item.chartData} />
      </div>
    </div>
  ))
    
  return (
    <div className="flex h-screen w-full flex-col" style={layout}>

      <header className="h-16 w-full flex-none border-b border-black">
        <div className="max-w-[var(--layout-width)] h-full flex mx-auto bg-gray-400 border-x border-black">
          <h1>Top Bar</h1>
        </div>
      </header>

      <div className="flex flex-1 justify-center overflow-y-hidden @container">
        <main className="max-w-[var(--layout-width)] w-full flex mx-auto">

          {/* Sidebar */}
          <aside className="w-16 @7xl:w-64 flex-none bg-gray-300 border-x border-black">
            <h1>Sidebar</h1>
          </aside>
          
          {/* Left Column*/}
          <section className="flex-1 overflow-y-scroll bg-gray-200 border-r border-black">
            <h1>Left Column</h1>
            <div>
              {tempListItems}
            </div>
          </section>

          {/* Right Column */}
          <section className="w-0 @4xl:w-64 @6xl:w-128 flex-none bg-gray-300 border-r border-black">
            <h1>Right Column</h1>
          </section>

        </main>
      </div>
    </div>
  )
}