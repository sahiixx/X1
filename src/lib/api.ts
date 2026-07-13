// NOWHERE.AI API client — wired to the live Fixfiz FastAPI backend.
//
// All endpoints are under /api and are currently public (no auth enforced
// server-side). Base URL comes from VITE_API_URL (default http://localhost:8001
// — the Windows->WSL localhost forward works for :8001). Throw on non-2xx or
// `{ success: false }` so each page's try/catch surfaces the backend message.
//
// The exported function names/signatures are kept identical to the original
// stub so every page works unchanged; only the bodies now hit the real backend.

const API_BASE: string =
  (import.meta as any).env?.VITE_API_URL ?? "http://localhost:8001";

// Attach the stored JWT (if any) to every request so authed endpoints work.
// The token is written by lib/auth.tsx under the "nowhere.token" key.
function authHeader(): Record<string, string> {
  try {
    const t = localStorage.getItem("nowhere.token");
    return t ? { Authorization: `Bearer ${t}` } : {};
  } catch {
    return {};
  }
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...(init?.headers ?? {}),
    },
  });
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok || (body && body.success === false)) {
    let detail =
      body?.message ??
      (Array.isArray(body?.data?.errors)
        ? body.data.errors
            .map((e: any) => `${e.field ?? e.loc ?? "field"}: ${e.message ?? e.msg ?? ""}`.trim())
            .filter(Boolean)
            .join("; ")
        : "") ??
      `${res.status} ${res.statusText}`;
    throw new Error(detail || `${res.status} ${res.statusText}`);
  }
  return body as T;
}

// ---- Shared types ----
export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
}

export type AgentState = "IDLE" | "RUNNING" | "PAUSED";
export interface AgentData {
  id: number;            // display index (1-based)
  agentId: string;       // backend agent key (used for control calls)
  name: string;
  desc: string;
  capabilities: string[];
  state: AgentState;
  tasks: number;
  failed: number;
  startedAt?: number;
}

// ---- Mappers (frontend free-text -> backend enums) ----

// The contact form offers human-readable service names; the backend validates
// against a fixed enum. Map the known options, fall back to "other".
const SERVICE_ENUM: Record<string, string> = {
  "web development": "web_development",
  "ai solutions": "ai_solutions",
  "digital marketing": "content_marketing",
  "mobile app": "other",
  "lead generation": "lead_generation",
  "custom project": "other",
  social_media: "social_media",
  "social media": "social_media",
  whatsapp: "whatsapp",
  seo: "seo",
  content_marketing: "content_marketing",
  "content marketing": "content_marketing",
  ecommerce: "ecommerce",
  "e-commerce": "ecommerce",
  other: "other",
};
function mapService(s?: string): string {
  const k = (s ?? "").trim().toLowerCase();
  return SERVICE_ENUM[k] ?? "other";
}

// Template id -> backend industry key. Keep in sync with the static `templates`
// array in src/pages/templates.tsx (ids 1..6 there).
const TEMPLATE_INDUSTRY: Record<number, string> = {
  1: "ecommerce",
  2: "saas",
  3: "local_service",
  4: "healthcare",
  5: "fintech",
  6: "real_estate",
};

// Light keyword -> industry inference for the solver. The backend returns a
// real response regardless of industry, but a good guess sharpens ROI/timeline.
function inferIndustry(challenge: string): string {
  const t = challenge.toLowerCase();
  if (/\breal ?estate|property|brokerage|broker|realtor|listing|dld|rera\b/.test(t)) return "real_estate";
  if (/\bshop|store|ecommerce|e-commerce|retail|cart\b/.test(t)) return "ecommerce";
  if (/\bsaas|software|subscription|trial\b/.test(t)) return "saas";
  if (/\bclinic|doctor|patient|healthcare|medical|hipaa\b/.test(t)) return "healthcare";
  if (/\bfintech|finance|banking|payment|kyc|fraud\b/.test(t)) return "fintech";
  if (/\brestaurant|food|delivery|reservation|cafe\b/.test(t)) return "restaurant";
  if (/\blocal service|salon|spa|plumber|electrician|hvac\b/.test(t)) return "local_service";
  return "real_estate"; // default — matches the startup's Dubai real-estate context
}

// ---- API functions (signatures preserved from the stub) ----

/** AI Problem Solver — analyze a business challenge, return a formatted report string. */
export async function analyzeProblem(challenge: string): Promise<string> {
  const industry = inferIndustry(challenge);
  const r = await http<any>("/api/ai/analyze-problem", {
    method: "POST",
    body: JSON.stringify({
      problem_description: challenge,
      industry,
      budget_range: "Not specified",
    }),
  });
  const a = r?.data?.analysis ?? {};
  const lines: string[] = [];
  lines.push("> AI ANALYSIS COMPLETE");
  lines.push(
    `> PRIORITY: ${a.priority_level ?? "—"}  |  ROI: ${a.estimated_roi ?? "—"}  |  TIMELINE: ${a.implementation_time ?? "—"}`,
  );
  lines.push(`> INDUSTRY: ${industry}  |  BUDGET: ${a.budget_range ?? "—"}`);
  lines.push("");
  lines.push("> ANALYSIS");
  lines.push(a.ai_analysis ?? "No analysis returned.");
  lines.push("");
  lines.push("> MARKET INSIGHTS");
  lines.push(a.market_insights ?? "No market insights returned.");
  lines.push("");
  lines.push("> STRATEGY PROPOSAL");
  lines.push(a.strategy_proposal ?? "No strategy returned.");
  return lines.join("\n");
}

/** Contact form submission. */
export async function submitContact(payload: ContactPayload): Promise<void> {
  await http<any>("/api/contact", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      phone: payload.phone ?? "", // backend requires the field
      service: mapService(payload.service),
      message: payload.message,
    }),
  });
}

export interface LeadResponse {
  id: string;
  whatsapp?: { status?: string; error?: string; test_mode?: boolean; channel?: string; reason?: string };
}

/**
 * Lead capture with WhatsApp follow-up. POST /api/leads stores the lead and
 * attempts a WhatsApp message to the lead's phone. Without Twilio WhatsApp
 * creds the backend stores the lead and returns `whatsapp.test_mode: true` —
 * the UI shows an honest "WhatsApp not configured yet" note in that case.
 */
export async function createLead(payload: ContactPayload & { phone?: string }): Promise<LeadResponse> {
  const r = await http<any>("/api/leads", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      phone: payload.phone ?? "",
      service: mapService(payload.service),
      message: payload.message,
    }),
  });
  return (r?.data ?? r) as LeadResponse;
}

/** Insights — analyze agent performance, returns log lines for the terminal. */
export async function analyzePerformance(): Promise<string[]> {
  const r = await http<any>("/api/insights/analyze-performance", {
    method: "POST",
    body: "{}",
  });
  const insights: any[] = r?.data?.insights ?? [];
  const lines: string[] = [
    `> Performance analysis complete — ${r?.data?.insights_generated ?? insights.length} insight(s) generated`,
  ];
  for (const ins of insights) {
    lines.push(
      `> [${String(ins.type ?? "insight").toUpperCase()}] ${ins.title ?? "insight"} ` +
        `(severity ${ins.severity ?? "?"}, confidence ${Math.round((ins.confidence ?? 0) * 100)}%)`,
    );
    if (ins.impact) lines.push(`   impact: ${ins.impact}`);
    for (const rec of (ins.recommendations ?? []).slice(0, 3)) lines.push(`   -> ${rec}`);
  }
  if (!insights.length) lines.push("> No performance insights available.");
  return lines;
}

/** Insights — detect anomalies, returns log lines for the terminal. */
export async function detectAnomalies(): Promise<string[]> {
  const r = await http<any>("/api/insights/detect-anomalies", {
    method: "POST",
    body: "{}",
  });
  const anomalies: number = r?.data?.anomalies_detected ?? 0;
  const insights: any[] = r?.data?.insights ?? [];
  const lines: string[] = [`> Anomaly scan complete — ${anomalies} anomaly/anomalies detected`];
  for (const ins of insights) {
    lines.push(`> [ALERT] ${ins.title ?? ins.id ?? "anomaly"} — severity ${ins.severity ?? "?"}`);
    if (ins.description) lines.push(`   ${ins.description}`);
  }
  if (!anomalies) lines.push("> All systems nominal — no anomalies detected.");
  return lines;
}

/** Deploy an industry template by id (maps to a backend industry key). */
export async function deployTemplate(templateId: number): Promise<void> {
  const industry = TEMPLATE_INDUSTRY[templateId] ?? "ecommerce";
  await http<any>("/api/templates/deploy", {
    method: "POST",
    body: JSON.stringify({ industry }),
  });
}

/**
 * Install a marketplace plugin by id.
 *
 * NOTE: no backend plugin-install endpoint exists yet — `/api/plugins/list`
 * returns a "Plugin not found" error and the marketplace is a roadmap feature.
 * The Plugins page tracks installations client-side; this resolves so the UI
 * flow completes. When a real endpoint lands, POST here and throw on failure.
 */
export async function installPlugin(_pluginId: number): Promise<void> {
  return;
}

/** Fetch the live list of AI agents and their status, shaped for the Agents page. */
export async function fetchAgents(): Promise<AgentData[]> {
  const r = await http<any>("/api/agents/status");
  const map: Record<string, any> = r?.data?.agents ?? {};
  return Object.entries(map).map(([key, a]: [string, any], i: number) => {
    const status = String(a?.status ?? "idle").toLowerCase();
    const state: AgentState =
      status === "running" ? "RUNNING" : status === "paused" ? "PAUSED" : "IDLE";
    const m = a?.metrics ?? {};
    const tasks = Number(m.tasks_completed ?? 0);
    const failed = Number(m.tasks_failed ?? 0);
    const uptimeSec = Number(a?.uptime ?? 0); // seconds
    return {
      id: i + 1,
      agentId: key,
      name: a?.name ?? `Agent ${i + 1}`,
      desc: a?.description ?? "",
      capabilities: Array.isArray(a?.capabilities) ? a.capabilities : [],
      state,
      tasks,
      failed,
      startedAt: uptimeSec > 0 ? Date.now() - uptimeSec * 1000 : undefined,
    };
  });
}

// ---- Agency engine (real cloud LLM agents via Ollama Cloud) ----
//
// The agency engine is a separate layer from the agent control endpoints
// above: /api/agents/* is the in-process agent state machine (pause/resume/
// reset, status, metrics); /api/agency/* runs curated agency-agents personas
// as REAL LLM calls against Ollama Cloud (glm-5.2 by default, 34 cloud models
// available). The Agents page surfaces both — control dashboard + run console.

export interface AgencyHealth {
  reachable: boolean;
  cloud: boolean;
  ollama_url: string;
  default_model: string;
  models?: string[];
  persona_count: number;
  error?: string;
}

export interface AgencyPersona {
  key: string;          // persona filename stem — the agent_key for /agency/run
  name: string;
  description: string;
  color: string;
  emoji: string;
  tools: string;
  slot: string | null;  // operational slot this persona maps to, if any
}

export interface AgencyRunResult {
  agent: string;
  name: string;
  model?: string;
  response?: string;
  eval_count?: number;
  took_ms?: number;
  ollama_url?: string;
  // Honest error fields (present when the run failed — Ollama offline,
  // unknown agent, timeout, etc.). The backend never crashes on these.
  error?: string;
  available?: string[];
  detail?: string;
  timeout_s?: number;
}

export async function agencyHealth(): Promise<AgencyHealth> {
  const r = await http<any>("/api/agency/health");
  return (r?.data ?? r) as AgencyHealth;
}

export async function agencyRoster(): Promise<AgencyPersona[]> {
  const r = await http<any>("/api/agency/roster");
  const data = r?.data ?? r;
  return Array.isArray(data) ? (data as AgencyPersona[]) : [];
}

/**
 * Run a curated persona against a task on the cloud LLM. Uses a raw fetch
 * (not http()) so we can surface the backend's honest error detail — e.g.
 * "agent engine offline — Ollama not reachable" — even when success=false,
 * instead of the generic "agent run failed" message http() would throw.
 */
export async function agencyRun(
  agentKey: string,
  task: string,
  model?: string,
): Promise<AgencyRunResult> {
  const res = await fetch(`${API_BASE}/api/agency/run/${encodeURIComponent(agentKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ task, ...(model ? { model } : {}) }),
  });
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON response */
  }
  return (body?.data ?? body ?? {}) as AgencyRunResult;
}

// ---- Agent control (real backend: pause / resume / reset) ----

export async function pauseAgent(agentId: string): Promise<void> {
  await http<any>(`/api/agents/${encodeURIComponent(agentId)}/pause`, { method: "POST" });
}
export async function resumeAgent(agentId: string): Promise<void> {
  await http<any>(`/api/agents/${encodeURIComponent(agentId)}/resume`, { method: "POST" });
}
export async function resetAgent(agentId: string): Promise<void> {
  await http<any>(`/api/agents/${encodeURIComponent(agentId)}/reset`, { method: "POST" });
}

// ---- Auth (real backend: signup + login, JWT returned) ----

export interface AuthUser {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  [k: string]: unknown;
}
export interface LoginResponse {
  token: string;
  session_id?: string;
  user: AuthUser;
  expires_at?: string | number;
}
export async function signup(body: { email: string; password: string; name?: string; role?: string }): Promise<LoginResponse> {
  // Self-service register: one call that creates a "customer" user AND returns
  // a JWT. Avoids the enterprise /security/users/create path which enforces a
  // 12+ char complex password — too strict for public SaaS signup.
  const r = await http<any>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email: body.email, password: body.password, name: body.name }),
  });
  return (r?.data ?? r) as LoginResponse;
}
export async function login(body: { email: string; password: string }): Promise<LoginResponse> {
  // Backend wraps the JWT in StandardResponse{success,message,data:{token,...}}.
  // Unwrap .data so auth.tsx sees {token, user, expires_at}.
  const r = await http<any>("/api/security/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: body.email, password: body.password }),
  });
  return (r?.data ?? r) as LoginResponse;
}

// ---- Payments (Stripe checkout; real charges need a real STRIPE_API_KEY) ----

export interface PaymentPackage {
  id?: string;
  name: string;
  price: number;
  currency?: string;
  period?: string;
  description?: string;
  features?: string[];
  [k: string]: unknown;
}
export async function paymentPackages(): Promise<PaymentPackage[]> {
  const r = await http<any>("/api/integrations/payments/packages");
  // The backend returns a dict of packages; normalise to an array.
  const data = r?.data ?? r;
  if (Array.isArray(data)) return data as PaymentPackage[];
  if (data && typeof data === "object") {
    const vals = Object.values(data) as any[];
    return vals.filter((v) => v && typeof v === "object") as PaymentPackage[];
  }
  return [];
}
export async function createCheckoutSession(body: { package_id: string; success_url?: string; cancel_url?: string }): Promise<{ url: string; session_id: string }> {
  const r = await http<any>("/api/integrations/payments/create-session", {
    method: "POST",
    body: JSON.stringify({ package_id: body.package_id, success_url: body.success_url, cancel_url: body.cancel_url }),
  });
  return { url: r?.data?.url ?? r?.url, session_id: r?.data?.session_id ?? r?.session_id };
}
export async function checkoutStatus(sessionId: string): Promise<{ status: string; [k: string]: unknown }> {
  const r = await http<any>(`/api/integrations/payments/status/${encodeURIComponent(sessionId)}`);
  return r?.data ?? r;
}

// ---- Analytics (real backend summary) ----
export interface AnalyticsSummary {
  today?: { page_views?: number; contact_forms?: number; bookings?: number; chat_sessions?: number };
  total?: { contacts?: number; bookings?: number; chat_sessions?: number; portfolio_items?: number };
  recent?: { contacts_today?: number };
}
export async function analyticsSummary(): Promise<AnalyticsSummary> {
  const r = await http<any>('/api/analytics/summary');
  return (r?.data ?? r) as AnalyticsSummary;
}