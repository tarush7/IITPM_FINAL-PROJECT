import { useState } from 'react'
import Carousel from './components/Carousel'
import InputPanel from './components/InputPanel'
import OutputPanel from './components/OutputPanel'
import TopBar from './components/TopBar'
import { validateAnalysisResponse } from './lib/analysisUtils'
import { DEFAULT_CRITERIA, MOCK_RESPONSE, SAMPLE_JD, SAMPLE_RESUME } from './lib/mockData'

function App() {
  const [jdText, setJdText] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [strictness, setStrictness] = useState(60)
  const [criteria, setCriteria] = useState({ ...DEFAULT_CRITERIA })
  const [mockMode, setMockMode] = useState(true)
  const [jdUploadNote, setJdUploadNote] = useState('')
  const [resumeUploadNote, setResumeUploadNote] = useState('')
  const [status, setStatus] = useState('empty')
  const [analysis, setAnalysis] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [copiedSection, setCopiedSection] = useState('')

  const handleReset = () => {
    setJdText('')
    setResumeText('')
    setStrictness(60)
    setCriteria({ ...DEFAULT_CRITERIA })
    setJdUploadNote('')
    setResumeUploadNote('')
    setStatus('empty')
    setAnalysis(null)
    setErrorMessage('')
    setCopiedSection('')
  }

  const handleLoadSample = () => {
    setJdText(SAMPLE_JD)
    setResumeText(SAMPLE_RESUME)
    setJdUploadNote('Sample JD loaded.')
    setResumeUploadNote('Sample resume loaded.')
    setStatus('empty')
    setAnalysis(null)
    setErrorMessage('')
    setCopiedSection('')
  }

  const handleJdFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

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
    } catch {
      setJdUploadNote('Could not read file. Please paste JD text.')
    } finally {
      event.target.value = ''
    }
  }

  const handleResumeFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const fileName = file.name.toLowerCase()
    const isTxt = fileName.endsWith('.txt')
    const isDocOrPdf =
      fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx')

    if (isTxt) {
      try {
        const text = await file.text()
        setResumeText(text)
        setResumeUploadNote(`Loaded ${file.name}`)
      } catch {
        setResumeUploadNote('Could not read file. Please paste resume text.')
      } finally {
        event.target.value = ''
      }
      return
    }

    if (isDocOrPdf) {
      setResumeUploadNote('Parsing not implemented. Paste resume text for best results.')
      event.target.value = ''
      return
    }

    setResumeUploadNote('Unsupported file type. Use .txt upload or paste resume text.')
    event.target.value = ''
  }

  const handleToggleCriterion = (criterionKey) => {
    setCriteria((currentCriteria) => ({
      ...currentCriteria,
      [criterionKey]: !currentCriteria[criterionKey],
    }))
  }

  const copyText = async (value, sectionKey) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedSection(sectionKey)
      setTimeout(() => {
        setCopiedSection('')
      }, 1500)
    } catch {
      setCopiedSection(`failed-${sectionKey}`)
      setTimeout(() => {
        setCopiedSection('')
      }, 1500)
    }
  }

  const analyzeCandidate = async () => {
    if (!jdText.trim()) {
      setStatus('error')
      setErrorMessage('Job Description text is required before analysis.')
      return
    }

    if (!resumeText.trim()) {
      setStatus('error')
      setErrorMessage('Resume text is required before analysis.')
      return
    }

    setStatus('loading')
    setErrorMessage('')
    setCopiedSection('')

    const payload = {
      jd_text: jdText,
      resume_text: resumeText,
      strictness,
      criteria: {
        must_have_skills: criteria.must_have_skills,
        relevant_experience: criteria.relevant_experience,
        education_alignment: criteria.education_alignment,
        location_availability: criteria.location_availability,
      },
      meta: {
        source: 'recruit-ai-frontend',
        ts: new Date().toISOString(),
      },
    }

    try {
      let rawResponse = null

      if (mockMode) {
        // Mock mode keeps demos stable when webhook or LLM is unavailable.
        await new Promise((resolve) => setTimeout(resolve, 800))
        rawResponse = MOCK_RESPONSE
      } else {
        const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
        if (!webhookUrl) {
          throw new Error(
            'Missing VITE_N8N_WEBHOOK_URL. Add it to your .env file and restart the dev server.',
          )
        }

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error(`Webhook request failed with status ${response.status}.`)
        }

        const responseContentType = response.headers.get('content-type') || ''
        if (!responseContentType.includes('application/json')) {
          throw new Error('Webhook response must be JSON.')
        }

        rawResponse = await response.json()
      }

      const validatedResponse = validateAnalysisResponse(rawResponse)
      setAnalysis(validatedResponse)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setAnalysis(null)
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Unexpected error while analyzing candidate.')
      }
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-900">
      <div className="pointer-events-none absolute -left-24 top-4 h-64 w-64 rounded-full bg-sky-300/50 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-indigo-300/45 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-cyan-200/60 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <TopBar mockMode={mockMode} onToggleMockMode={() => setMockMode((value) => !value)} />

        <main className="grid gap-6 lg:grid-cols-2">
          <InputPanel
            jdText={jdText}
            resumeText={resumeText}
            strictness={strictness}
            criteria={criteria}
            jdUploadNote={jdUploadNote}
            resumeUploadNote={resumeUploadNote}
            isLoading={status === 'loading'}
            onJdTextChange={setJdText}
            onResumeTextChange={setResumeText}
            onStrictnessChange={setStrictness}
            onToggleCriterion={handleToggleCriterion}
            onJdFileUpload={handleJdFileUpload}
            onResumeFileUpload={handleResumeFileUpload}
            onAnalyze={analyzeCandidate}
            onReset={handleReset}
            onLoadSample={handleLoadSample}
          />

          <OutputPanel
            status={status}
            analysis={analysis}
            errorMessage={errorMessage}
            copiedSection={copiedSection}
            onRetry={analyzeCandidate}
            onCopyText={copyText}
          />
        </main>

        <section className="mt-6">
          <Carousel />
        </section>
      </div>
    </div>
  )
}

export default App
