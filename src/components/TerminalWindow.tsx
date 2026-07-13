import { cn } from '@/lib/utils';
import React from 'react';

/**
 * TerminalWindow — kept as a clean card primitive (same prop signature as
 * before: title / children / className) so existing pages render with the new
 * SaaS look without import churn. The `>_` prefix and mac traffic-light dots
 * are stripped. New code should prefer `Card`.
 */
export function TerminalWindow({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) {
  const cleanTitle = title.replace(/^>_\s*/, '').replace(/\.(exe|sh|log|txt|md)$/i, '');
  return (
    <div className={cn('flex flex-col h-full rounded-lg border border-border bg-card text-card-foreground shadow-sm overflow-hidden', className)}>
      {cleanTitle && (
        <div className="border-b border-border bg-secondary/50 px-4 py-2.5">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{cleanTitle}</div>
        </div>
      )}
      <div className="p-5 flex-1 relative overflow-hidden text-sm md:text-base">{children}</div>
    </div>
  );
}