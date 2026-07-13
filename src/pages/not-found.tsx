import { PageLayout } from '@/components/PageLayout';

export default function NotFound() {
  return (
    <PageLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center container mx-auto px-4">
        <p className="text-7xl md:text-8xl font-bold text-gradient mb-6">404</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
          Page Not Found
        </h1>
        <p className="text-muted-foreground max-w-md mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/" className="bg-brand text-primary-foreground rounded-lg px-6 py-3 font-semibold shadow-[0_0_0_1px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.6),0_8px_30px_-12px_hsl(var(--primary)/0.6)] transition-all">
          Back to home
        </a>
      </div>
    </PageLayout>
  );
}