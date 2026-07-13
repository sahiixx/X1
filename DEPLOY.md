# NOWHERE.AI — Ship It: Deploy Runbook

This is the unification that was built: the **Replit-style Vite + TS + wouter + React Query frontend** (this `nowhere-ai/` project) wired to the **real Fixfiz FastAPI + MongoDB backend** (`../Fixfiz/backend`). Every formerly-fake feature now hits a live endpoint.

> **Status (2026-07-13):** full stack verified end-to-end on this machine.
> Frontend production build served at `http://localhost:3000`, backend at `http://localhost:8001`, Mongo in WSL docker on `:27017`. All 8 wired backend calls return `success: true`; SPA serves `200`.
>
> **I (Claude) cannot press deploy** — I have no cloud credentials and must not be given yours. This runbook takes you to *one command + your keys*.

---

## What ships where

| Piece | Source | Host (recommended) | Notes |
|---|---|---|---|
| Frontend (static SPA) | `nowhere-ai/dist/` after `npm run build` | **Cloudflare Pages** (or Vercel / Netlify) | Pure static. Build cmd `npm run build`, output dir `dist`. No server runtime. |
| Backend (FastAPI) | `Fixfiz/backend/` (+ its `Dockerfile`) | **Render** (Docker web service) or **Railway** / **Fly.io** | Container already production-ready: python:3.11-slim, 4 uvicorn workers, `/api/health` healthcheck, port 8001. |
| Database | MongoDB | **MongoDB Atlas** free M0 | Set `MONGO_URL` + `DB_NAME`. Local dev used WSL docker; Atlas is the prod equivalent. |

The frontend and backend are **independent** — deploy each, then point the frontend at the backend URL.

---

## 1. Backend → Render (Docker)

The repo already has a production multi-stage `Fixfiz/backend/Dockerfile`. It installs `emergentintegrations` from the private cloudfront index (`--extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/`), runs `uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4`, and health-checks `/api/health`.

1. Push `Fixfiz/` to a GitHub repo (it already has a `LICENSE`/`README`; create a private repo `sahiixx/nowhere-ai`).
2. Render → **New → Web Service → Deploy from a Dockerfile repo**. Root = `backend/`.
3. Render auto-detects the Dockerfile. Set the **port to 8001** (or set `PORT=8001`; the Dockerfile hardcodes 8001 — keep it).
4. Add the environment variables from the secrets checklist below.
5. Deploy. Render's health check will hit `/api/health` → `{"status":"healthy","database":"connected"}`.

**Railway / Fly.io alternative:** same Dockerfile works. On Fly, `fly launch --dockerfile Fixfiz/backend/Dockerfile` then `fly deploy`; expose port 8001. On Railway, connect the repo, set root to `backend/`, Railway detects Dockerfile.

> ⚠️ **`emergentintegrations` is a private package.** It installs fine on Linux containers (Render/Railway/Fly) because the Dockerfile's `--extra-index-url` is public. Do **not** try to deploy the backend to a host that can't reach `d33sy5i8bnduwe.cloudfront.net` (it's HTTP-200 public; fine).

---

## 2. Database → MongoDB Atlas (free M0)

1. MongoDB Atlas → free shared cluster (M0) → create a DB user.
2. "Connect → Drivers" → copy the connection string: `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/...`
3. Put it in the backend env as `MONGO_URL`. Set `DB_NAME=nowhere_digital`.
4. Atlas Network Access: allow the backend host's egress IP (Render publishes egress IPs), or `0.0.0.0/0` for the free tier if you don't want to pin it.

---

## 3. Frontend → Cloudflare Pages (static)

1. Cloudflare Pages → **Connect to Git** (same repo).
2. **Build command:** `npm run build`
3. **Build output directory:** `dist`
4. **Environment variable (build-time):** `VITE_API_URL = https://<your-backend>.onrender.com`  ← the Render backend URL from step 1.
   - `VITE_API_URL` is read at **build time** and baked into the bundle. Set it *before* the first build, and rebuild if the backend URL changes.
5. Deploy. You get `https://<project>.pages.dev`.

> The SPA uses history routing (wouter) with a static `dist/index.html` — the local `serve-dist.cjs` here handles the SPA fallback; Cloudflare/Vercel/Netlify all do SPA fallback by default for a single `index.html`.

---

## 4. CORS — the one gotcha that will break production

`Fixfiz/backend/config.py:40`:
```python
cors_origins: List[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000,...").split(",")
```
The default is split-on-comma, but because the field is typed `List[str]`, **pydantic-settings parses the env var as JSON when you set it.** A comma string like `https://a,https://b` is **not valid JSON** → the backend crashes on boot.

**Set `CORS_ORIGINS` as a JSON array string**, including your Pages URL **and** localhost for local dev:
```
CORS_ORIGINS=["https://nowhere-ai.pages.dev","http://localhost:3000"]
```
Render's env UI accepts this verbatim (it's a string value that happens to contain JSON). Do **not** drop the quotes around the URLs inside the brackets.

If you skip `CORS_ORIGINS` entirely, the backend boots with the default list (which includes localhost:3000 and two Emergent preview hosts — **not** your Pages URL), so the deployed frontend will be blocked by CORS. You must set it.

---

## 5. Backend environment / secrets checklist

Set these on the backend host (Render/Railway/Fly env UI). **Real keys only — never commit them.**

| Variable | Required? | Purpose |
|---|---|---|
| `MONGO_URL` | ✅ | Atlas connection string |
| `DB_NAME` | ✅ | `nowhere_digital` |
| `CORS_ORIGINS` | ✅ | JSON array incl. your Pages URL + localhost (see §4) |
| `ENVIRONMENT` | ✅ | `production` |
| `JWT_SECRET` | ✅ | Set a strong random value (default is a placeholder) |
| `EMERGENT_LLM_KEY` | ⚠️ for real AI | The default `sk-emergent-...` is a demo key — `/api/ai/analyze-problem` returns fallback text without a real key. Set a real one for genuine LLM analysis. |
| `OPENAI_API_KEY` | optional | If you switch `AI_PROVIDER=openai` |
| `STRIPE_API_KEY` | for payments | Stripe secret key |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_VERIFY_SERVICE` / `TWILIO_PHONE_NUMBER` | for WhatsApp/SMS | Twilio creds |
| `SENDGRID_API_KEY` | for email | SendGrid key |
| `PLUGINS_DIRECTORY` | optional | Defaults to `/app/plugins` (Docker path) — fine in the container. Only override if running outside Docker. |

> The backend degrades gracefully without AI/payment/SMS keys: endpoints return `200` with fallback text/marketing copy rather than 500. So you can ship a "marketing + contact + insights + agents + templates" surface first, then add real AI/payments keys to light up genuine analysis.

---

## 6. What's wired to the real backend (no more fake `setTimeout` demos)

| Page | Was (fake) | Now (real) |
|---|---|---|
| `/ai-solver` | threw "not wired" | `POST /api/ai/analyze-problem` → formatted analysis report (ROI, timeline, priority, strategy) |
| `/agents` | hardcoded 4-agent array | `GET /api/agents/status` → real 5-agent roster (names, capabilities, live metrics). The 1s task-increment is a local "live activity" sim; play/pause/reset stay local (no backend control endpoint). |
| `/contact` | threw "not wired" | `POST /api/contact` → creates a real contact record (returns an id). Service field mapped to the backend enum; `phone` sent as `""`. |
| `/insights` | threw "not wired" | `POST /api/insights/analyze-performance` + `POST /api/insights/detect-anomalies` → real insight/anomaly log lines. |
| `/templates` | threw "not wired" | `POST /api/templates/deploy` → real deployment config generated per industry (6 templates map to `ecommerce/saas/local_service/healthcare/fintech/real_estate`). |
| `/plugins` | threw "not wired" | **Local only.** No backend plugin-install endpoint exists (`/api/plugins/list` returns "Plugin not found"); the marketplace is a roadmap feature. `installPlugin` resolves client-side; installation is tracked in component state. |
| `/` `/platform` `/services` `/about` | static marketing | unchanged (intentionally static) |

---

## 7. Local full-stack (this machine, already running)

```powershell
# Backend (WSL) — already detached, pid 1438 in WSL, log /tmp/fixfiz-backend.log
wsl -d Ubuntu-24.04 -- bash -c 'curl -s http://localhost:8001/api/health'

# Mongo (WSL docker) — restart policy added
wsl -d Ubuntu-24.04 -- bash -c 'docker start fixfiz-mongo'

# Frontend — production build served on :3000 (this project)
cd C:\Users\sahii\Projects\nowhere-ai
npm run build
Start-Process node.exe -ArgumentList "serve-dist.cjs" -WorkingDirectory $PWD -WindowStyle Hidden
# → http://localhost:3000
```

To run the Vite dev server instead (hot reload), use port 3000 (CORS only allows :3000, not 5173):
```powershell
npx vite --port 3000 --host
```

---

## 8. Open the deployed site

After steps 1–4:
- Frontend: `https://<project>.pages.dev`
- Backend: `https://<backend>.onrender.com/api/health` → `healthy`
- Swagger: `https://<backend>.onrender.com/docs`

Verify end-to-end on the deployed site: submit the contact form (you should get `MESSAGE_TRANSMITTED`), run the AI solver on a real estate prompt, hit ANALYZE PERFORMANCE in Insights, DEPLOY a template — each now round-trips to the live backend.

---

## Honest gaps before this is "a real product"

These are the things the deploy *will not* fix — they're product/seed-stage decisions, not infra:

1. **AI solver returns fallback text** without a real `EMERGENT_LLM_KEY`/`OPENAI_API_KEY`. The wired flow works; the *content* is placeholder until you set a key. Highest-leverage secret to add.
2. **No auth on the frontend.** The backend has JWT/RBAC code, but the SPA has no login screen and all `/api/*` endpoints are currently public. Anyone who finds the backend URL can call them. Add a login flow + enforce before going public, or gate the backend behind rate limiting (the repo has a `rate_limiter.py`).
3. **Agent control is local-only.** The Agents dashboard can't actually start/stop backend agents (no control endpoint). It's a real-time *monitor*, not a control surface.
4. **Plugin marketplace is fictional.** The 12 plugins are static marketing; install does nothing real. Either remove the page or build the marketplace.
5. **No analytics attribution.** `/api/analytics/summary` returns near-zero until real traffic hits the contact/chat endpoints — that's correct, not a bug.
6. **The bundle is 502 kB.** Vite warns about the >500 kB chunk. Add route-level `lazy()` imports (wouter supports it) before caring about Lighthouse scores — not a blocker to ship.

Ship the marketing + contact + solver + agents + templates + insights surface first (steps 1–4 + a real LLM key), then close the auth + agent-control + marketplace gaps as the next sprint.