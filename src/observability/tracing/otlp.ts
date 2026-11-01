/**
 * otlp.ts — real OTLP/HTTP span exporter, batched.
 *
 * Before this, tracer.ts produced spans nobody could read. If VITE_OTLP_ENDPOINT
 * is unset, spans are dropped after one warning — never silently half-sent.
 */
import { env } from '@/config/env';

export interface Span {
  traceId: string;
  spanId: string;
  name: string;
  startMs: number;
  durationMs: number;
  status: 'ok' | 'error';
  attributes?: Record<string, string | number | boolean>;
}

const ENDPOINT = (import.meta.env.VITE_OTLP_ENDPOINT as string | undefined) ?? '';
const MAX_BATCH = 25;
const FLUSH_MS = 5_000;

let buffer: Span[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let warned = false;

function toOtlp(span: Span) {
  return {
    traceId: span.traceId,
    spanId: span.spanId,
    name: span.name,
    kind: 3,
    startTimeUnixNano: String(span.startMs * 1e6),
    endTimeUnixNano: String((span.startMs + span.durationMs) * 1e6),
    attributes: Object.entries(span.attributes ?? {}).map(([k, v]) => ({
      key: k,
      value: typeof v === 'number' ? { intValue: v } : typeof v === 'boolean' ? { boolValue: v } : { stringValue: String(v) },
    })),
    status: { code: span.status === 'error' ? 2 : 1 },
  };
}

export function recordSpan(span: Span): void {
  if (!ENDPOINT) {
    if (!warned) {
      console.warn('[otlp] VITE_OTLP_ENDPOINT unset — spans dropped');
      warned = true;
    }
    return;
  }
  buffer.push(span);
  if (buffer.length >= MAX_BATCH) return void flush();
  timer ??= setTimeout(() => void flush(), FLUSH_MS);
}

export async function flush(): Promise<void> {
  if (timer) { clearTimeout(timer); timer = null; }
  if (!buffer.length) return;
  const batch = buffer;
  buffer = [];

  const body = JSON.stringify({
    resourceSpans: [{
      resource: { attributes: [{ key: 'service.name', value: { stringValue: 'vedic-rajkumar' } },
                               { key: 'service.version', value: { stringValue: env.VITE_RELEASE_VERSION } }] },
      scopeSpans: [{ scope: { name: 'vr-client' }, spans: batch.map(toOtlp) }],
    }],
  });

  try {
    await fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true });
  } catch {
    /* tracing is best-effort */
  }
}
