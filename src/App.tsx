export default function App() {
  return (
    <div className="flex h-screen w-full flex-col">
      <header className="h-16 w-full flex-none border-b border-black">
        <h1>Top Bar</h1>
      </header>

      <div className="flex flex-1 justify-center overflow-hidden @container">
        <main className="flex flex-1 max-w-7xl">

          {/* Sidebar */}
          <aside className="w-16 @6xl:w-64 flex-none border-l border-r border-black ease-in-out duration-300">
            <h1>Sidebar</h1>
          </aside>
          
          {/* Left Column*/}
          <section className="max-w-256 flex-1 border-r border-black">
            <h1>Left Column</h1>
          </section>

          {/* Right Column */}
          <section className="w-0 @4xl:w-64 flex-none border-r border-black ease-in-out duration-300">
            <h1>Right Column</h1>
          </section>

        </main>
      </div>
    </div>
  )
}