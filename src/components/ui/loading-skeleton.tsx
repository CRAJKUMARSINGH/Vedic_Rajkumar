/**
 * LoadingSkeleton — Reusable animated loading placeholder.
 * Sourced from Code-Data-Shared/artifacts/vedic-rajkumar/src/components/ui/loading-skeleton.tsx
 * Incorporated into root per CODE-JUNCTION audit July 2026.
 */
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  rows?: number;
  /** Show as a card with header + rows */
  variant?: 'default' | 'card' | 'chart' | 'table';
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-muted/60',
        className
      )}
    />
  );
}

export function LoadingSkeleton({
  className,
  rows = 3,
  variant = 'default',
}: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-4 space-y-3', className)}>
        {/* Card header */}
        <div className="flex items-center gap-3">
          <SkeletonLine className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <SkeletonLine className="h-4 w-1/3" />
            <SkeletonLine className="h-3 w-1/2" />
          </div>
        </div>
        {/* Card body rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonLine key={i} className={`h-3 ${i === rows - 1 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-4 space-y-3', className)}>
        <SkeletonLine className="h-4 w-1/4 mb-4" />
        <div className="flex items-end gap-2 h-32">
          {[60, 80, 45, 90, 70, 55, 85, 40].map((h, i) => (
            <div
              key={i}
              className="flex-1 animate-pulse rounded-t bg-muted/60"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLine key={i} className="h-3 w-10" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}>
        {/* Table header */}
        <div className="flex gap-4 p-3 border-b border-border bg-muted/30">
          {[2, 3, 2, 2].map((w, i) => (
            <SkeletonLine key={i} className={`h-3 flex-${w}`} />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-4 p-3 border-b border-border/50 last:border-0">
            {[2, 3, 2, 2].map((w, colIdx) => (
              <SkeletonLine key={colIdx} className={`h-3 flex-${w}`} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Default — simple stacked lines
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLine
          key={i}
          className={`h-3 ${i === rows - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

/** Full-page loading overlay with spinning chakra */
export function PageLoadingOverlay({ message = 'Calculating...' }: { message?: string }) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-center">
      {/* Animated OM symbol */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin" />
        <div className="absolute inset-2 flex items-center justify-center text-amber-500 text-xl font-cinzel">
          ॐ
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default LoadingSkeleton;
