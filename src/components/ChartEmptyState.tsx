/**
 * ChartEmptyState.tsx
 *
 * Week 5: Standardized empty state for chart pages before first calculation.
 *
 * Uses the Empty component primitives from ui/empty.tsx — unifying the
 * previously unused Empty/EmptyHeader/EmptyTitle/EmptyDescription components.
 *
 * Usage:
 *   {!result && !isLoading && (
 *     <ChartEmptyState
 *       icon={<Star className="h-8 w-8 text-amber-600" />}
 *       title="Enter birth details"
 *       description="Fill in the form above and click Calculate to generate your chart."
 *     />
 *   )}
 */

import React from 'react';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';

interface ChartEmptyStateProps {
  /** Icon element to display (e.g. a Lucide icon). */
  icon?: React.ReactNode;
  /** Main heading. */
  title: string;
  /** Explanatory text below the title. */
  description?: string;
  /** Optional action button or element below the description. */
  action?: React.ReactNode;
  /** Additional className for the wrapper. */
  className?: string;
}

const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <Empty
      className={className}
      aria-label={title}
    >
      <EmptyHeader>
        {icon && (
          <EmptyMedia
            variant="icon"
            className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
            aria-hidden="true"
          >
            {icon}
          </EmptyMedia>
        )}
        <EmptyTitle className="text-foreground">{title}</EmptyTitle>
        {description && (
          <EmptyDescription className="text-muted-foreground">
            {description}
          </EmptyDescription>
        )}
      </EmptyHeader>
      {action && (
        <div className="mt-2">{action}</div>
      )}
    </Empty>
  );
};

export default ChartEmptyState;
