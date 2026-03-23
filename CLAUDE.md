# CareerLaunch — AI Career Platform

## Stack
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Firebase Auth (email + Google)
- Vercel deployment (api/ folder = serverless functions)

## Design System — Stitch "Digital Architect"
- ALL colors via CSS vars: `var(--primary)`, `var(--surface-container-low)` etc.
- NO hardcoded hex colors in components (except portal brand colors)
- Buttons: ALWAYS pill-shaped `borderRadius: 999`
- Cards: `card-stitch` class or inline `border-radius: 1.5rem` + elevation shadow
- No 1px borders — sections defined by background color shifts
- Fonts: Manrope (headlines) + Inter (body) via `var(--font-headline)` / `var(--font-body)`
- Icons: Material Symbols Outlined only

## Theme System
- 10 color palettes in `src/lib/themes.ts`
- Applied via CSS vars on `:root` — all components auto-react
- Key vars: `--primary`, `--primary-container`, `--secondary`, `--secondary-container`
- `--hero-from`, `--hero-mid`, `--hero-to` for gradients
- `--secondary-fixed` for mint accent on dark backgrounds

## File Structure
```
src/
├── components/
│   ├── CareerLaunchLogo.tsx   — SVG logo, theme-reactive
│   ├── AuthModal.tsx          — sign in / sign up modal
│   ├── advisor/               — ChatBubble, ChatWindow
│   ├── layout/                — Sidebar, Topbar, DashboardLayout
│   └── theme/                 — ThemeSwitcher
├── hooks/
│   ├── useAuth.tsx            — Firebase auth state
│   ├── useCity.tsx            — 18 Indian cities, localStorage
│   └── useTheme.tsx           — color palette context
├── lib/
│   ├── themes.ts              — 10 palette definitions + applyTheme()
│   ├── cities.ts              — Indian cities list
│   └── portals.ts             — Naukri/LinkedIn/Indeed deep-links
├── pages/                     — one file per route
└── services/
    ├── gemini.ts              — calls /api/ai proxy → Gemini
    ├── groq.ts                — calls /api/ai proxy → Groq
    ├── jsearch.ts             — calls /api/ai proxy → RapidAPI
    └── ai.ts                  — re-exports callAI, safeParseJSON
api/
└── ai.ts                      — Vercel serverless, reads server-only env vars
```

## Routing (App.tsx)
Every page owns its own `<DashboardLayout>` — do NOT double-wrap in App.tsx.
Use `<Protected>` guard only.

## API Keys
- `GEMINI_API_KEY`, `GROQ_API_KEY`, `RAPIDAPI_KEY` — server-only (no VITE_ prefix)
- `VITE_FIREBASE_*` — client-safe, fine with VITE_ prefix
- All AI calls go through `/api/ai` proxy, never directly from browser

## Gemini Models (current, 2026)
Valid: `gemini-2.0-flash`, `gemini-2.5-flash`
Deprecated (do NOT use): gemini-1.5-flash, gemini-1.5-flash-8b, gemini-1.5-pro

## AI Response Parsing
Always use `safeParseJSON<T>(raw, fallback)` from `src/services/gemini.ts`
Never use raw `JSON.parse()` on AI responses directly.

## India-specific conventions
- Salary always in LPA (Lakhs Per Annum) — e.g. ₹12L–₹18L
- Default city: Hyderabad (from useCity hook)
- Job portals: Naukri, LinkedIn, Indeed, Glassdoor, Internshala, Wellfound

## Branding
- App name: CareerLaunch
- Tagline: Architect Your Future
- Logo: `<CareerLaunchLogo variant="full|icon|wordmark" size={N} />`
