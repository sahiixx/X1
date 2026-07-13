import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Card } from '@/components/Card';
import { ShoppingCart, Cloud, MapPin, Heart, Shield, Home as HomeIcon } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { StatCounter } from '@/components/StatCounter';
import { toast } from 'sonner';
import { deployTemplate } from '@/lib/api';

// TODO: wire to real backend — see src/lib/api.ts. The `templates` array below is
// static marketing content; eventually it should come from the backend, and
// handleDeploy() should POST to deploy the chosen template.
export default function Templates() {
  usePageTitle("Template Deployment");
  const [deployingId, setDeployingId] = useState<number | null>(null);

  const templates = [
    {
      id: 1,
      name: "E-commerce Business Template",
      tag: "Ecommerce",
      desc: "Complete automation for online retail businesses",
      icon: ShoppingCart,
      stats: "4 AI Agents / 6 Integrations"
    },
    {
      id: 2,
      name: "SaaS Business Template",
      tag: "Saas",
      desc: "Comprehensive automation for Software as a Service companies",
      icon: Cloud,
      stats: "4 AI Agents / 6 Integrations"
    },
    {
      id: 3,
      name: "Local Service Business Template",
      tag: "Local Service",
      desc: "Automation suite for local service providers and small businesses",
      icon: MapPin,
      stats: "4 AI Agents / 5 Integrations"
    },
    {
      id: 4,
      name: "Healthcare Practice Template",
      tag: "Healthcare",
      desc: "HIPAA-compliant automation for healthcare providers",
      icon: Heart,
      stats: "4 AI Agents / 5 Integrations"
    },
    {
      id: 5,
      name: "Fintech Business Template",
      tag: "Fintech",
      desc: "Secure automation for financial technology companies",
      icon: Shield,
      chips: ["compliance", "security", "customer trust", "analytics"]
    },
    {
      id: 6,
      name: "Real Estate Agency Template",
      tag: "Real Estate",
      desc: "Complete automation for real estate professionals",
      icon: HomeIcon,
      chips: ["lead nurturing", "property marketing", "client management", "scheduling"]
    }
  ];

  const handleDeploy = async (id: number) => {
    // TODO: wire to real backend — see src/lib/api.ts
    setDeployingId(id);
    try {
      await deployTemplate(id);
      toast.success("Deployment initiated", { description: "Template configuring — estimated 30min setup" });
    } catch (err) {
      toast.error("Deployment failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setDeployingId(null);
    }
  };

  return (
    <PageLayout>
      <section className="container mx-auto px-4 lg:px-8 py-12 flex flex-col items-center text-center">
        <div className="max-w-4xl flex flex-col items-center">
          <div className="inline-flex items-center gap-2 border border-border bg-secondary/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-8">
            <span>🏭</span>
            <span>Industry Blueprints</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
            Template Deployment
          </h1>

          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed mb-10">
            Pre-configured AI agent setups for rapid deployment across industries.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { value: <StatCounter end={7} />, label: "Available Templates" },
            { value: <StatCounter end={30} suffix="min" />, label: "Setup Time" },
            { value: <StatCounter end={98} suffix="%" />, label: "Success Rate" },
            { value: <StatCounter end={300} suffix="%" />, label: "ROI Improvement" }
          ].map((stat, i) => (
            <Card key={i} className="h-32" bodyClassName="flex h-full p-5">
              <div className="flex flex-col justify-center h-full text-center w-full">
                <span className="text-3xl font-bold text-primary">{stat.value}</span>
                <span className="text-muted-foreground text-sm mt-2">{stat.label}</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map(tpl => (
            <Card key={tpl.id} className="flex flex-col" bodyClassName="flex flex-col flex-1 p-5">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-secondary rounded-lg border border-border shrink-0">
                  <tpl.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2 leading-tight">{tpl.name}</h3>
                  <span className="bg-primary/10 text-primary border border-primary/30 text-xs font-medium px-2 py-1 rounded">
                    {tpl.tag}
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground text-sm mb-6 flex-1">
                {tpl.desc}
              </p>

              <div className="mb-8">
                {tpl.stats ? (
                  <div className="text-xs text-primary bg-primary/10 p-2 border border-primary/30 rounded-lg">
                    {tpl.stats}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tpl.chips?.map(chip => (
                      <span key={chip} className="text-xs px-2 py-1 bg-secondary border border-border text-muted-foreground rounded">
                        {chip}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-auto">
                <button
                  onClick={() => handleDeploy(tpl.id)}
                  disabled={deployingId === tpl.id}
                  className="bg-primary text-primary-foreground font-semibold rounded-lg py-2 text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deployingId === tpl.id ? "Deploying..." : "Deploy"}
                </button>
                <button className="border border-border bg-card hover:bg-secondary text-foreground rounded-lg py-2 text-sm font-semibold transition-colors">
                  Details
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}