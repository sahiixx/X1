import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Full link list (used by the footer). Title-cased; linkToRoute maps to routes.
export const navLinks = [
  'Home',
  'Platform',
  'Services',
  'AI Solver',
  'Agents',
  'Plugins',
  'Templates',
  'Insights',
  'About',
  'Contact',
];

// Curated primary nav (navbar). Fewer, cleaner.
export const mainNav = ['Platform', 'Services', 'AI Solver', 'Pricing'];

export const linkToRoute = (link: string) => {
  if (link === 'Home') return '/';
  return '/' + link.toLowerCase().replace(/[\s_]+/g, '-');
};

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 w-full z-[60] transition-all duration-300 border-b',
          scrolled
            ? 'bg-background/85 backdrop-blur-md border-border shadow-sm py-3'
            : 'bg-background border-transparent py-4',
        )}
      >
        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 z-[70]">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand text-primary-foreground shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-foreground">NOWHERE.ai</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm">
            {mainNav.map((link) => {
              const route = linkToRoute(link);
              const isActive = location === route;
              return (
                <Link
                  key={link}
                  href={route}
                  className={cn(
                    'transition-colors font-medium',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {link}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="hidden sm:inline-flex items-center text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-lg transition-colors"
            >
              Get started
            </Link>
            <button
              className="md:hidden text-foreground z-[70] relative p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background flex flex-col pt-24 px-6 overflow-y-auto md:hidden"
          >
            <nav className="flex flex-col gap-1 mt-4">
              {mainNav.map((link) => {
                const route = linkToRoute(link);
                const isActive = location === route;
                return (
                  <Link
                    key={link}
                    href={route}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'text-2xl font-semibold py-3 border-b border-border transition-colors',
                      isActive ? 'text-primary' : 'text-foreground',
                    )}
                  >
                    {link}
                  </Link>
                );
              })}
              <Link
                href="/agents"
                onClick={() => setMenuOpen(false)}
                className="text-2xl font-semibold py-3 border-b border-border text-foreground"
              >
                Agents
              </Link>
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="text-2xl font-semibold py-3 border-b border-border text-foreground"
              >
                Contact
              </Link>
            </nav>
            <div className="mt-auto pt-8 flex flex-col gap-3 pb-8">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="text-center text-sm font-medium border border-border text-foreground px-4 py-3 rounded-lg"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="text-center text-sm font-semibold bg-foreground text-background px-4 py-3 rounded-lg"
              >
                Get started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}