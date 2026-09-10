/**
 * ChartLoadingState.tsx
 *
 * Week 5: Standardized loading state for chart calculation pages.
 *
 * Replaces ad-hoc inline spinners across Kundli, Prashna, and other
 * core feature pages. Wraps PageLoadingOverlay from loading-skeleton.tsx
 * with an accessible role="status" region.
 *
 * Usage:
 *   {isLoading && <ChartLoadingState message="Calculating your chart..." />}
 */

import React from 'react';
import { PageLoadingOverlay } from '@/components/ui/loading-skeleton';

interface ChartLoadingStateProps {
  /** Message shown below the animated OM symbol. Default: 'Calculating…' */
  message?: string;
  /** Additional className for the wrapper. */
  className?: string;
}

const ChartLoadingState: React.FC<ChartLoadingStateProps> = ({
  message = 'Calculating…',
  className,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={className}
    >
      <PageLoadingOverlay message={message} />
    </div>
  );
};

export default ChartLoadingState;
