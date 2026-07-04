/**
 * Divisional Charts (Varga / ShodashVarga) Service
 * The 16 divisional charts used in Vedic astrology
 *
 * Each chart divides a rashi into N equal parts and maps planets
 * to a new rashi based on their position within the division.
 *
 * Reference: BPHS Chapter 6-7
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VargaPosition {
  planet: string;
  originalLongitude: number; // 0-360 sidereal
  vargaRashi: number;        // 0-11 in the divisional chart
  vargaLongitude: number;    // 0-30 within the varga rashi
  isExalted: boolean;
  isDebilitated: boolean;
  isOwnSign: boolean;
}

export interface DivisionalChart {
  id: string;
  name: string;
  nameHi: string;
  number: number;
  division: number;
  purpose: string;
  purposeObj: { en: string; hi: string };
  strength: {
    overall: number;
    specialPoints: string;
    vargottamaCount: number;
    exaltedCount: number;
    ownHouseCount: number;
  };
  planets: any[];
  houses: any[];
  aspects: any[];
  interpretations: {
    overallVerdict: string;
    strengths: string[];
    weaknesses: string[];
    contradictionFlags: string[];
    finalResolvedMeaning: string;
  };
  positions: VargaPosition[];
  ascendantRashi: number;
}

export interface ShodashVargaResult {
  charts: DivisionalChart[];
  /** Vimshopaka Bala — strength based on dignity across all 16 charts */
  vimshopakaBala: Record<string, number>;
  /** Varga Dignity Names (Parijata, Gopura, etc.) for each planet */
  vargaDignities: Record<string, { name: string; nameHi: string; count: number }>;
}

// ─── Varga Definitions ────────────────────────────────────────────────────────

const VARGA_CONFIGS = [
  { name: 'D1 - Rashi',        nameHi: 'D1 - राशि',        division: 1,  purpose: { en: 'Overall life, personality, general predictions', hi: 'समग्र जीवन, व्यक्तित्व, सामान्य भविष्यवाणी' } },
  { name: 'D2 - Hora',         nameHi: 'D2 - होरा',         division: 2,  purpose: { en: 'Wealth, financial prosperity', hi: 'धन, आर्थिक समृद्धि' } },
  { name: 'D3 - Drekkana',     nameHi: 'D3 - द्रेक्काण',    division: 3,  purpose: { en: 'Siblings, courage, short journeys', hi: 'भाई-बहन, साहस, छोटी यात्राएं' } },
  { name: 'D4 - Chaturthamsha',nameHi: 'D4 - चतुर्थांश',   division: 4,  purpose: { en: 'Property, home, fixed assets', hi: 'संपत्ति, घर, स्थायी संपत्ति' } },
  { name: 'D7 - Saptamsha',    nameHi: 'D7 - सप्तमांश',    division: 7,  purpose: { en: 'Children, progeny, creativity', hi: 'संतान, रचनात्मकता' } },
  { name: 'D9 - Navamsha',     nameHi: 'D9 - नवमांश',      division: 9,  purpose: { en: 'Marriage, dharma, spiritual life, inner self', hi: 'विवाह, धर्म, आध्यात्मिक जीवन, आंतरिक स्वभाव' } },
  { name: 'D10 - Dashamsha',   nameHi: 'D10 - दशमांश',     division: 10, purpose: { en: 'Career, profession, status, achievements', hi: 'करियर, पेशा, पद, उपलब्धियां' } },
  { name: 'D12 - Dwadashamsha',nameHi: 'D12 - द्वादशांश',  division: 12, purpose: { en: 'Parents, ancestry, past life karma', hi: 'माता-पिता, वंश, पूर्व जन्म कर्म' } },
  { name: 'D16 - Shodashamsha',nameHi: 'D16 - षोडशांश',    division: 16, purpose: { en: 'Vehicles, comforts, luxuries', hi: 'वाहन, सुख-सुविधाएं, विलासिता' } },
  { name: 'D20 - Vimshamsha',  nameHi: 'D20 - विंशांश',    division: 20, purpose: { en: 'Spiritual progress, religious activities', hi: 'आध्यात्मिक प्रगति, धार्मिक गतिविधियां' } },
  { name: 'D24 - Chaturvimshamsha', nameHi: 'D24 - चतुर्विंशांश', division: 24, purpose: { en: 'Education, learning, knowledge', hi: 'शिक्षा, ज्ञान, विद्या' } },
  { name: 'D27 - Saptavimshamsha',  nameHi: 'D27 - सप्तविंशांश',  division: 27, purpose: { en: 'Strength, vitality, physical constitution', hi: 'शक्ति, जीवन शक्ति, शारीरिक संरचना' } },
  { name: 'D30 - Trimshamsha', nameHi: 'D30 - त्रिंशांश',  division: 30, purpose: { en: 'Misfortunes, evils, health issues', hi: 'दुर्भाग्य, बुराइयां, स्वास्थ्य समस्याएं' } },
  { name: 'D40 - Khavedamsha', nameHi: 'D40 - खवेदांश',    division: 40, purpose: { en: 'Auspicious/inauspicious effects, maternal ancestry', hi: 'शुभ/अशुभ प्रभाव, मातृ वंश' } },
  { name: 'D45 - Akshavedamsha',nameHi: 'D45 - अक्षवेदांश', division: 45, purpose: { en: 'General indications, paternal ancestry', hi: 'सामान्य संकेत, पितृ वंश' } },
  { name: 'D60 - Shashtiamsha',nameHi: 'D60 - षष्ट्यांश',  division: 60, purpose: { en: 'Past life karma, overall destiny', hi: 'पूर्व जन्म कर्म, समग्र भाग्य' } },
];

// Exaltation and own sign data
const EXALTATION: Record<string, number> = {
  Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6,
};
const DEBILITATION: Record<string, number> = {
  Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0,
};
const OWN_SIGNS: Record<string, number[]> = {
  Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5],
  Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10],
};

// ─── Core Calculation ─────────────────────────────────────────────────────────

/**
 * Calculate varga rashi for a given longitude and division
 */
function calculateVargaRashi(longitude: number, division: number): number {
  const normalizedLon = ((longitude % 360) + 360) % 360;
  const rashiIndex = Math.floor(normalizedLon / 30); // 0-11
  const degreesInRashi = normalizedLon - rashiIndex * 30; // 0-30

  // Which part of the rashi are we in?
  const partSize = 30 / division;
  const partIndex = Math.floor(degreesInRashi / partSize); // 0 to division-1

  // Special rules for specific vargas
  if (division === 2) {
    // Hora: Sun's hora (odd rashis, first half) or Moon's hora
    const isOddRashi = rashiIndex % 2 === 0;
    if (isOddRashi) return partIndex === 0 ? 4 : 3; // Leo or Cancer
    else return partIndex === 0 ? 3 : 4;
  }

  if (division === 3) {
    // Drekkana: 1st part = same rashi, 2nd = 5th from it, 3rd = 9th from it
    return (rashiIndex + partIndex * 4) % 12;
  }

  if (division === 9) {
    // Navamsha: fire signs start from Aries, earth from Capricorn, air from Libra, water from Cancer
    const fireStart = [0, 4, 8];   // Aries, Leo, Sagittarius
    const earthStart = [1, 5, 9];  // Taurus, Virgo, Capricorn
    const airStart = [2, 6, 10];   // Gemini, Libra, Aquarius
    const waterStart = [3, 7, 11]; // Cancer, Scorpio, Pisces

    let startRashi: number;
    if (fireStart.includes(rashiIndex)) startRashi = 0;       // Aries
    else if (earthStart.includes(rashiIndex)) startRashi = 9; // Capricorn
    else if (airStart.includes(rashiIndex)) startRashi = 6;   // Libra
    else startRashi = 3;                                       // Cancer

    return (startRashi + partIndex) % 12;
  }

  if (division === 12) {
    // Dwadashamsha: starts from the same rashi
    return (rashiIndex + partIndex) % 12;
  }

  if (division === 30) {
    // Trimshamsha: special rules for odd/even rashis
    const isOddRashi = rashiIndex % 2 === 0;
    const deg = degreesInRashi;
    if (isOddRashi) {
      if (deg < 5) return 0;       // Aries (Mars)
      if (deg < 10) return 10;     // Aquarius (Saturn)
      if (deg < 18) return 8;      // Sagittarius (Jupiter)
      if (deg < 25) return 2;      // Gemini (Mercury)
      return 6;                    // Libra (Venus)
    } else {
      if (deg < 5) return 6;       // Libra (Venus)
      if (deg < 12) return 2;      // Gemini (Mercury)
      if (deg < 20) return 8;      // Sagittarius (Jupiter)
      if (deg < 25) return 10;     // Aquarius (Saturn)
      return 0;                    // Aries (Mars)
    }
  }

  // Default: sequential mapping
  return (rashiIndex * division + partIndex) % 12;
}

/**
 * Calculate a single divisional chart
 */
function calculateVargaChart(
  config: typeof VARGA_CONFIGS[0],
  planetLongitudes: Record<string, number>,
  ascendantLongitude: number,
): DivisionalChart {
  const positions: VargaPosition[] = Object.entries(planetLongitudes).map(([planet, lon]) => {
    const vargaRashi = calculateVargaRashi(lon, config.division);
    const vargaLongitude = (lon * config.division) % 30;

    return {
      planet,
      originalLongitude: lon,
      vargaRashi,
      vargaLongitude,
      isExalted: EXALTATION[planet] === vargaRashi,
      isDebilitated: DEBILITATION[planet] === vargaRashi,
      isOwnSign: (OWN_SIGNS[planet] || []).includes(vargaRashi),
    };
  });

  const ascendantRashi = calculateVargaRashi(ascendantLongitude, config.division);

  // Mock planets with shadbala for the dashboard
  const planets = positions.map(pos => ({
    planet: pos.planet,
    sign: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][pos.vargaRashi],
    degree: pos.vargaLongitude,
    vargottama: false, // Would need D1 comparison
    exaltation: pos.isExalted,
    dignity: { type: pos.isExalted ? 'exalted' : pos.isOwnSign ? 'own' : 'neutral' },
    shadbala: { total: 400 + Math.random() * 200, ratio: 1.0 + Math.random() }
  }));

  // Mock houses
  const houses = Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    sign: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][(ascendantRashi + i) % 12],
    lord: 'Unknown',
    planets: positions.filter(p => p.vargaRashi === (ascendantRashi + i) % 12).map(p => p.planet),
    isKendra: [1, 4, 7, 10].includes(i + 1),
    isTrikona: [1, 5, 9].includes(i + 1),
    isUpachaya: [3, 6, 10, 11].includes(i + 1)
  }));

  return {
    id: `varga-${config.division}`,
    name: config.name,
    nameHi: config.nameHi,
    number: config.division,
    division: config.division,
    purpose: config.purpose.en,
    purposeObj: config.purpose,
    strength: {
      overall: 75 + Math.random() * 20,
      specialPoints: 'Moderate',
      vargottamaCount: 0,
      exaltedCount: positions.filter(p => p.isExalted).length,
      ownHouseCount: positions.filter(p => p.isOwnSign).length
    },
    planets,
    houses,
    aspects: [],
    interpretations: synthesizeDivisionalVerdict(config.division, positions, ascendantRashi),
    positions,
    ascendantRashi
  };
}

/**
 * Calculate Vimshopaka Bala (strength across 16 charts)
 * Each chart has a weight; exaltation/own sign gives full points
 */
const VIMSHOPAKA_WEIGHTS: Record<number, number> = {
  1: 3.5, 2: 1, 3: 1, 4: 0.5, 7: 0.5, 9: 3, 10: 0.5, 12: 0.5,
  16: 2, 20: 0.5, 24: 0.5, 27: 0.5, 30: 1, 40: 0.5, 45: 0.5, 60: 4,
};

function calculateVimshopakaBala(charts: DivisionalChart[]): Record<string, number> {
  const bala: Record<string, number> = {};

  for (const chart of charts) {
    const weight = VIMSHOPAKA_WEIGHTS[chart.division] || 0;
    for (const pos of chart.positions) {
      if (!bala[pos.planet]) bala[pos.planet] = 0;
      if (pos.isExalted) bala[pos.planet] += weight;
      else if (pos.isOwnSign) bala[pos.planet] += weight * 0.75;
      else bala[pos.planet] += weight * 0.25; // Neutral
    }
  }

  return bala;
}

const VARGA_NAMES = [
  { count: 2,  en: 'Parijata',      hi: 'पारिजात' },
  { count: 3,  en: 'Uttama',        hi: 'उत्तम' },
  { count: 4,  en: 'Gopura',        hi: 'गोपुर' },
  { count: 5,  en: 'Simhasana',      hi: 'सिंहासन' },
  { count: 6,  en: 'Parvata',       hi: 'पर्वत' },
  { count: 7,  en: 'Devaloka',      hi: 'देवलोक' },
  { count: 8,  en: 'Brahmaloka',    hi: 'ब्रह्मलोक' },
  { count: 10, en: 'Shakra-Vahana', hi: 'शक्रवाहन' },
  { count: 11, en: 'Shridhara',     hi: 'श्रीधर' },
];

function calculateVargaDignities(charts: DivisionalChart[]): Record<string, { name: string; nameHi: string; count: number }> {
  const counts: Record<string, number> = {};
  
  // Count how many times each planet is in its own sign or exalted
  for (const chart of charts) {
    for (const pos of chart.positions) {
      if (!counts[pos.planet]) counts[pos.planet] = 0;
      if (pos.isExalted || pos.isOwnSign) {
        counts[pos.planet]++;
      }
    }
  }

  const dignities: Record<string, { name: string; nameHi: string; count: number }> = {};
  for (const [planet, count] of Object.entries(counts)) {
    // Find the highest applicable name
    const dignityMatch = [...VARGA_NAMES].reverse().find(v => count >= v.count);
    if (dignityMatch) {
      dignities[planet] = { name: dignityMatch.en, nameHi: dignityMatch.hi, count };
    }
  }

  return dignities;
}

// ─── Main Function ────────────────────────────────────────────────────────────

/**
 * Calculate all 16 divisional charts
 * @param planetLongitudes - absolute sidereal longitudes (0-360) for each planet
 * @param ascendantLongitude - absolute sidereal longitude of ascendant
 */
export function calculateShodashVarga(
  planetLongitudes: Record<string, number>,
  ascendantLongitude: number,
): ShodashVargaResult {
  const charts = VARGA_CONFIGS.map(config =>
    calculateVargaChart(config, planetLongitudes, ascendantLongitude)
  );

  const vimshopakaBala = calculateVimshopakaBala(charts);
  const vargaDignities = calculateVargaDignities(charts);

  return { charts, vimshopakaBala, vargaDignities };
}

/**
 * Get a specific divisional chart by division number
 */
export function getVargaChart(
  result: ShodashVargaResult,
  division: number,
): DivisionalChart | undefined {
  return result.charts.find(c => c.division === division);
}

/**
 * Get Navamsha (D9) chart — most important divisional chart
 */
export function getNavamsha(result: ShodashVargaResult): DivisionalChart | undefined {
  return getVargaChart(result, 9);
}

/**
 * Get Dashamsha (D10) chart — career chart
 */
export function getDashamsha(result: ShodashVargaResult): DivisionalChart | undefined {
  return getVargaChart(result, 10);
}

/**
 * Check if a planet is Vargottama (same rashi in D1 and D9)
 */
export function isVargottama(
  d1Rashi: number,
  d9Rashi: number,
 ): boolean {
  return d1Rashi === d9Rashi;
}

/**
 * Get all Vargottama planets
 */
export function getVargottamaPlanets(result: ShodashVargaResult): string[] {
  const d1 = getVargaChart(result, 1);
  const d9 = getVargaChart(result, 9);
  if (!d1 || !d9) return [];

  return d1.positions
    .filter(p1 => {
      const p9 = d9.positions.find(p => p.planet === p1.planet);
      return p9 && p1.vargaRashi === p9.vargaRashi;
    })
    .map(p => p.planet);
}

export { VARGA_CONFIGS };

// ─── Dashboard adapter (Phase-2 UI expects async methods + birth params) ───

/** Params shape used by `DivisionalChartsDashboard` demo loader. */
export interface DivisionalChartParams {
  birthDate: Date;
  birthTime: string;
  birthLocation: { latitude: number; longitude: number; timezone: string };
  ayanamsa: number;
  divisionalChart: number;
  system: string;
}

const DEMO_PLANET_LONGITUDES: Record<string, number> = {
  Sun: 280.5,
  Moon: 95.2,
  Mars: 210.3,
  Mercury: 265.1,
  Jupiter: 88.7,
  Venus: 320.4,
  Saturn: 155.8,
  Rahu: 12.5,
  Ketu: 192.5,
};

const DEMO_ASCENDANT_LONGITUDE = 32.4;

export const divisionalChartsService = {
  async calculateNavamshaChart(_params: DivisionalChartParams): Promise<DivisionalChart> {
    const result = calculateShodashVarga(DEMO_PLANET_LONGITUDES, DEMO_ASCENDANT_LONGITUDE);
    const chart = getNavamsha(result);
    if (!chart) throw new Error('Navamsha calculation failed');
    return chart;
  },
  async calculateDashamshaChart(_params: DivisionalChartParams): Promise<DivisionalChart> {
    const result = calculateShodashVarga(DEMO_PLANET_LONGITUDES, DEMO_ASCENDANT_LONGITUDE);
    const chart = getDashamsha(result);
    if (!chart) throw new Error('Dashamsha calculation failed');
    return chart;
  },
};

function synthesizeDivisionalVerdict(division: number, positions: VargaPosition[], ascendantRashi: number) {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const contradictionFlags: string[] = [];
  let overallVerdict = '';
  let finalResolvedMeaning = '';

  const exalted = positions.filter(p => p.isExalted);
  const debilitated = positions.filter(p => p.isDebilitated);
  const ownSign = positions.filter(p => p.isOwnSign);

  if (exalted.length > 0) strengths.push(`${exalted.map(p => p.planet).join(', ')} in exaltation.`);
  if (ownSign.length > 0) strengths.push(`${ownSign.map(p => p.planet).join(', ')} in own sign.`);
  if (debilitated.length > 0) weaknesses.push(`${debilitated.map(p => p.planet).join(', ')} in debilitation.`);

  const lagnaLord = Object.keys(OWN_SIGNS).find(p => OWN_SIGNS[p]?.includes(ascendantRashi));
  const lagnaLordPos = positions.find(p => p.planet === lagnaLord);

  if (lagnaLordPos) {
    if (lagnaLordPos.isExalted || lagnaLordPos.isOwnSign) {
      strengths.push(`Lagna Lord ${lagnaLord} is strong.`);
    } else if (lagnaLordPos.isDebilitated) {
      weaknesses.push(`Lagna Lord ${lagnaLord} is debilitated, weakening the chart's foundation.`);
      contradictionFlags.push('Lagna Lord affliction limits the realization of positive yogas.');
    }
  }

  const strongCount = exalted.length + ownSign.length;
  const weakCount = debilitated.length;

  if (division === 9) {
    overallVerdict = 'Navamsha (D9) - Marriage, Dharma & Underlying Strength';
    if (strongCount > weakCount) {
      finalResolvedMeaning = 'The D9 chart shows structural integrity, indicating that the natal promises will manifest reliably, especially after marriage or in the second half of life.';
    } else {
      finalResolvedMeaning = 'The D9 chart shows structural weakness. Some natal promises may fail to manifest fully or could face significant hurdles.';
    }
  } else if (division === 10) {
    overallVerdict = 'Dashamsha (D10) - Career, Status & Professional Achievements';
    if (strongCount > weakCount) {
      finalResolvedMeaning = 'The D10 chart strongly supports professional rise. The native has the capacity to attain authority and sustain their status.';
    } else {
      finalResolvedMeaning = 'The D10 chart indicates professional fluctuations. Success requires sustained effort, and authority may be challenged.';
    }
  } else if (division === 60) {
    overallVerdict = 'Shastiamsha (D60) - Past Life Karma & Root Destiny';
    if (strongCount > weakCount) {
      finalResolvedMeaning = 'Positive past life karma (D60) provides a strong invisible safety net, ensuring ultimate success despite earthly hurdles.';
    } else {
      finalResolvedMeaning = 'Karmic debts (D60) are present, which may create unexplainable blockages that require spiritual remedies.';
    }
  } else {
    overallVerdict = `D${division} Chart Synthesis`;
    finalResolvedMeaning = strongCount >= weakCount ? `The D${division} divisional chart supports its corresponding life areas.` : `The D${division} divisional chart indicates challenges in its corresponding life areas.`;
  }

  return {
    overallVerdict,
    strengths,
    weaknesses,
    contradictionFlags,
    finalResolvedMeaning
  };
}
