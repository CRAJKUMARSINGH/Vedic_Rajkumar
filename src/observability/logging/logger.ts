/**
 * logger.ts — Week 9 Observability
 * Structured client logger with PII redaction and warn+ shipping to ingest-logs.
 */

import { getCorrelationId, getRequestId } from './correlation';

export interface LogMeta {
  [key: string]: unknown;
}

const REDACT_KEYS = new Set([
  'password',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'email',
]);

const redact = (value: unknown, key?: string): unknown => {
  if (key && (REDACT_KEYS.has(key.toLowerCase()) || key.startsWith('birthData'))) {
    return '[REDACTED]';
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = redact(v, k);
    }
    return out;
  }
  return value;
};

const emit = (level: 'debug' | 'info' | 'warn' | 'error', message: string, extra?: LogMeta): void => {
  const payload = {
    level,
    message,
    service: 'vedic-rajkumar-web',
    env: import.meta.env.MODE,
    release: import.meta.env.VITE_RELEASE_VERSION ?? 'dev',
    correlationId: typeof sessionStorage === 'undefined' ? undefined : getCorrelationId(),
    requestId: typeof sessionStorage === 'undefined' ? undefined : getRequestId(),
    url: typeof location === 'undefined' ? undefined : location.href,
    ts: Date.now(),
    extra: extra ? (redact(extra) as LogMeta) : undefined,
  };

  const line = `[${level}] ${message}`;
  if (level === 'error') console.error(line, payload.extra ?? {});
  else if (level === 'warn') console.warn(line, payload.extra ?? {});
  else if (import.meta.env.DEV) console.info(line, payload.extra ?? {});

  if (level === 'warn' || level === 'error') {
    const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    if (base && typeof fetch === 'function') {
      fetch(`${base}/functions/v1/ingest-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  }
};

export const logger = {
  debug: (message: string, extra?: LogMeta) => emit('debug', message, extra),
  info: (message: string, extra?: LogMeta) => emit('info', message, extra),
  warn: (message: string, extra?: LogMeta) => emit('warn', message, extra),
  error: (message: string, extra?: LogMeta) => emit('error', message, extra),
};

export const createLogger = (module: string) => ({
  debug: (message: string, extra?: LogMeta) => logger.debug(message, { module, ...extra }),
  info: (message: string, extra?: LogMeta) => logger.info(message, { module, ...extra }),
  warn: (message: string, extra?: LogMeta) => logger.warn(message, { module, ...extra }),
  error: (message: string, extra?: LogMeta) => logger.error(message, { module, ...extra }),
});
