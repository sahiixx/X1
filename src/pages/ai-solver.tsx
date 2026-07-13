import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Card } from '@/components/Card';
import { motion } from 'framer-motion';
import { Search, BarChart3, Zap, Grid, Briefcase } from 'lucide-react';
import { Link } from 'wouter';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toast } from 'sonner';
import { analyzeProblem } from '@/lib/api';

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

export default function AiSolver() {
  usePageTitle("AI PROBLEM SOLVER");
  const [challenge, setChallenge] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState("");

  const handleAnalyze = async () => {
    if (!challenge.trim()) return;
    setAnalyzing(true);
    setResult("");
    toast("Analyzing...", { description: "AI processing your business challenge" });

    try {
      const analysis = await analyzeProblem(challenge);
      setResult(analysis);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      toast.error("Analysis failed", { description: msg });
      setResult(`ERROR: ${msg}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const isDemo =
    /couldn't generate|couldn't analyze/i.test(result);

  return (
    <PageLayout>
      <section className="container mx-auto px-4 lg:px-8 py-12 flex flex-col items-center text-center">
        <motion.div initial="hidden" animate="visible" variants={staggerVariants} className="max-w-4xl flex flex-col items-center">
          <motion.div variants={childVariants} className="inline-flex items-center gap-2 border border-border bg-secondary/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-8">
            <span>🤖</span>
            <span>AI-powered business analysis</span>
          </motion.div>

          <motion.h1 variants={childVariants} className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
            <span className="block">Intelligent</span>
            <span className="block text-primary">Problem Solver</span>
          </motion.h1>

          <motion.p variants={childVariants} className="text-muted-foreground text-lg md:text-xl max-w-3xl leading-relaxed mb-10">
            Describe your business challenge, and our advanced AI will analyze your situation, provide market insights, and recommend the perfect combination of services for maximum ROI.
          </motion.p>

          <motion.div variants={childVariants} className="flex flex-col sm:flex-row gap-4">
            <Link href="/platform" className="flex items-center justify-center gap-2 border border-border glass text-foreground hover:border-primary/40 px-6 py-3 rounded-lg transition-colors">
              <Grid className="w-5 h-5" />
              View platform overview
            </Link>
            <Link href="/services" className="flex items-center justify-center gap-2 border border-border glass text-foreground hover:border-primary/40 px-6 py-3 rounded-lg transition-colors">
              <Briefcase className="w-5 h-5" />
              Browse services
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[
            { title: "Intelligent analysis", icon: Search, desc: "Advanced AI algorithms analyze your business challenges and market position." },
            { title: "Market insights", icon: BarChart3, desc: "Real-time market analysis and industry-specific trends for your sector." },
            { title: "Strategic solutions", icon: Zap, desc: "Customized recommendations with ROI projections and implementation timelines." }
          ].map((item, i) => (
            <Card key={i} title={`Capability 0${i+1}`} className="p-0">
              <item.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Intelligent solution engine
            </h2>
            <p className="text-muted-foreground">Instantly analyze your business needs and generate a custom technical blueprint.</p>
          </div>

          <Card title="Solver interface" subtitle="Describe your business challenge for an AI-generated analysis">
            <div className="space-y-4">
              <label className="text-xs text-muted-foreground block">Input business challenge</label>
              <textarea
                rows={6}
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                placeholder="Describe your business challenge... Our AI will analyze and recommend the perfect combination of services, timeline, and budget."
                className="w-full bg-background border border-input rounded-lg focus:border-primary focus:ring-1 focus:ring-primary p-4 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none"
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{challenge.length} / 1000 characters</span>
                {analyzing && <span className="text-primary animate-pulse">Processing data...</span>}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={analyzing || !challenge.trim()}
                className="w-full bg-primary text-primary-foreground font-semibold rounded-lg py-4 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed mt-4 transition-all"
              >
                {analyzing ? "Analyzing..." : "Analyze now"}
              </button>

              {result && (
                <div className="mt-6 space-y-2">
                  <div className="bg-secondary border border-border rounded-lg p-4 font-mono whitespace-pre-wrap text-sm text-foreground">
                    {result}
                  </div>
                  {isDemo && (
                    <p className="text-xs text-muted-foreground">
                      Demo output — add an AI key for full analysis.
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>
    </PageLayout>
  );
}