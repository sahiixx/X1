import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Card — the clean SaaS surface primitive. Replaces the old cyberpunk
 * TerminalWindow. Rounded, subtle border, optional title row (no mac-dot
 * chrome, no `>_` prefix). Used across all pages.
 */
export function Card({
  title,
  subtitle,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col h-full rounded-xl border border-border bg-card text-card-foreground border-hairline transition-colors',
        className,
      )}
    >
      {(title || subtitle) && (
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className={cn('p-5 flex-1 text-sm', bodyClassName)}>{children}</div>
    </div>
  );
}