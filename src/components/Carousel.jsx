import { useState } from 'react'

const SLIDES = [
  {
    title: 'Persona & Pain',
    content:
      'Sarah, a small-team HR lead, is drowning in resumes while juggling hiring manager follow-ups and interview coordination.',
  },
  {
    title: 'Problem',
    content:
      'Manual screening is slow and inconsistent, creates decision fatigue, and delays candidate responses that hurt experience.',
  },
  {
    title: 'Solution',
    content:
      'Recruit-AI scores fit, explains strengths and gaps, recommends a decision, and can output interview email + scheduling payload.',
  },
  {
    title: 'How It Works',
    content:
      'JD + Resume are sent to n8n webhook, processed by an LLM chain, and returned as structured JSON for easy HR action.',
  },
  {
    title: 'Metrics',
    content:
      'Track time-to-screen, shortlist precision, and a time-to-hire proxy to evaluate whether quality and speed both improve.',
  },
]

function Carousel() {
  const [activeIndex, setActiveIndex] = useState(0)

  const showPrevious = () => {
    setActiveIndex((currentIndex) => {
      if (currentIndex === 0) {
        return SLIDES.length - 1
      }
      return currentIndex - 1
    })
  }

  const showNext = () => {
    setActiveIndex((currentIndex) => {
      if (currentIndex === SLIDES.length - 1) {
        return 0
      }
      return currentIndex + 1
    })
  }

  const activeSlide = SLIDES[activeIndex]

  return (
    <section className="glass-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">PM Snapshot</h2>
        <span className="text-xs text-slate-500">
          {activeIndex + 1} / {SLIDES.length}
        </span>
      </div>

      <div key={activeSlide.title} className="glass-soft slide-enter p-4">
        <h3 className="text-sm font-semibold text-slate-800">{activeSlide.title}</h3>
        <p className="mt-2 text-sm text-slate-700">{activeSlide.content}</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={showPrevious}
          className="btn-secondary"
        >
          Prev
        </button>

        <div className="flex items-center gap-1.5">
          {SLIDES.map((slide, index) => (
            <button
              type="button"
              key={slide.title}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full ${
                index === activeIndex ? 'bg-blue-600' : 'bg-slate-300/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={showNext}
          className="btn-secondary"
        >
          Next
        </button>
      </div>
    </section>
  )
}

export default Carousel
