// src/services/mtssService.ts

/**
 * Service wrapper for the MTSS (Marriage Timing, Spouse Characteristics, Spiritual Remedies) engine.
 * Provides a clean async interface for consumption from UI components or other services.
 */
import { computeMTSS, type JatakInput, type MTSSResult } from '@/lib/mtss/mtssEngine';

/**
 * Compute MTSS analysis for a given birth chart input.
 *
 * @param input - JatakInput containing birth details.
 * @param ayanamsa - Optional ayanamsa string (e.g., "Lahiri"). Defaults to Sidereal calculations used by the engine.
 * @returns A promise resolving to the MTSSResult.
 */
export async function computeMTSSService(
  input: JatakInput,
  ayanamsa?: string
): Promise<MTSSResult> {
  // The underlying engine is synchronous and fast, but we expose it as async
  // to keep the API consistent with other service wrappers.
  return computeMTSS(input, ayanamsa);
}

/**
 * Convenience helper to build a JatakInput from simple string/number parameters.
 * Used primarily in tests and UI forms.
 */
export function buildJatakInput(params: {
  name: string;
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  lat: number;
  lon: number;
  tz?: number;
  ampm?: 'AM' | 'PM';
}): JatakInput {
  const { name, day, month, year, hour, minute, lat, lon, tz, ampm } = params;
  // Convert to 24‑hour format if am/pm provided
  let hour24 = hour;
  if (ampm) {
    if (ampm === 'PM' && hour < 12) hour24 += 12;
    if (ampm === 'AM' && hour === 12) hour24 = 0;
  }
  return {
    id: `${name.replace(/\s+/g, '-').toLowerCase()}-${year}`,
    name,
    day,
    month,
    year,
    hour: hour24,
    minute,
    lat,
    lon,
    tz: tz ?? 5.5,
  };
}
