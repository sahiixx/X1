import { useState, useRef, useEffect } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Card } from '@/components/Card';
import { Brain, BarChart3, Activity, RefreshCw, Cpu, Target } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { analyzePerformance, detectAnomalies } from '@/lib/api';

export default function Insights() {
  usePageTitle("SMART INSIGHTS");
  const [logs, setLogs] = useState<string[]>(["💡 Click 'Analyze Performance' or 'Detect Anomalies' to generate AI insights"]);
  const [stats, setStats] = useState({ insights: 0, alerts: 0, optimizations: 0, anomalies: 0 });
  const [busy, setBusy] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const animateStats = (keys: Array<keyof typeof stats>, increments: number[]) => {
    let steps = 0;
    const interval = setInterval(() => {
      setStats(prev => {
        const next = { ...prev };
        keys.forEach((k, i) => {
          if (steps < increments[i]) next[k] += 1;
        });
        return next;
      });
      steps++;
      if (steps >= Math.max(...increments)) clearInterval(interval);
    }, 300);
  };

  const analyze = async () => {
    if (busy) return;
    setBusy(true);
    setLogs(prev => [...prev, "> Analyzing agent performance metrics..."]);
    // TODO: wire to real backend — see src/lib/api.ts
    try {
      const lines = await analyzePerformance();
      setLogs(prev => [...prev, ...lines]);
      animateStats(['insights', 'optimizations'], [3, 2]);
    } catch (err) {
      setLogs(prev => [...prev, `> ERROR: ${err instanceof Error ? err.message : 'analysis failed'}`]);
    } finally {
      setBusy(false);
    }
  };

  const detect = async () => {
    if (busy) return;
    setBusy(true);
    setLogs(prev => [...prev, "> Scanning for pattern anomalies..."]);
    // TODO: wire to real backend — see src/lib/api.ts
    try {
      const lines = await detectAnomalies();
      setLogs(prev => [...prev, ...lines]);
      animateStats(['alerts', 'anomalies'], [1, 1]);
    } catch (err) {
      setLogs(prev => [...prev, `> ERROR: ${err instanceof Error ? err.message : 'detection failed'}`]);
    } finally {
      setBusy(false);
    }
  };

  const refresh = () => {
    setLogs(["> System log cleared.", "> Reconnecting to data streams... [OK]"]);
    setStats({ insights: 0, alerts: 0, optimizations: 0, anomalies: 0 });
  };

  return (
    <PageLayout>
      <section className="container mx-auto px-4 lg:px-8 py-12 flex flex-col items-center text-center">
        <div className="max-w-4xl flex flex-col items-center">
          <div className="inline-flex items-center gap-2 border border-border bg-secondary/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-8">
            <span>🧠</span>
            <span>AI-Powered Intelligence</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
            Smart Insights
          </h1>

          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed mb-10">
            AI-powered analytics, anomaly detection, and optimization recommendations.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { value: stats.insights, label: "Total Insights" },
            { value: stats.alerts, label: "Critical Alerts" },
            { value: stats.optimizations, label: "Optimizations" },
            { value: stats.anomalies, label: "Anomalies" }
          ].map((stat, i) => (
            <div key={i} className="border border-border bg-card rounded-lg p-6 text-center">
              <span className="block text-3xl font-bold text-primary mb-2">{stat.value}</span>
              <span className="text-muted-foreground text-sm">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button onClick={analyze} disabled={busy} className="flex items-center gap-2 border border-primary text-primary rounded-lg px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-semibold disabled:opacity-50">
            <BarChart3 className="w-4 h-4" /> Analyze Performance
          </button>
          <button onClick={detect} disabled={busy} className="flex items-center gap-2 border border-primary text-primary rounded-lg px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-semibold disabled:opacity-50">
            <Activity className="w-4 h-4" /> Detect Anomalies
          </button>
          <button onClick={refresh} className="flex items-center gap-2 border border-primary text-primary rounded-lg px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-semibold ml-auto">
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </button>
        </div>

        <div className="bg-secondary border border-border rounded-lg p-4 font-mono text-sm h-[300px] overflow-y-auto mb-12">
          <div ref={terminalRef} className="space-y-2 text-muted-foreground scroll-smooth">
            {logs.map((log, i) => (
              <p key={i} className={log.includes("complete") || log.includes("patch") ? "text-primary" : ""}>
                {log}
              </p>
            ))}
            <div className="mt-2 text-primary animate-pulse">_</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Target, title: "Agent Performance Analysis", desc: "Real-time tracking of AI agent efficiency, task completion rates, and ROI generation metrics." },
            { icon: Cpu, title: "Business Intelligence", desc: "Deep synthesis of market data, competitor movements, and predictive consumer behavior modeling." },
            { icon: Brain, title: "Optimization Engine", desc: "Autonomous self-improvement protocols that continuously refine workflows for maximum output." }
          ].map((card, i) => (
            <Card key={i} title={card.title} className="hover:border-primary/40 transition-colors">
              <card.icon className="w-8 h-8 text-primary mb-4" />
              <p className="text-muted-foreground text-sm leading-relaxed">{card.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}