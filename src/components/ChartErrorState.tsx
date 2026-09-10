/**
 * ChartErrorState.tsx
 *
 * Week 5: Standardized error state for chart calculation pages.
 *
 * Replaces bare <p className="text-red-400"> patterns with a properly
 * accessible Alert component. Supports an optional retry callback.
 *
 * Usage:
 *   {error && (
 *     <ChartErrorState
 *       message={error}
 *       onRetry={() => setError(null)}
 *     />
 *   )}
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ChartErrorStateProps {
  /** The error message to display. */
  message: string;
  /** Optional callback to retry the failed operation. */
  onRetry?: () => void;
  /** Optional additional className. */
  className?: string;
}

const ChartErrorState: React.FC<ChartErrorStateProps> = ({
  message,
  onRetry,
  className,
}) => {
  return (
    <Alert
      variant="destructive"
      role="alert"
      className={className}
    >
      <AlertCircle className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>Calculation Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 mt-1">
        <span>{message}</span>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="self-start gap-1.5 h-8 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
            aria-label="Retry calculation"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ChartErrorState;
