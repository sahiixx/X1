# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

**NOWHERE.ai** — the user's first startup. A Dubai AI-marketing agency product. This repo is the **frontend only**: a Vite + TypeScript + React 18 SPA (wouter routing, TanStack Query, framer-motion, Tailwind v4, Radix tooltip, sonner toasts). Git remote: `github.com/sahiixx/X1`.

The **backend is a separate repo**: `C:\Users\sahii\Projects\Fixfiz\backend` (FastAPI + MongoDB, git remote `sahiixx/Fixfiz`). It is not in this tree — do not look for server code here. The two are coupled by URL only. See `DEPLOY.md` for the full stack runbook (backend on `:8001`, Mongo in WSL docker on `:27017`, the cloud agency engine on Ollama Cloud).

## Commands

```bash
npm run dev        # Vite dev server on http://localhost:3000 (NOT 5173 — see below)
npm run build      # vite build → dist/
npm run preview    # vite preview of the built dist/
npm run typecheck  # tsc -p tsconfig.json --noEmit  (the only "lint"/"test" — there is no test suite)
```

To serve the production build locally (with SPA history fallback), use `node serve-dist.cjs` (dependency-free; serves `dist/` on `:3000`).

## Big-picture architecture

### API layer (`src/lib/api.ts`)
Every backend call goes through one `http<T>(path, init)` helper that POSTs to `${VITE_API_URL}${path}`, throws on non-2xx **or** `{success:false}`, and unwraps the backend's `StandardResponse{data}` envelope. Function names/signatures here are the stable contract — pages import them by name. Two mappers live here too: `mapService` (free-text → backend service enum) and `inferIndustry` (keyword → backend industry key, defaulting to `real_estate` per the Dubai context).

### Two distinct agent layers — do not confuse them
- **`/api/agents/*`** — the in-process agent **state machine**: `pause` / `resume` / `reset` / `status` / metrics. `fetchAgents()` shapes `/api/agents/status` for the dashboard. Pure control, no LLM.
- **`/api/agency/*`** — the **cloud LLM agency engine**: `/agency/health`, `/agency/roster` (12 curated personas), `/agency/run/{agent_key}` runs a real LLM call (Ollama Cloud, `glm-5.2` default). `agencyRun()` uses a raw `fetch` (not `http()`) so it can surface the backend's honest error detail (e.g. "agent engine offline") instead of throwing a generic message.

### Routing (`src/App.tsx`)
wouter `<Switch>` with framer-motion `AnimatePresence` page transitions wrapping every route (`PageTransition`). `/dashboard` is wrapped in `ProtectedRoute` (from `lib/auth.tsx`). `wouter` `base` is set from `import.meta.env.BASE_URL` so it works under subpath deploys.

### Auth (`src/lib/auth.tsx`)
**Client-side only for now.** The backend mints a JWT on `/api/auth/register` + `/api/security/auth/login`; this code stores it in `localStorage` under `nowhere.token` (+ `nowhere.user`). `api.ts`'s `authHeader()` attaches `Bearer` to every request. **The backend does not yet enforce the JWT on routes** (DEPLOY plan Phase C-13) — `ProtectedRoute` gates the UI only. Keep this honest; don't pretend server-side auth exists.

### Theme (`src/index.css`)
Source-driven Tailwind v4: `@import "tailwindcss"` + `@theme` tokens (HSL CSS vars) + `@custom-variant dark`. **Dark-first** — the app is dark everywhere; there is no `.dark` class toggle. Fonts: Inter (sans), Orbitron (display), Share Tech Mono (mono) via Google Fonts `@import` at the top. `Card.tsx` is the shared surface primitive (replaces an older `TerminalWindow`).

## Non-obvious gotchas

- **Dev server is `:3000`, not Vite's `5173`.** The FastAPI backend CORS allow-list includes `http://localhost:3000` but not 5173 — `vite.config.ts` pins it. Don't "fix" it back to 5173.
- **`VITE_API_URL` is build-time, baked into the bundle.** Set it in `.env` *before* `npm run build` and rebuild whenever the backend URL changes. Default `http://localhost:8001` (Windows→WSL localhost forward works). `.env` is gitignored; `.env.example` is the template.
- **Path alias `@/*` → `src/*`** (configured in both `tsconfig.json` and `vite.config.ts`). Use `@/...` imports.
- **`installPlugin()` is a deliberate no-op stub** — no backend plugin-install endpoint exists yet; the Plugins page tracks installs client-side. When a real endpoint lands, POST to it and throw on failure.
- **Honest degradation, not fakes.** The backend returns fallback strings / `test_mode` without keys; AI surfaces a "demo output" state. Do not reintroduce `setTimeout`-based fake loading or pretend features that need secrets are live.
- **Pushing to GitHub from this box:** WSL git has no credential helper and hangs on the HTTPS prompt. Push via **Windows git** from PowerShell (`git -C C:\Users\sahii\Projects\nowhere-ai push origin main`), which uses Git Credential Manager. See DEPLOY.md.
- **SPA fallback** for Cloudflare Pages is `public/_redirects`; `serve-dist.cjs` does the same fallback locally so wouter routes resolve on refresh.

## Scratch/runbook files at the repo root (active, not stale)

`_build_aitmpl_pack.py` builds the `aitmpl-pack/` artifact (packages the 12 agency personas into `claude-code-templates` agent format — see `aitmpl-pack/README.md`). `_restart_backend.sh` / `_wsl_restart_backend.sh` restart the Fixfiz backend in WSL. These are live tooling, not dated artifacts to ignore.

## Deployment

`DEPLOY.md` is the authoritative runbook: frontend → Cloudflare Pages (`dist/`, build cmd `npm run build`), backend → Render Docker web service (port 8001, healthcheck `/api/health`), DB → MongoDB Atlas, agency engine → Ollama Cloud via backend env. The frontend and backend deploy independently — point the frontend at the backend URL via `VITE_API_URL`. Real AI / Stripe charges / WhatsApp sends require the user's live keys in the backend env; Claude must not be given those keys or paste them into chat.