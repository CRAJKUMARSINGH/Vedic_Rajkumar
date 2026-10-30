/**
 * update.ts — service worker update policy.
 *
 * THE PROBLEM: a SW is a client you deployed and cannot un-deploy. A user can sit
 * on a 3-week-old bundle indefinitely. If the API has moved on, that user sees
 * 500s and blames the product.
 *
 * POLICY (deliberate, not default):
 *   1. Do NOT call skipWaiting() blindly. A mid-session swap reloads the page under
 *      the user's fingers and loses an in-progress chart form.
 *   2. Update in the background. Apply on the NEXT navigation, or on idle.
 *   3. If the server says the client is below MIN_CLIENT_VERSION, escalate to a
 *      blocking prompt — but only after warning.
 *   4. Never force-reload with unsaved state. Guard with beforeunload.
 */
import { MIN_CLIENT_VERSION, APP_VERSION, compareVersions } from '@/lib/version';

const IDLE_APPLY_MS = 60_000;

let waiting: ServiceWorker | null = null;
let hasUnsavedWork = false;
let updatePromptShown = false;

export function markUnsavedWork(dirty: boolean): void { hasUnsavedWork = dirty; }

export function installUpdateFlow(): void {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.ready.then((reg) => {
    // A worker already waiting from a previous visit — apply now, it is safe:
    // the page is fresh.
    if (reg.waiting) waiting = reg.waiting;

    reg.addEventListener('updatefound', () => {
      const sw = reg.installing;
      if (!sw) return;
      sw.addEventListener('statechange', () => {
        if (sw.state === 'installed' && navigator.serviceWorker.controller) {
          waiting = sw;
          scheduleApply();
        }
      });
    });
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Only reload if we asked for it. Otherwise we fight the user.
    if (!reloading) return;
    window.location.reload();
  });

  // Check on visibility — a backgrounded tab is the cheapest place to discover
  // an update, and the safest place to apply one.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void checkForUpdate();
    else if (!hasUnsavedWork) scheduleApply(true);
  });

  // Cross-check the server's floor. This catches the case the SW flow cannot:
  // a client so old that no SW update will fix the API skew.
  void verifyClientFloor();
}

let reloading = false;

async function checkForUpdate(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.update();
  } catch { /* offline is fine */ }
}

function scheduleApply(immediate = false): void {
  if (!waiting) return;
  if (hasUnsavedWork && !immediate) {
    notify('Update ready — it will apply after you save.');
    return;
  }
  window.setTimeout(() => applyNow(), immediate ? 0 : IDLE_APPLY_MS);
}

export function applyNow(): void {
  if (!waiting) return;
  if (hasUnsavedWork && !confirm('An update is ready. Reload now? Unsaved changes will be lost.')) return;
  reloading = true;
  waiting.postMessage({ type: 'SKIP_WAITING' });
  waiting = null;
}

/**
 * If the server's minimum client version is above ours, the API may already have
 * broken for us. Escalate to a blocking prompt — this is the only case where an
 * update is mandatory.
 */
async function verifyClientFloor(): Promise<void> {
  if (compareVersions(APP_VERSION, MIN_CLIENT_VERSION) >= 0) return;
  if (updatePromptShown) return;
  updatePromptShown = true;
  // Give the user a moment to finish what they are doing.
  window.setTimeout(() => {
    if (hasUnsavedWork) { notify('Update required — save your chart first.'); return; }
    applyNow();
  }, 5_000);
}

function notify(message: string): void {
  document.dispatchEvent(new CustomEvent('app:update-available', { detail: { message } }));
}

/** Called by the API client when a 426 Upgrade Required comes back. */
export function onUpgradeRequired(serverMin: string): void {
  if (compareVersions(APP_VERSION, serverMin) < 0) {
    notify('This app version is too old for the server. Update to continue.');
    updatePromptShown = false;
    void verifyClientFloor();
  }
}
