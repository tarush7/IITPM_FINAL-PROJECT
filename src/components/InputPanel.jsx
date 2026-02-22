import { useRef, useState } from 'react'

function InputPanel({
  jdText,
  jdUploadNote,
  resumeUploadNote,
  resumeFiles,
  selectedResumeId,
  selectedResumeLabel,
  isLoading,
  onJdTextChange,
  onJdFileUpload,
  onResumeFileUpload,
  onResumeDrop,
  onSelectedResumeChange,
  onRemoveSelectedResume,
  onAnalyze,
  onReset,
  inviteEmail,
  inviteStatus,
  inviteMessage,
  strengthsCount,
  inviteEnabled,
  onInviteEmailChange,
  interviewDate,
  interviewTime,
  onInterviewDateChange,
  onInterviewTimeChange,
  onSendInvite,
}) {
  const fileInputRef = useRef(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleDragOver = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (!isDragActive) {
      setIsDragActive(true)
    }
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)
    onResumeDrop(Array.from(event.dataTransfer.files || []))
  }

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
        <label htmlFor="resumeSelect" className="mb-2 block text-sm font-semibold text-slate-700">
          Resume (PDF only)
        </label>

        <div
          className={`pdf-dropzone ${isDragActive ? 'pdf-dropzone-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-2xl">☁</div>
          <p className="mt-1 text-base font-semibold text-slate-800">Choose PDF or drag and drop</p>
          <p className="mt-1 text-sm text-slate-500">PDF format only, up to 50MB each</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary mt-4"
          >
            Browse PDF
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            onChange={onResumeFileUpload}
            className="hidden"
          />
        </div>

        <select
          id="resumeSelect"
          value={selectedResumeId}
          onChange={(event) => onSelectedResumeChange(event.target.value)}
          className="glass-input mt-3"
          disabled={resumeFiles.length === 0}
        >
          {resumeFiles.length === 0 && <option value="">No resume uploaded yet</option>}
          {resumeFiles.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {selectedResumeId && (
              <button type="button" onClick={onRemoveSelectedResume} className="btn-ghost text-xs">
                Remove selected
              </button>
            )}
            <span className="text-xs text-slate-500">{resumeFiles.length} file(s)</span>
          </div>
        </div>
        {selectedResumeLabel && <p className="m-2 text-xs font-medium text-slate-700">Selected: {selectedResumeLabel}</p>}
        {resumeUploadNote && <p className="m-2 text-xs text-slate-600">{resumeUploadNote}</p>}
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
      </div>

      <div
        className={`glass-soft mt-5 border border-slate-300/70 p-4 ${
          inviteEnabled ? '' : 'opacity-60'
        }`}
      >
        <h3 className="text-sm font-semibold text-slate-800">Send Interview Draft</h3>
        <p className="mt-1 text-xs text-slate-600">
          Uses n8n `send-invite` webhook with selected candidate strengths.
        </p>

        <div className="mt-3 space-y-2">
          <label htmlFor="inviteEmail" className="block text-xs font-semibold text-slate-700">
            Candidate Email
          </label>
          <input
            id="inviteEmail"
            type="email"
            value={inviteEmail}
            onChange={(event) => onInviteEmailChange(event.target.value)}
            placeholder="candidate@email.com"
            className="glass-input"
            disabled={!inviteEnabled}
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="interviewDate" className="block text-xs font-semibold text-slate-700">
              Interview Date
            </label>
            <input
              id="interviewDate"
              type="date"
              value={interviewDate}
              onChange={(event) => onInterviewDateChange(event.target.value)}
              className="glass-input"
              disabled={!inviteEnabled}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="interviewTime" className="block text-xs font-semibold text-slate-700">
              Interview Time
            </label>
            <input
              id="interviewTime"
              type="time"
              value={interviewTime}
              onChange={(event) => onInterviewTimeChange(event.target.value)}
              className="glass-input"
              disabled={!inviteEnabled}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xs text-slate-500">{strengthsCount} strength item(s) will be sent</p>
          <button
            type="button"
            onClick={onSendInvite}
            disabled={!inviteEnabled || inviteStatus === 'sending'}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {inviteStatus === 'sending' ? 'Sending...' : 'Create Draft'}
          </button>
        </div>

        {!inviteEnabled && (
          <p className="mt-2 text-xs text-slate-500">
            Run AI analysis first to enable draft creation.
          </p>
        )}

        {inviteMessage && (
          <p
            className={`mt-3 text-xs ${
              inviteStatus === 'error'
                ? 'text-rose-700'
                : inviteStatus === 'success'
                  ? 'text-emerald-700'
                  : 'text-slate-600'
            }`}
          >
            {inviteMessage}
          </p>
        )}
      </div>
    </section>
  )
}

export default InputPanel
