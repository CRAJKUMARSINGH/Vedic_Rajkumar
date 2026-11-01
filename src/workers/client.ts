/**
 * client.ts — main-thread handle for the ephemeris worker.
 *
 * FALLBACK FIRST: if Worker construction fails (older browser, CSP, test env),
 * we compute on the main thread using the identical pure functions. The worker is
 * an optimisation, never a correctness dependency.
 */
import type { WorkerRequest, WorkerResponse } from './ephemeris.worker';
import {
  calculateCompletePlanetaryPositions,
  calculateAyanamsa,
  calculateJulianDay,
} from '@/services/ephemerisService';

type Pending = { resolve: (v: unknown) => void; reject: (e: Error) => void; timer: number };

/** Omit is not distributive, so keep the union discriminated per variant. */
type WithoutId<T> = T extends { id: string } ? Omit<T, 'id'> : never;
export type WorkerRequestInit = WithoutId<WorkerRequest>;

let worker: Worker | null = null;
let workerBroken = false;
const pending = new Map<string, Pending>();
const TIMEOUT_MS = 10_000;

function ensure(): Worker | null {
  if (worker || workerBroken) return worker;
  try {
    worker = new Worker(new URL('./ephemeris.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (ev: MessageEvent<WorkerResponse>) => {
      const p = pending.get(ev.data.id);
      if (!p) return;
      clearTimeout(p.timer);
      pending.delete(ev.data.id);
      if (ev.data.type === 'RESULT') p.resolve(ev.data.data);
      else p.reject(new Error(ev.data.message));
    };
    worker.onerror = () => {
      // A worker that dies mid-flight must not hang the UI.
      workerBroken = true;
      for (const [, p] of pending) { clearTimeout(p.timer); p.reject(new Error('worker_crashed')); }
      pending.clear();
    };
    return worker;
  } catch {
    workerBroken = true;
    return null;
  }
}

/** The identical computation, on the main thread — the worker is optional. */
function computeOnMainThread(req: WorkerRequestInit): unknown {
  switch (req.type) {
    case 'CALC_PLANETS': return calculateCompletePlanetaryPositions(req.dateStr, req.timeStr);
    case 'CALC_AYANAMSA': return calculateAyanamsa(req.year);
    case 'CALC_JD': return calculateJulianDay(req.dateStr, req.timeStr);
  }
}

export async function runInWorker<T>(req: WorkerRequestInit): Promise<T> {
  const w = ensure();

  if (!w) return computeOnMainThread(req) as T;

  const id = crypto.randomUUID();
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      pending.delete(id);
      reject(new Error('ephemeris_worker_timeout'));
    }, TIMEOUT_MS);
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject, timer });
    w.postMessage({ ...req, id } as WorkerRequest);
  });
}

/** Warm the worker so the first real chart does not pay construction cost. */
export function warmWorker(): void { void ensure(); }

export function workerStatus(): 'ready' | 'fallback' {
  return workerBroken || !worker ? 'fallback' : 'ready';
}
