/**
 * src/workers/ephemeris.worker.ts
 * Web Worker for heavy ephemeris calculations — Phase 5 (Performance & Scaling)
 *
 * Offloads CPU-intensive planetary position calculations off the main thread
 * so the UI stays responsive during chart generation.
 *
 * Usage (from main thread):
 *   import { calcWorker } from '@/workers/ephemerisWorkerClient';
 *   const result = await calcWorker.calculate({ dateStr, timeStr });
 */

import {
  calculateCompletePlanetaryPositions,
  calculateAyanamsa,
  calculateJulianDay,
} from '@/services/ephemerisService';

export type WorkerRequest =
  | { type: 'CALC_PLANETS';  id: string; dateStr: string; timeStr: string }
  | { type: 'CALC_AYANAMSA'; id: string; year: number }
  | { type: 'CALC_JD';       id: string; dateStr: string; timeStr: string };

export type WorkerResponse =
  | { type: 'RESULT'; id: string; data: unknown }
  | { type: 'ERROR';  id: string; message: string };

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const req = event.data;

  try {
    let data: unknown;

    switch (req.type) {
      case 'CALC_PLANETS':
        data = calculateCompletePlanetaryPositions(req.dateStr, req.timeStr);
        break;

      case 'CALC_AYANAMSA':
        data = calculateAyanamsa(req.year);
        break;

      case 'CALC_JD':
        data = calculateJulianDay(req.dateStr, req.timeStr);
        break;

      default:
        throw new Error(`Unknown worker request type`);
    }

    const response: WorkerResponse = { type: 'RESULT', id: req.id, data };
    self.postMessage(response);

  } catch (err) {
    const response: WorkerResponse = {
      type: 'ERROR',
      id: req.id,
      message: err instanceof Error ? err.message : String(err),
    };
    self.postMessage(response);
  }
};
