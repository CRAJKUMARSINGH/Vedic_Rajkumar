/**
 * Build and parse shareable /event-transit URLs that prefill the analysis form.
 */

import type { EventProfile, EventInput } from '@/services/eventTransitAnalysisService';

export interface EventFormSnapshot {
  profile: EventProfile;
  event: EventInput;
  birthCityLabel: string;
  birthDst: boolean;
  eventDst: boolean;
}

const BASE = '/event-transit';

function num(v: string | null, fallback: number): number {
  if (v == null || v === '') return fallback;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

function int(v: string | null, fallback: number): number {
  if (v == null || v === '') return fallback;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

function str(v: string | null, fallback = ''): string {
  return v?.trim() ? decodeURIComponent(v) : fallback;
}

/** Encode profile + event into query params (compact keys). */
export function buildEventShareUrl(
  snapshot: EventFormSnapshot,
  options?: { autoRun?: boolean; origin?: string }
): string {
  const { profile, event, birthCityLabel, birthDst, eventDst } = snapshot;
  const params = new URLSearchParams();

  params.set('pn', profile.name);
  params.set('bd', profile.birthDate);
  params.set('bt', profile.birthTime);
  params.set('bl', birthCityLabel);
  params.set('blat', String(profile.birthLat));
  params.set('blon', String(profile.birthLon));
  if (birthDst) params.set('bdst', '1');
  params.set('moon', String(profile.moonRashiIndex));
  if (profile.ascendantRashiIndex != null) {
    params.set('asc', String(profile.ascendantRashiIndex));
  }

  params.set('ed', event.eventDate);
  params.set('et', event.eventTime);
  params.set('eutc', event.eventTimeUTC);
  params.set('el', event.eventLocation);
  if (eventDst) params.set('edst', '1');
  params.set('etype', event.eventType);
  if (event.domainLabel) params.set('label', event.domainLabel);
  if (event.eventCompany) params.set('co', event.eventCompany);

  if (options?.autoRun) params.set('run', '1');

  const origin = options?.origin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return `${origin}${BASE}?${params.toString()}`;
}

/** True if URL contains enough params to prefill the form. */
export function hasEventShareParams(search: URLSearchParams): boolean {
  return search.has('bd') && search.has('ed');
}

/** Parse query params into form snapshot. Returns null if insufficient data. */
export function parseEventShareParams(search: URLSearchParams): EventFormSnapshot | null {
  const birthDate = str(search.get('bd'));
  const eventDate = str(search.get('ed'));
  if (!birthDate || !eventDate) return null;

  const birthCityLabel = str(search.get('bl'), 'Indore, Madhya Pradesh');
  const eventLocation = str(search.get('el'), 'Miami, USA');

  const profile: EventProfile = {
    name: str(search.get('pn'), 'Guest'),
    birthDate,
    birthTime: str(search.get('bt'), '06:00'),
    birthLat: num(search.get('blat'), 22.72),
    birthLon: num(search.get('blon'), 75.86),
    moonRashiIndex: int(search.get('moon'), 3),
    ascendantRashiIndex: search.has('asc') ? int(search.get('asc'), 3) : undefined,
  };

  const eventType = str(search.get('etype'), 'general') as EventInput['eventType'];
  const validTypes: EventInput['eventType'][] = ['interview', 'exam', 'business', 'general'];
  const event: EventInput = {
    eventDate,
    eventTime: str(search.get('et'), '10:00'),
    eventTimeUTC: str(search.get('eutc'), '04:30'),
    eventLocation,
    eventType: validTypes.includes(eventType) ? eventType : 'general',
    domainLabel: str(search.get('label')) || undefined,
    eventCompany: str(search.get('co')) || undefined,
  };

  return {
    profile,
    event,
    birthCityLabel,
    birthDst: search.get('bdst') === '1',
    eventDst: search.get('edst') === '1',
  };
}

export function shouldAutoRunFromShare(search: URLSearchParams): boolean {
  return search.get('run') === '1';
}
