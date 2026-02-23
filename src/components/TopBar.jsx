import { useEffect, useState } from 'react'

const PITCH_LINES = [
  'Screen resumes faster',
  'Rank candidate fit',
  'Highlight hiring risks',
  'Recommend next action',
]

function TopBar() {
  const [lineIndex, setLineIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentLine = PITCH_LINES[lineIndex]
    const typingDelay = isDeleting ? 35 : 65

    const timer = setTimeout(() => {
      if (!isDeleting) {
        const nextText = currentLine.slice(0, displayText.length + 1)
        setDisplayText(nextText)

        if (nextText === currentLine) {
          setTimeout(() => {
            setIsDeleting(true)
          }, 900)
        }
        return
      }

      const nextText = currentLine.slice(0, Math.max(0, displayText.length - 1))
      setDisplayText(nextText)

      if (nextText.length === 0) {
        setIsDeleting(false)
        setLineIndex((currentIndex) => (currentIndex + 1) % PITCH_LINES.length)
      }
    }, typingDelay)

    return () => clearTimeout(timer)
  }, [displayText, isDeleting, lineIndex])

  return (
    <header className="glass-panel mb-4 flex flex-col gap-3 p-3 sm:mb-6 sm:gap-4 sm:p-4 md:p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-lg font-extrabold tracking-[0.12em] text-slate-900 sm:text-xl sm:tracking-[0.18em]">
          RECRUIT-AI
        </h1>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          Agentic resume screening and scheduling copilot
        </p>
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
        <p className="typing-pill w-full sm:w-auto">
          {displayText}
          <span className="typing-cursor">|</span>
        </p>
        <span className="status-pill">LIVE • React + n8n</span>
      </div>
    </header>
  )
}

export default TopBar
