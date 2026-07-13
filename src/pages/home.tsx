import { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Zap, BarChart3, Shield, Activity, Bot, Code, Crosshair, ArrowRight, Check } from 'lucide-react';
import { Link } from 'wouter';
import { PageLayout } from '@/components/PageLayout';
import { Card } from '@/components/Card';
import { usePageTitle } from '@/hooks/usePageTitle';
import { StatCounter } from '@/components/StatCounter';
import { submitContact } from '@/lib/api';
import { toast } from 'sonner';

const staggerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const childVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const services = [
  { icon: Code, title: 'Web Development', desc: 'Full-stack web platforms built for scale, speed, and conversion.' },
  { icon: Smartphone, title: 'Mobile Apps', desc: 'Native and cross-platform iOS & Android apps with polished UX.' },
  { icon: Bot, title: 'AI Solutions', desc: 'Custom AI agents, LLM integrations, and workflow automation.' },
  { icon: Activity, title: 'Digital Marketing', desc: 'SEO, performance marketing, and data-driven social campaigns.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Real-time dashboards and insights across every channel.' },
  { icon: Crosshair, title: 'Lead Generation', desc: 'Automated funnels delivering qualified leads at volume.' },
];

export default function Home() {
  usePageTitle('NOWHERE.ai — Dubai AI Marketing Agency');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setSubmitting(true);
    try {
      await submitContact({
        name: String(fd.get('name') ?? ''),
        email: String(fd.get('email') ?? ''),
        service: String(fd.get('service') ?? ''),
        message: String(fd.get('message') ?? ''),
      });
      toast.success("Thanks — we'll be in touch within 4 hours.");
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Layered backdrop: fading dot-grid + scanlines + soft brand glow. */}
        <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-70" />
        <div className="pointer-events-none absolute inset-0 scanlines opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-glow" />
        <div className="relative container mx-auto px-4 lg:px-8 min-h-[80vh] flex flex-col justify-center py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={staggerVariants} className="space-y-7">
              <motion.div variants={childVariants} className="terminal-label inline-flex items-center gap-2 border border-border glass px-3 py-1 rounded-full text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.8)]" />
                nowhere://agency — dubai
              </motion.div>

              <motion.h1 variants={childVariants} className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.08] text-foreground">
                AI agents that run your <span className="text-gradient">marketing</span>, so you can run your business.
              </motion.h1>

              <motion.p variants={childVariants} className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                NOWHERE.ai builds and operates AI agents that capture leads, follow up on WhatsApp, run campaigns, and analyse performance — for businesses across Dubai and the UAE.
              </motion.p>

              <motion.div variants={childVariants} className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/contact" className="group inline-flex items-center justify-center gap-2 bg-brand text-primary-foreground font-semibold px-6 py-3 rounded-lg shadow-[0_0_0_1px_hsl(var(--primary)/0.4),0_8px_30px_-12px_hsl(var(--primary)/0.6)] hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.6),0_10px_40px_-10px_hsl(var(--primary)/0.8)] transition-all">
                  Start your project <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link href="/ai-solver" className="inline-flex items-center justify-center gap-2 border border-border glass hover:border-primary/40 px-6 py-3 rounded-lg font-semibold text-foreground transition-colors">
                  Try the AI solver
                </Link>
              </motion.div>

              <motion.div variants={childVariants} className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground pt-2">
                <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> Free consultation</span>
                <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> 24/7 support</span>
                <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> UAE specialists</span>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col gap-4">
              <Card title="Your AI workforce" subtitle="nowhere://workforce — 5 agents online" className="glass">
                <div className="space-y-3">
                  {[
                    { icon: Bot, name: 'Sales Agent', task: 'Qualifying inbound leads' },
                    { icon: Activity, name: 'Marketing Agent', task: 'Running 3 campaigns' },
                    { icon: Code, name: 'Content Agent', task: 'Drafting weekly posts' },
                    { icon: BarChart3, name: 'Analytics Agent', task: 'Tracking conversions' },
                  ].map((a) => (
                    <div key={a.name} className="flex items-center gap-3 rounded-lg border border-border bg-background/60 px-3 py-2.5 transition-colors hover:border-primary/30">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                        <a.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">{a.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{a.task}</div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.9)]" />
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { end: 500, suffix: '+', label: 'Projects delivered' },
              { end: 200, suffix: '+', label: 'Active clients' },
              { end: 5, suffix: '+', label: 'Years in market' },
              { end: 98, suffix: '%', label: 'Satisfaction' },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center">
                <span className="text-4xl md:text-5xl font-bold text-gradient">
                  <StatCounter end={s.end} suffix={s.suffix} />
                </span>
                <span className="text-sm text-muted-foreground mt-1">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="container mx-auto px-4 lg:px-8 py-20" id="services">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Everything you need to grow</h2>
          <p className="text-muted-foreground mt-3">One team, one platform — from web and mobile to AI agents and performance marketing.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((srv) => (
            <Card key={srv.title} className="hover:border-primary/40 transition-colors">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10 text-primary mb-5">
                  <srv.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{srv.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{srv.desc}</p>
                <Link href="/services" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-5 hover:gap-2 transition-all">
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container mx-auto px-4 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-5">
                Built for real Dubai businesses
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We combine AI agents with elite creative execution to architect digital ecosystems — not just websites. Our agents work around the clock to capture, nurture, and convert.
              </p>
              <ul className="space-y-3">
                {[
                  ['Total integration', 'We architect digital ecosystems, not isolated sites.'],
                  ['AI-first approach', 'Agents that capture leads and follow up instantly.'],
                  ['Relentless execution', '24/7 optimization for constant, measurable growth.'],
                ].map(([t, d]) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground mt-0.5 shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                    <span className="text-foreground"><strong className="font-semibold">{t}:</strong> <span className="text-muted-foreground">{d}</span></span>
                  </li>
                ))}
              </ul>
              <Link href="/about" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-7 hover:gap-2 transition-all">
                More about us <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Card title="Why NOWHERE.ai">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Zap, k: 'Instant follow-up', v: 'Leads contacted in seconds, not hours.' },
                  { icon: Shield, k: 'Secure by default', v: 'JWT auth, rate limiting, RBAC.' },
                  { icon: Bot, k: '5 AI agents', v: 'Sales, marketing, content, analytics, ops.' },
                  { icon: BarChart3, k: 'Real analytics', v: 'Live dashboards across every channel.' },
                ].map((f) => (
                  <div key={f.k} className="rounded-lg border border-border bg-background p-4">
                    <f.icon className="w-5 h-5 text-primary mb-3" />
                    <div className="text-sm font-semibold text-foreground">{f.k}</div>
                    <div className="text-xs text-muted-foreground mt-1">{f.v}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="container mx-auto px-4 lg:px-8 py-20 max-w-3xl" id="contact">
        <Card title="Start your project">
          <div className="p-2 md:p-4">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Let's talk about your business</h2>
              <p className="text-muted-foreground">Tell us what you need — we'll respond within 4 hours.</p>
            </div>
            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <input name="name" required type="text" placeholder="Your name" className="w-full bg-background border border-input rounded-lg focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input name="email" required type="email" placeholder="you@company.com" className="w-full bg-background border border-input rounded-lg focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Service</label>
                <select name="service" className="w-full bg-background border border-input rounded-lg focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm outline-none transition-all">
                  <option value="Web Development">Web Development</option>
                  <option value="AI Solutions">AI Solutions</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Lead Generation">Lead Generation</option>
                  <option value="Custom Project">Custom Project</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Message</label>
                <textarea name="message" required rows={4} placeholder="What are you trying to achieve?" className="w-full bg-background border border-input rounded-lg focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm outline-none transition-all resize-none" />
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-brand text-primary-foreground font-semibold py-3 rounded-lg shadow-[0_0_0_1px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.6),0_8px_30px_-12px_hsl(var(--primary)/0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Sending…' : 'Send message'}
              </button>
            </form>
          </div>
        </Card>
      </section>
    </PageLayout>
  );
}