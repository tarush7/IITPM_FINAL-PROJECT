function normalizeArrayField(value, fieldName) {
  if (!Array.isArray(value)) {
    throw new Error(`Response field "${fieldName}" must be an array.`)
  }

  return value.map((item) => String(item))
}

function normalizeContactLinks(value) {
  if (value === undefined || value === null) {
    return []
  }

  if (!Array.isArray(value)) {
    throw new Error('Response field "contact_links" must be an array.')
  }

  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      url: String(item.url || ''),
      category: String(item.category || 'Other'),
      context_clue: String(item.context_clue || ''),
    }))
    .filter((item) => item.url)
}

function mapVerdictToRecommendation(value) {
  const verdict = String(value || '').toUpperCase()

  if (verdict === 'STRONG_FIT' || verdict === 'INTERVIEW') {
    return 'INTERVIEW'
  }

  if (verdict === 'BORDERLINE' || verdict === 'HOLD') {
    return 'HOLD'
  }

  return 'REJECT'
}

function parseCandidateProfileShape(rawData) {
  const profile = rawData.candidate_profile
  if (!profile || typeof profile !== 'object') {
    return null
  }

  const parsedScore = Number(profile.fit_score)
  if (Number.isNaN(parsedScore)) {
    throw new Error('Response field "candidate_profile.fit_score" must be a number.')
  }

  const verdict = String(profile.verdict || profile.screening_decision || '').toUpperCase()
  if (!verdict) {
    throw new Error('Response field "candidate_profile.verdict" is required.')
  }

  const strengths = normalizeArrayField(profile.strengths || [], 'candidate_profile.strengths')
  const gaps = normalizeArrayField(profile.gaps || [], 'candidate_profile.gaps')
  const screeningDecision = String(profile.screening_decision || verdict)

  return {
    score: Math.min(100, Math.max(0, Math.round(parsedScore))),
    recommendation: mapVerdictToRecommendation(verdict),
    summary: `Verdict: ${verdict}.`,
    strengths,
    gaps,
    interview_questions: [],
    recommended_action: `Screening decision: ${screeningDecision}`,
    email_draft: rawData.email_draft ? String(rawData.email_draft) : '',
    calendar_payload: rawData.calendar_payload && typeof rawData.calendar_payload === 'object' ? rawData.calendar_payload : null,
    contact_links: normalizeContactLinks(rawData.contact_links),
  }
}

export function validateAnalysisResponse(rawData) {
  // Defensive validation keeps backend contract issues easy to debug.
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Backend returned an invalid response object.')
  }

  const parsedCandidateProfileShape = parseCandidateProfileShape(rawData)
  if (parsedCandidateProfileShape) {
    return parsedCandidateProfileShape
  }

  const requiredFields = [
    'score',
    'recommendation',
    'summary',
    'strengths',
    'gaps',
    'interview_questions',
    'recommended_action',
  ]
  const missingFields = requiredFields.filter(
    (field) => rawData[field] === undefined || rawData[field] === null,
  )

  if (missingFields.length > 0) {
    throw new Error(`Response is missing required fields: ${missingFields.join(', ')}`)
  }

  const parsedScore = Number(rawData.score)
  if (Number.isNaN(parsedScore)) {
    throw new Error('Response field "score" must be a number.')
  }

  const recommendation = String(rawData.recommendation).toUpperCase()
  if (!['INTERVIEW', 'HOLD', 'REJECT'].includes(recommendation)) {
    throw new Error('Response field "recommendation" must be INTERVIEW, HOLD, or REJECT.')
  }

  if (
    rawData.email_draft !== undefined &&
    rawData.email_draft !== null &&
    typeof rawData.email_draft !== 'string'
  ) {
    throw new Error('Optional field "email_draft" must be a string.')
  }

  if (
    rawData.calendar_payload !== undefined &&
    rawData.calendar_payload !== null &&
    (typeof rawData.calendar_payload !== 'object' || Array.isArray(rawData.calendar_payload))
  ) {
    throw new Error('Optional field "calendar_payload" must be an object.')
  }

  return {
    score: Math.min(100, Math.max(0, Math.round(parsedScore))),
    recommendation,
    summary: String(rawData.summary),
    strengths: normalizeArrayField(rawData.strengths, 'strengths'),
    gaps: normalizeArrayField(rawData.gaps, 'gaps'),
    interview_questions: normalizeArrayField(rawData.interview_questions, 'interview_questions'),
    recommended_action: String(rawData.recommended_action),
    email_draft: rawData.email_draft ? String(rawData.email_draft) : '',
    calendar_payload: rawData.calendar_payload || null,
    contact_links: normalizeContactLinks(rawData.contact_links),
  }
}
