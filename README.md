# Safe Space

**Safe Space** is a calm, privacy-first mental wellbeing platform designed for young people who often feel unheard, judged, or overwhelmed. It combines private reflection, anonymous peer connection, guided learning, and supportive AI + therapist access in one human-centered space.

## Why this project

Many mental health tools feel clinical or hard to approach. Safe Space was built to reduce stigma and make support feel natural, gentle, and accessible—without forcing users to expose their identity.

## Core features

- **Reflect** – private journaling for thoughts, gratitude, and daily emotional check-ins.
- **Connect** – anonymous peer sharing around topics like anxiety, loneliness, academics, family, and self-esteem.
- **Wellness** – quick tools for emotional check-ins and simple self-regulation.
- **Learn** – mental health education, exercises, and self-care resources.
- **Stories** – relatable, interactive narratives based on lived experiences.
- **AI Mental Health Advisor** – non-diagnostic, supportive conversational guidance.
- **Therapist Experience** – verified professionals can log in, contribute content, and support users via privacy-preserving chat.

## Tech stack

- **Frontend:** React + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui + Radix UI
- **Backend / Auth / DB:** Supabase
- **State & data:** TanStack React Query

## Project structure (high level)

```text
src/
  pages/               # Main user + therapist pages
  components/          # Reusable UI + layout components
  hooks/               # Auth and utility hooks
  integrations/supabase/ # Supabase client/types
supabase/
  migrations/          # Database migrations
  functions/chat/      # Edge function(s)
```

## Getting started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL="your_supabase_url"
VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_anon_key"
VITE_SUPABASE_PROJECT_ID="your_supabase_project_id"
```

### 3) Run locally

```bash
npm run dev
```

App will start on Vite’s default local server (usually `http://localhost:5173`).

## Available scripts

- `npm run dev` – start development server
- `npm run build` – production build
- `npm run build:dev` – development-mode build
- `npm run preview` – preview production build locally
- `npm run lint` – run ESLint

## Impact statement

Safe Space is built around one principle: **emotional safety first**. Instead of optimizing for attention, it prioritizes anonymity, empathy, and trust—so users can reflect, connect, and seek support at their own pace.

## Future roadmap

- Better therapist onboarding and verification workflows
- Deeper moderation and safety tooling
- Expanded Learn content (workshops and guided programs)
- Improved personalization and accessibility
- Mobile experience optimization

---

If you’re reviewing this for a hackathon: Safe Space is not trying to replace therapy. It is designed to be a compassionate first step toward emotional support and professional help.
