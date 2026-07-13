import { ReactNode, useState, useEffect } from 'react';
import { Navbar, navLinks, linkToRoute } from './Navbar';
import { Sparkles, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

export function PageLayout({ children }: { children: ReactNode }) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const col1Links = navLinks.slice(0, 5);
  const col2Links = navLinks.slice(5);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-16">{children}</main>

      <footer className="border-t border-border bg-secondary/40">
        <div className="container mx-auto px-4 lg:px-8 py-14">
          <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-12">
            <div className="flex flex-col gap-3 max-w-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand text-primary-foreground">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-semibold text-lg tracking-tight">NOWHERE.ai</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Dubai's AI-powered marketing agency. Real agents, real automation, real results.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-12 sm:gap-20 text-sm">
              <div className="flex flex-col gap-2.5">
                {col1Links.map((link) => (
                  <Link
                    key={link}
                    href={linkToRoute(link)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-2.5">
                {col2Links.map((link) => (
                  <Link
                    key={link}
                    href={linkToRoute(link)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link}
                  </Link>
                ))}
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>© {new Date().getFullYear()} NOWHERE.ai — Dubai, UAE</div>
            <div>Built for real businesses.</div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="fixed bottom-8 right-8 z-50 p-3 rounded-lg glass border border-border text-foreground hover:border-primary/50 transition-colors"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}