/**
 * Navamsa (D9) Chart Service
 * The Navamsa chart is the most important divisional chart for marriage analysis.
 * It reveals the quality of marriage, spouse characteristics, and marital happiness.
 *
 * Calculation: Each rashi (30°) is divided into 9 parts (3°20' each = Navamsa).
 * The Navamsa sign is determined by which 3°20' slice the planet falls in.
 */

export interface NavamsaPosition {
  planet: string;
  planetHindi: string;
  rashiD1: number;      // Sign in birth chart (0-11)
  rashiD1Name: string;
  degreeInSign: number; // Degree within the sign (0-30)
  navamsaRashi: number; // Sign in D9 chart (0-11)
  navamsaRashiName: string;
  navamsaPada: number;  // Pada 1-9
  significance: string;
}

export interface NavamsaChart {
  positions: NavamsaPosition[];
  seventhLordD9: string;
  seventhSignD9: string;
  venusNavamsa: string;
  jupiterNavamsa: string;
  lagnaNavamsa: string;
  marriageAnalysis: MarriageD9Analysis;
}

export interface MarriageD9Analysis {
  overallScore: number;       // 0-100
  rating: string;
  spouseQualities: string[];
  timingInsights: string[];
  doshaInD9: string[];
  yogas: string[];
  remedies: string[];
}

const RASHI_NAMES = [
  'Aries (मेष)', 'Taurus (वृषभ)', 'Gemini (मिथुन)', 'Cancer (कर्क)',
  'Leo (सिंह)', 'Virgo (कन्या)', 'Libra (तुला)', 'Scorpio (वृश्चिक)',
  'Sagittarius (धनु)', 'Capricorn (मकर)', 'Aquarius (कुम्भ)', 'Pisces (मीन)',
];

const RASHI_SHORT = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const RASHI_LORDS = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
];

/**
 * Calculate Navamsa (D9) sign for a planet given its sidereal longitude.
 * 
 * For a fire sign (Aries, Leo, Sag): Navamsa starts from Aries
 * For an earth sign (Taurus, Virgo, Cap): Navamsa starts from Capricorn
 * For an air sign (Gemini, Libra, Aqu): Navamsa starts from Libra
 * For a water sign (Cancer, Scorpio, Pisces): Navamsa starts from Cancer
 */
export function getNavamsaRashi(siderealLongitude: number): { rashi: number; pada: number } {
  const signIndex = Math.floor(siderealLongitude / 30) % 12;
  const degreeInSign = siderealLongitude % 30;
  const navamsaNumber = Math.floor(degreeInSign / (30 / 9)); // 0-8 (each pada = 3°20')

  // Starting sign for each element
  const elementStarts: Record<number, number> = {
    0: 0,   // Fire (Aries, Leo, Sag) → starts from Aries
    1: 9,   // Earth (Taurus, Virgo, Cap) → starts from Capricorn
    2: 6,   // Air (Gemini, Libra, Aqu) → starts from Libra
    3: 3,   // Water (Cancer, Scorpio, Pisces) → starts from Cancer
  };

  const element = signIndex % 4; // 0=fire, 1=earth, 2=air, 3=water
  const startSign = elementStarts[element];
  const navamsaRashi = (startSign + navamsaNumber) % 12;

  return { rashi: navamsaRashi, pada: navamsaNumber + 1 };
}

/**
 * Approximate planetary positions for Priyvrit Singh
 * DOB: 08 Oct 1999, 07:43 AM, Udaipur (24.59°N, 73.71°E)
 * Computed using standard Vedic ephemeris approximations with Lahiri ayanamsa
 *
 * These are approximate sidereal longitudes.
 * For production, use Swiss Ephemeris or similar.
 */
export function getPriyvritPlanetaryPositions(): Array<{
  planet: string;
  planetHindi: string;
  siderealLong: number;
  significance: string;
}> {
  return [
    {
      planet: 'Ascendant (Lagna)',
      planetHindi: 'लग्न',
      siderealLong: 167.5,   // ~17°30' Virgo (Kanya Lagna)
      significance: 'Self, personality, physical appearance',
    },
    {
      planet: 'Sun',
      planetHindi: 'सूर्य',
      siderealLong: 171.2,   // ~21°12' Virgo — debilitated in natural chart but here in own nakshatra context
      significance: 'Soul, father, authority, career',
    },
    {
      planet: 'Moon',
      planetHindi: 'चन्द्र',
      siderealLong: 149.09,  // ~29°09' Leo — Uttara Phalguni Pada 1
      significance: 'Mind, emotions, mother, public image',
    },
    {
      planet: 'Mars',
      planetHindi: 'मंगल',
      siderealLong: 188.7,   // ~8°42' Libra — debilitated
      significance: 'Energy, courage, siblings, property',
    },
    {
      planet: 'Mercury',
      planetHindi: 'बुध',
      siderealLong: 158.3,   // ~8°18' Virgo — exalted (own sign)
      significance: 'Intelligence, communication, business',
    },
    {
      planet: 'Jupiter',
      planetHindi: 'गुरु',
      siderealLong: 56.8,    // ~26°48' Taurus
      significance: 'Wisdom, fortune, children, guru',
    },
    {
      planet: 'Venus',
      planetHindi: 'शुक्र',
      siderealLong: 142.5,   // ~22°30' Leo
      significance: 'Love, marriage, spouse, luxury',
    },
    {
      planet: 'Saturn',
      planetHindi: 'शनि',
      siderealLong: 26.4,    // ~26°24' Aries
      significance: 'Discipline, karma, longevity, service',
    },
    {
      planet: 'Rahu',
      planetHindi: 'राहु',
      siderealLong: 115.2,   // ~25°12' Cancer
      significance: 'Obsession, foreign, unconventional, illusion',
    },
    {
      planet: 'Ketu',
      planetHindi: 'केतु',
      siderealLong: 295.2,   // ~25°12' Capricorn
      significance: 'Spirituality, detachment, past karma',
    },
  ];
}

/**
 * Build the complete Navamsa (D9) chart.
 * If dynamicPositions are supplied (from vedicEngine.buildChart), use them.
 * Otherwise, fall back to the hardcoded Priyvrit Singh positions for backward compatibility.
 */
export function buildNavamsaChart(dynamicPositions?: Array<{
  planet: string;
  planetHindi?: string;
  siderealLong: number;
  significance?: string;
}>): NavamsaChart {
  const planets = dynamicPositions
    ? dynamicPositions.map(p => ({
        planet: p.planet,
        planetHindi: p.planetHindi ?? '',
        siderealLong: p.siderealLong,
        significance: p.significance ?? '',
      }))
    : getPriyvritPlanetaryPositions();

  const positions: NavamsaPosition[] = [];

  for (const p of planets) {
    const signIndex = Math.floor(p.siderealLong / 30) % 12;
    const degreeInSign = p.siderealLong % 30;
    const { rashi: navRashi, pada } = getNavamsaRashi(p.siderealLong);

    positions.push({
      planet: p.planet,
      planetHindi: p.planetHindi,
      rashiD1: signIndex,
      rashiD1Name: RASHI_NAMES[signIndex],
      degreeInSign: Math.round(degreeInSign * 100) / 100,
      navamsaRashi: navRashi,
      navamsaRashiName: RASHI_NAMES[navRashi],
      navamsaPada: pada,
      significance: p.significance,
    });
  }

  // Lagna in D9
  const lagnaD9 = positions.find(p => p.planet.includes('Lagna') || p.planet === 'Lagna')!;
  // 7th from D9 Lagna
  const seventhSignIndex = (lagnaD9.navamsaRashi + 6) % 12;
  const seventhLord = RASHI_LORDS[seventhSignIndex];

  // Venus position in D9
  const venusD9 = positions.find(p => p.planet === 'Venus')!;
  // Jupiter position in D9
  const jupiterD9 = positions.find(p => p.planet === 'Jupiter')!;

  // Marriage analysis
  const marriageAnalysis = analyzeMarriageFromD9(positions, lagnaD9, seventhSignIndex, seventhLord, venusD9, jupiterD9);

  return {
    positions,
    seventhLordD9: seventhLord,
    seventhSignD9: RASHI_NAMES[seventhSignIndex],
    venusNavamsa: venusD9.navamsaRashiName,
    jupiterNavamsa: jupiterD9.navamsaRashiName,
    lagnaNavamsa: lagnaD9.navamsaRashiName,
    marriageAnalysis,
  };
}

function analyzeMarriageFromD9(
  positions: NavamsaPosition[],
  lagnaD9: NavamsaPosition,
  seventhSignIndex: number,
  seventhLord: string,
  venusD9: NavamsaPosition,
  jupiterD9: NavamsaPosition,
): MarriageD9Analysis {
  const spouseQualities: string[] = [];
  const timingInsights: string[] = [];
  const doshaInD9: string[] = [];
  const yogas: string[] = [];
  const remedies: string[] = [];
  let score = 65; // Base score

  // 1. Analyze 7th house sign in D9
  const seventhSignName = RASHI_SHORT[seventhSignIndex];
  spouseQualities.push(
    `7th house of D9 falls in ${RASHI_NAMES[seventhSignIndex]}, ruled by ${seventhLord}.`
  );

  // 7th lord analysis
  if (['Venus', 'Jupiter', 'Moon'].includes(seventhLord)) {
    spouseQualities.push(`${seventhLord} as 7th lord in Navamsa is highly auspicious for marital harmony — spouse will be cultured, attractive, and supportive.`);
    score += 10;
  } else if (['Saturn', 'Mars'].includes(seventhLord)) {
    spouseQualities.push(`${seventhLord} as 7th lord may bring a spouse who is strong-willed, hardworking, and disciplined. Marriage may come after some delay but will be stable.`);
    doshaInD9.push(`${seventhLord} lordship of D9 7th house suggests need for patience in marriage matters.`);
  } else {
    spouseQualities.push(`${seventhLord} as 7th lord brings intellectual and communicative qualities to the spouse.`);
  }

  // 2. Venus in D9 — the key marriage significator
  if ([1, 6, 11].includes(venusD9.navamsaRashi)) {
    // Venus in own or exaltation sign
    spouseQualities.push(`Venus in ${venusD9.navamsaRashiName} in D9 — Venus is strong, indicating a beautiful, loving, and artistic spouse. Marriage will be fulfilling.`);
    yogas.push('Shukra Bala Yoga — Venus strong in Navamsa');
    score += 12;
  } else if ([5, 7].includes(venusD9.navamsaRashi)) {
    // Venus debilitated (Virgo) or afflicted 
    doshaInD9.push(`Venus in ${venusD9.navamsaRashiName} in D9 may indicate initial adjustments in married life. Remedies for Venus are recommended.`);
    remedies.push('Recite "Om Shukraya Namah" 108 times on Fridays. Wear a Diamond or White Sapphire after consulting a Jyotishi.');
    score -= 5;
  } else {
    spouseQualities.push(`Venus in ${venusD9.navamsaRashiName} in D9 — brings charm and a taste for comfort. Spouse will value aesthetics, harmony, and domestic peace.`);
    score += 5;
  }

  // 3. Jupiter in D9 — husband significator / fortune
  if ([3, 8, 11].includes(jupiterD9.navamsaRashi)) {
    spouseQualities.push(`Jupiter in ${jupiterD9.navamsaRashiName} in D9 — Jupiter is well placed, bringing wisdom, righteousness, and fortune in marriage.`);
    yogas.push('Guru Bala Yoga — Jupiter strong in Navamsa');
    score += 8;
  } else {
    spouseQualities.push(`Jupiter in ${jupiterD9.navamsaRashiName} in D9 — brings philosophical depth and moral values to the marital bond.`);
    score += 3;
  }

  // 4. Lagna lord in D9
  const lagnaSign = lagnaD9.navamsaRashi;
  spouseQualities.push(`D9 Lagna falls in ${lagnaD9.navamsaRashiName} — the native's D9 personality is shaped by ${RASHI_LORDS[lagnaSign]}. This influences how he approaches marriage and partnership.`);

  // 5. Check if any planet occupies 7th house in D9
  const planetsIn7th = positions.filter(p => p.navamsaRashi === seventhSignIndex && !p.planet.includes('Lagna'));
  if (planetsIn7th.length > 0) {
    const planetNames = planetsIn7th.map(p => p.planet).join(', ');
    spouseQualities.push(`${planetNames} placed in 7th house of D9 — directly influences spouse's nature and the quality of marriage.`);
    
    for (const p of planetsIn7th) {
      if (p.planet === 'Venus') {
        yogas.push('Venus in D9 7th house — Malavya-like Yoga — spouse is beautiful, artistic, and wealthy.');
        score += 10;
      }
      if (p.planet === 'Jupiter') {
        yogas.push('Jupiter in D9 7th house — Hamsa-like Yoga — spouse is wise, spiritual, and noble.');
        score += 10;
      }
      if (p.planet === 'Mars') {
        doshaInD9.push('Mars in D9 7th house — Kuja Dosha in Navamsa — may cause friction. Remedies needed.');
        remedies.push('Perform Mangal Dosha Nivarana puja. Chant Hanuman Chalisa on Tuesdays.');
        score -= 8;
      }
      if (p.planet === 'Saturn') {
        doshaInD9.push('Saturn in D9 7th house — may cause delays and coldness in marriage. Patience required.');
        remedies.push('Observe Shani Vrat (Saturday fast). Donate black sesame and iron on Saturdays.');
        score -= 5;
      }
      if (p.planet.includes('Rahu')) {
        doshaInD9.push('Rahu in D9 7th house — unconventional marriage circumstances possible. Foreign or inter-caste marriage likely.');
        score -= 3;
      }
    }
  } else {
    spouseQualities.push('No planets in D9 7th house — marriage matters are primarily judged by the 7th lord placement.');
  }

  // 6. Timing insights from D9
  timingInsights.push(`D9 Lagna in ${lagnaD9.navamsaRashiName} activates during the dasha of ${RASHI_LORDS[lagnaSign]}. Marriage is most likely when the dasha/antardasha lord connects to the D9 7th house or its lord.`);
  timingInsights.push(`Current Rahu Mahadasha → look for transits of Jupiter and Venus over the D9 7th house (${RASHI_NAMES[seventhSignIndex]}) for triggering marriage.`);
  timingInsights.push(`Jupiter's transit over natal Venus or the 7th house in both D1 and D9 is a classical marriage trigger.`);

  // 7. General remedies
  if (remedies.length === 0) {
    remedies.push('Worship Goddess Parvathi on Fridays for a virtuous spouse.');
    remedies.push('Recite Kalyanamastu mantra before any marriage-related discussion.');
  }
  remedies.push('Visit Swayamvara Parvathi temple or perform the homam for swift marriage.');

  // Clamp score
  score = Math.max(20, Math.min(95, score));

  let rating = 'Average';
  if (score >= 80) rating = 'Excellent';
  else if (score >= 65) rating = 'Good';
  else if (score >= 50) rating = 'Average';
  else rating = 'Challenging';

  return {
    overallScore: score,
    rating,
    spouseQualities,
    timingInsights,
    doshaInD9,
    yogas,
    remedies,
  };
}
