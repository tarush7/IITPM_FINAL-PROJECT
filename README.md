# Recruit-AI Frontend (POC)

Single-page React + Tailwind app for HR screening flow:

- Paste/upload Job Description
- Paste/upload Resume
- Analyze candidate via n8n webhook (or Mock Mode)
- View structured AI recommendation and optional automation outputs

## Tech Stack

- React (Vite)
- Tailwind CSS (`@tailwindcss/vite`)
- n8n webhook integration over HTTP POST

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in project root:

```bash
VITE_N8N_WEBHOOK_URL=https://your-n8n-domain/webhook/recruit-ai
```

3. Run development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Mock Mode

The app includes a `Mock Mode` toggle in the top bar.

- `ON`: skips network call, returns a hardcoded response after 800ms
- `OFF`: sends real request to `VITE_N8N_WEBHOOK_URL`

Use Mock Mode to demo safely when backend is unavailable.

## Webhook Request Payload

When `Analyze Candidate` is clicked, frontend sends:

```json
{
  "jd_text": "string",
  "resume_text": "string",
  "strictness": 60,
  "criteria": {
    "must_have_skills": true,
    "relevant_experience": true,
    "education_alignment": true,
    "location_availability": true
  },
  "meta": {
    "source": "recruit-ai-frontend",
    "ts": "2026-02-22T00:00:00.000Z"
  }
}
```

## Expected Webhook Response

```json
{
  "score": 78,
  "recommendation": "INTERVIEW",
  "summary": "string",
  "strengths": ["string"],
  "gaps": ["string"],
  "interview_questions": ["string"],
  "recommended_action": "string",
  "email_draft": "string",
  "calendar_payload": {}
}
```

`email_draft` and `calendar_payload` are optional.
