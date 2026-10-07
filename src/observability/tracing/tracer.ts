import { trackEvent } from '../analytics/posthog';
import { getCorrelationId, newRequestId } from '../logging/correlation';

type Span = { name: string; start: number; end?: number; attrs: Record<string, unknown> };

export const startSpan = (name: string, attrs: Record<string, unknown> = {}) => {
  const span: Span = { name, start: performance.now(), attrs };
  return {
    end: (extra?: Record<string, unknown>) => {
      span.end = performance.now();
      Object.assign(span.attrs, extra);
      trackEvent('span', {
        name: span.name,
        duration_ms: Math.round(span.end - span.start),
        correlationId: getCorrelationId(),
        ...span.attrs,
      });
      return span;
    },
  };
};

/** Trace an async operation end-to-end (e.g. a chart calculation). */
export const withSpan = async <T>(
  name: string,
  fn: () => Promise<T>,
  attrs?: Record<string, unknown>,
): Promise<T> => {
  const requestId = newRequestId();
  const s = startSpan(name, { requestId, ...attrs });
  try {
    const result = await fn();
    s.end({ status: 'ok' });
    return result;
  } catch (err) {
    s.end({ status: 'error', error: (err as Error).message });
    throw err;
  }
};
