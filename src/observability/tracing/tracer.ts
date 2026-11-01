import { trackEvent } from '../analytics/posthog';
import { getCorrelationId, newRequestId } from '../logging/correlation';
import { recordSpan } from './otlp';

type Span = { name: string; start: number; end?: number; attrs: Record<string, unknown> };

export const startSpan = (name: string, attrs: Record<string, unknown> = {}) => {
  const span: Span = { name, start: performance.now(), attrs };
  return {
    end: (extra?: Record<string, unknown>) => {
      span.end = performance.now();
      Object.assign(span.attrs, extra);
      const durationMs = Math.round(span.end - span.start);
      trackEvent('span', {
        name: span.name,
        duration_ms: durationMs,
        correlationId: getCorrelationId(),
        ...span.attrs,
      });
      // Also ship as a real OTLP span when an endpoint is configured.
      const attributes: Record<string, string | number | boolean> = {};
      for (const [k, v] of Object.entries(span.attrs)) {
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') attributes[k] = v;
      }
      recordSpan({
        traceId: getCorrelationId() || 'no-trace',
        spanId: `${Math.round(span.start)}-${span.name}`,
        name: span.name,
        startMs: Math.round(span.start),
        durationMs,
        status: span.attrs.status === 'error' ? 'error' : 'ok',
        attributes,
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
