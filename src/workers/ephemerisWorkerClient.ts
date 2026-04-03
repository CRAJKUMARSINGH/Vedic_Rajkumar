/**
 * src/workers/ephemerisWorkerClient.ts
 * Main-thread client for the ephemeris Web Worker.
 *
 * Falls back to synchronous calculation if Workers are unavailable
 * (e.g., in test environments or older browsers).
 *
 * Usage:
 *   import { calcWorker } from '@/workers/ephemerisWorkerClient';
 *   const planets = await calcWorker.calcPlanets('1963-09-15', '06:00');
 */

import {
  calculateCompletePlanetaryPositions,
  calculateAyanamsa,
  calculateJulianDay,
} from '@/services/ephemerisService';
import type { WorkerRequest, WorkerResponse } from './ephemeris.worker';

// ── Pending promise map ───────────────────────────────────────────────────────

type Resolver = { resolve: (v: unknown) => void; reject: (e: Error) => void };
const pending = new Map<string, Resolver>();
let worker: Worker | null = null;
let idCounter = 0;

function getWorker(): Worker | null {
  if (worker) return worker;
  if (typeof Worker === 'undefined') return null;

  try {
    worker = new Worker(new URL('./ephemeris.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { id } = e.data;
      const p = pending.get(id);
      if (!p) return;
      pending.delete(id);
      if (e.data.type === 'RESULT') {
        p.resolve(e.data.data);
      } else {
        p.reject(new Error(e.data.message));
      }
    };
    worker.onerror = (e) => {
      // Reject all pending on fatal error
      pending.forEach(p => p.reject(new Error(e.message)));
      pending.clear();
      worker = null;
    };
    return worker;
  } catch {
    return null;
  }
}

function send<T>(req: Omit<WorkerRequest, 'id'>): Promise<T> {
  const id = `w${++idCounter}`;
  const w = getWorker();

  if (!w) {
    // Synchronous fallback
    try {
      let data: unknown;
      if (req.type === 'CALC_PLANETS') {
        data = calculateCompletePlanetaryPositions(req.dateStr, req.timeStr);
      } else if (req.type === 'CALC_AYANAMSA') {
        data = calculateAyanamsa(req.year);
      } else if (req.type === 'CALC_JD') {
        data = calculateJulianDay(req.dateStr, req.timeStr);
      }
      return Promise.resolve(data as T);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  return new Promise<T>((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
    w.postMessage({ ...req, id } as WorkerRequest);
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

export const calcWorker = {
  /** Calculate all 9 planetary positions (offloaded to worker) */
  calcPlanets: (dateStr: string, timeStr: string) =>
    send<ReturnType<typeof calculateCompletePlanetaryPositions>>({
      type: 'CALC_PLANETS', dateStr, timeStr,
    }),

  /** Calculate Lahiri ayanamsa for a year */
  calcAyanamsa: (year: number) =>
    send<number>({ type: 'CALC_AYANAMSA', year }),

  /** Calculate Julian Day */
  calcJD: (dateStr: string, timeStr: string) =>
    send<number>({ type: 'CALC_JD', dateStr, timeStr }),

  /** Terminate the worker (call on app unmount if needed) */
  terminate: () => {
    worker?.terminate();
    worker = null;
    pending.clear();
  },
};
