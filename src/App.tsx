import { useEffect, useState } from "react";
import { fetch_stock_data } from "./components/stock_chart";

export default function App() {
  const layout: React.CSSProperties & { [key: string]: any } = {
    "--layout-width": "1600px",
  }

  const [temp_list, setTempList] = useState<any[]>([]);

  useEffect(() => {
    const test_fetch = async () => {
      const data = await fetch_stock_data("AAPL");
      const list = data.slice(0, 5).map((item: any, index: number) => ({
        id: index,
        stock: item.time,
      }));
      setTempList(list);
    };

    test_fetch();
  }, []);

  const temp_list_items = temp_list.map((item) => (
    <div key={item.id} className="h-100 p-2 border-b border-gray-300">
      {item.stock}
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
              {temp_list_items}
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