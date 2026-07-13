import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Card } from '@/components/Card';
import { Bot, Activity, TrendingUp, Zap, Play, Pause, RotateCcw, Loader2 } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toast } from 'sonner';
import {
  fetchAgents,
  pauseAgent,
  resumeAgent,
  resetAgent,
  type AgentData,
  type AgentState,
} from '@/lib/api';

// The agent roster (names, descriptions, capabilities, real task/failed counts,
// AND the backend `agentId` key used for control calls) seeds from the live
// backend via fetchAgents() -> GET /api/agents/status. Play/Pause/Reset now
// call the REAL backend endpoints /api/agents/{id}/pause|resume|reset instead
// of mutating local state only. The task/failed counters are NOT locally
// simulated any more — they reflect whatever the backend reports on refresh.

const DEFAULT_AGENTS: AgentData[] = [
  {
    id: 1,
    agentId: 'sales',
    name: 'Sales Agent',
    desc: 'AI-powered sales automation specialist for lead qualification and conversion.',
    capabilities: ['lead_qualification', 'client_communication', 'workflow_automation'],
    state: 'IDLE',
    tasks: 0,
    failed: 0,
  },
  {
    id: 2,
    agentId: 'marketing',
    name: 'Marketing Agent',
    desc: 'AI-powered marketing automation specialist for campaign management and optimization.',
    capabilities: ['campaign_management', 'data_analysis', 'content_creation'],
    state: 'RUNNING',
    tasks: 125,
    failed: 2,
    startedAt: Date.now() - 3600000,
  },
  {
    id: 3,
    agentId: 'content',
    name: 'Content Agent',
    desc: 'AI-powered content creation specialist for blogs, social media, and marketing materials.',
    capabilities: ['content_creation', 'workflow_automation'],
    state: 'PAUSED',
    tasks: 45,
    failed: 0,
    startedAt: Date.now() - 7200000,
  },
  {
    id: 4,
    agentId: 'analytics',
    name: 'Analytics Agent',
    desc: 'AI-powered analytics specialist for data analysis and business intelligence.',
    capabilities: ['data_analysis', 'workflow_automation'],
    state: 'RUNNING',
    tasks: 890,
    failed: 1,
    startedAt: Date.now() - 14400000,
  },
];

export default function Agents() {
  usePageTitle('Agents — NOWHERE.ai');

  const [agents, setAgents] = useState<AgentData[]>(DEFAULT_AGENTS);
  const [now, setNow] = useState(Date.now());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);

  // Seed the roster from the live backend once on mount. If the backend is
  // reachable its real agents replace the static defaults (real definitions +
  // live metrics). On failure we keep the defaults. We do NOT persist this to
  // localStorage any more — the backend is the source of truth.
  useEffect(() => {
    let cancelled = false;
    fetchAgents()
      .then((live: AgentData[]) => {
        if (cancelled || !live.length) return;
        setAgents(live);
        setSeeded(true);
      })
      .catch((e) => {
        if (!cancelled) console.error('fetchAgents failed, keeping defaults:', e);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // A 5s clock tick ONLY to refresh the uptime display for RUNNING agents.
  // (No fake task-count increments — backend metrics are the source of truth.)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  // Refresh the roster from the backend after a control call so the UI
  // reflects the authoritative server-side state.
  const refresh = async () => {
    try {
      const live = await fetchAgents();
      if (live.length) setAgents(live);
    } catch {
      /* keep current state */
    }
  };

  const control = async (agent: AgentData, action: 'resume' | 'pause' | 'reset') => {
    if (busyId) return;
    setBusyId(agent.agentId);
    try {
      if (action === 'resume') {
        await resumeAgent(agent.agentId);
        toast.success('Agent resumed', { description: `${agent.name} is now processing tasks` });
      } else if (action === 'pause') {
        await pauseAgent(agent.agentId);
        toast('Agent paused', { description: `${agent.name} moved to standby` });
      } else {
        await resetAgent(agent.agentId);
        toast('Agent reset', { description: `${agent.name} task data cleared` });
      }
      // Optimistically update the visible state, then sync from the backend.
      setAgents((prev) =>
        prev.map((a) =>
          a.agentId === agent.agentId
            ? {
                ...a,
                state: (action === 'resume' ? 'RUNNING' : action === 'pause' ? 'PAUSED' : 'IDLE') as AgentState,
                tasks: action === 'reset' ? 0 : a.tasks,
                failed: action === 'reset' ? 0 : a.failed,
                startedAt: action === 'resume' ? a.startedAt || Date.now() : undefined,
              }
            : a,
        ),
      );
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `${action} failed`);
      await refresh();
    } finally {
      setBusyId(null);
    }
  };

  const activeCount = agents.filter((a) => a.state === 'RUNNING').length;
  const totalTasks = agents.reduce((sum, a) => sum + a.tasks, 0);
  const totalFailed = agents.reduce((sum, a) => sum + a.failed, 0);
  const overallSuccessRate = totalTasks > 0 ? (((totalTasks - totalFailed) / totalTasks) * 100).toFixed(1) : '0';

  let maxUptimeMs = 0;
  agents
    .filter((a) => a.state === 'RUNNING' && a.startedAt)
    .forEach((a) => {
      const uptime = now - a.startedAt!;
      if (uptime > maxUptimeMs) maxUptimeMs = uptime;
    });

  const formatUptime = (ms: number) => {
    if (ms <= 0) return '—';
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const stats = [
    { value: activeCount.toString(), label: 'Active agents', icon: Bot },
    { value: totalTasks.toLocaleString(), label: 'Total tasks', icon: Activity },
    { value: `${overallSuccessRate}%`, label: 'Success rate', icon: TrendingUp },
    { value: formatUptime(maxUptimeMs), label: 'Uptime', icon: Zap },
  ];

  return (
    <PageLayout>
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 bg-secondary border border-border rounded-full px-3 py-1 text-xs text-muted-foreground mb-5">
            <Bot className="w-3 h-3" />
            <span>AI Agent Command Center</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Agent dashboard
          </h1>
          <p className="text-muted-foreground text-lg mt-3">
            Monitor and control your AI-powered marketing workforce. Pause, resume, or reset any agent — changes take effect on the live backend.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <Card key={s.label} bodyClassName="p-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl md:text-3xl font-bold text-foreground">{s.value}</span>
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-xs text-muted-foreground mt-2">{s.label}</div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {agents.map((agent) => {
            const successRate = agent.tasks > 0 ? (((agent.tasks - agent.failed) / agent.tasks) * 100).toFixed(1) : '0';
            const uptimeStr = agent.state === 'RUNNING' && agent.startedAt ? formatUptime(now - agent.startedAt) : '—';
            const isBusy = busyId === agent.agentId;

            return (
              <Card key={agent.agentId} bodyClassName="p-6">
                <div className="flex justify-between items-start gap-4 mb-5">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-foreground">{agent.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{agent.desc}</p>
                    <p className="text-xs text-muted-foreground mt-2">Uptime: {uptimeStr}</p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      agent.state === 'RUNNING'
                        ? 'text-primary border-primary bg-primary/10'
                        : agent.state === 'PAUSED'
                        ? 'text-amber-600 border-amber-500/60 bg-amber-500/10'
                        : 'text-muted-foreground border-border bg-secondary'
                    }`}
                  >
                    {agent.state}
                  </span>
                </div>

                <div className="flex gap-4 text-xs text-muted-foreground mb-5 pb-5 border-b border-border">
                  <span>{agent.tasks.toLocaleString()} completed</span>
                  <span>{agent.failed.toLocaleString()} failed</span>
                  <span>{successRate}% success</span>
                </div>

                <div className="mb-6">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Capabilities</div>
                  <div className="flex flex-wrap gap-2">
                    {agent.capabilities.map((cap) => (
                      <span key={cap} className="px-2 py-1 bg-secondary border border-border rounded-md text-xs text-muted-foreground">
                        {cap.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => control(agent, 'resume')}
                    disabled={agent.state === 'RUNNING' || isBusy}
                    className="flex items-center justify-center gap-2 border border-border bg-card hover:bg-primary hover:text-primary-foreground text-foreground text-xs font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:text-foreground"
                  >
                    {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    Resume
                  </button>
                  <button
                    onClick={() => control(agent, 'pause')}
                    disabled={agent.state === 'PAUSED' || isBusy}
                    className="flex items-center justify-center gap-2 border border-border bg-card hover:bg-amber-500 hover:border-amber-500 hover:text-white text-foreground text-xs font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    Pause
                  </button>
                  <button
                    onClick={() => control(agent, 'reset')}
                    disabled={agent.state === 'IDLE' || isBusy}
                    className="flex items-center justify-center gap-2 border border-border bg-card hover:bg-foreground hover:text-background text-foreground text-xs font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        {!seeded && (
          <p className="text-center text-xs text-muted-foreground mt-8">
            Showing default agent roster — connect to the backend to load live status.
          </p>
        )}
      </section>
    </PageLayout>
  );
}