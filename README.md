# Starks AI MVP

Premium single-page Next.js 14 MVP for **Starks AI** with:

- Futuristic HUD visual system (glass panels, scan lines, particles, holographic styling)
- Animated hero scene using `@react-three/fiber` + `@react-three/drei`
- Scroll-driven motion with `framer-motion`
- shadcn-style UI components + `lucide-react` icons
- Real Gemini-backed interactive motion-spec demo via server route

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Framer Motion
- shadcn/ui-style component primitives
- Three.js (`@react-three/fiber`, `@react-three/drei`) for hero HUD scene only
- Gemini API (server-side route, no client key exposure)

## 1) Install

```bash
npm install
```

## 2) Environment

Copy `.env.example` to `.env.local` and set:

```bash
GEMINI_API_KEY=your_real_key
```

## 3) Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## 4) Production build check

```bash
npm run lint
npm run build
```

## Preview video setup

Hero modal expects:

- `public/preview/demo-loop.mp4`

Recommended capture workflow:

1. Record ~10 seconds in Chrome screen recorder or OBS.
2. Capture the demo panel generating JSON + export tabs.
3. Export MP4 (`H.264`) at `1080p` or `720p`.
4. Save file as `public/preview/demo-loop.mp4`.

If the file is missing, the modal shows a graceful fallback message.

## Optional UI sound setup

Sound toggle defaults to off and is persisted in localStorage.

- Expected file: `public/sfx/bleep.mp3`
- Used for subtle bleep on primary actions (request access, try live demo, generate)
- Missing sound file fails silently and never blocks UI

## Gemini route details

- Endpoint: `POST /api/gemini`
- Input: `{ styleText, actionText, engine, rigType, toggles }`
- Validation: shared `zod` schema (`lib/motion-schema.ts`)
- Safety:
  - Server-side key usage only (`process.env.GEMINI_API_KEY`)
  - Max input lengths enforced by schema
  - Best-effort in-memory rate limit
  - Strict JSON parsing + one retry if invalid JSON

## Deploy to Vercel

1. Push repo to GitHub/GitLab/Bitbucket.
2. Import project in Vercel.
3. In Vercel Project Settings -> Environment Variables, add:
   - `GEMINI_API_KEY`
4. Deploy.

Vercel defaults:

- Build Command: `next build`
- Output Directory: `.next`

## Project structure

```text
app/
  api/gemini/route.ts
  layout.tsx
  page.tsx
components/
  SiteHeader.tsx
  HeroHUD.tsx
  ParticleField.tsx
  AppMockWindow.tsx
  Metrics.tsx
  FeaturesGrid.tsx
  HowItWorks.tsx
  DemoPanel.tsx
  Pricing.tsx
  FAQ.tsx
  Footer.tsx
  ui/*
lib/
  gemini-client.ts
  motion-schema.ts
  utils.ts
styles/
  globals.css
```
