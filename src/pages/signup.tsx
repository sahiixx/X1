import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Sparkles, Loader2 } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { Card } from '@/components/Card';
import { usePageTitle } from '@/hooks/usePageTitle';
import { signUp } from '@/lib/auth';
import { toast } from 'sonner';

export default function Signup() {
  usePageTitle('Get started — NOWHERE.ai');
  const [, navigate] = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signUp(email, password, name || undefined);
      toast.success('Account created.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageLayout>
      <section className="relative container mx-auto px-4 lg:px-8 py-16 max-w-md">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-glow" />
        <div className="relative flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-brand text-primary-foreground mb-4 shadow-[0_0_24px_-6px_hsl(var(--primary)/0.7)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Start with NOWHERE.ai</h1>
          <p className="text-muted-foreground text-sm mt-1">Create your account in seconds.</p>
        </div>

        <Card>
          <form className="space-y-5 p-2" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full bg-background border border-input rounded-lg focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="w-full bg-background border border-input rounded-lg focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full bg-background border border-input rounded-lg focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm outline-none transition-all" />
            </div>
            <button type="submit" disabled={busy} className="w-full bg-brand text-primary-foreground font-semibold py-3 rounded-lg shadow-[0_0_0_1px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.6),0_8px_30px_-12px_hsl(var(--primary)/0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {busy ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </section>
    </PageLayout>
  );
}