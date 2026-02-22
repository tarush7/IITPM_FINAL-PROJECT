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
  candidate_profile: {
    fit_score: 76,
    verdict: 'BORDERLINE',
    strengths: [
      'Experience with Angular and RxJS',
      'Quantifiable impacts demonstrating efficiency improvements',
      'Relevant educational background',
    ],
    gaps: [
      'Less than 2 years of professional experience',
      'No extensive project depth in a senior capacity',
    ],
    screening_decision: 'BORDERLINE',
  },
  contact_links: [
    {
      url: 'https://github.com/tarush7',
      category: 'GitHub',
      context_clue: 'Link to the candidate code repositories.',
    },
    {
      url: 'https://linkedin.com/in/tarush-kumar',
      category: 'LinkedIn',
      context_clue: 'Professional networking profile.',
    },
    {
      url: 'kumartarush20@gmail.com',
      category: 'Email',
      context_clue: 'Contains an @ symbol and appears as contact email.',
    },
  ],
}

export const DEFAULT_CRITERIA = {
  must_have_skills: true,
  relevant_experience: true,
  education_alignment: true,
  location_availability: true,
}
