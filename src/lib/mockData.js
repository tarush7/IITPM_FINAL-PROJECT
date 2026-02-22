export const SAMPLE_JD = `Senior Frontend Engineer (React)
We are seeking a frontend engineer to build recruiting workflows for small HR teams.
Must-have: React, JavaScript, REST APIs, stakeholder communication.
Preferred: ATS integrations, analytics dashboards, accessibility fundamentals.
Experience: 3+ years building production web apps.
Location: Remote-friendly in US time zones.`

export const SAMPLE_RESUME = `Ananya Rao
Frontend Engineer with 4 years of experience in React and TypeScript.
Built internal hiring portal reducing recruiter screening time by 35%.
Worked with REST APIs, form workflows, and performance optimization.
Education: B.Tech in Computer Science.
Location: Austin, TX. Available to start in 2 weeks.`

export const MOCK_RESPONSE = {
  score: 84,
  recommendation: 'INTERVIEW',
  summary:
    'Candidate aligns well with core frontend requirements and has directly relevant recruiting-tool experience.',
  strengths: [
    'Strong React implementation background',
    'Experience reducing recruiter workflow time with measurable impact',
    'Clear alignment with location and availability requirements',
  ],
  gaps: [
    'No explicit ATS integration ownership described',
    'Accessibility depth is implied but not clearly demonstrated',
  ],
  interview_questions: [
    'Walk us through a complex React workflow you shipped and tradeoffs you made.',
    'How did you measure and improve screening funnel performance?',
    'Describe your approach to accessibility in form-heavy interfaces.',
  ],
  recommended_action: 'Proceed to 45-minute technical + PM collaboration interview.',
  email_draft:
    'Hi Ananya,\n\nThanks for applying. We were impressed by your experience building recruiter workflows. We would like to invite you to a 45-minute interview this week.\n\nBest,\nSarah',
  calendar_payload: {
    candidate_name: 'Ananya Rao',
    meeting_type: 'Technical + PM Interview',
    duration_minutes: 45,
    preferred_slots: ['2026-02-24T18:00:00Z', '2026-02-25T17:00:00Z'],
  },
}

export const DEFAULT_CRITERIA = {
  must_have_skills: true,
  relevant_experience: true,
  education_alignment: true,
  location_availability: true,
}
