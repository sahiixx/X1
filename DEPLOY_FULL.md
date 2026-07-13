# 🚀 NOWHERE.ai — Full-Stack Production Deploy

This is the **one-shot runbook** for shipping NOWHERE.ai to a public URL with a real backend. Every step is order-sensitive. **None of your keys are echoed here** — you paste them into the host UIs yourself.

After this runs you have:
- **Frontend** → `https://<project>.pages.dev` (Cloudflare Pages, free, auto-deploys from `sahiixx/X1` main)
- **Backend** → `https://<service>.onrender.com` (Render Docker web service, free tier — sleeps after 15 min idle)
- **DB** → MongoDB Atlas M0 (free, 512 MB)
- **Agency engine** → Ollama Cloud (`https://ollama.com`, 34 models, free tier)

## The 7-step plan

Run these in order. Each step has a verification check before moving on.

---

### Step 1 — Database: MongoDB Atlas (free M0)

1. Create a free Atlas account at https://www.mongodb.com/cloud/atlas
2. **Create a cluster** → free shared M0 → region nearest Render (Oregon by default)
3. **Create a database user** (Security → Database Access → Add New User). Note username + password — you'll paste them into `MONGO_URL`.
4. **Network Access** → Add IP → **0.0.0.0/0** (Render's egress IPs are dynamic, this is the free-tier fix; restrict to Render's published IPs when you go paid)
5. **Get the connection string** → Deployment → Connect → Drivers → copy. It looks like:
   ```
   mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<user>` and `<pass>` with the values from step 3.

✅ **Verify** (do this AFTER step 4 — backend needs the network open):
```bash
# From PowerShell, with the WSL Python venv active:
wsl -d Ubuntu-24.04 -- bash -c '~/fixfiz-venv/bin/python -c "from pymongo import MongoClient; c=MongoClient(\"mongodb+srv://USER:PASS@CLUSTER.mongodb.net/\"); print(c.server_info()[\"version\"])"'
```

---

### Step 2 — Agency engine: Ollama Cloud (free tier)

1. Sign up at https://ollama.com → Settings → API Keys → Create
2. Note the key (paste into Render as `AGENCY_OLLAMA_API_KEY`)
3. Test from this box:
   ```bash
   wsl -d Ubuntu-24.04 -- bash -c 'curl -sS -H "Authorization: Bearer YOUR_KEY" https://ollama.com/api/tags | head -c 400'
   ```
   Should print `{"models":[...]}`. If empty list, sign in once on the website to activate the free tier.

---

### Step 3 — Backend: Render (free Docker web service)

**Option A — Blueprint (recommended, infra-as-code):**
1. Render → New → **Blueprint** → connect `sahiixx/Fixfiz` repo
2. Render auto-detects `render.yaml` at the repo root
3. Click **Apply** — Render reads the file and creates the service
4. **Environment** tab → fill in the `sync: false` secret values:
   - `MONGO_URL` → the Atlas string from Step 1
   - `JWT_SECRET` → either keep Render's auto-generated value, OR paste your own (you generated one earlier — `wsl -d Ubuntu-24.04 -- cat /tmp/.jwt_secret` if still on disk; otherwise `python -c "import secrets; print(secrets.token_urlsafe(48))"`)
   - `AGENCY_OLLAMA_API_KEY` → your Ollama key
5. **Manual Deploy** → "Deploy latest commit" — watch logs

**Option B — Manual UI (if Blueprint fails):**
1. Render → New → Web Service → connect `sahiixx/Fixfiz` → Root = `backend/`
2. Environment = Docker, Port = 8001, Health Check Path = `/api/health`
3. Add the env vars per `backend/.env.example` (every row in the table)

✅ **Verify:**
- Render shows "Live" (green)
- `https://<service>.onrender.com/api/health` returns `{"status":"healthy","database":"connected"}` (first request after sleep takes ~30s to wake the free service)
- `https://<service>.onrender.com/api/agency/health` returns `{"data":{"reachable":true,"cloud":true,"persona_count":12}}`
- `https://<service>.onrender.com/docs` → Swagger loads

If the boot crashes on `CORS_ORIGINS`, the JSON-array form is wrong — it MUST be a JSON array string, not a comma-separated list.

---

### Step 4 — Frontend: Cloudflare Pages (free static)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → pick `sahiixx/X1`
2. Project name = `nowhere-ai` (gives you `nowhere-ai.pages.dev`)
3. **Build settings**:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: *(leave empty — repo root is fine; the app is at root)*
4. **Environment variables** (Pages → Settings → Environment variables):
   - `VITE_API_URL` = `https://<service>.onrender.com` (your Render URL from Step 3, **no trailing slash**)
   - **Important:** add it to BOTH "Production" and "Preview" environments
5. **Save and Deploy** → Cloudflare builds (1-2 min) → live at `https://nowhere-ai.pages.dev`

The `public/_redirects` file in this repo already proxies `/api/*` requests to the Render backend (if you set it) and falls back to `index.html` for client-side routes. **You do NOT need to set up Cloudflare Workers for this** — Pages handles it.

✅ **Verify:**
- `https://nowhere-ai.pages.dev/` loads (Linear/Vercel dark UI)
- `/pricing`, `/about`, `/contact` all render
- Hard refresh `/pricing` — should NOT 404 (the `_redirects` SPA fallback handles it)

---

### Step 5 — Wire frontend CORS to backend

1. Back in **Render** → your service → **Environment** → edit `CORS_ORIGINS`
2. Change to:
   ```json
   ["https://nowhere-ai.pages.dev","http://localhost:3000"]
   ```
   (Replace with your actual Pages URL. JSON array — NOT comma-separated.)
3. Save → Render auto-redeploys (1-2 min)

✅ **Verify:**
- Open `https://nowhere-ai.pages.dev/ai-solver` in a private window → fill the form → "Analyze" → check browser devtools Network tab for the POST `/api/ai/analyze-problem` request — it should hit `https://<service>.onrender.com/api/ai/analyze-problem` and return 200 (or fallback text if no LLM key set, both are OK)

---

### Step 6 — Smoke-test every real feature

Open `https://nowhere-ai.pages.dev/` and verify each row from `DEPLOY.md` §6 actually works end-to-end against the live URLs:

| Page | Test | Expected |
|---|---|---|
| `/` | page loads, marketing copy renders | OK |
| `/ai-solver` | enter a Dubai real-estate prompt → Analyze | analysis text + ROI/timeline (fallback text if no LLM key) |
| `/agents` | click Pause on an agent → button states change | backend log shows `orchestrator.pause_agent` |
| `/agents` → cloud console | pick a persona, enter task, "Run on cloud" | real `glm-5.2` response in 5-15s |
| `/contact` | submit the lead form | success toast, `db.contact_forms` row in Atlas |
| `/insights` | "Run anomaly scan" | insights list (or "no anomalies" — both valid) |
| `/templates` | click "Deploy" on any template | success toast |
| `/login` → `/signup` → `/dashboard` | sign up new user → log in | JWT stored, `/dashboard` renders; `/dashboard` while logged out redirects to `/login` |
| `/pricing` | click Subscribe | Stripe Checkout opens (or honest error if no Stripe key set) |

If any row fails: check the Render logs (`Logs` tab) AND the browser Network tab. The two most common failures:
- **CORS preflight failure** → fix Step 5
- **404 on `/api/...`** → check `VITE_API_URL` (it was baked at build time — you must rebuild after changing it)

---

### Step 7 — (Optional) Light up the optional features

These all degrade gracefully without keys, but if you have them, paste into Render Environment:

| Variable | What it lights up | Where to get it |
|---|---|---|
| `OPENAI_API_KEY` | Real AI solver output (instead of fallback text) | https://platform.openai.com/api-keys |
| `STRIPE_API_KEY` (test or live) | Real Stripe Checkout on `/pricing` | https://dashboard.stripe.com/apikeys |
| `STRIPE_WEBHOOK_SECRET` | Real payment confirmation → `db.payments` fulfilment | https://dashboard.stripe.com/webhooks (point to `<render-url>/api/integrations/payments/webhook`) |
| `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_WHATSAPP_NUMBER` | Real WhatsApp follow-up on lead form | https://console.twilio.com/ (WhatsApp sandbox) |
| `SENDGRID_API_KEY` | Real email notifications on contact/lead form | https://app.sendgrid.com/ |

After pasting any key, Render auto-redeploys in ~1 minute. No code change needed.

---

## What you tell people

```
Frontend: https://nowhere-ai.pages.dev
API:      https://<service>.onrender.com/docs
```

That's the pitch-deck URL set. Share the frontend one with non-technical viewers; the `/docs` Swagger is for the engineering team.

## Important notes

- **Render free tier sleeps after 15 min idle.** The first request after sleep takes ~30s to wake. For a production launch, upgrade to the $7/mo "Starter" plan (always-on).
- **The aitmpl-pack at `C:\Users\sahii\Projects\aitmpl\` is a separate, staged fork** (12 persona agents, ready to PR upstream). Not part of this deploy — separate decision.
- **The aitmpl clone at `C:\Users\sahii\Projects\aitmpl\`** (102 MB) is no longer needed for your own product now that the agents are also in your repo (`nowhere-ai/aitmpl-pack/`). Safe to remove with `Remove-Item -Recurse -Force C:\Users\sahii\Projects\aitmpl` when you're done with it.
- **The Fixfiz backend repo is now `render.yaml`-ready** — the file I just wrote declares the full env-var template. You do NOT need to edit it again unless you add a new env var.