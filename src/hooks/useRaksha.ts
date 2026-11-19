/**
 * useRaksha — React hook that runs the full N4→N9 Navratri pipeline.
 *
 * This is the production integration point: it fires the pipeline on mount
 * and whenever `birthDate` changes, and returns the validated result so
 * consuming components (HoroscopeCard, DashaPage) can render provenance-
 * grounded content rather than ungrounded template text.
 *
 * The hook is intentionally thin — it only manages async state.  All logic
 * lives in the pure N4–N9 services.
 */

import { useState, useEffect } from 'react';
import { runRaksha, type RakshaInput, type RakshaResult } from '@/services/navratri/n9Raksha';

export interface UseRakshaState {
  result: RakshaResult | null;
  loading: boolean;
  error: string | null;
}

export function useRaksha(input: RakshaInput | null): UseRakshaState {
  const [state, setState] = useState<UseRakshaState>({
    result: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!input) {
      setState({ result: null, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState({ result: null, loading: true, error: null });

    runRaksha(input)
      .then((result) => {
        if (!cancelled) setState({ result, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            result: null,
            loading: false,
            error: err instanceof Error ? err.message : 'Pipeline error',
          });
      });

    return () => { cancelled = true; };
  }, [
    input?.birthDate,
    input?.birthTime,
    input?.accurateMoonLongitude,
    input?.lang,
  ]);

  return state;
}
