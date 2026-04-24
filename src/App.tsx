import './index.css'

export default function App() {

  return (
    <div className="flex h-screen w-full flex-col">
      
      {/* Bar at top: fixed height with bottom border */}
      <header className="h-16 w-full flex-none border-b border-black">
        <h1>Top Bar</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Bar at side: fixed width with right border */}
        <aside className="w-64 flex-none border-r border-black">
          <h1>Sidebar</h1>
        </aside>

        {/* Main Content Area */}
        <main className="flex flex-1">
          
          {/* Left Column */}
          <section className="w-256 flex-none overflow-auto border-r border-black">
            <h1>Left Column</h1>
          </section>

          {/* Right Column*/}
          <section className="flex-1 overflow-auto">
            <h1>Right Column</h1>
          </section>

        </main>
      </div>
    </div>
  )
}