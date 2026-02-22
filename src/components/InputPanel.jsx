function InputPanel({
  jdText,
  resumeText,
  strictness,
  criteria,
  jdUploadNote,
  resumeUploadNote,
  isLoading,
  onJdTextChange,
  onResumeTextChange,
  onStrictnessChange,
  onToggleCriterion,
  onJdFileUpload,
  onResumeFileUpload,
  onAnalyze,
  onReset,
  onLoadSample,
}) {
  return (
    <section className="glass-panel p-5">
      <h2 className="mb-4 text-lg font-bold text-slate-900">Inputs</h2>

      <div className="mb-6">
        <label htmlFor="jdText" className="mb-2 block text-sm font-semibold text-slate-700">
          Job Description
        </label>
        <textarea
          id="jdText"
          value={jdText}
          onChange={(event) => onJdTextChange(event.target.value)}
          rows={8}
          placeholder="Paste the full job description..."
          className="glass-input"
        />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <label className="glass-chip cursor-pointer">
            Upload .txt
            <input
              type="file"
              accept=".txt,text/plain"
              onChange={onJdFileUpload}
              className="hidden"
            />
          </label>
          <span className="text-xs text-slate-500">{jdText.length} chars</span>
        </div>
        {jdUploadNote && <p className="mt-2 text-xs text-slate-600">{jdUploadNote}</p>}
      </div>

      <div className="mb-6">
        <label htmlFor="resumeText" className="mb-2 block text-sm font-semibold text-slate-700">
          Resume
        </label>
        <textarea
          id="resumeText"
          value={resumeText}
          onChange={(event) => onResumeTextChange(event.target.value)}
          rows={8}
          placeholder="Paste resume text, or upload a .txt file."
          className="glass-input"
        />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <label className="glass-chip cursor-pointer">
            Upload Resume
            <input
              type="file"
              accept=".txt,.pdf,.doc,.docx,text/plain,application/pdf,.doc,.docx"
              onChange={onResumeFileUpload}
              className="hidden"
            />
          </label>
          <span className="text-xs text-slate-500">{resumeText.length} chars</span>
        </div>
        {resumeUploadNote && <p className="mt-2 text-xs text-slate-600">{resumeUploadNote}</p>}
      </div>

      <div className="glass-soft mb-6 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Evaluation Settings</h3>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="strictness" className="text-sm font-medium text-slate-700">
              Strictness
            </label>
            <span className="text-sm font-semibold text-slate-800">{strictness}</span>
          </div>
          <input
            id="strictness"
            type="range"
            min="0"
            max="100"
            value={strictness}
            onChange={(event) => onStrictnessChange(Number(event.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="space-y-2 text-sm text-slate-700">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={criteria.must_have_skills}
              onChange={() => onToggleCriterion('must_have_skills')}
              className="h-4 w-4 rounded border-slate-400/50 bg-white/70"
            />
            Must-have skills match
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={criteria.relevant_experience}
              onChange={() => onToggleCriterion('relevant_experience')}
              className="h-4 w-4 rounded border-slate-400/50 bg-white/70"
            />
            Relevant experience
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={criteria.education_alignment}
              onChange={() => onToggleCriterion('education_alignment')}
              className="h-4 w-4 rounded border-slate-400/50 bg-white/70"
            />
            Education alignment
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={criteria.location_availability}
              onChange={() => onToggleCriterion('location_availability')}
              className="h-4 w-4 rounded border-slate-400/50 bg-white/70"
            />
            Location/availability
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isLoading}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Candidate'}
        </button>

        <button type="button" onClick={onReset} className="btn-secondary">
          Reset
        </button>

        <button type="button" onClick={onLoadSample} className="btn-ghost text-xs">
          Load Sample JD + Resume
        </button>
      </div>
    </section>
  )
}

export default InputPanel
