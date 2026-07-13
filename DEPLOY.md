# NOWHERE.AI — Deploy Runbook

The production stack: a **Vite + TS + wouter + React Query frontend** (this `nowhere-ai/` repo) wired to the **real Fixfiz FastAPI + MongoDB backend** (`Fixfiz/backend`). Every feature hits a live endpoint — AI solver, 5-agent control, the cloud agency engine, auth, payments, leads→WhatsApp, insights, templates.

> **Status (2026-07-13):** full stack verified end-to-end on this machine.
> Frontend build served at `http://localhost:3000`, backend at `http://localhost:8001`, Mongo in WSL docker on `:27017`. The cloud agency engine runs real LLM agents on **Ollama Cloud `glm-5.2`** (34 cloud models available).
>
> **Canonical repos (pushed 2026-07-13):**
> - Frontend → `github.com/sahiixx/X1`
> - Backend → `github.com/sahiixx/Fixfiz`
>
> **I (Claude) cannot press deploy** — I have no cloud credentials and must not be given yours. This runbook takes you to *one command + your keys*.

---

## ⚠️ Read this first: the deploy gates

Two things you must handle before this is "live on the internet":

1. **Dependabot: 122 vulnerabilities on `sahiixx/Fixfiz` (2 critical, 54 high)** as of the last push. These are pre-existing dependencies (largely the legacy CRA `frontend/` + backend Python deps), not code I wrote this session. Run `gh api repos/sahiixx/Fixfiz/dependabot/alerts --jq '.[] | select(.state=="open") | .security_vulnerability.severity'` or check the GitHub Security tab. The criticals should be reviewed before accepting real customer payments. The nowhere-ai frontend (this repo) has a small, current dep tree and no reported criticals.
2. **Secrets.** The backend degrades gracefully without keys (returns fallback text / test-mode), so you can ship the marketing + agents + contact surface first. But real AI, real Stripe charges, real WhatsApp, and the cloud agency engine all need keys — see §5.

---

## What ships where

| Piece | Source | Host (recommended) | Notes |
|---|---|---|---|
| Frontend (static SPA) | `nowhere-ai/dist/` after `npm run build` | **Cloudflare Pages** (or Vercel / Netlify) | Pure static. Build cmd `npm run build`, output dir `dist`. SPA fallback ships via `public/_redirects`. |
| Backend (FastAPI) | `Fixfiz/backend/` (+ its `Dockerfile`) | **Render** (Docker web service) or **Railway** / **Fly.io** | Container is production-ready: python:3.11-slim, 4 uvicorn workers, `/api/health` healthcheck, port 8001. |
| Database | MongoDB | **MongoDB Atlas** free M0 | Set `MONGO_URL` + `DB_NAME`. |
| Agency engine (LLM) | Ollama Cloud | No host — called from the backend | Set `AGENCY_OLLAMA_*` in the backend host env (see §5). |

The frontend and backend are **independent** — deploy each, then point the frontend at the backend URL.

---

## 1. Backend → Render (Docker)

`Fixfiz/backend/Dockerfile` is a multi-stage production image: installs `emergentintegrations` from the private cloudfront index (`--extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/`), runs `uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4`, health-checks `/api/health`, runs as a non-root user.

1. Render → **New → Web Service → Deploy from a Dockerfile repo** → connect `sahiixx/Fixfiz`. Root = `backend/`.
2. Render auto-detects the Dockerfile. Port **8001** (the Dockerfile hardcodes it).
3. Add the environment variables from §5. A full template lives at `backend/.env.example` — copy the var names from there.
4. Deploy. Health check hits `/api/health` → `{"status":"healthy","database":"connected"}`.

**Railway / Fly.io alternative:** same Dockerfile. On Fly, `fly launch --dockerfile Fixfiz/backend/Dockerfile` then `fly deploy`; expose 8001. On Railway, connect the repo, set root to `backend/`.

> ⚠️ **`emergentintegrations` is a private package** but installs fine on Linux containers (the `--extra-index-url` is HTTP-200 public). Don't deploy the backend to a host that can't reach `d33sy5i8bnduwe.cloudfront.net`.

---

## 2. Database → MongoDB Atlas (free M0)

1. Atlas → free shared cluster (M0) → create a DB user.
2. "Connect → Drivers" → copy `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/...`.
3. Set it as `MONGO_URL` on the backend host. Set `DB_NAME=nowhere_digital`.
4. Atlas Network Access: allow the backend host's egress IP (Render publishes egress IPs), or `0.0.0.0/0` for the free tier.

---

## 3. Frontend → Cloudflare Pages (static)

1. Cloudflare Pages → **Connect to Git** → `sahiixx/X1`.
2. **Build command:** `npm run build`
3. **Build output directory:** `dist`
4. **Environment variable (build-time):** `VITE_API_URL = https://<your-backend>.onrender.com` ← the Render backend URL from §1.
   - `VITE_API_URL` is read at **build time** and baked into the bundle. Set it *before* the first build, and rebuild if the backend URL changes. (Template at `.env.example`.)
5. Deploy. You get `https://<project>.pages.dev`.

> **SPA routing is handled.** `public/_redirects` (with `/* /index.html 200`) is copied into `dist/` by Vite, so Cloudflare Pages serves `index.html` for every client-side route. Vercel (`vercel.json` rewrites) and Netlify (`_redirects`) work the same way. No extra config needed on Pages.

---

## 4. CORS — the one gotcha that will break production

`Fixfiz/backend/config.py`:
```python
cors_origins: List[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000,...").split(",")
```
The field is typed `List[str]`, so **pydantic-settings parses `CORS_ORIGINS` as JSON when you set it.** A comma string like `https://a,https://b` is **not valid JSON** → the backend crashes on boot.

**Set `CORS_ORIGINS` as a JSON array string**, including your Pages URL **and** localhost for local dev:
```
CORS_ORIGINS=["https://nowhere-ai.pages.dev","http://localhost:3000"]
```
Keep the inner quotes around the URLs. If you skip `CORS_ORIGINS` entirely, the backend boots with the default list (which does NOT include your Pages URL) → the deployed frontend is blocked by CORS.

---

## 5. Backend environment / secrets checklist

Set these on the backend host (Render/Railway/Fly env UI). **Real keys only — never commit them.** Full template with notes: `Fixfiz/backend/.env.example`.

| Variable | Required? | Purpose |
|---|---|---|
| `MONGO_URL` | ✅ | Atlas connection string |
| `DB_NAME` | ✅ | `nowhere_digital` |
| `CORS_ORIGINS` | ✅ | JSON array incl. your Pages URL + localhost (see §4) |
| `ENVIRONMENT` | ✅ | `production` |
| `JWT_SECRET` | ✅ | Strong random value — signs JWTs. `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `AGENCY_OLLAMA_URL` | ✅ for cloud agents | `https://ollama.com` (Ollama Cloud) |
| `AGENCY_OLLAMA_API_KEY` | ✅ for cloud agents | Your Ollama Cloud key |
| `AGENCY_OLLAMA_MODEL` | optional | Default `glm-5.2`; any of the 34 cloud models |
| `EMERGENT_LLM_KEY` | ⚠️ for real AI solver | Default is a demo key — `/api/ai/analyze-problem` returns fallback text without a real one |
| `STRIPE_API_KEY` + `STRIPE_WEBHOOK_SECRET` | for payments | Stripe secret + webhook secret (the `/api/integrations/payments/webhook` endpoint exists) |
| `TWILIO_ACCOUNT_SID` / `AUTH_TOKEN` / `VERIFY_SERVICE` / `PHONE_NUMBER` / `WHATSAPP_NUMBER` | for WhatsApp/SMS | `/api/leads` dispatches WhatsApp follow-up with these |
| `SENDGRID_API_KEY` | for email | Contact/lead email notifications |

> **Backend degrades gracefully** without AI/payment/SMS keys: endpoints return `200` with fallback text / test-mode rather than `500`. Ship the marketing + agents + contact + cloud-agency surface first, then add real keys to light up genuine analysis, charges, and WhatsApp.

### ⚠️ `.env` vs process env — the agency-engine gotcha

`config.py` uses pydantic-settings 2.14 with **`extra="forbid"`**. This forbids *extra keys in the `.env` file* — so the `AGENCY_OLLAMA_*` vars **must NOT go in `backend/.env`** (it crashes on boot AND the pydantic error trace echoes the API key value into the log). Locally they live in `backend/.agency.env` (gitignored, read directly by `services/agency_engine.py` — never enter `os.environ`). Template: `backend/.agency.env.example`.

**On a PaaS host this is not a problem:** set `AGENCY_OLLAMA_*` in the host's env UI as normal process env vars. `extra="forbid"` only rejects extra `.env` *file* keys, not unknown process env vars — verified 2026-07-13 (`config.Settings` boots fine with `AGENCY_OLLAMA_*` in process env). No `config.py` change needed.

---

## 6. What's wired to the real backend (no fake `setTimeout` demos)

| Page / feature | Backend call | Status |
|---|---|---|
| `/ai-solver` | `POST /api/ai/analyze-problem` | Real analysis (ROI/timeline/priority/strategy). Fallback text without an LLM key. |
| `/agents` — control | `POST /api/agents/{id}/pause\|resume\|reset` | **Real control** of the 5 backend agents (uses the UUID `agentId` from `/api/agents/status`). |
| `/agents` — cloud console | `POST /api/agency/run/{agent_key}` | **Real LLM runs** on Ollama Cloud `glm-5.2`; 12 curated personas; model picker exposes all 34 cloud models. |
| `/contact` + `/leads` | `POST /api/leads` | Stores lead + WhatsApp follow-up (test-mode without Twilio creds). |
| `/insights` | `POST /api/insights/analyze-performance` + `/detect-anomalies` | Real insight/anomaly output. |
| `/templates` | `POST /api/templates/deploy` | Real per-industry deployment config (6 templates). |
| `/login` `/signup` `/dashboard` | `POST /api/auth/register`, `POST /api/security/auth/login` | **Real JWT auth.** `ProtectedRoute` gates `/dashboard`; token stored under `nowhere.token`. |
| `/pricing` | `POST /api/integrations/payments/create-session` | Real Stripe Checkout (returns `cs_test_…` URL with a test key). Route guarded by `Depends(get_current_user)`. |
| `/plugins` | — | **Local only** — no backend plugin endpoint (`/api/plugins/list` errors). Marketplace is roadmap. |
| `/` `/platform` `/services` `/about` | static marketing | unchanged (intentionally static) |

Agency-engine endpoints (all `StandardResponse`-wrapped, public): `GET /api/agency/health`, `GET /api/agency/roster`, `POST /api/agency/run/{agent_key}` body `{"task","model"?}`.

---

## 7. Local full-stack (this machine)

```powershell
# Backend (WSL) — needs PLUGINS_DIRECTORY or it crashes at import
wsl -d Ubuntu-24.04 -- bash -c 'cd /mnt/c/Users/sahii/Projects/Fixfiz/backend && export PLUGINS_DIRECTORY=$PWD/plugins && mkdir -p $PLUGINS_DIRECTORY && ~/fixfiz-venv/bin/python -m uvicorn server:app --host 0.0.0.0 --port 8001'
# Cloud creds live in backend/.agency.env (gitignored) — never put them in .env.

# Mongo (WSL docker)
wsl -d Ubuntu-24.04 -- bash -c 'docker start fixfiz-mongo'

# Frontend — production build served on :3000
cd C:\Users\sahii\Projects\nowhere-ai
npm run build
Start-Process node.exe -ArgumentList "serve-dist.cjs" -WorkingDirectory $PWD -WindowStyle Hidden
# → http://localhost:3000
```

Dev server with hot reload (must be port 3000 — CORS only allows :3000, not 5173):
```powershell
npx vite --port 3000 --host
```

Backend restart runbook: `nowhere-ai/_wsl_restart_backend.sh`.

---

## 8. Verify the deployed site

After §1–§3 + secrets:
- Frontend: `https://<project>.pages.dev`
- Backend: `https://<backend>.onrender.com/api/health` → `healthy`
- Swagger: `https://<backend>.onrender.com/docs`

End-to-end checks on the deployed site: sign up → log in → `/dashboard` renders; submit the contact/lead form; run the AI solver on a real-estate prompt; on `/agents` pick a persona → "Run on cloud" → real `glm-5.2` response in the console; pause/resume a backend agent; on `/pricing` subscribe → Stripe Checkout redirect.

---

## Honest gaps before this is "a real product"

1. **Dependabot vulnerabilities (2 critical, 54 high on Fixfiz).** Review before accepting real payments. See ⚠️ at top.
2. **Plugin marketplace is fictional.** The 12 plugins are static; install does nothing. Remove the page or build the marketplace.
3. **Agents are in-memory.** Agent state/metrics reset on backend restart. Real persistence is a later backend task.
4. **No analytics attribution yet.** `/api/analytics/summary` returns near-zero until real traffic hits the contact/chat endpoints — correct, not a bug.

Items that were gaps earlier and are now **shipped**: frontend auth (login/signup/ProtectedRoute + backend `Depends(get_current_user)`), real agent control (pause/resume/reset hit the backend), the cloud agency engine (real LLM agents), the bundle size (vendor code-split — largest chunk 229 KB, no warnings).