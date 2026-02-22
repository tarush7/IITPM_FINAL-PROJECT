function TopBar({ mockMode, onToggleMockMode }) {
  return (
    <header className="glass-panel mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-extrabold tracking-[0.18em] text-slate-900">RECRUIT-AI</h1>
        <p className="mt-1 text-xs text-slate-600">Agentic resume screening and scheduling copilot</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="status-pill">POC • React + n8n</span>

        <button
          type="button"
          onClick={onToggleMockMode}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            mockMode
              ? 'border-blue-300 bg-blue-100/80 text-blue-800'
              : 'border-white/70 bg-white/50 text-slate-700'
          }`}
        >
          Mock Mode: {mockMode ? 'ON' : 'OFF'}
        </button>
      </div>
    </header>
  )
}

export default TopBar
