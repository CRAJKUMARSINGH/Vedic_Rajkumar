/**
 * Week 0: Application Entry Point
 * Initializes the React app with all required providers and global setup
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ─── Global error handler (before React mounts) ───────────────────────────────
window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
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
