# Calmara Backend — Agent Instructions

## What this project is
FastAPI backend for Calmara — an AI-powered healthcare preparation platform
for autistic individuals and their caregivers. This backend replaces a Google AI 
Studio (Gemini) frontend-only app. The frontend is React 19 + TypeScript + Vite 
and lives in the frontend\ sibling folder.

## Tech stack (do not deviate)
- Python 3.11
- FastAPI + Uvicorn (async)
- SQLAlchemy (async) + aiosqlite for dev
- Alembic for migrations
- Groq API — model: llama-3.3-70b-versatile — for ALL text/AI generation
- Hugging Face Inference API — FLUX.1-schnell — for image generation (free)
- JWT auth via python-jose + passlib[bcrypt]
- Pydantic v2 + pydantic-settings

## Non-negotiables
- All Groq calls go through app/services/groq_service.py ONLY
- All image calls go through app/services/image_service.py ONLY
- All routes return typed Pydantic response models — never raw dicts
- All endpoints use async/await
- API keys always come from Settings() — never hardcoded
- Every route except /health and /auth/* requires JWT via get_current_user dependency

## Original frontend AI functions to replicate (from geminiService.ts)
1.  generateStorySteps       → POST /ai/social-story
2.  generateImage            → handled inside /ai/social-story and /ai/simplify
3.  generateEnvironmentalPrep → POST /ai/env-prep
4.  translateBehavior        → POST /ai/translate
5.  simplifyJargon           → POST /ai/simplify
6.  generateEmergencyProtocol → POST /ai/emergency-protocol
7.  generateProviderGuide    → POST /ai/provider-guide
8.  findResources            → POST /ai/resources
9.  analyzeSensoryPatterns   → POST /ai/analyze-logs
10. simplifyInsuranceJargon  → POST /ai/insurance-simplify
11. generateAppealLetter     → POST /ai/appeal-letter
12. findPeerMatches          → POST /ai/peer-matches
13. generateAdvocacyLetter   → POST /ai/advocacy-letter

## Data models (from original types.ts)
- UserInput: name, age, communicationStyle, sensorySensitivities (list), 
  anxietyTriggers (list), doctorName, appointmentType
- MedicalProfile: communication, sensory, calming, accommodations
- SensoryLogEntry: timestamp, environment, stressLevel (1-10), triggers (list)
- InsuranceItem: serviceName, dateSubmitted, type, notes
- ResourceQuery: need, age, location
- PeerProfileQuery: childAge, location, challenges (list)
- AdvocacyLetterQuery: letterType, details

## Project folder structure
backend\
├── main.py
├── AGENTS.md
├── .env.example
├── requirements.txt
├── alembic.ini
├── alembic\
├── app\
│   ├── core\         config.py, database.py, security.py
│   ├── models\       user.py, profile.py, sensory_log.py, insurance.py
│   ├── schemas\      auth.py, profile.py, logs.py, ai.py
│   ├── routers\      auth.py, profile.py, logs.py, ai.py
│   └── services\     groq_service.py, image_service.py
└── tests\

## Test rule
Every prompt ends with pytest passing green. Fix all failures before stopping.

## Naming
The app is called Calmara (not Calmara 3.0). Version is 1.0.
