/**
 * codec.ts — permalink codec. A chart's *inputs* in the URL: no account, no
 * backend, no stored row. The same URL always renders the same chart.
 *
 * Load-bearing detail: the link carries the RESOLVED UTC offset, never a place
 * name. If it carried `Mumbai`, the recipient's device would re-resolve the
 * timezone and any difference in the place database would silently produce a
 * different chart — precisely the 1943-wartime bug class resurfacing across
 * devices. The offset is also already part of `chartCacheKey`.
 *
 * Two forms, one contract:
 *   - compact  (28 base64url chars)  — the share default
 *   - readable (/c?d=...&t=...&...)  — canonical, documented in docs/permalink.md
 * When they disagree, the readable form wins.
 *
 * Layout (21 bytes): version(1) · day(2) · minutes(2) · lat(4) · lon(4) ·
 * tz(2) · lang(1) · checksum(1) · fingerprint(4).
 */

export const PERMALINK_VERSION = 1;

export interface ChartLink {
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM */
  time: string;
  /** -90..90, stored to 4dp */
  lat: number;
  /** -180..180, stored to 4dp */
  lon: number;
  /** RESOLVED offset in minutes, e.g. 390 for wartime +06:30 */
  tzOffsetMinutes: number;
  lang: 'en' | 'hi';
}

export interface DecodedLink {
  link: ChartLink;
  fingerprint: string;
}

const EPOCH = Date.UTC(1900, 0, 1);
const DAY_MS = 86400000;
/** 4 bytes of fingerprint -> 6 base64url chars (no padding). */
const FINGERPRINT_BYTES = 4;
const PAYLOAD_BYTES = 21;

const toBase64Url = (b: Uint8Array): string =>
  btoa(String.fromCharCode(...b))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const fromBase64Url = (s: string): Uint8Array =>
  Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

/** 8-bit FNV-1a over the first 16 bytes — the payload's own checksum byte. */
function checksum8(bytes: Uint8Array): number {
  let h = 0x811c9dc5;
  for (const b of bytes) {
    h ^= b;
    h = Math.imul(h, 0x01000193);
  }
  return h & 0xff;
}

/** 32-bit FNV-1a, written big-endian — the cross-device fingerprint. */
function hash32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const quantize = (deg: number): string => (Math.round(deg * 100) / 100).toFixed(2);

/**
 * A 4-byte chart fingerprint: ascendant and Moon longitude at 0.01° plus the
 * ayanamsa. Recomputed on load and compared — a mismatch means the link was
 * computed elsewhere and recomputes differently here (place-database or
 * ephemeris version change), which is labelled rather than silently wrong.
 */
export function chartFingerprint(
  ascendantDeg: number,
  moonLonDeg: number,
  ayanamsaDeg: number,
): string {
  const h = hash32(`${quantize(ascendantDeg)}|${quantize(moonLonDeg)}|${quantize(ayanamsaDeg)}`);
  const buf = new Uint8Array(FINGERPRINT_BYTES);
  new DataView(buf.buffer).setUint32(0, h, false);
  return toBase64Url(buf);
}

function assertValid(link: ChartLink): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(link.date)) throw new Error('bad_date');
  if (!/^\d{2}:\d{2}$/.test(link.time)) throw new Error('bad_time');
  if (Math.abs(link.lat) > 90) throw new Error('bad_lat');
  if (Math.abs(link.lon) > 180) throw new Error('bad_lon');
  if (Math.abs(link.tzOffsetMinutes) > 840) throw new Error('bad_tz');
}

export function encodeCompact(link: ChartLink, fingerprint: string): string {
  assertValid(link);
  const [y, mo, d] = link.date.split('-').map(Number);
  const [hh, mm] = link.time.split(':').map(Number);
  const buf = new Uint8Array(PAYLOAD_BYTES);
  const dv = new DataView(buf.buffer);
  dv.setUint8(0, PERMALINK_VERSION);
  dv.setUint16(1, Math.round((Date.UTC(y, mo - 1, d) - EPOCH) / DAY_MS));
  dv.setUint16(3, hh * 60 + mm);
  dv.setInt32(5, Math.round(link.lat * 10000));
  dv.setInt32(9, Math.round(link.lon * 10000));
  dv.setInt16(13, link.tzOffsetMinutes);
  dv.setUint8(15, link.lang === 'hi' ? 1 : 0);
  dv.setUint8(16, checksum8(buf.subarray(0, 16)));
  buf.set(fromBase64Url(fingerprint), 17);
  return toBase64Url(buf);
}

export function decodeCompact(payload: string): DecodedLink {
  const buf = fromBase64Url(payload);
  if (buf.length !== PAYLOAD_BYTES) throw new Error('bad_length');
  if (buf[0] !== PERMALINK_VERSION) throw new Error('unsupported_version');
  if (buf[16] !== checksum8(buf.subarray(0, 16))) throw new Error('bad_checksum');
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const days = dv.getUint16(1);
  const minutes = dv.getUint16(3);
  const lat = dv.getInt32(5) / 10000;
  const lon = dv.getInt32(9) / 10000;
  const tz = dv.getInt16(13);
  if (minutes > 1439 || Math.abs(lat) > 90 || Math.abs(lon) > 180 || Math.abs(tz) > 840) {
    throw new Error('out_of_range');
  }
  return {
    link: {
      date: new Date(EPOCH + days * DAY_MS).toISOString().slice(0, 10),
      time: `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`,
      lat,
      lon,
      tzOffsetMinutes: tz,
      lang: buf[15] & 1 ? 'hi' : 'en',
    },
    fingerprint: toBase64Url(buf.subarray(17, 21)),
  };
}

/** The readable canonical query string (no leading `?`). */
export function encodeReadable(link: ChartLink, fingerprint: string): string {
  assertValid(link);
  const p = new URLSearchParams({
    d: link.date,
    t: link.time,
    lat: link.lat.toFixed(4),
    lon: link.lon.toFixed(4),
    tz: String(link.tzOffsetMinutes),
    l: link.lang,
    h: fingerprint,
  });
  return p.toString();
}

/** Parse the readable form. Accepts a full `?a=b` string or a URLSearchParams. */
export function decodeReadable(search: string): DecodedLink {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const date = params.get('d') ?? '';
  const time = params.get('t') ?? '';
  const lang = params.get('l') === 'hi' ? 'hi' : 'en';
  const link: ChartLink = {
    date,
    time,
    lat: Number(params.get('lat')),
    lon: Number(params.get('lon')),
    tzOffsetMinutes: Number(params.get('tz')),
    lang,
  };
  if (Number.isNaN(link.lat) || Number.isNaN(link.lon) || Number.isNaN(link.tzOffsetMinutes)) {
    throw new Error('bad_number');
  }
  assertValid(link);
  return { link, fingerprint: params.get('h') ?? '' };
}

/** Human-readable disclosure — a URL that carries birth data should say so. */
export function describeLink(link: ChartLink): string {
  const [y, mo, d] = link.date.split('-').map(Number);
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][mo - 1];
  const ns = link.lat >= 0 ? 'N' : 'S';
  const ew = link.lon >= 0 ? 'E' : 'W';
  const sign = link.tzOffsetMinutes < 0 ? '-' : '+';
  const abs = Math.abs(link.tzOffsetMinutes);
  const tz = `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
  return (
    `${d} ${month} ${y} ${link.time} · ` +
    `${Math.abs(link.lat).toFixed(4)}${ns} ${Math.abs(link.lon).toFixed(4)}${ew} · ${tz}`
  );
}

/** Origin-relative share path for the chosen representation. */
export function sharePath(link: ChartLink, fingerprint: string, compact = true): string {
  return compact
    ? `/c?x=${encodeCompact(link, fingerprint)}`
    : `/c?${encodeReadable(link, fingerprint)}`;
}
