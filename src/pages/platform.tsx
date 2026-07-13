import { PageLayout } from '@/components/PageLayout';
import { Card } from '@/components/Card';
import { motion } from 'framer-motion';
import { Brain, Grid, Zap, Star, Globe, Cpu, Network, Shield } from 'lucide-react';
import { Link } from 'wouter';
import { usePageTitle } from '@/hooks/usePageTitle';
import { StatCounter } from '@/components/StatCounter';
import { toast } from 'sonner';

const staggerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const childVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, duration: 0.45 }
};

export default function Platform() {
  usePageTitle("Ultimate Platform");

  const handleAnalyzeClick = () => {
    toast("Analyzing...", { description: "AI processing your business challenges" });
  };

  return (
    <PageLayout>
      <section className="container mx-auto px-4 lg:px-8 py-12 flex flex-col items-center text-center">
        <motion.div initial="hidden" animate="visible" variants={staggerVariants} className="max-w-4xl flex flex-col items-center">
          <motion.div variants={childVariants} className="inline-flex items-center gap-2 border border-border bg-secondary px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-8">
            <span>✨</span>
            <span>Ultimate Platform Overview</span>
          </motion.div>

          <motion.h1 variants={childVariants} className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
            The Ultimate Digital Platform
          </motion.h1>

          <motion.p variants={childVariants} className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
            Experience our comprehensive ecosystem of AI-powered digital services, real-time analytics, and cutting-edge technology solutions designed for the future.
          </motion.p>

          <motion.div variants={childVariants} className="flex flex-col sm:flex-row gap-4">
            <Link href="/ai-solver" onClick={handleAnalyzeClick} className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold rounded-lg px-6 py-3 hover:bg-primary/90 transition-colors">
              <Brain className="w-5 h-5" />
              Analyze My Business
            </Link>
            <Link href="/services" className="flex items-center justify-center gap-2 border border-border bg-card hover:bg-secondary text-foreground rounded-lg px-6 py-3 transition-colors">
              <Grid className="w-5 h-5" />
              View Services
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 py-20 relative">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Digital Supremacy Platform
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">Comprehensive AI-powered digital services ecosystem built for absolute market dominance and exponential scaling.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { value: <StatCounter end={1247583} />, label: "AI Interactions Today", icon: Brain },
            { value: <StatCounter end={45892} />, label: "Processes Automated", icon: Zap },
            { value: <StatCounter end={997} format="percent" suffix="%" />, label: "Client Satisfaction", icon: Star },
            { value: <StatCounter end={147} />, label: "Countries Served", icon: Globe }
          ].map((stat, i) => (
            <Card key={i} className="h-32" bodyClassName="flex flex-col justify-between">
              <div className="flex justify-between items-start h-full">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                  <span className="text-muted-foreground text-xs mt-2">{stat.label}</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Platform Architecture">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-foreground font-bold mb-2">Neural Computing Engine</h3>
                  <p className="text-muted-foreground text-sm">Advanced machine learning models processing millions of data points to optimize your digital presence in real-time.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-foreground font-bold mb-2">Omnichannel Integration</h3>
                  <p className="text-muted-foreground text-sm">Seamless connectivity across all digital touchpoints, ensuring a unified and powerful brand experience.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-foreground font-bold mb-2">Military-Grade Security</h3>
                  <p className="text-muted-foreground text-sm">Enterprise-level encryption and threat prevention securing your digital assets and customer data.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Deployment Status" subtitle="Live platform telemetry">
            <div className="space-y-3">
              <p className="text-muted-foreground">Initializing platform matrix...</p>
              <p className="text-foreground">Database clusters synced.</p>
              <p className="text-muted-foreground">Loading AI optimization models...</p>
              <p className="text-foreground">Neural nets actively learning.</p>
              <p className="text-muted-foreground">Establishing secure pathways...</p>
              <p className="text-foreground">All endpoints protected.</p>
              <p className="text-primary pt-4 border-t border-border mt-6 font-medium">Platform operating at 100% capacity</p>
              <p className="text-primary font-semibold">Ready for new project</p>
            </div>
          </Card>
        </div>
      </section>
    </PageLayout>
  );
}