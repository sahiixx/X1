import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Card } from '@/components/Card';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, Phone, Mail, MapPin, Send, Copy, CheckCircle, Loader2, MessageCircle } from 'lucide-react';
import { Link } from 'wouter';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toast } from 'sonner';
import { createLead } from '@/lib/api';

const staggerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const childVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function Contact() {
  usePageTitle('Contact — NOWHERE.ai');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setSubmitting(true);
    try {
      const res = await createLead({
        name: String(fd.get('name') ?? ''),
        email: String(fd.get('email') ?? ''),
        phone: String(fd.get('phone') ?? ''),
        service: String(fd.get('service') ?? ''),
        message: String(fd.get('message') ?? ''),
      });
      const wa = res.whatsapp;
      if (wa && wa.test_mode) {
        toast.success('Lead received', {
          description: "We saved your details. WhatsApp follow-up is not configured yet — we'll email you instead.",
        });
      } else if (wa && wa.status && wa.status !== 'skipped') {
        toast.success('Lead received', { description: 'A WhatsApp follow-up message is on its way to your phone.' });
      } else {
        toast.success("Message received — we'll respond within 4 hours.");
      }
      form.reset();
    } catch (err) {
      toast.error('Submission failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <section className="container mx-auto px-4 lg:px-8 py-12 flex flex-col items-center text-center">
        <motion.div initial="hidden" animate="visible" variants={staggerVariants} className="max-w-3xl flex flex-col items-center">
          <motion.div variants={childVariants} className="inline-flex items-center gap-2 bg-secondary border border-border rounded-full px-3 py-1 text-xs text-muted-foreground mb-6">
            <MessageSquare className="w-3 h-3" />
            <span>Talk to our team</span>
          </motion.div>
          <motion.h1 variants={childVariants} className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-5">
            Start your project
          </motion.h1>
          <motion.p variants={childVariants} className="text-muted-foreground text-lg max-w-2xl leading-relaxed mb-9">
            Tell us about your business and what you need. We'll get back to you within 4 hours — and when WhatsApp is connected, you'll get an instant follow-up message too.
          </motion.p>
          <motion.div variants={childVariants} className="flex flex-col sm:flex-row gap-3">
            <Link href="/ai-solver" className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold rounded-lg px-6 py-3 hover:bg-primary/90 transition-colors">
              <Brain className="w-5 h-5" />
              Try the AI solver
            </Link>
            <a href="#form" className="flex items-center justify-center gap-2 border border-border bg-card hover:bg-secondary text-foreground px-6 py-3 rounded-lg transition-colors">
              <MessageSquare className="w-5 h-5" />
              Send a message
            </a>
          </motion.div>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <Card className="flex flex-col items-center text-center" bodyClassName="flex flex-col items-center text-center w-full">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-foreground font-semibold mb-1">Call us</h3>
            <p className="text-muted-foreground text-xs mb-3">Direct line</p>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-lg text-foreground font-medium">+971 56 714 8469</p>
              <button onClick={() => handleCopy('phone', '+971567148469')} className="text-muted-foreground hover:text-primary transition-colors">
                {copiedField === 'phone' ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-muted-foreground text-xs">Available for urgent inquiries</p>
          </Card>
          <Card className="flex flex-col items-center text-center" bodyClassName="flex flex-col items-center text-center w-full">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-foreground font-semibold mb-1">Email us</h3>
            <p className="text-muted-foreground text-xs mb-3">Response within 4 hours</p>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-base text-foreground">info@nowhere.ai</p>
              <button onClick={() => handleCopy('email', 'info@nowhere.ai')} className="text-muted-foreground hover:text-primary transition-colors">
                {copiedField === 'email' ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-muted-foreground text-xs">For proposals & support</p>
          </Card>
          <Card className="flex flex-col items-center text-center" bodyClassName="flex flex-col items-center text-center w-full">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-foreground font-semibold mb-1">Visit us</h3>
            <p className="text-muted-foreground text-xs mb-3">By appointment</p>
            <p className="text-base text-foreground mb-3">Boulevard Tower, Downtown Dubai</p>
            <p className="text-muted-foreground text-xs">United Arab Emirates</p>
          </Card>
        </div>

        <div id="form" className="max-w-3xl mx-auto">
          <Card title="Send us a message" subtitle="Fill this in and our team will reach out — by email now, by WhatsApp once it's connected.">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground block">Name</label>
                  <input name="name" required type="text" placeholder="Your name" className="w-full bg-background border border-input rounded-lg focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground block">Email</label>
                  <input name="email" required type="email" placeholder="you@company.com" className="w-full bg-background border border-input rounded-lg focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground block">Phone <span className="text-muted-foreground font-normal">(optional, for WhatsApp)</span></label>
                  <input name="phone" type="tel" placeholder="+971 5x xxx xxxx" className="w-full bg-background border border-input rounded-lg focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground block">Service</label>
                  <select name="service" className="w-full bg-background border border-input rounded-lg focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm outline-none transition-all">
                    <option>Web Development</option>
                    <option>AI Solutions</option>
                    <option>Digital Marketing</option>
                    <option>Mobile App</option>
                    <option>Lead Generation</option>
                    <option>Custom Project</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground block">Message</label>
                <textarea name="message" required rows={5} placeholder="Tell us about your business and what you need." className="w-full bg-background border border-input rounded-lg focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm outline-none resize-none transition-all" />
              </div>

              <button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground font-semibold rounded-lg py-3.5 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {submitting ? 'Sending…' : 'Send message'}
              </button>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp follow-up activates the moment a Twilio number is connected.
              </p>
            </form>
          </Card>
        </div>
      </section>
    </PageLayout>
  );
}