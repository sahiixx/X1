import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Card } from '@/components/Card';
import { Search, Grid, List, Puzzle, Download, Tag, Star, Database, Mail, BarChart, MessageCircle, FileText, Calendar, Target, Shield, Mic, FileBarChart, Zap, Check } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toast } from 'sonner';
import { installPlugin } from '@/lib/api';

// TODO: wire to real backend — see src/lib/api.ts. The PLUGINS array below is
// static marketplace content; eventually it should come from the backend, and
// handleInstall() should POST to record the installation.
const PLUGINS = [
  { id:1, name:"CRM Connector", category:"Sales", desc:"Seamlessly sync AI agents with Salesforce, HubSpot, and Pipedrive.", rating:4.8, installs:2341, featured:true, icon:Database },
  { id:2, name:"Email Automator", category:"Marketing", desc:"AI-driven email sequences with smart personalization and A/B testing.", rating:4.9, installs:5102, featured:true, icon:Mail },
  { id:3, name:"Analytics Pulse", category:"Analytics", desc:"Real-time dashboards pulling from GA4, Meta Ads, and TikTok Ads.", rating:4.7, installs:1893, featured:true, icon:BarChart },
  { id:4, name:"SEO Sentinel", category:"Marketing", desc:"Automated SEO audits, rank tracking, and content gap analysis.", rating:4.6, installs:988, featured:false, icon:Search },
  { id:5, name:"WhatsApp Bridge", category:"Sales", desc:"Connect AI sales agents to WhatsApp Business for instant lead response.", rating:4.9, installs:3210, featured:true, icon:MessageCircle },
  { id:6, name:"Invoice Bot", category:"Finance", desc:"Auto-generate and send invoices from completed agent tasks.", rating:4.5, installs:654, featured:false, icon:FileText },
  { id:7, name:"Social Scheduler", category:"Marketing", desc:"Schedule AI-generated posts across Instagram, LinkedIn, and X.", rating:4.7, installs:2109, featured:false, icon:Calendar },
  { id:8, name:"Lead Scraper Pro", category:"Sales", desc:"Extract verified B2B leads from LinkedIn and target websites.", rating:4.4, installs:1456, featured:false, icon:Target },
  { id:9, name:"Anomaly Guard", category:"Analytics", desc:"ML-based anomaly detection across all connected data streams.", rating:4.8, installs:721, featured:true, icon:Shield },
  { id:10, name:"Voice Transcriber", category:"AI Tools", desc:"Transcribe and summarise sales calls with speaker separation.", rating:4.6, installs:842, featured:false, icon:Mic },
  { id:11, name:"Report Builder", category:"Analytics", desc:"Auto-generate branded PDF reports from any connected data source.", rating:4.5, installs:1123, featured:false, icon:FileBarChart },
  { id:12, name:"Zapier Gateway", category:"Integrations", desc:"Connect 5000+ apps to your AI agents via Zapier webhooks.", rating:4.9, installs:4788, featured:true, icon:Zap }
];

const CATEGORIES = ["All Categories", "Sales", "Marketing", "Analytics", "Finance", "AI Tools", "Integrations"];

export default function Plugins() {
  usePageTitle("Plugin Marketplace");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [installed, setInstalled] = useState<Set<number>>(new Set());
  const [installingId, setInstallingId] = useState<number | null>(null);

  const handleInstall = async (id: number) => {
    if (installed.has(id) || installingId !== null) return;
    // TODO: wire to real backend — see src/lib/api.ts
    setInstallingId(id);
    try {
      await installPlugin(id);
      setInstalled(new Set([...installed, id]));
      toast.success("Plugin installed", { description: "Plugin activated for all AI agents" });
    } catch (err) {
      toast.error("Install failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setInstallingId(null);
    }
  };

  const filteredPlugins = PLUGINS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All Categories" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const featuredCount = PLUGINS.filter(p => p.featured).length;

  return (
    <PageLayout>
      <section className="container mx-auto px-4 lg:px-8 py-12 flex flex-col items-center text-center">
        <div className="max-w-4xl flex flex-col items-center">
          <div className="inline-flex items-center gap-2 border border-border bg-secondary/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-8">
            <span>🔌</span>
            <span>Plugin Marketplace</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
            Extend your platform
          </h1>

          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed mb-10">
            Discover and install plugins to enhance your AI agent capabilities.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { value: PLUGINS.length.toString(), label: "Available Plugins", icon: Puzzle },
            { value: installed.size.toString(), label: "Installed", icon: Download },
            { value: (CATEGORIES.length - 1).toString(), label: "Categories", icon: Tag },
            { value: featuredCount.toString(), label: "Featured", icon: Star }
          ].map((stat, i) => (
            <Card key={i} className="h-32" bodyClassName="flex h-full p-5">
              <div className="flex justify-between items-start w-full">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-primary">{stat.value}</span>
                  <span className="text-muted-foreground text-sm mt-2">{stat.label}</span>
                </div>
                <stat.icon className="w-6 h-6 text-primary opacity-70" />
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-between bg-card p-4 border border-border rounded-lg">
          <div className="flex flex-1 w-full gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plugins..."
                className="w-full bg-background border border-input rounded-lg focus:ring-1 focus:ring-primary pl-10 pr-4 py-2 text-sm text-foreground outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-background border border-input rounded-lg focus:ring-1 focus:ring-primary px-3 py-2 text-sm text-foreground outline-none hidden md:block"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-4 w-full md:w-auto items-center justify-between md:justify-end">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg border ${viewMode === 'grid' ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:text-primary hover:border-primary'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg border ${viewMode === 'list' ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:text-primary hover:border-primary'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button className="border border-border bg-card hover:bg-secondary text-foreground rounded-lg px-4 py-2 text-sm font-semibold transition-colors">
              + Create Plugin
            </button>
          </div>
        </div>

        <div className={`mb-16 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}`}>
          {filteredPlugins.map(plugin => {
            const isInstalled = installed.has(plugin.id);

            if (viewMode === 'grid') {
              return (
                <Card key={plugin.id} className="flex flex-col" bodyClassName="flex flex-col flex-1 p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-secondary rounded-lg border border-border shrink-0">
                      <plugin.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1 leading-tight">{plugin.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 border border-border bg-secondary text-muted-foreground rounded">
                          {plugin.category}
                        </span>
                        {plugin.featured && (
                          <span className="bg-primary/10 text-primary text-xs font-semibold px-1.5 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-6 flex-1">
                    {plugin.desc}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {plugin.rating}</span>
                    <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {plugin.installs.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => handleInstall(plugin.id)}
                    disabled={isInstalled || installingId === plugin.id}
                    className={`w-full py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 ${
                      isInstalled
                        ? 'border border-primary text-primary bg-primary/10 cursor-default'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
                    }`}
                  >
                    {isInstalled ? <><Check className="w-4 h-4" /> Installed</> : installingId === plugin.id ? 'Installing...' : 'Install Plugin'}
                  </button>
                </Card>
              );
            }

            return (
              <Card key={plugin.id} bodyClassName="p-5">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="p-3 bg-secondary rounded-lg border border-border shrink-0 hidden md:block">
                    <plugin.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-lg font-bold text-foreground leading-tight">{plugin.name}</h3>
                      <span className="text-xs px-2 py-0.5 border border-border bg-secondary text-muted-foreground rounded">
                        {plugin.category}
                      </span>
                      {plugin.featured && (
                        <span className="bg-primary/10 text-primary text-xs font-semibold px-1.5 py-0.5 rounded">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">{plugin.desc}</p>
                  </div>
                  <div className="flex items-center gap-6 w-full md:w-auto mt-4 md:mt-0 justify-between md:justify-end">
                    <div className="flex md:flex-col gap-4 md:gap-1 text-xs text-muted-foreground text-right">
                      <span className="flex items-center gap-1 justify-end"><Star className="w-3 h-3" /> {plugin.rating}</span>
                      <span className="flex items-center gap-1 justify-end"><Download className="w-3 h-3" /> {plugin.installs.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => handleInstall(plugin.id)}
                      disabled={isInstalled || installingId === plugin.id}
                      className={`px-6 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 min-w-[140px] ${
                        isInstalled
                          ? 'border border-primary text-primary bg-primary/10 cursor-default'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
                      }`}
                    >
                      {isInstalled ? <><Check className="w-4 h-4" /> Installed</> : installingId === plugin.id ? 'Installing...' : 'Install'}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}

          {filteredPlugins.length === 0 && (
            <div className="col-span-full border border-border bg-card p-12 rounded-lg text-center text-muted-foreground">
              <p>No plugins found matching your search criteria.</p>
            </div>
          )}
        </div>

        <Card title="Plugin Development Kit (PDK) v2.0" subtitle="Create custom plugins to extend your AI agent platform" className="min-h-[300px]" bodyClassName="space-y-4 p-5">
          <ul className="space-y-3 text-muted-foreground">
            <li>· Support for custom agent capabilities and integrations</li>
            <li>· Plugin marketplace submission and distribution</li>
            <li>· White-label and reseller plugin licensing available</li>
          </ul>
          <div className="mt-8 pt-6 border-t border-border">
            <span className="text-muted-foreground mr-2">Get started:</span>
            <a href="#" className="text-primary underline hover:text-primary/80 transition-colors">Create Plugin Template</a>
          </div>
        </Card>
      </section>
    </PageLayout>
  );
}