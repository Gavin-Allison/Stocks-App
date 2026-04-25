export default function App() {
  return (
    <div className="flex h-screen w-full flex-col">
      <header className="h-16 w-full flex-none border-b border-black">
        <div className="max-w-[1600px] h-full flex mx-auto border-l border-r border-black">
          <h1>Top Bar</h1>
        </div>
      </header>

      <div className="flex flex-1 justify-center @container">
        <main className="max-w-[1600px] w-full flex mx-auto">

          {/* Sidebar */}
          <aside className="w-16 @[1300px]:w-64 flex-none border-l border-r border-black">
            <h1>Sidebar</h1>
          </aside>
          
          {/* Left Column*/}
          <section className="flex-1 border-r border-black">
            <h1>Left Column</h1>
          </section>

          {/* Right Column */}
          <section className="w-0 @[800px]:w-64 @[1100px]:w-128 flex-none border-r border-black">
            <h1>Right Column</h1>
          </section>

        </main>
      </div>
    </div>
  )
}