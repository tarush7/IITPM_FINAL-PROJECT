import { useEffect, useState } from 'react'

const recommendationStyles = {
  INTERVIEW: 'border-green-300/70 bg-green-100/70 text-green-800',
  HOLD: 'border-amber-300/70 bg-amber-100/70 text-amber-900',
  REJECT: 'border-rose-300/70 bg-rose-100/70 text-rose-800',
}

function CopyButton({ sectionKey, copiedSection, onCopy }) {
  let label = 'Copy'
  if (copiedSection === sectionKey) {
    label = 'Copied'
  }
  if (copiedSection === `failed-${sectionKey}`) {
    label = 'Copy failed'
  }

  return (
    <button type="button" onClick={onCopy} className="btn-secondary !px-3 !py-1.5 text-xs">
      {label}
    </button>
  )
}

function LoadingTrail({ processTrail }) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse((value) => !value)
    }, 500)

    return () => clearInterval(timer)
  }, [])

  const steps = processTrail && processTrail.length > 0 ? processTrail : []

  return (
    <div className="glass-soft p-3 sm:p-4">
      <div className="mb-3 flex items-center gap-2 sm:gap-3 text-xs font-medium text-orange-800 sm:text-sm">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-300 border-t-orange-800" />
        Analyzing...
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Backend Process Trace
      </p>

      <ul className="space-y-1.5 text-xs sm:text-sm">
        {steps.map((step, index) => {
          const styleClass =
            step.status === 'done'
              ? 'bg-emerald-50 text-emerald-700'
              : step.status === 'active'
                ? `text-orange-800 ${pulse ? 'bg-orange-100' : 'bg-orange-50'}`
                : step.status === 'error'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-white/50 text-slate-500'

          return (
            <li key={step.key} className={`rounded-lg px-2 py-1.5 sm:px-2.5 transition ${styleClass}`}>
              <p>
                {index + 1}. {step.label}
              </p>
              {step.detail && <p className="mt-0.5 text-xs opacity-80">{step.detail}</p>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="glass-soft border border-slate-300/70 p-3 sm:p-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-800">{title}</h3>
      {children}
    </div>
  )
}

function OutputPanel({
  status,
  analysis,
  errorMessage,
  copiedSection,
  processTrail,
  onRetry,
  onCopyText,
}) {
  return (
    <section className="glass-panel p-4 sm:p-5">
      <h2 className="mb-3 text-base font-bold text-slate-900 sm:mb-4 sm:text-lg">AI Analysis</h2>

      {status === 'empty' && (
        <div className="glass-soft rounded-xl border border-dashed border-slate-300/60 p-4 text-sm text-slate-600 sm:p-6">
          Add a job description, upload resume PDF(s), choose one from the dropdown, and click
          Analyze Candidate.
        </div>
      )}

      {status === 'loading' && (
        <LoadingTrail processTrail={processTrail} />
      )}

      {status === 'error' && (
        <div className="glass-soft space-y-3 border border-rose-200/70 bg-rose-50/70 p-3 sm:p-4">
          <p className="break-words text-sm text-rose-700">{errorMessage}</p>
          <LoadingTrail processTrail={processTrail} />
          <button type="button" onClick={onRetry} className="btn-secondary w-full text-xs sm:w-auto">
            Try again
          </button>
        </div>
      )}

      {status === 'success' && analysis && (
        <div className="space-y-5">
          <SectionCard title="Fit Score">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <p className="text-3xl font-extrabold text-slate-900 sm:text-4xl">{analysis.score}</p>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${recommendationStyles[analysis.recommendation]}`}
              >
                {analysis.recommendation}
              </span>
            </div>
          </SectionCard>

          <SectionCard title="Summary">
            <p className="text-sm text-slate-700">{analysis.summary}</p>
          </SectionCard>

          {analysis.workflow_note && (
            <SectionCard title="Workflow Context">
              <p className="break-words text-sm text-slate-700">{analysis.workflow_note}</p>
            </SectionCard>
          )}

          <SectionCard title="Strengths">
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {analysis.strengths.map((item, index) => (
                <li key={`strength-${index}`}>{item}</li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Gaps / Risks">
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {analysis.gaps.map((item, index) => (
                <li key={`gap-${index}`}>{item}</li>
              ))}
            </ul>
          </SectionCard>

          {analysis.interview_questions.length > 0 && (
            <SectionCard title="Suggested Interview Questions">
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                {analysis.interview_questions.map((item, index) => (
                  <li key={`question-${index}`}>{item}</li>
                ))}
              </ul>
            </SectionCard>
          )}

          <SectionCard title="Recommended Next Action">
            <p className="text-sm text-slate-700">{analysis.recommended_action}</p>
          </SectionCard>

          {analysis.contact_links.length > 0 && (
            <SectionCard title="Contact Links">
              <ul className="space-y-2 text-sm text-slate-700">
                {analysis.contact_links.map((link, index) => (
                  <li
                    key={`${link.url}-${index}`}
                    className="rounded-lg border border-white/70 bg-white/55 p-2.5 sm:p-3"
                  >
                    <p className="break-words font-semibold text-slate-800">{link.category}</p>
                    {link.url.includes('@') ? (
                      <a
                        href={`mailto:${link.url}`}
                        className="break-all text-orange-700 underline decoration-orange-300"
                      >
                        {link.url}
                      </a>
                    ) : (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-orange-700 underline decoration-orange-300"
                      >
                        {link.url}
                      </a>
                    )}
                    {link.context_clue && <p className="mt-1 text-xs text-slate-500">{link.context_clue}</p>}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {analysis.email_draft && (
            <div className="glass-soft p-3 sm:p-4">
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Email Draft</h3>
                <CopyButton
                  sectionKey="email"
                  copiedSection={copiedSection}
                  onCopy={() => onCopyText(analysis.email_draft, 'email')}
                />
              </div>
              <textarea
                readOnly
                value={analysis.email_draft}
                rows={7}
                className="glass-input text-sm text-slate-700"
              />
            </div>
          )}

          {analysis.calendar_payload && (
            <div className="glass-soft p-3 sm:p-4">
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Scheduling Payload</h3>
                <CopyButton
                  sectionKey="calendar"
                  copiedSection={copiedSection}
                  onCopy={() => onCopyText(JSON.stringify(analysis.calendar_payload, null, 2), 'calendar')}
                />
              </div>
              <pre className="max-h-64 overflow-auto rounded-xl border border-white/60 bg-white/60 p-3 text-xs text-slate-700">
                {JSON.stringify(analysis.calendar_payload, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default OutputPanel
