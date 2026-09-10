/**
 * errorMonitoring.ts
 *
 * Week 4: Thin adapter for error monitoring (Sentry or no-op).
 *
 * Keeps Sentry out of the main bundle when VITE_SENTRY_DSN is not configured.
 * Provides a stable API (`captureException`, `captureMessage`) that works
 * regardless of whether Sentry is installed.
 *
 * Usage:
 *   // In main.tsx — before createRoot:
 *   initErrorMonitoring();
 *
 *   // In error boundaries or catch blocks:
 *   captureException(error, { context: 'KundliPage' });
 *   captureMessage('User attempted unauthenticated export', 'warning');
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type SeverityLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

export interface CaptureContext {
  /** Human-readable label for where the error occurred */
  context?: string;
  /** Additional key-value pairs attached to the event */
  extra?: Record<string, unknown>;
  /** Tags for filtering in Sentry dashboard */
  tags?: Record<string, string>;
}

// ─── Internal state ───────────────────────────────────────────────────────────

let _initialized = false;
let _sentryCapture: ((err: unknown, ctx?: CaptureContext) => void) | null = null;
let _sentryMessage: ((msg: string, level?: SeverityLevel) => void) | null = null;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Initialize error monitoring.
 *
 * - If `VITE_SENTRY_DSN` is set AND `@sentry/browser` is installed,
 *   dynamically imports and initializes Sentry.
 * - Otherwise installs a console-based fallback — errors are never swallowed.
 *
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export async function initErrorMonitoring(): Promise<void> {
  if (_initialized) return;
  _initialized = true;

  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

  if (dsn && dsn.trim() !== '') {
    try {
      // Use an indirect import path so Vite's static analysis doesn't
      // resolve @sentry/browser at build time (it may not be installed).
      const sentryPkg = '@sentry/browser';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic optional dep
      const Sentry = await import(/* @vite-ignore */ sentryPkg).catch(() => null) as any;
      if (Sentry) {
        Sentry.init({
          dsn,
          environment: import.meta.env.MODE ?? 'development',
          release: (import.meta.env.VITE_APP_VERSION as string | undefined) ?? 'unknown',
          tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
          // Don't send errors for user-triggered navigation or rate limit rejections
          ignoreErrors: [
            /ResizeObserver loop limit exceeded/,
            /Rate limit reached/,
          ],
        });

        _sentryCapture = (err, ctx) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          Sentry.withScope((scope: { setTag: (k: string, v: string) => void; setExtra: (k: string, v: unknown) => void }) => {
            if (ctx?.context) scope.setTag('context', ctx.context);
            if (ctx?.extra) {
              Object.entries(ctx.extra).forEach(([k, v]) => scope.setExtra(k, v));
            }
            if (ctx?.tags) {
              Object.entries(ctx.tags).forEach(([k, v]) => scope.setTag(k, v));
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            Sentry.captureException(err);
          });
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        _sentryMessage = (msg, level = 'info') => Sentry.captureMessage(msg, level);

        console.info('[Vedic Rajkumar] Error monitoring initialized (Sentry).');
        return;
      }
    } catch {
      // Sentry unavailable — fall through to console fallback
    }
  }

  // No-op / console fallback
  installConsoleFallback();
}

/**
 * Capture an exception. Works whether Sentry is initialized or not.
 */
export function captureException(err: unknown, context?: CaptureContext): void {
  if (!_initialized) {
    // Called before initErrorMonitoring — install fallback on the fly
    installConsoleFallback();
  }

  if (_sentryCapture) {
    _sentryCapture(err, context);
  } else {
    const label = context?.context ? `[${context.context}]` : '';
    console.error(`[ErrorMonitoring]${label}`, err, context?.extra ?? '');
  }
}

/**
 * Capture a message with an optional severity level.
 */
export function captureMessage(message: string, level: SeverityLevel = 'info'): void {
  if (!_initialized) {
    installConsoleFallback();
  }

  if (_sentryMessage) {
    _sentryMessage(message, level);
  } else {
    const logFn =
      level === 'error' || level === 'fatal' ? console.error :
      level === 'warning' ? console.warn :
      console.info;
    logFn(`[ErrorMonitoring] ${message}`);
  }
}

/**
 * Returns true if error monitoring has been initialized.
 * Useful for testing.
 */
export function isMonitoringInitialized(): boolean {
  return _initialized;
}

/**
 * Reset internal state — for testing only.
 * @internal
 */
export function _resetForTesting(): void {
  _initialized = false;
  _sentryCapture = null;
  _sentryMessage = null;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function installConsoleFallback(): void {
  if (_sentryCapture) return; // already set
  _sentryCapture = (err, ctx) => {
    const label = ctx?.context ? `[${ctx.context}]` : '';
    console.error(`[ErrorMonitoring]${label}`, err, ctx?.extra ?? '');
  };
  _sentryMessage = (msg, level = 'info') => {
    const fn =
      level === 'error' || level === 'fatal' ? console.error :
      level === 'warning' ? console.warn :
      console.info;
    fn(`[ErrorMonitoring] ${msg}`);
  };
}
