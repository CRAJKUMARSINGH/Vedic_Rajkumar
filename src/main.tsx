/**
 * Application Entry Point
 * Initializes the React app with all required providers and global setup.
 *
 * Boot order:
 *  1. validateEnv()           — fail fast if required env vars are missing
 *  2. initErrorMonitoring()   — wire Sentry (or console fallback) before React mounts
 *  3. createRoot / render     — mount the React tree
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { validateEnv } from '@/lib/envConfig';
import { initErrorMonitoring, captureException } from '@/lib/errorMonitoring';

// ─── Step 1: Validate environment variables ───────────────────────────────────
// Throws in production if required vars are missing; warns in development.
validateEnv();

// ─── Step 2: Start error monitoring ──────────────────────────────────────────
// Non-blocking — resolves after Sentry is configured (or no-op if DSN absent).
initErrorMonitoring().catch((err) => {
  console.warn('[main.tsx] Error monitoring failed to initialize:', err);
});

// ─── Global error handler (before React mounts) ───────────────────────────────
// Forward to captureException so Sentry (or console fallback) captures these.
window.addEventListener('error', (event) => {
  captureException(event.error ?? new Error(event.message), {
    context: 'window.onerror',
    extra: { filename: event.filename, lineno: event.lineno, colno: event.colno },
  });
});

window.addEventListener('unhandledrejection', (event) => {
  captureException(event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
    context: 'unhandledrejection',
  });
});

// ─── Performance mark ─────────────────────────────────────────────────────────
if (typeof performance !== 'undefined') {
  performance.mark('app-init-start');
}

// ─── Mount ────────────────────────────────────────────────────────────────────
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('[main.tsx] Root element #root not found in DOM');
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// ─── Post-mount performance ───────────────────────────────────────────────────
if (typeof performance !== 'undefined') {
  performance.mark('app-init-end');
  performance.measure('app-init', 'app-init-start', 'app-init-end');
}
