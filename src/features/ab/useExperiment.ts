import { useFlagsmith } from '../flags/provider';

export type ExperimentVariant = 'control' | 'treatment' | 'treatment-a' | 'treatment-b';

export interface ExperimentResult<T> {
  variant: ExperimentVariant;
  value: T;
  track: (event: string, metadata?: Record<string, unknown>) => void;
}

export const useExperiment = <T = string>(
  experimentKey: string,
  variants: Record<ExperimentVariant, T>
): ExperimentResult<T> => {
  const { getValue } = useFlagsmith();

  // Get assigned variant from Flagsmith
  const assignedVariant = getValue<ExperimentVariant>(experimentKey, 'control');

  // Get value for variant
  const value = variants[assignedVariant] ?? variants.control;

  // Track experiment event
  const track = (event: string, metadata?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', event, {
        experiment_id: experimentKey,
        variant: assignedVariant,
        ...metadata,
      });
    }
  };

  return {
    variant: assignedVariant,
    value,
    track,
  };
};
