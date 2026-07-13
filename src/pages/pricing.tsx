import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Check, Loader2, Lock } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { Card } from '@/components/Card';
import { usePageTitle } from '@/hooks/usePageTitle';
import { paymentPackages, createCheckoutSession, type PaymentPackage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

// Fallback tiers if the backend packages endpoint is unavailable. The backend
// returns starter/growth/enterprise in AED.
const FALLBACK: PaymentPackage[] = [
  { name: 'Starter', price: 2500, currency: 'AED', period: '/mo', description: 'For small businesses getting started with AI.', features: ['1 AI agent', 'Lead capture', 'Email support', 'Basic analytics'] },
  { name: 'Growth', price: 7500, currency: 'AED', period: '/mo', description: 'For growing teams that need the full workforce.', features: ['5 AI agents', 'WhatsApp follow-up', 'Priority support', 'Full analytics', 'Campaign automation'] },
  { name: 'Enterprise', price: 15000, currency: 'AED', period: '/mo', description: 'For established businesses with custom needs.', features: ['All agents + custom', 'Dedicated manager', '24/7 support', 'Custom integrations', 'SLA'] },
];

export default function Pricing() {
  usePageTitle('Pricing — NOWHERE.ai');
  const { isAuthed } = useAuth();
  const [, navigate] = useLocation();
  const [packages, setPackages] = useState<PaymentPackage[]>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    paymentPackages()
      .then((p) => { if (!cancelled && p.length) setPackages(p); })
      .catch(() => { /* keep fallback */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const subscribe = async (pkg: PaymentPackage, idx: number) => {
    const id = String(pkg.id ?? pkg.name).toLowerCase();
    // Checkout requires an account (the backend create-session endpoint is
    // auth-guarded). Send visitors to sign up first; the flow returns here.
    if (!isAuthed) {
      navigate('/signup');
      return;
    }
    setBusyId(id);
    try {
      const { url } = await createCheckoutSession({
        package_id: String(pkg.id ?? idx + 1),
        success_url: `${window.location.origin}/dashboard`,
        cancel_url: `${window.location.origin}/pricing`,
      });
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Checkout session created but no redirect URL returned.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Checkout unavailable');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PageLayout>
      <section className="container mx-auto px-4 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Simple, transparent <span className="text-gradient">pricing</span></h1>
          <p className="text-muted-foreground mt-3 text-lg">One AI workforce, three plans. Cancel anytime.</p>
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary border border-border rounded-full px-3 py-1 mt-4">
            <Lock className="w-3 h-3" /> Payments run on Stripe. Test mode active until a live key is set.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {packages.map((pkg, i) => {
            const price = Number(pkg.price ?? 0);
            const featured = i === 1;
            const id = String(pkg.id ?? pkg.name).toLowerCase();
            return (
              <Card key={pkg.name} className={featured ? 'border-primary/60 ring-1 ring-primary/40 relative shadow-[0_0_40px_-12px_hsl(var(--primary)/0.5)]' : ''}>
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-[0_0_18px_-4px_hsl(var(--primary)/0.7)]">Most popular</span>
                )}
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-semibold">{pkg.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 min-h-[2.5rem]">{pkg.description}</p>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold">{pkg.currency ?? 'AED'} {price.toLocaleString()}</span>
                    <span className="text-muted-foreground">{pkg.period ?? '/mo'}</span>
                  </div>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {(pkg.features ?? []).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => subscribe(pkg, i)}
                    disabled={busyId === id || loading}
                    className={`w-full font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      featured
                        ? 'bg-brand text-primary-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.6),0_8px_30px_-12px_hsl(var(--primary)/0.6)]'
                        : 'border border-border glass hover:border-primary/40 text-foreground'
                    }`}
                  >
                    {busyId === id && <Loader2 className="w-4 h-4 animate-spin" />}
                    {busyId === id ? 'Redirecting…' : isAuthed ? 'Subscribe' : 'Get started'}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          Not sure which plan?{' '}
          <Link href="/contact" className="font-medium text-primary hover:underline">Talk to us</Link>
        </p>
      </section>
    </PageLayout>
  );
}