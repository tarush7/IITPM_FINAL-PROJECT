import { useState } from 'react'
import InputPanel from './components/InputPanel'
import OutputPanel from './components/OutputPanel'
import TopBar from './components/TopBar'
import { validateAnalysisResponse } from './lib/analysisUtils'

const DEBUG_LOGS = import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true'

function logDebug(message, payload) {
  if (!DEBUG_LOGS) {
    return
  }

  if (payload === undefined) {
    console.log(`[Recruit-AI] ${message}`)
    return
  }

  console.log(`[Recruit-AI] ${message}`, payload)
}

function logError(message, payload) {
  if (!DEBUG_LOGS) {
    return
  }

  if (payload === undefined) {
    console.error(`[Recruit-AI] ${message}`)
    return
  }

  console.error(`[Recruit-AI] ${message}`, payload)
}

function buildResumeId(file) {
  return `${file.name}-${file.size}-${file.lastModified}`
}

function createProcessTrail() {
  return [
    {
      key: 'request',
      label: 'Sending request to n8n webhook',
      status: 'pending',
      detail: '',
    },
    {
      key: 'workflow',
      label: 'n8n workflow executing (Extract PDF -> LLM -> URL parse)',
      status: 'pending',
      detail: '',
    },
    {
      key: 'profile',
      label: 'Validating candidate profile payload',
      status: 'pending',
      detail: '',
    },
    {
      key: 'links',
      label: 'Validating contact links payload',
      status: 'pending',
      detail: '',
    },
    {
      key: 'render',
      label: 'Rendering frontend analysis cards',
      status: 'pending',
      detail: '',
    },
  ]
}

const N8N_PROXY_EVALUATE_PATH = '/n8n-webhook/webhook/evaluate'
const N8N_PROXY_INVITE_PATH = '/n8n-webhook/webhook/send-invite'

function resolveWebhookUrl(directUrl, proxyPath) {
  const configured = (directUrl || '').trim()
  if (configured.startsWith('/')) {
    return configured
  }
  return proxyPath
}

function extractCandidateEmail(contactLinks) {
  if (!Array.isArray(contactLinks)) {
    return ''
  }

  const emailLink = contactLinks.find(
    (link) =>
      link &&
      typeof link === 'object' &&
      (String(link.category || '').toLowerCase() === 'email' || String(link.url || '').includes('@')),
  )

  if (!emailLink || !emailLink.url) {
    return ''
  }

  const rawEmail = String(emailLink.url).replace(/^mailto:/i, '').trim()
  return rawEmail
}

function App() {
  const [jdText, setJdText] = useState('')
  const [resumeFiles, setResumeFiles] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [jdUploadNote, setJdUploadNote] = useState('')
  const [resumeUploadNote, setResumeUploadNote] = useState('')
  const [status, setStatus] = useState('empty')
  const [analysis, setAnalysis] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [copiedSection, setCopiedSection] = useState('')
  const [processTrail, setProcessTrail] = useState(createProcessTrail())
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteStatus, setInviteStatus] = useState('idle')
  const [inviteMessage, setInviteMessage] = useState('')
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewTime, setInterviewTime] = useState('')

  const selectedResume = resumeFiles.find((item) => item.id === selectedResumeId) || null
  const selectedResumeLabel = selectedResume
    ? `${selectedResume.file.name} (${Math.max(1, Math.round(selectedResume.file.size / 1024))} KB)`
    : ''

  const updateProcessStep = (stepKey, nextStatus, detail = '') => {
    setProcessTrail((currentTrail) =>
      currentTrail.map((step) =>
        step.key === stepKey ? { ...step, status: nextStatus, detail } : step,
      ),
    )
  }

  const handleReset = () => {
    logDebug('Reset clicked.')
    setJdText('')
    setResumeFiles([])
    setSelectedResumeId('')
    setJdUploadNote('')
    setResumeUploadNote('')
    setStatus('empty')
    setAnalysis(null)
    setErrorMessage('')
    setCopiedSection('')
    setProcessTrail(createProcessTrail())
    setInviteEmail('')
    setInviteStatus('idle')
    setInviteMessage('')
    setInterviewDate('')
    setInterviewTime('')
  }

  const handleJdFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    logDebug('JD file selected.', { name: file.name, size: file.size, type: file.type })

    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.txt')) {
      setJdUploadNote('Only .txt upload is supported for JD. Please paste text for other formats.')
      event.target.value = ''
      return
    }

    try {
      const text = await file.text()
      setJdText(text)
      setJdUploadNote(`Loaded ${file.name}`)
    } catch (error) {
      logError('JD file read failed.', error)
      setJdUploadNote('Could not read file. Please paste JD text.')
    } finally {
      event.target.value = ''
    }
  }

  const handleResumeFileUpload = async (event) => {
    handleResumeDrop(Array.from(event.target.files || []))
    event.target.value = ''
  }

  const handleResumeDrop = (incomingFiles) => {
    if (!incomingFiles || incomingFiles.length === 0) {
      return
    }

    const pdfFiles = incomingFiles.filter((file) => file.name.toLowerCase().endsWith('.pdf'))
    const ignoredCount = incomingFiles.length - pdfFiles.length

    if (pdfFiles.length === 0) {
      setResumeUploadNote('Only PDF files are allowed.')
      return
    }

    logDebug('Resume PDF files selected.', {
      totalSelected: incomingFiles.length,
      pdfAccepted: pdfFiles.length,
      ignored: ignoredCount,
      names: pdfFiles.map((file) => file.name),
    })

    let nextFiles = []
    let addedCount = 0
    let firstAddedId = ''

    setResumeFiles((currentFiles) => {
      const existingIds = new Set(currentFiles.map((item) => item.id))
      const additions = []

      pdfFiles.forEach((file) => {
        const id = buildResumeId(file)
        if (!existingIds.has(id)) {
          additions.push({
            id,
            label: `${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB)`,
            file,
          })
          existingIds.add(id)
        }
      })

      addedCount = additions.length
      firstAddedId = additions[0]?.id || ''
      nextFiles = [...currentFiles, ...additions]
      return nextFiles
    })

    setSelectedResumeId((currentId) => {
      if (currentId && nextFiles.some((item) => item.id === currentId)) {
        return currentId
      }
      return firstAddedId || nextFiles[0]?.id || ''
    })

    const noteParts = [`Added ${addedCount} PDF file(s).`]
    if (ignoredCount > 0) {
      noteParts.push(`Ignored ${ignoredCount} non-PDF file(s).`)
    }
    if (addedCount < pdfFiles.length) {
      noteParts.push('Duplicate files were skipped.')
    }
    setResumeUploadNote(noteParts.join(' '))
  }

  const handleRemoveSelectedResume = () => {
    if (!selectedResumeId) {
      return
    }

    logDebug('Removing selected resume.', { selectedResumeId })
    setResumeFiles((currentFiles) => {
      const filtered = currentFiles.filter((item) => item.id !== selectedResumeId)
      const nextSelected = filtered[0]?.id || ''
      setSelectedResumeId(nextSelected)
      setResumeUploadNote(filtered.length > 0 ? 'Selected resume removed.' : 'All resumes removed.')
      return filtered
    })
  }

  const copyText = async (value, sectionKey) => {
    try {
      await navigator.clipboard.writeText(value)
      logDebug('Copied to clipboard.', { section: sectionKey })
      setCopiedSection(sectionKey)
      setTimeout(() => {
        setCopiedSection('')
      }, 1500)
    } catch (error) {
      logError('Clipboard copy failed.', { section: sectionKey, error })
      setCopiedSection(`failed-${sectionKey}`)
      setTimeout(() => {
        setCopiedSection('')
      }, 1500)
    }
  }

  const analyzeCandidate = async () => {
    logDebug('Analyze triggered.', {
      jdChars: jdText.length,
      selectedResumeId,
      selectedResumeName: selectedResume?.file?.name || null,
      totalResumeFiles: resumeFiles.length,
    })

    if (!jdText.trim()) {
      logError('Analyze blocked: missing job description.')
      setStatus('error')
      setErrorMessage('Job Description text is required before analysis.')
      return
    }

    if (!selectedResume) {
      logError('Analyze blocked: resume PDF must be selected.')
      setStatus('error')
      setErrorMessage('Please upload and select a resume PDF before analysis.')
      return
    }

    setStatus('loading')
    setErrorMessage('')
    setCopiedSection('')
    setInviteStatus('idle')
    setInviteMessage('')
    setProcessTrail(
      createProcessTrail().map((step, index) =>
        index === 0 ? { ...step, status: 'active', detail: 'Preparing upload payload' } : step,
      ),
    )

    try {
      const webhookUrl = resolveWebhookUrl(import.meta.env.VITE_N8N_WEBHOOK_URL, N8N_PROXY_EVALUATE_PATH)
      if (!webhookUrl) {
        throw new Error(
          'Missing webhook URL. Set VITE_N8N_WEBHOOK_URL to a same-origin path like /n8n-webhook/webhook/evaluate.',
        )
      }

      const formData = new FormData()
      formData.append('resume', selectedResume.file)
      formData.append('job_description', jdText)
      formData.append('meta', JSON.stringify({ source: 'recruit-ai-frontend', ts: new Date().toISOString() }))

      logDebug('Sending request to n8n webhook.', {
        webhookUrl,
        resumeFileName: selectedResume.file.name,
        jdChars: jdText.length,
      })

      const responsePromise = fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      })
      updateProcessStep('request', 'done', 'Request accepted by gateway')
      updateProcessStep('workflow', 'active', 'Waiting for n8n execution response')

      const response = await responsePromise

      const responseContentType = response.headers.get('content-type') || ''
      const responseText = await response.text()
      logDebug('Received webhook response.', {
        status: response.status,
        contentType: responseContentType,
        bodyPreview: responseText.slice(0, 300),
      })

      if (!response.ok) {
        const errorDetails = responseText.trim().slice(0, 300)
        throw new Error(
          `Webhook request failed with status ${response.status}.${errorDetails ? ` ${errorDetails}` : ''}`,
        )
      }

      updateProcessStep('workflow', 'done', `Response received (HTTP ${response.status})`)

      if (!responseText.trim()) {
        throw new Error(
          'Webhook returned an empty response body. Check n8n execution logs for failed nodes or rate limits.',
        )
      }

      const looksLikeJson =
        responseText.trim().startsWith('{') || responseText.trim().startsWith('[')
      if (!responseContentType.includes('application/json') && !looksLikeJson) {
        throw new Error(
          `Webhook response must be JSON. Received content-type "${responseContentType || 'unknown'}".`,
        )
      }

      updateProcessStep('profile', 'active', 'Checking score, verdict, and strengths payload')

      let rawResponse = null
      try {
        rawResponse = JSON.parse(responseText)
      } catch {
        throw new Error(
          `Webhook returned invalid JSON. Body preview: ${responseText.slice(0, 160)}`,
        )
      }

      logDebug('Raw webhook response parsed.', rawResponse)
      const validatedResponse = validateAnalysisResponse(rawResponse)
      updateProcessStep('profile', 'done', 'Candidate profile payload validated')

      updateProcessStep('links', 'active', 'Inspecting contact links payload')
      const linksCount = Array.isArray(validatedResponse.contact_links)
        ? validatedResponse.contact_links.length
        : 0
      const workflowNoteText =
        typeof validatedResponse.workflow_note === 'string'
          ? validatedResponse.workflow_note.toLowerCase()
          : ''
      const workflowSkippedUrls =
        workflowNoteText.includes('skip') || workflowNoteText.includes('false branch')

      updateProcessStep(
        'links',
        'done',
        linksCount > 0
          ? `Validated ${linksCount} contact link(s)`
          : workflowSkippedUrls
            ? 'URL extraction skipped by workflow branch'
            : 'No contact links returned',
      )

      updateProcessStep('render', 'active', 'Building UI output cards')
      logDebug('Validated response ready for UI.', validatedResponse)
      setAnalysis(validatedResponse)
      setStatus('success')
      updateProcessStep('render', 'done', 'Analysis rendered')

      const parsedEmail = extractCandidateEmail(validatedResponse.contact_links)
      if (parsedEmail) {
        setInviteEmail(parsedEmail)
      }
    } catch (error) {
      logError('Analyze request failed.', error)
      setProcessTrail((currentTrail) => {
        const activeStepIndex = currentTrail.findIndex((step) => step.status === 'active')
        if (activeStepIndex === -1) {
          return currentTrail.map((step, index) =>
            index === 1
              ? {
                  ...step,
                  status: 'error',
                  detail: error instanceof Error ? error.message : 'Unexpected processing error',
                }
              : step,
          )
        }

        return currentTrail.map((step, index) =>
          index === activeStepIndex
            ? {
                ...step,
                status: 'error',
                detail: error instanceof Error ? error.message : 'Unexpected processing error',
              }
            : step,
        )
      })
      setStatus('error')
      setAnalysis(null)
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Unexpected error while analyzing candidate.')
      }
    }
  }

  const sendInterviewInvite = async () => {
    if (!analysis) {
      setInviteStatus('error')
      setInviteMessage('Run Analyze Candidate first to generate strengths.')
      return
    }

    if (!inviteEmail.trim()) {
      setInviteStatus('error')
      setInviteMessage('Candidate email is required to create draft.')
      return
    }

    if (!interviewDate) {
      setInviteStatus('error')
      setInviteMessage('Please select an interview date before creating draft.')
      return
    }

    if (!interviewTime) {
      setInviteStatus('error')
      setInviteMessage('Please select an interview time before creating draft.')
      return
    }

    if (!Array.isArray(analysis.strengths) || analysis.strengths.length === 0) {
      setInviteStatus('error')
      setInviteMessage('No strengths found in analysis payload.')
      return
    }

    setInviteStatus('sending')
    setInviteMessage('Sending to n8n send-invite webhook...')

    try {
      const evaluateUrl = resolveWebhookUrl(import.meta.env.VITE_N8N_WEBHOOK_URL, N8N_PROXY_EVALUATE_PATH)
      const inviteUrlFromEval = evaluateUrl.includes('/evaluate')
        ? evaluateUrl.replace('/evaluate', '/send-invite')
        : ''
      const inviteWebhookUrl =
        resolveWebhookUrl(import.meta.env.VITE_N8N_INVITE_WEBHOOK_URL, N8N_PROXY_INVITE_PATH) ||
        inviteUrlFromEval

      if (!inviteWebhookUrl) {
        throw new Error(
          'Missing invite webhook URL. Set VITE_N8N_INVITE_WEBHOOK_URL to a same-origin path like /n8n-webhook/webhook/send-invite.',
        )
      }

      const payload = {
        candidate_email: inviteEmail.trim(),
        strengths: analysis.strengths,
        selected_date: interviewDate,
        selected_time: interviewTime,
      }

      logDebug('Sending invite draft request.', {
        inviteWebhookUrl,
        candidateEmail: payload.candidate_email,
        strengthsCount: payload.strengths.length,
        selectedDate: payload.selected_date,
        selectedTime: payload.selected_time,
      })

      const response = await fetch(inviteWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const responseText = await response.text()
      const responseContentType = response.headers.get('content-type') || ''

      logDebug('Invite webhook response received.', {
        status: response.status,
        contentType: responseContentType,
        bodyPreview: responseText.slice(0, 300),
      })

      if (!response.ok) {
        throw new Error(
          `Invite webhook failed with status ${response.status}. ${responseText.slice(0, 200)}`,
        )
      }

      let parsedResponse = null
      if (responseText.trim()) {
        try {
          parsedResponse = JSON.parse(responseText)
        } catch {
          parsedResponse = null
        }
      }

      const successMessage =
        parsedResponse && typeof parsedResponse.message === 'string'
          ? parsedResponse.message
          : 'Interview draft created successfully.'

      setInviteStatus('success')
      setInviteMessage(successMessage)
    } catch (error) {
      logError('Invite draft request failed.', error)
      setInviteStatus('error')
      if (error instanceof Error) {
        setInviteMessage(error.message)
      } else {
        setInviteMessage('Unexpected error while creating interview draft.')
      }
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-900">
      <div className="pointer-events-none absolute -left-24 top-4 h-64 w-64 rounded-full bg-amber-300/50 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-orange-300/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-rose-200/50 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <TopBar />

        <main className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <InputPanel
            jdText={jdText}
            jdUploadNote={jdUploadNote}
            resumeUploadNote={resumeUploadNote}
            resumeFiles={resumeFiles}
            selectedResumeId={selectedResumeId}
            selectedResumeLabel={selectedResumeLabel}
            isLoading={status === 'loading'}
            onJdTextChange={setJdText}
            onJdFileUpload={handleJdFileUpload}
            onResumeFileUpload={handleResumeFileUpload}
            onResumeDrop={handleResumeDrop}
            onSelectedResumeChange={setSelectedResumeId}
            onRemoveSelectedResume={handleRemoveSelectedResume}
            onAnalyze={analyzeCandidate}
            onReset={handleReset}
            inviteEmail={inviteEmail}
            inviteStatus={inviteStatus}
            inviteMessage={inviteMessage}
            strengthsCount={Array.isArray(analysis?.strengths) ? analysis.strengths.length : 0}
            inviteEnabled={Boolean(analysis)}
            onInviteEmailChange={setInviteEmail}
            interviewDate={interviewDate}
            interviewTime={interviewTime}
            onInterviewDateChange={setInterviewDate}
            onInterviewTimeChange={setInterviewTime}
            onSendInvite={sendInterviewInvite}
          />

          <OutputPanel
            status={status}
            analysis={analysis}
            errorMessage={errorMessage}
            copiedSection={copiedSection}
            processTrail={processTrail}
            onRetry={analyzeCandidate}
            onCopyText={copyText}
          />
        </main>
      </div>
    </div>
  )
}

export default App
