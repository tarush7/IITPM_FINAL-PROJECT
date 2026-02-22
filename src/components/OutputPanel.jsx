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
    <button type="button" onClick={onCopy} className="btn-secondary !px-2.5 !py-1 text-xs">
      {label}
    </button>
  )
}

function OutputPanel({ status, analysis, errorMessage, copiedSection, onRetry, onCopyText }) {
  return (
    <section className="glass-panel p-5">
      <h2 className="mb-4 text-lg font-bold text-slate-900">AI Analysis</h2>

      {status === 'empty' && (
        <div className="glass-soft rounded-xl border border-dashed border-slate-300/60 p-6 text-sm text-slate-600">
          Paste a JD and resume, adjust settings, and click Analyze Candidate.
        </div>
      )}

      {status === 'loading' && (
        <div className="glass-soft flex items-center gap-3 p-4 text-sm font-medium text-blue-800">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-blue-800" />
          Analyzing...
        </div>
      )}

      {status === 'error' && (
        <div className="glass-soft space-y-3 border border-rose-200/70 bg-rose-50/70 p-4">
          <p className="text-sm text-rose-700">{errorMessage}</p>
          <button type="button" onClick={onRetry} className="btn-secondary text-xs">
            Try again
          </button>
        </div>
      )}

      {status === 'success' && analysis && (
        <div className="space-y-5">
          <div className="glass-soft p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Fit Score</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="text-4xl font-extrabold text-slate-900">{analysis.score}</p>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${recommendationStyles[analysis.recommendation]}`}
              >
                {analysis.recommendation}
              </span>
            </div>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-semibold text-slate-800">Summary</h3>
            <p className="text-sm text-slate-700">{analysis.summary}</p>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-semibold text-slate-800">Strengths</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {analysis.strengths.map((item, index) => (
                <li key={`strength-${index}`}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-semibold text-slate-800">Gaps / Risks</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {analysis.gaps.map((item, index) => (
                <li key={`gap-${index}`}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-semibold text-slate-800">Suggested Interview Questions</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {analysis.interview_questions.map((item, index) => (
                <li key={`question-${index}`}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-semibold text-slate-800">Recommended Next Action</h3>
            <p className="text-sm text-slate-700">{analysis.recommended_action}</p>
          </div>

          {analysis.email_draft && (
            <div className="glass-soft p-4">
              <div className="mb-2 flex items-center justify-between">
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
                rows={6}
                className="glass-input text-sm text-slate-700"
              />
            </div>
          )}

          {analysis.calendar_payload && (
            <div className="glass-soft p-4">
              <div className="mb-2 flex items-center justify-between">
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
