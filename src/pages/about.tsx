import { PageLayout } from '@/components/PageLayout';
import { Card } from '@/components/Card';
import { motion } from 'framer-motion';
import { Brain, Phone } from 'lucide-react';
import { Link } from 'wouter';
import { usePageTitle } from '@/hooks/usePageTitle';
import { StatCounter } from '@/components/StatCounter';

const staggerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const childVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, duration: 0.45 }
};

export default function About() {
  usePageTitle("DIGITAL PIONEERS");

  return (
    <PageLayout>
      <section className="container mx-auto px-4 lg:px-8 py-12 flex flex-col items-center text-center">
        <motion.div initial="hidden" animate="visible" variants={staggerVariants} className="max-w-4xl flex flex-col items-center">
          <motion.div variants={childVariants} className="inline-flex items-center gap-2 border border-border bg-secondary/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-8">
            <span>🤖</span>
            <span>About nowhere.ai</span>
          </motion.div>

          <motion.h1 variants={childVariants} className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
            <span className="block">Digital pioneers</span>
            <span className="block text-primary">of the matrix</span>
          </motion.h1>

          <motion.p variants={childVariants} className="text-muted-foreground text-lg md:text-xl max-w-3xl leading-relaxed mb-10">
            We are the UAE's leading digital marketing agency, specializing in AI-powered solutions that transform businesses and dominate the digital landscape.
          </motion.p>

          <motion.div variants={childVariants} className="flex flex-col sm:flex-row gap-4">
            <Link href="/services" className="flex items-center justify-center gap-2 bg-brand text-primary-foreground font-semibold px-6 py-3 rounded-lg shadow-[0_0_0_1px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.6),0_8px_30px_-12px_hsl(var(--primary)/0.6)] transition-all">
              <Brain className="w-5 h-5" />
              Experience our AI
            </Link>
            <Link href="/contact" className="flex items-center justify-center gap-2 border border-border glass text-foreground hover:border-primary/40 px-6 py-3 rounded-lg transition-colors">
              <Phone className="w-5 h-5" />
              Join our mission
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <Card title="Mission statement" subtitle="What drives us">
            <div className="space-y-3">
              <p className="text-muted-foreground">Empower businesses with cutting-edge AI and digital solutions.</p>
              <p className="text-muted-foreground">Deliver measurable results that exceed expectations.</p>
              <p className="text-muted-foreground">Lead the digital transformation revolution in the UAE.</p>
              <p className="text-primary font-semibold mt-3">Status: Mission active.</p>
            </div>
          </Card>

          <Card title="Vision 2030" subtitle="Where we're headed">
            <div className="space-y-3">
              <p className="text-muted-foreground">Become the #1 AI-powered digital agency globally.</p>
              <p className="text-muted-foreground">Pioneer next-generation metaverse marketing solutions.</p>
              <p className="text-muted-foreground">Transform 10,000+ businesses by 2030.</p>
              <p className="text-primary font-semibold mt-3">Status: Vision loading...</p>
            </div>
          </Card>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            By the numbers
          </h2>
          <p className="text-muted-foreground">Proven track record of digital excellence</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: <StatCounter end={500} suffix="+" />, label: "Projects" },
            { value: <StatCounter end={200} suffix="+" />, label: "Clients" },
            { value: <StatCounter end={5} suffix="+" />, label: "Years" },
            { value: <StatCounter end={98} suffix="%" />, label: "Satisfaction" }
          ].map((stat, i) => (
            <div key={i} className="border border-border bg-card border-hairline rounded-xl p-8 flex flex-col items-center text-center hover:border-primary/40 transition-colors">
              <span className="text-4xl font-bold text-foreground mb-2">{stat.value}</span>
              <span className="text-muted-foreground text-sm">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}