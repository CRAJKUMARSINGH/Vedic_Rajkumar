/**
 * codec.test.ts — permalink round-trips, tamper rejection and the disclosure.
 *
 * The point of these tests is that a share link is *inputs*, not a stored row:
 * decode(encode(x)) must be x bit-for-bit, and anything tampered must be
 * refused rather than rendered as a plausible-but-wrong chart.
 */

import { describe, expect, it } from 'vitest';
import {
  chartFingerprint,
  decodeCompact,
  decodeReadable,
  describeLink,
  encodeCompact,
  encodeReadable,
  sharePath,
  PERMALINK_VERSION,
  type ChartLink,
} from '@/lib/permalink/codec';

/** The example link from the spec: 1943 wartime Bombay, resolved +06:30. */
const LINK: ChartLink = {
  date: '1943-06-15',
  time: '04:27',
  lat: 19.076,
  lon: 72.8777,
  tzOffsetMinutes: 390,
  lang: 'hi',
};

const FP = chartFingerprint(123.45, 210.9, 23.85);

/** Local mirror of the payload checksum, so a tampered buffer can be re-signed. */
function checksum8(bytes: number[]): number {
  let h = 0x811c9dc5;
  for (const b of bytes) {
    h ^= b;
    h = Math.imul(h, 0x01000193);
  }
  return h & 0xff;
}

describe('permalink codec — compact form', () => {
  it('round-trips every input field', () => {
    const payload = encodeCompact(LINK, FP);
    const { link, fingerprint } = decodeCompact(payload);
    expect(link).toEqual(LINK);
    expect(fingerprint).toBe(FP);
  });

  it('is 28 base64url characters for a 21-byte payload', () => {
    const payload = encodeCompact(LINK, FP);
    // 21 bytes -> ceil(21/3)*4 = 28 chars, unpadded (the 17-byte payload before
    // the 4-byte fingerprint is the 23-char figure the spec's comment quotes).
    expect(payload).toHaveLength(28);
    expect(payload).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('rejects a truncated payload', () => {
    expect(() => decodeCompact('AAAA')).toThrow('bad_length');
  });

  it('rejects a tampered byte (checksum)', () => {
    const payload = encodeCompact(LINK, FP);
    const buf = Uint8Array.from(atob(payload.replace(/-/g, '+').replace(/_/g, '/')), c =>
      c.charCodeAt(0),
    );
    buf[5] ^= 0xff; // flip a latitude byte
    const tampered = btoa(String.fromCharCode(...buf))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    expect(() => decodeCompact(tampered)).toThrow('bad_checksum');
  });

  it('rejects an unsupported version even when the checksum is re-signed', () => {
    const payload = encodeCompact(LINK, FP);
    const buf = Uint8Array.from(atob(payload.replace(/-/g, '+').replace(/_/g, '/')), c =>
      c.charCodeAt(0),
    );
    buf[0] = PERMALINK_VERSION + 1;
    buf[16] = checksum8([...buf.subarray(0, 16)]);
    const resigned = btoa(String.fromCharCode(...buf))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    expect(() => decodeCompact(resigned)).toThrow('unsupported_version');
  });
});

describe('permalink codec — readable canonical form', () => {
  it('round-trips and keeps 4dp coordinates', () => {
    const qs = encodeReadable(LINK, FP);
    expect(qs).toContain('lat=19.0760');
    expect(qs).toContain('lon=72.8777');
    expect(qs).toContain('tz=390');
    expect(decodeReadable(qs)).toEqual({ link: LINK, fingerprint: FP });
  });

  it('accepts a leading question mark and defaults lang to en', () => {
    const bare = decodeReadable('?d=2000-01-01&t=12:00&lat=0&lon=0&tz=330');
    expect(bare.link.lang).toBe('en');
    expect(bare.fingerprint).toBe('');
  });
});

describe('permalink codec — validation and disclosure', () => {
  it('refuses out-of-range coordinates at encode time', () => {
    expect(() => encodeCompact({ ...LINK, lat: 91 }, FP)).toThrow('bad_lat');
    expect(() => encodeCompact({ ...LINK, lon: -181 }, FP)).toThrow('bad_lon');
    expect(() => encodeCompact({ ...LINK, tzOffsetMinutes: 900 }, FP)).toThrow('bad_tz');
  });

  it('describes the link in the disclosure the page renders', () => {
    expect(describeLink(LINK)).toBe('15 Jun 1943 04:27 · 19.0760N 72.8777E · UTC+06:30');
  });

  it('builds both share paths and they decode back to the same link', () => {
    const compact = sharePath(LINK, FP, true);
    expect(decodeCompact(compact.split('x=')[1]).link).toEqual(LINK);

    const readable = sharePath(LINK, FP, false);
    expect(decodeReadable(readable.split('?')[1]).link).toEqual(LINK);
  });
});

describe('permalink codec — fingerprint', () => {
  it('is stable for identical inputs and 6 base64url chars', () => {
    expect(chartFingerprint(10, 20, 30)).toBe(chartFingerprint(10, 20, 30));
    expect(chartFingerprint(10, 20, 30)).toHaveLength(6);
  });

  it('changes when any input moves by 0.01°', () => {
    const base = chartFingerprint(100.0, 200.0, 24.0);
    expect(chartFingerprint(100.01, 200.0, 24.0)).not.toBe(base);
    expect(chartFingerprint(100.0, 200.01, 24.0)).not.toBe(base);
    expect(chartFingerprint(100.0, 200.0, 24.01)).not.toBe(base);
  });

  it('ignores sub-0.01° noise', () => {
    expect(chartFingerprint(100.0, 200.0, 24.0)).toBe(chartFingerprint(100.004, 200.001, 24.002));
  });
});
