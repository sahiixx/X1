import { PageLayout } from '@/components/PageLayout';
import { Card } from '@/components/Card';
import { motion } from 'framer-motion';
import { Brain, Phone, CheckCircle2 } from 'lucide-react';
import { Link } from 'wouter';
import { usePageTitle } from '@/hooks/usePageTitle';

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

export default function Services() {
  usePageTitle("Services Arsenal");

  return (
    <PageLayout>
      <section className="container mx-auto px-4 lg:px-8 py-12 flex flex-col items-center text-center">
        <motion.div initial="hidden" animate="visible" variants={staggerVariants} className="max-w-4xl flex flex-col items-center">
          <motion.div variants={childVariants} className="inline-flex items-center gap-2 border border-border bg-secondary px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-8">
            <span>🔧</span>
            <span>Comprehensive Service Portfolio</span>
          </motion.div>

          <motion.h1 variants={childVariants} className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Comprehensive Arsenal
          </motion.h1>

          <motion.div variants={childVariants} className="text-primary text-sm md:text-base font-semibold mb-6">
            Web Development · Lead Generation · AI Agents · UAE Market Dominance
          </motion.div>

          <motion.p variants={childVariants} className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
            Full-spectrum digital solutions designed for the modern business landscape.
          </motion.p>

          <motion.div variants={childVariants} className="flex flex-col sm:flex-row gap-4">
            <Link href="/ai-solver" className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold rounded-lg px-6 py-3 hover:bg-primary/90 transition-colors">
              <Brain className="w-5 h-5" />
              Get Service Recommendations
            </Link>
            <Link href="/contact" className="flex items-center justify-center gap-2 border border-border bg-card hover:bg-secondary text-foreground rounded-lg px-6 py-3 transition-colors">
              <Phone className="w-5 h-5" />
              Discuss Project
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 py-20 relative">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Core Services
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">Comprehensive digital solutions tailored for your success.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[
            {
              tag: "AI-Powered Automation",
              title: "AI Business Automation Suite",
              desc: "Complete AI-driven business automation with custom AI agents, workflow optimization, and intelligent decision-making systems",
              bullets: [
                "Custom AI Agent Development",
                "Automated Workflow Creation",
                "Intelligent Document Processing"
              ]
            },
            {
              tag: "Complete Digital Ecosystem",
              title: "360° Digital Transformation Suite",
              desc: "Complete digital ecosystem including custom web/app development, cloud infrastructure, cybersecurity, and digital operations management",
              bullets: [
                "Custom Web & Mobile Development",
                "Cloud Infrastructure Setup",
                "Cybersecurity Implementation"
              ]
            },
            {
              tag: "Advanced Marketing Intelligence",
              title: "AI-Powered Marketing Intelligence Platform",
              desc: "Advanced marketing automation with AI-driven insights, omnichannel campaigns, and predictive customer behavior analysis",
              bullets: [
                "AI-Driven Customer Segmentation",
                "Predictive Marketing Analytics",
                "Omnichannel Campaign Management"
              ]
            }
          ].map((service, i) => (
            <Card key={i} className="flex flex-col" bodyClassName="flex flex-col">
              <div className="text-primary text-xs font-semibold mb-4">{service.tag}</div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">{service.title}</h3>
              <p className="text-muted-foreground text-sm mb-8 flex-1 leading-relaxed">{service.desc}</p>

              <div className="space-y-3 mb-8">
                {service.bullets.map((bullet, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{bullet}</span>
                  </div>
                ))}
              </div>

              <Link href="/contact" className="mt-auto block w-full py-3 text-center border border-border rounded-lg text-sm text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-semibold">
                Initiate Service Module
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}