import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation, Redirect } from 'wouter';
import Home from '@/pages/home';
import Platform from '@/pages/platform';
import Services from '@/pages/services';
import AiSolver from '@/pages/ai-solver';
import Agents from '@/pages/agents';
import Plugins from '@/pages/plugins';
import Templates from '@/pages/templates';
import Insights from '@/pages/insights';
import About from '@/pages/about';
import Contact from '@/pages/contact';
import Login from '@/pages/login';
import Signup from '@/pages/signup';
import Pricing from '@/pages/pricing';
import Dashboard from '@/pages/dashboard';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { ProtectedRoute } from '@/lib/auth';
import { useEffect } from 'react';

const queryClient = new QueryClient();

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  const wrap = (Page: React.ComponentType) => () => (
    <PageTransition>
      <Page />
    </PageTransition>
  );

  return (
    <AnimatePresence mode="wait">
      <Switch key={location}>
        <Route path="/" component={wrap(Home)} />
        <Route path="/platform" component={wrap(Platform)} />
        <Route path="/services" component={wrap(Services)} />
        <Route path="/ai-solver" component={wrap(AiSolver)} />
        <Route path="/agents" component={wrap(Agents)} />
        <Route path="/plugins" component={wrap(Plugins)} />
        <Route path="/templates" component={wrap(Templates)} />
        <Route path="/insights" component={wrap(Insights)} />
        <Route path="/about" component={wrap(About)} />
        <Route path="/contact" component={wrap(Contact)} />
        <Route path="/login" component={wrap(Login)} />
        <Route path="/signup" component={wrap(Signup)} />
        <Route path="/pricing" component={wrap(Pricing)} />
        <Route path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/home">
          <Redirect to="/" />
        </Route>
        <Route component={wrap(NotFound)} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster position="bottom-right" theme="dark" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;