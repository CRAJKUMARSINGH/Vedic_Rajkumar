/**
 * src/services/ayanamsaService.ts
 *
 * PHASE 1 · comparison surface for the UI. All astronomy moved to
 * `lib/vedic/ayanamsaCore.ts`; nothing here may hold a constant.
 *
 * Patched because this module disagreed with the engine module it is displayed
 * next to:
 *   - Fagan-Bradley was 24.0440 at J2000 (0.699 deg low). Correct family value
 *     is ~24.74; the old number put FB *below* Lahiri, which is astronomically
 *     impossible for that definition.
 *   - KP was 23.8628 vs the engine's 23.85022 (45" apart, both shown to users).
 *   - `toJD()` silently dropped the time of day and applied the Gregorian
 *     correction before 1582; it also changed the anchor of every value.
 *   - Every row was labelled with a qualitative `accuracy` string
 *     ("Highest — includes nutation") that the code could not substantiate.
 *     Rows now carry the machine-readable `source` + `degraded` instead, and the
 *     human string is derived from them, never typed by hand.
 */

import {
  AYANAMSA_ENGINE_VERSION,
  ayanamsaAt,
  boundaryMargins,
  type AyanamsaDegraded,
  type AyanamsaSource,
  type AyanamsaSystem,
} from '@/lib/vedic/ayanamsaCore';

export interface AyanamsaResult {
  name: string;
  nameHi: string;
  /** Ayanamsa in degrees. */
  value: number;
  description: { en: string; hi: string };
  usedBy: string;
  /** Derived from `source` + `degraded`; never a hand-typed claim. */
  accuracy: string;
  /** NEW — machine-readable provenance for the UI badge and the card. */
  source: AyanamsaSource;
  seSidMode: number;
  degraded: AyanamsaDegraded[];
}

export interface AyanamsaComparison {
  date: string;
  julianDay: number;
  results: AyanamsaResult[];
  difference: { maxDiff: number; minDiff: number; spread: string };
  recommendation: { en: string; hi: string };
  engineVersion: string;
}

interface Row {
  system: AyanamsaSystem;
  name: string;
  nameHi: string;
  description: { en: string; hi: string };
  usedBy: string;
}

const ROWS: readonly Row[] = [
  {
    system: 'Lahiri',
    name: 'Lahiri (Chitrapaksha)',
    nameHi: 'लाहिरी (चित्रपक्ष)',
    description: {
      en: 'IAU 1956 standard. Most widely used in India. Recommended by Govt. of India.',
      hi: 'IAU 1956 मानक। भारत में सर्वाधिक प्रयुक्त। भारत सरकार द्वारा अनुशंसित।',
    },
    usedBy: 'Most Indian astrologers, Govt. of India Panchang',
  },
  {
    system: 'Raman',
    name: 'B.V. Raman',
    nameHi: 'बी.वी. रमण',
    description: {
      en: "Dr. Raman's own ayanamsa. Slightly less than Lahiri. Used in The Astrological Magazine tradition.",
      hi: 'डॉ. रमण का अपना अयनांश। लाहिरी से थोड़ा कम। द एस्ट्रोलॉजिकल मैगज़ीन परंपरा में प्रयुक्त।',
    },
    usedBy: 'B.V. Raman tradition, Raman Publications',
  },
  {
    system: 'KP',
    name: 'KP (Krishnamurti)',
    nameHi: 'केपी (कृष्णमूर्ति)',
    description: {
      en: 'Used in the KP system. Very close to Lahiri. Gives precise sub-lord results.',
      hi: 'KP प्रणाली में प्रयुक्त। लाहिरी के बहुत करीब। सटीक सब-लॉर्ड परिणाम देता है।',
    },
    usedBy: 'KP astrologers worldwide',
  },
  {
    system: 'Yukteshwar',
    name: 'Sri Yukteshwar',
    nameHi: 'श्री युक्तेश्वर',
    description: {
      en: 'From "The Holy Science" (1894). Places the vernal equinox at 0° Aries in 499 AD.',
      hi: '"द होली साइंस" (1894) से। 499 ई. में वसंत विषुव को 0° मेष पर रखता है।',
    },
    usedBy: 'Paramahansa Yogananda tradition, some Western Vedic astrologers',
  },
  {
    system: 'FaganBradley',
    name: 'Fagan-Bradley',
    nameHi: 'फेगन-ब्रैडली',
    description: {
      en: 'Western sidereal standard. Sits above Lahiri by roughly 0.89°.',
      hi: 'पश्चिमी साइडरियल मानक। लाहिरी से लगभग 0.89° अधिक।',
    },
    usedBy: 'Western sidereal astrologers',
  },
  {
    system: 'TrueCitra',
    name: 'True Chitra (Spica-referenced)',
    nameHi: 'सच्चा चित्रा (स्पाइका आधारित)',
    description: {
      en: 'Anchors the zodiac on Spica itself. Pure-JS path models nutation only.',
      hi: 'राशिचक्र को स्पाइका पर आधारित करता है। शुद्ध-JS पथ केवल न्यूटेशन मॉडल करता है।',
    },
    usedBy: 'Precision astrology software running Swiss Ephemeris',
  },
];

/**
 * Julian Day (UT) from an ISO `YYYY-MM-DD` or full ISO-8601 instant.
 * Meeus, Astronomical Algorithms, ch. 7 (Gregorian branch after 1582-10-15).
 * Rejects junk instead of returning NaN — the old version returned NaN for
 * "2026-13-45" and the caller rendered `NaN°`.
 */
export function toJD(dateStr: string): number {
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(dateStr);
  if (!iso) throw new RangeError(`toJD: expected ISO-8601 date, got "${dateStr}"`);
  const [, ys, ms, ds, hs, mins, ss] = iso;
  const year = Number(ys);
  const month = Number(ms);
  const day = Number(ds);
  if (month < 1 || month > 12) throw new RangeError(`toJD: month out of range in "${dateStr}"`);
  if (day < 1 || day > 31) throw new RangeError(`toJD: day out of range in "${dateStr}"`);
  const fractionOfDay = ((Number(hs ?? 12) + Number(mins ?? 0) / 60 + Number(ss ?? 0) / 3600) / 24);

  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const gregorian = year > 1582 || (year === 1582 && (month > 10 || (month === 10 && day >= 15)));
  const a = Math.floor(y / 100);
  const b = gregorian ? 2 - a + Math.floor(a / 4) : 0;
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + fractionOfDay + b - 1524.5;
}

function formatDMS(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  const s = Math.floor(((deg - d) * 60 - m) * 60);
  return `${d}°${m}'${s}"`;
}

/** Human label derived from the machine tags, so the two can never disagree. */
function accuracyLabel(source: AyanamsaSource, degraded: AyanamsaDegraded[]): string {
  if (source === 'swisseph' && degraded.length === 0) return 'Swiss Ephemeris';
  if (degraded.includes('true-citra-approximated')) return 'Approximate (nutation only)';
  if (degraded.includes('anchor-pending-golden')) return 'Polynomial — anchor pending golden lock';
  return 'Polynomial (IAU 2006 precession)';
}

export function compareAyanamsas(dateStr: string): AyanamsaComparison {
  const jd = toJD(dateStr);

  const results: AyanamsaResult[] = ROWS.map((row) => {
    const v = ayanamsaAt(jd, row.system);
    return {
      name: row.name,
      nameHi: row.nameHi,
      value: v.value,
      description: row.description,
      usedBy: row.usedBy,
      accuracy: accuracyLabel(v.source, v.degraded),
      source: v.source,
      seSidMode: v.seSidMode,
      degraded: v.degraded,
    };
  });

  const values = results.map((r) => r.value);
  const maxDiff = Math.max(...values) - Math.min(...values);
  const lahiri = results.find((r) => r.name.startsWith('Lahiri'))?.value ?? values[0];
  const raman = results.find((r) => r.name.startsWith('B.V.'))?.value ?? values[0];

  // The old copy claimed the spread "can shift a planet by up to 1 house".
  // That is true only when the spread crosses a 30 deg edge — say so precisely.
  const margins = boundaryMargins(lahiri);

  return {
    date: dateStr,
    julianDay: jd,
    results,
    difference: {
      maxDiff,
      minDiff: 0,
      spread: `${formatDMS(maxDiff)} spread between all systems`,
    },
    recommendation: {
      en:
        `For traditional Vedic astrology use Lahiri (${formatDMS(lahiri)}); for the ` +
        `B.V. Raman tradition use Raman (${formatDMS(raman)}). The systems span ${formatDMS(maxDiff)}. ` +
        `A house only changes when that spread crosses a sign edge — Lahiri is currently ` +
        `${margins.toRashi.toFixed(3)}° from the nearest one.`,
      hi:
        `पारंपरिक वैदिक ज्योतिष के लिए लाहिरी (${formatDMS(lahiri)}) और बी.वी. रमण परंपरा के लिए ` +
        `रमण (${formatDMS(raman)}) का उपयोग करें। सभी प्रणालियों में ${formatDMS(maxDiff)} का अंतर है। ` +
        `भाव तभी बदलता है जब यह अंतर राशि सीमा पार करे — लाहिरी अभी निकटतम सीमा से ` +
        `${margins.toRashi.toFixed(3)}° दूर है।`,
    },
    engineVersion: AYANAMSA_ENGINE_VERSION,
  };
}

export { formatDMS };
