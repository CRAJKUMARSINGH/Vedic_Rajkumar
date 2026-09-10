/**
 * doshaCheckerService.ts
 *
 * Comprehensive single-person dosha report.
 * Combines Manglik Dosha (from manglikService) and Kaal Sarp Dosha
 * (computed here from planetary positions) into one DoshaReport.
 *
 * nadiDosha is intentionally null — it requires comparing two nakshatras
 * and cannot be determined from a single birth chart.
 */

// @ts-nocheck — ephemerisService and ascendantService lack full TS declarations
import { checkManglikDosha, type ManglikResult } from './manglikService';
import { calculateCompletePlanetaryPositions } from './ephemerisService';
import { calculateCompleteAscendant } from './ascendantService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type KaalSarpType =
  | 'Anant' | 'Kulik' | 'Vasuki' | 'Shankhpal' | 'Padma' | 'Mahapadma'
  | 'Takshak' | 'Karkotak' | 'Shankhnaad' | 'Patak' | 'Vishdhar' | 'Sheshnag'
  | 'None';

export interface KaalSarpResult {
  present: boolean;
  type: KaalSarpType;
  /** Rahu house (1-12) from ascendant; 0 if not calculable */
  rahuHouse: number;
  /** Ketu house (1-12) from ascendant; 0 if not calculable */
  ketuHouse: number;
  /** Houses occupied by planets caught within the Rahu→Ketu arc */
  affectedHouses: number[];
  severity: 'None' | 'Partial' | 'Full';
  description: { en: string; hi: string };
  remedies: { en: string[]; hi: string[] };
}

export interface DoshaReport {
  /** Full Manglik result from manglikService — unmodified */
  manglik: ManglikResult;
  /** Kaal Sarp Yoga analysis for this chart */
  kaalSarp: KaalSarpResult;
  /**
   * Always null for a single-person report.
   * Nadi Dosha requires comparing two nakshatras (two charts).
   */
  nadiDosha: null;
  summary: {
    totalDoshas: number;
    criticalDoshas: string[];
    moderateDoshas: string[];
    recommendations: string[];
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maps Rahu's house number (1-12 from ascendant) to the classical KSY name */
const RAHU_HOUSE_TO_TYPE: Record<number, KaalSarpType> = {
  1: 'Anant',     2: 'Kulik',     3: 'Vasuki',    4: 'Shankhpal',
  5: 'Padma',     6: 'Mahapadma', 7: 'Takshak',   8: 'Karkotak',
  9: 'Shankhnaad', 10: 'Patak',   11: 'Vishdhar', 12: 'Sheshnag',
};

/** Classical planet names used for arc-containment check */
const CLASSICAL_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

const KAAL_SARP_REMEDIES = {
  en: [
    'Recite Om Namah Shivaya 108 times daily',
    'Offer water to Shivalingam every Monday',
    'Perform Kaal Sarp Dosh Nivaran Pooja at Trambakeshwar or Kalahasti',
    'Recite Maha Mrityunjaya Mantra daily',
    'Donate black items on Saturdays',
  ],
  hi: [
    'प्रतिदिन ॐ नमः शिवाय 108 बार जाप करें',
    'प्रत्येक सोमवार शिवलिंग पर जल अर्पित करें',
    'त्र्यंबकेश्वर या कालहस्ती में काल सर्प दोष निवारण पूजा कराएं',
    'प्रतिदिन महा मृत्युंजय मंत्र का जाप करें',
    'शनिवार को काली वस्तुएं दान करें',
  ],
};

// ─── Kaal Sarp Detection ──────────────────────────────────────────────────────

/**
 * Internal helper — detects Kaal Sarp Yoga from planetary positions.
 * Returns a full KaalSarpResult.
 */
function detectKaalSarpDosha(
  dateOfBirth: string,
  timeOfBirth: string,
  latitude: number,
  longitude: number,
): KaalSarpResult {
  const NONE_RESULT: KaalSarpResult = {
    present: false,
    type: 'None',
    rahuHouse: 0,
    ketuHouse: 0,
    affectedHouses: [],
    severity: 'None',
    description: {
      en: 'No Kaal Sarp Dosha detected. All planets are not confined within the Rahu–Ketu axis.',
      hi: 'कोई काल सर्प दोष नहीं पाया गया। सभी ग्रह राहु-केतु अक्ष के बाहर हैं।',
    },
    remedies: { en: [], hi: [] },
  };

  const positions = calculateCompletePlanetaryPositions(dateOfBirth, timeOfBirth);
  const ascendantData = calculateCompleteAscendant(dateOfBirth, timeOfBirth, latitude, longitude);

  if (!positions?.planets || !ascendantData?.ascendant) return NONE_RESULT;

  const ascRashi: number = ascendantData.ascendant.rashi ?? ascendantData.ascendant.rashiIndex ?? 0;
  const toHouse = (rashiIndex: number): number => ((rashiIndex - ascRashi + 12) % 12) + 1;

  const rahu = positions.planets.find((p: { name: string }) => p.name === 'Rahu' || p.name === 'North Node');
  const ketu = positions.planets.find((p: { name: string }) => p.name === 'Ketu' || p.name === 'South Node');

  if (!rahu || !ketu) return NONE_RESULT;

  const rahuRashi: number = rahu.rashiIndex ?? 0;
  const ketuRashi: number = ketu.rashiIndex ?? 0;
  const rahuHouse = toHouse(rahuRashi);
  const ketuHouse = toHouse(ketuRashi);

  // Determine the arc from Rahu to Ketu going clockwise (increasing rashi index)
  // A planet is "inside" if its rashi falls within the shorter arc Rahu→Ketu
  const classicalPlanets = positions.planets.filter(
    (p: { name: string }) => CLASSICAL_PLANETS.includes(p.name),
  );

  const planetsInArc: string[] = [];
  const planetsOutsideArc: string[] = [];

  for (const planet of classicalPlanets) {
    const rashiIdx: number = planet.rashiIndex ?? 0;
    // Check if rashiIdx is in the arc from rahuRashi → ketuRashi (clockwise)
    let inArc: boolean;
    if (rahuRashi <= ketuRashi) {
      inArc = rashiIdx >= rahuRashi && rashiIdx <= ketuRashi;
    } else {
      // Arc wraps around 0/12 boundary
      inArc = rashiIdx >= rahuRashi || rashiIdx <= ketuRashi;
    }
    if (inArc) {
      planetsInArc.push(planet.name);
    } else {
      planetsOutsideArc.push(planet.name);
    }
  }

  if (planetsInArc.length === 0) return NONE_RESULT;

  const isFullKSY = planetsOutsideArc.length === 0;
  const isPartialKSY = !isFullKSY && planetsInArc.length > 0;

  const severity: KaalSarpResult['severity'] = isFullKSY ? 'Full' : isPartialKSY ? 'Partial' : 'None';
  const type: KaalSarpType = RAHU_HOUSE_TO_TYPE[rahuHouse] ?? 'None';
  const affectedHouses = planetsInArc.map((_name) => {
    const p = classicalPlanets.find((pl: { name: string }) => pl.name === _name);
    return p ? toHouse(p.rashiIndex ?? 0) : 0;
  }).filter((h) => h > 0);

  const typeNames: Record<KaalSarpType, string> = {
    Anant: 'Anant', Kulik: 'Kulik', Vasuki: 'Vasuki', Shankhpal: 'Shankhpal',
    Padma: 'Padma', Mahapadma: 'Mahapadma', Takshak: 'Takshak', Karkotak: 'Karkotak',
    Shankhnaad: 'Shankhnaad', Patak: 'Patak', Vishdhar: 'Vishdhar', Sheshnag: 'Sheshnag',
    None: 'None',
  };

  const description = {
    en: `${typeNames[type]} Kaal Sarp Yoga detected (${severity}). Rahu in house ${rahuHouse}, Ketu in house ${ketuHouse}. ` +
        `${planetsInArc.length} of 7 classical planets (${planetsInArc.join(', ')}) are within the Rahu–Ketu arc.` +
        (isPartialKSY ? ` ${planetsOutsideArc.join(', ')} are outside the arc (partial cancellation).` : ''),
    hi: `${typeNames[type]} काल सर्प योग मिला (${severity === 'Full' ? 'पूर्ण' : 'आंशिक'})। राहु ${rahuHouse}वें भाव में, केतु ${ketuHouse}वें भाव में।`,
  };

  return {
    present: true,
    type,
    rahuHouse,
    ketuHouse,
    affectedHouses,
    severity,
    description,
    remedies: KAAL_SARP_REMEDIES,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns a comprehensive dosha report for one birth chart.
 *
 * @param dateOfBirth  ISO date string YYYY-MM-DD
 * @param timeOfBirth  24-hour time string HH:MM
 * @param latitude     Decimal degrees (North positive)
 * @param longitude    Decimal degrees (East positive)
 */
export async function getComprehensiveDoshaReport(
  dateOfBirth: string,
  timeOfBirth: string,
  latitude: number,
  longitude: number,
): Promise<DoshaReport> {
  const criticalDoshas: string[] = [];
  const moderateDoshas: string[] = [];
  const recommendations: string[] = [];

  let manglik: ManglikResult;
  let kaalSarp: KaalSarpResult;

  try {
    manglik = checkManglikDosha(dateOfBirth, timeOfBirth, latitude, longitude);
  } catch (err) {
    console.error('[doshaCheckerService] Manglik check failed:', err);
    manglik = {
      isManglik: false,
      severity: 'None',
      marsHouse: 0,
      marsRashi: 'Unknown',
      affectedHouses: [],
      cancellations: [],
      effectiveManglik: false,
      description: { en: 'Manglik calculation failed.', hi: 'मांगलिक गणना विफल।' },
      remedies: { en: [], hi: [] },
    };
  }

  try {
    kaalSarp = detectKaalSarpDosha(dateOfBirth, timeOfBirth, latitude, longitude);
  } catch (err) {
    console.error('[doshaCheckerService] Kaal Sarp check failed:', err);
    kaalSarp = {
      present: false, type: 'None', rahuHouse: 0, ketuHouse: 0,
      affectedHouses: [], severity: 'None',
      description: { en: 'Kaal Sarp calculation failed.', hi: 'काल सर्प गणना विफल।' },
      remedies: { en: [], hi: [] },
    };
  }

  // Classify doshas by severity
  if (manglik.effectiveManglik) {
    if (manglik.severity === 'Severe' || manglik.severity === 'High') {
      criticalDoshas.push(`Manglik Dosha (${manglik.severity})`);
      recommendations.push('Perform Mangal Shanti Puja before marriage.');
      recommendations.push('Kumbh Vivah may be recommended — consult a qualified Jyotishi.');
    } else {
      moderateDoshas.push(`Manglik Dosha (${manglik.severity})`);
      recommendations.push('Recite Hanuman Chalisa daily and fast on Tuesdays.');
    }
  }

  if (kaalSarp.present) {
    if (kaalSarp.severity === 'Full') {
      criticalDoshas.push(`Kaal Sarp Yoga – ${kaalSarp.type} (Full)`);
      recommendations.push(`Perform ${kaalSarp.type} Kaal Sarp Dosh Nivaran Pooja at Trambakeshwar.`);
    } else if (kaalSarp.severity === 'Partial') {
      moderateDoshas.push(`Kaal Sarp Yoga – ${kaalSarp.type} (Partial)`);
      recommendations.push('Recite Maha Mrityunjaya Mantra 108 times daily.');
    }
  }

  if (criticalDoshas.length === 0 && moderateDoshas.length === 0) {
    recommendations.push('No significant doshas found. Proceed with standard auspicious timing.');
  }

  return {
    manglik,
    kaalSarp,
    nadiDosha: null,
    summary: {
      totalDoshas: criticalDoshas.length + moderateDoshas.length,
      criticalDoshas,
      moderateDoshas,
      recommendations,
    },
  };
}

export type { ManglikResult };
