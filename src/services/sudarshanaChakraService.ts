/**
 * sudarshanaChakraService.ts — Sri Sudarshana Chakra (Tri-Bhava / Chakra-Traya).
 *
 * The classical confirmation device. A chart is read from three references at
 * once: the Lagna (self/body), the Chandra lagna (Moon = mind, feeling, what one
 * lives for) and the Surya lagna (Sun = soul, authority, what one is here to
 * do). A matter is *firm* only where the three charts agree; where they diverge
 * the promise is partial, and where none carries it the matter has no support.
 *
 * This is the principled counterpart of the house rule the answer card already
 * enforces (`house = sign − asc + 1`). Instead of choosing one reference and
 * hiding the other two, the Sudarshana Chakra reads all three and reports their
 * level of agreement — so a "Sun in the 2nd"-style single-reference error cannot
 * survive.
 *
 * Pure & deterministic: a projection of ChartData — no I/O, no LLM, no
 * wall-clock — so a card embedding it stays byte-reproducible under
 * `npm run answers:check`.
 */
import type { ChartData } from '@/hooks/useChartCalculation';
import { BENEFICS } from '@/astrology/core/constants';
import { getPlanetDignity } from '@/services/ephemerisService';
import { RASHI_LORDS } from '@/lib/vedic/vedicCalc';

export type SudarshanaRef = 'lagna' | 'chandra' | 'surya';

/** The three references, in reading order. */
export const SUDARSHANA_REFS: readonly SudarshanaRef[] = ['lagna', 'chandra', 'surya'] as const;

/**
 * Houses that let a planet's result land: kendra (1/4/7/10) + trikona (1/5/9).
 * A bhava's lord placed here (or in its own/exalted sign) is "strong" for that
 * reference.
 */
const GOOD_HOUSES: ReadonlySet<number> = new Set([1, 4, 5, 7, 9, 10]);

export interface SudarshanaRefSlot {
  ref: SudarshanaRef;
  /** 0..11 — the sign that occupies this bhava in this reference's chart. */
  bhavaSign: number;
  /** Planets sitting in {@link bhavaSign}. */
  occupants: string[];
  /** Natural benefics (Jupiter/Venus/Mercury/Moon) among the occupants. */
  benefics: string[];
  /** Rashi lord of {@link bhavaSign}. */
  lord: string;
  /** 1..12 — house the lord occupies, counted from this reference. */
  lordHouse: number;
  /** The lord sits in a kendra/trikona, or in its own / moolatrikona / exalted sign. */
  lordStrong: boolean;
}

export interface SudarshanaBhavaReading {
  /** 1..12. */
  bhava: number;
  /** Always length 3: lagna, chandra, surya. */
  refs: SudarshanaRefSlot[];
  refsOccupied: number;
  refsBenefic: number;
  refsLordStrong: number;
  /** 0..3 — references where the bhava is "active" (occupied, or its lord strong). */
  confirmation: number;
  verdict: { en: string; hi: string };
}

export interface SudarshanaPlanetRow {
  planet: string;
  /** 0..11. */
  sign: number;
  fromLagna: number;
  fromMoon: number;
  fromSun: number;
}

export interface SudarshanaChakra {
  /** The three reference signs (0..11). */
  ascSign: number;
  moonSign: number;
  sunSign: number;
  planets: SudarshanaPlanetRow[];
  /** One reading per bhava; index i => bhava (i+1). */
  bhavas: SudarshanaBhavaReading[];
  /** Highest confirmation, tie-broken by benefic support then lower bhava. */
  strongestBhava: number;
  weakestBhava: number;
}

/** Whole-sign house of `sign` counted from `refSign` (0..11) → 1..12. */
const houseFrom = (sign: number, refSign: number): number => ((sign - refSign + 12) % 12) + 1;

function verdictFor(confirmation: number, refsOccupied: number): { en: string; hi: string } {
  if (confirmation >= 3) {
    return {
      en: 'confirmed in all three charts — treat this as firm',
      hi: 'तीनों कुंडलियों में पुष्ट — इसे पक्का मानें',
    };
  }
  if (confirmation === 2) {
    return {
      en: 'confirmed in two of the three charts — firm, with one caveat',
      hi: 'तीन में दो कुंडलियों में पुष्ट — पक्का, पर एक शर्त',
    };
  }
  if (refsOccupied >= 1) {
    return {
      en: 'carried by one chart only — provisional',
      hi: 'केवल एक कुंडली में — अनिश्चित',
    };
  }
  return {
    en: 'not corroborated in any of the three charts — do not lean on it',
    hi: 'किसी भी कुंडली में पुष्ट नहीं — इस पर भार न डालें',
  };
}

/**
 * Project ChartData → Sudarshana Chakra. Returns null when the ascendant, the
 * Moon or the Sun is not calculable — the triad is incomplete and a partial
 * reading would be misleading.
 */
export function computeSudarshanaChakra(
  chart: ChartData | null | undefined,
): SudarshanaChakra | null {
  const ascSign = chart?.ascendant?.ascendant?.rashiIndex;
  const planets = chart?.planetaryPositions?.planets ?? [];
  if (!Number.isInteger(ascSign) || !planets.length) return null;

  const findSign = (name: string): number | null => {
    const p = planets.find(x => x.name === name);
    return p && Number.isInteger(p.rashiIndex) ? p.rashiIndex : null;
  };
  const moonSign = findSign('Moon');
  const sunSign = findSign('Sun');
  if (moonSign == null || sunSign == null) return null;

  const refSignOf: Record<SudarshanaRef, number> = {
    lagna: ascSign as number,
    chandra: moonSign,
    surya: sunSign,
  };

  const bySign = new Map<number, string[]>();
  for (const p of planets) {
    if (!Number.isInteger(p.rashiIndex)) continue;
    const arr = bySign.get(p.rashiIndex) ?? [];
    arr.push(p.name);
    bySign.set(p.rashiIndex, arr);
  }

  const planetRows: SudarshanaPlanetRow[] = planets
    .filter(p => Number.isInteger(p.rashiIndex))
    .map(p => ({
      planet: p.name,
      sign: p.rashiIndex,
      fromLagna: houseFrom(p.rashiIndex, ascSign as number),
      fromMoon: houseFrom(p.rashiIndex, moonSign),
      fromSun: houseFrom(p.rashiIndex, sunSign),
    }));

  const bhavas: SudarshanaBhavaReading[] = [];
  for (let bhava = 1; bhava <= 12; bhava++) {
    const refs: SudarshanaRefSlot[] = SUDARSHANA_REFS.map(ref => {
      const refSign = refSignOf[ref];
      const bhavaSign = (refSign + bhava - 1) % 12;
      const occupants = bySign.get(bhavaSign) ?? [];
      const benefics = occupants.filter(o => (BENEFICS as readonly string[]).includes(o));
      const lord = RASHI_LORDS[bhavaSign + 1] ?? 'Sun';
      const lordHouse = houseFrom(findSign(lord) ?? bhavaSign, refSign);
      const lordSign = findSign(lord);
      const lordDignity = lordSign == null ? '' : getPlanetDignity(lord, lordSign);
      const lordStrong =
        GOOD_HOUSES.has(lordHouse) ||
        lordDignity === 'Own Sign' ||
        lordDignity === 'Moolatrikona' ||
        lordDignity === 'Exalted';
      return { ref, bhavaSign, occupants, benefics, lord, lordHouse, lordStrong };
    });

    const refsOccupied = refs.filter(r => r.occupants.length > 0).length;
    const refsBenefic = refs.filter(r => r.benefics.length > 0).length;
    const refsLordStrong = refs.filter(r => r.lordStrong).length;
    const confirmation = refs.filter(r => r.occupants.length > 0 || r.lordStrong).length;

    bhavas.push({
      bhava,
      refs,
      refsOccupied,
      refsBenefic,
      refsLordStrong,
      confirmation,
      verdict: verdictFor(confirmation, refsOccupied),
    });
  }

  const ranked = [...bhavas].sort(
    (a, b) => b.confirmation - a.confirmation || b.refsBenefic - a.refsBenefic || a.bhava - b.bhava,
  );

  return {
    ascSign: ascSign as number,
    moonSign,
    sunSign,
    planets: planetRows,
    bhavas,
    strongestBhava: ranked[0]?.bhava ?? 1,
    weakestBhava: ranked[ranked.length - 1]?.bhava ?? 1,
  };
}

/** Read one bhava (1..12) off a computed chakra. Null when out of range. */
export function readSudarshanaBhava(
  chakra: SudarshanaChakra,
  bhava: number,
): SudarshanaBhavaReading | null {
  if (!Number.isInteger(bhava) || bhava < 1 || bhava > 12) return null;
  return chakra.bhavas[bhava - 1] ?? null;
}
