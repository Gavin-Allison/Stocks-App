export default function App() {
  const layout: React.CSSProperties & { [key: string]: any } = {
    "--layout-width": "1600px",
  }
   
  return (
    <div className="flex h-screen w-full flex-col" style={layout}>

      <header className="h-16 w-full flex-none border-b border-black">
        <div className="max-w-[var(--layout-width)] h-full flex mx-auto border-x border-black">
          <h1>Top Bar</h1>
        </div>
      </header>

      <div className="flex flex-1 justify-center @container">
        <main className="max-w-[var(--layout-width)] w-full flex mx-auto">

          {/* Sidebar */}
          <aside className="w-16 @7xl:w-64 flex-none border-x border-black">
            <h1>Sidebar</h1>
          </aside>
          
          {/* Left Column*/}
          <section className="flex-1 border-r border-black">
            <h1>Left Column</h1>
          </section>

          {/* Right Column */}
          <section className="w-0 @4xl:w-64 @6xl:w-128 flex-none border-r border-black">
            <h1>Right Column</h1>
          </section>

        </main>
      </div>
    </div>
  )
}