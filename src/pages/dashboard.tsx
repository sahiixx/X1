import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Bot, LayoutGrid, Activity, ArrowRight, LogOut, Sparkles } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { Card } from '@/components/Card';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuth } from '@/lib/auth';
import { analyticsSummary, fetchAgents, type AnalyticsSummary } from '@/lib/api';

export default function Dashboard() {
  usePageTitle('Dashboard — NOWHERE.ai');
  const { user, signOut } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [agentsCount, setAgentsCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    analyticsSummary()
      .then((a) => { if (!cancelled) setAnalytics(a); })
      .catch(() => {});
    fetchAgents()
      .then((a) => { if (!cancelled) setAgentsCount(a.length); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const stats = [
    { label: 'Contacts (total)', value: analytics?.total?.contacts ?? '—' },
    { label: 'Chat sessions', value: analytics?.total?.chat_sessions ?? '—' },
    { label: 'Bookings', value: analytics?.total?.bookings ?? '—' },
    { label: 'AI agents', value: agentsCount ?? '—' },
  ];

  const shortcuts = [
    { to: '/agents', icon: Bot, title: 'Agents', desc: 'Monitor and control your AI workforce' },
    { to: '/insights', icon: Activity, title: 'Insights', desc: 'Performance analysis and anomaly detection' },
    { to: '/templates', icon: LayoutGrid, title: 'Templates', desc: 'Deploy an industry blueprint' },
    { to: '/ai-solver', icon: Sparkles, title: 'AI solver', desc: 'Analyse a business challenge' },
  ];

  return (
    <PageLayout>
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome{user?.name || user?.email ? `, ${user?.name || user?.email}` : ''}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Your AI marketing operations dashboard.</p>
          </div>
          <button onClick={signOut} className="inline-flex items-center gap-2 text-sm border border-border bg-card hover:bg-secondary px-4 py-2 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <Card key={s.label} bodyClassName="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</div>
              <div className="text-3xl font-bold mt-2">{s.value}</div>
            </Card>
          ))}
        </div>

        <h2 className="text-lg font-semibold mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {shortcuts.map((s) => (
            <Link key={s.to} href={s.to}>
              <Card className="hover:border-primary/40 transition-colors h-full">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{s.title}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{s.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="mt-8" title="Account">
          <div className="text-sm text-muted-foreground space-y-1">
            <div><span className="font-medium text-foreground">Email:</span> {user?.email ?? '—'}</div>
            <div><span className="font-medium text-foreground">Role:</span> {user?.role ?? 'customer'}</div>
          </div>
        </Card>
      </section>
    </PageLayout>
  );
}