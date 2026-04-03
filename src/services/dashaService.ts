/**
 * Vimshottari Dasha System
 * The primary predictive system in Vedic astrology
 * Total cycle: 120 years across 9 planets
 */

import { calculateNakshatra } from './nakshatraService';
import { calculateMoonPosition } from './ephemerisService';

// Vimshottari Dasha periods (years) for each planet
export const DASHA_PERIODS: Record<string, number> = {
  Ketu:    7,
  Venus:   20,
  Sun:     6,
  Moon:    10,
  Mars:    7,
  Rahu:    18,
  Jupiter: 16,
  Saturn:  19,
  Mercury: 17,
};

// Dasha sequence starting from Ketu
export const DASHA_SEQUENCE = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
  'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

// Nakshatra lords (each nakshatra maps to a dasha lord)
// 27 nakshatras, 9 lords × 3 = 27
export const NAKSHATRA_LORDS: string[] = [
  'Ketu',    // 1. Ashwini
  'Venus',   // 2. Bharani
  'Sun',     // 3. Krittika
  'Moon',    // 4. Rohini
  'Mars',    // 5. Mrigashira
  'Rahu',    // 6. Ardra
  'Jupiter', // 7. Punarvasu
  'Saturn',  // 8. Pushya
  'Mercury', // 9. Ashlesha
  'Ketu',    // 10. Magha
  'Venus',   // 11. Purva Phalguni
  'Sun',     // 12. Uttara Phalguni
  'Moon',    // 13. Hasta
  'Mars',    // 14. Chitra
  'Rahu',    // 15. Swati
  'Jupiter', // 16. Vishakha
  'Saturn',  // 17. Anuradha
  'Mercury', // 18. Jyeshtha
  'Ketu',    // 19. Mula
  'Venus',   // 20. Purva Ashadha
  'Sun',     // 21. Uttara Ashadha
  'Moon',    // 22. Shravana
  'Mars',    // 23. Dhanishtha
  'Rahu',    // 24. Shatabhisha
  'Jupiter', // 25. Purva Bhadrapada
  'Saturn',  // 26. Uttara Bhadrapada
  'Mercury', // 27. Revati
];

export interface DashaPeriod {
  planet: string;
  startDate: Date;
  endDate: Date;
  durationYears: number;
  isActive: boolean;
  antardashas: AntarDasha[];
}

export interface AntarDasha {
  planet: string;        // Antardasha lord
  mahadashaLord: string; // Parent Mahadasha lord
  startDate: Date;
  endDate: Date;
  durationDays: number;
  isActive: boolean;
  pratyantardashas?: PratyantarDasha[];
}

export interface PratyantarDasha {
  planet: string;
  startDate: Date;
  endDate: Date;
  durationDays: number;
  isActive: boolean;
}

export interface DashaResult {
  birthDate: Date;
  moonNakshatra: number;       // 1-27
  moonNakshatraName: string;
  moonNakshatraLord: string;
  balanceDays: number;         // Remaining days of first dasha at birth
  balanceYears: number;        // Remaining years of first dasha at birth
  mahadashas: DashaPeriod[];
  currentMahadasha: DashaPeriod | null;
  currentAntardasha: AntarDasha | null;
  currentPratyantardasha: PratyantarDasha | null;
}

const TOTAL_DASHA_YEARS = 120;
const DAYS_PER_YEAR = 365.25;

/**
 * Calculate the balance of the first dasha at birth
 * Based on Moon's position within its nakshatra
 */
function calculateDashaBalance(moonLongitude: number): {
  lord: string;
  balanceDays: number;
  nakshatraIndex: number; // 0-26
} {
  const normalizedLon = ((moonLongitude % 360) + 360) % 360;
  const nakshatraIndex = Math.floor(normalizedLon / (360 / 27)); // 0-26
  const lord = NAKSHATRA_LORDS[nakshatraIndex];
  const periodYears = DASHA_PERIODS[lord];

  // Degrees traversed within the nakshatra
  const nakshatraSize = 360 / 27; // 13.333...°
  const degreesInNakshatra = normalizedLon - nakshatraIndex * nakshatraSize;
  const fractionTraversed = degreesInNakshatra / nakshatraSize;
  const fractionRemaining = 1 - fractionTraversed;

  const balanceDays = fractionRemaining * periodYears * DAYS_PER_YEAR;

  return { lord, balanceDays, nakshatraIndex };
}

/**
 * Add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setTime(result.getTime() + days * 24 * 60 * 60 * 1000);
  return result;
}

/**
 * Calculate Antardasha periods within a Mahadasha
 */
function calculateAntardashas(
  mahadashaLord: string,
  mahadashaStart: Date,
  mahadashaEnd: Date,
  now: Date
): AntarDasha[] {
  const mahaYears = DASHA_PERIODS[mahadashaLord];
  const startIdx = DASHA_SEQUENCE.indexOf(mahadashaLord);
  const antardashas: AntarDasha[] = [];
  let currentDate = new Date(mahadashaStart);

  for (let i = 0; i < 9; i++) {
    const antarLord = DASHA_SEQUENCE[(startIdx + i) % 9];
    const antarYears = DASHA_PERIODS[antarLord];
    // Antardasha duration = (mahadasha years × antardasha years / 120) years
    const durationDays = (mahaYears * antarYears / TOTAL_DASHA_YEARS) * DAYS_PER_YEAR;
    const endDate = addDays(currentDate, durationDays);

    antardashas.push({
      planet: antarLord,
      mahadashaLord,
      startDate: new Date(currentDate),
      endDate,
      durationDays,
      isActive: now >= currentDate && now < endDate,
    });

    currentDate = endDate;
  }

  return antardashas;
}

/**
 * Calculate Pratyantardasha periods within an Antardasha
 */
function calculatePratyantardashas(
  antarLord: string,
  mahaLord: string,
  antarStart: Date,
  antarEnd: Date,
  now: Date
): PratyantarDasha[] {
  const mahaYears = DASHA_PERIODS[mahaLord];
  const antarYears = DASHA_PERIODS[antarLord];
  const antarDays = (mahaYears * antarYears / TOTAL_DASHA_YEARS) * DAYS_PER_YEAR;

  const startIdx = DASHA_SEQUENCE.indexOf(antarLord);
  const pratyantars: PratyantarDasha[] = [];
  let currentDate = new Date(antarStart);

  for (let i = 0; i < 9; i++) {
    const pratyLord = DASHA_SEQUENCE[(startIdx + i) % 9];
    const pratyYears = DASHA_PERIODS[pratyLord];
    // Pratyantardasha = (antardasha days × pratyantardasha years / 120)
    const durationDays = (antarDays * pratyYears) / TOTAL_DASHA_YEARS;
    const endDate = addDays(currentDate, durationDays);

    pratyantars.push({
      planet: pratyLord,
      startDate: new Date(currentDate),
      endDate,
      durationDays,
      isActive: now >= currentDate && now < endDate,
    });

    currentDate = endDate;
  }

  return pratyantars;
}

/**
 * Main function: Calculate complete Vimshottari Dasha for a birth date/time
 */
export function calculateVimshottariDasha(
  dateStr: string,
  timeStr: string,
  yearsToShow = 3  // How many complete dasha cycles to show (past + future)
): DashaResult {
  const now = new Date();

  // Get Moon's sidereal longitude
  const moonPos = calculateMoonPosition(dateStr, timeStr);
  const moonLongitude = moonPos.rashiIndex * 30 + moonPos.degrees;

  // Get nakshatra info
  const nakshatraInfo = calculateNakshatra(moonLongitude);
  const nakshatraIndex = nakshatraInfo.number - 1; // 0-based

  // Calculate dasha balance at birth
  const { lord: firstLord, balanceDays } = calculateDashaBalance(moonLongitude);

  // Parse birth date
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = timeStr.split(':').map(Number);
  const birthDate = new Date(y, m - 1, d, h, min, 0);

  // Build all mahadasha periods
  const mahadashas: DashaPeriod[] = [];
  const firstLordIdx = DASHA_SEQUENCE.indexOf(firstLord);

  let currentDate = new Date(birthDate);

  // First dasha: partial (balance only)
  const firstEndDate = addDays(currentDate, balanceDays);
  const firstAntardashas = calculateAntardashas(firstLord, currentDate, firstEndDate, now);
  mahadashas.push({
    planet: firstLord,
    startDate: new Date(currentDate),
    endDate: firstEndDate,
    durationYears: balanceDays / DAYS_PER_YEAR,
    isActive: now >= currentDate && now < firstEndDate,
    antardashas: firstAntardashas,
  });
  currentDate = firstEndDate;

  // Subsequent full dashas — show enough to cover current date + future
  const maxDate = addDays(now, yearsToShow * DAYS_PER_YEAR * 10);
  let idx = (firstLordIdx + 1) % 9;

  while (currentDate < maxDate) {
    const lord = DASHA_SEQUENCE[idx];
    const years = DASHA_PERIODS[lord];
    const endDate = addDays(currentDate, years * DAYS_PER_YEAR);
    const antardashas = calculateAntardashas(lord, currentDate, endDate, now);

    mahadashas.push({
      planet: lord,
      startDate: new Date(currentDate),
      endDate,
      durationYears: years,
      isActive: now >= currentDate && now < endDate,
      antardashas,
    });

    currentDate = endDate;
    idx = (idx + 1) % 9;
  }

  // Find current periods
  const currentMahadasha = mahadashas.find(d => d.isActive) || null;
  const currentAntardasha = currentMahadasha?.antardashas.find(a => a.isActive) || null;

  // Calculate pratyantardashas for current antardasha
  let currentPratyantardasha: PratyantarDasha | null = null;
  if (currentAntardasha && currentMahadasha) {
    const pratyantars = calculatePratyantardashas(
      currentAntardasha.planet,
      currentMahadasha.planet,
      currentAntardasha.startDate,
      currentAntardasha.endDate,
      now
    );
    currentAntardasha.pratyantardashas = pratyantars;
    currentPratyantardasha = pratyantars.find(p => p.isActive) || null;
  }

  const nakshatraName = typeof nakshatraInfo.name === 'string'
    ? nakshatraInfo.name
    : (nakshatraInfo.name as { en: string }).en;

  return {
    birthDate,
    moonNakshatra: nakshatraInfo.number,
    moonNakshatraName: nakshatraName,
    moonNakshatraLord: firstLord,
    balanceDays,
    balanceYears: balanceDays / DAYS_PER_YEAR,
    mahadashas,
    currentMahadasha,
    currentAntardasha,
    currentPratyantardasha,
  };
}

/**
 * Format a dasha period for display
 */
export function formatDashaDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

/**
 * Get dasha interpretation text
 */
export function getDashaInterpretation(planet: string, lang: 'en' | 'hi' = 'en'): {
  en: string;
  hi: string;
} {
  const interpretations: Record<string, { en: string; hi: string }> = {
    Sun: {
      en: 'Period of authority, government, father, health, and self-confidence. Good for career advancement and leadership roles.',
      hi: 'अधिकार, सरकार, पिता, स्वास्थ्य और आत्मविश्वास का काल। करियर उन्नति और नेतृत्व के लिए अच्छा।'
    },
    Moon: {
      en: 'Period of emotions, mother, mind, travel, and public life. Good for relationships and creative pursuits.',
      hi: 'भावनाओं, माता, मन, यात्रा और सार्वजनिक जीवन का काल। रिश्तों और रचनात्मक कार्यों के लिए अच्छा।'
    },
    Mars: {
      en: 'Period of energy, courage, siblings, property, and action. Good for physical activities and real estate.',
      hi: 'ऊर्जा, साहस, भाई-बहन, संपत्ति और कार्य का काल। शारीरिक गतिविधियों और अचल संपत्ति के लिए अच्छा।'
    },
    Rahu: {
      en: 'Period of ambition, foreign connections, technology, and unconventional paths. Transformative and unpredictable.',
      hi: 'महत्वाकांक्षा, विदेशी संबंध, प्रौद्योगिकी और अपरंपरागत मार्गों का काल। परिवर्तनकारी और अप्रत्याशित।'
    },
    Jupiter: {
      en: 'Period of wisdom, expansion, spirituality, children, and good fortune. Most auspicious dasha for growth.',
      hi: 'ज्ञान, विस्तार, आध्यात्मिकता, संतान और सौभाग्य का काल। विकास के लिए सबसे शुभ दशा।'
    },
    Saturn: {
      en: 'Period of discipline, hard work, karma, delays, and long-term results. Tests patience and perseverance.',
      hi: 'अनुशासन, कठिन परिश्रम, कर्म, विलंब और दीर्घकालिक परिणामों का काल। धैर्य और दृढ़ता की परीक्षा।'
    },
    Mercury: {
      en: 'Period of intellect, communication, business, education, and analytical skills. Good for learning and trade.',
      hi: 'बुद्धि, संचार, व्यापार, शिक्षा और विश्लेषणात्मक कौशल का काल। सीखने और व्यापार के लिए अच्छा।'
    },
    Ketu: {
      en: 'Period of spirituality, detachment, past karma, and liberation. Mystical experiences and inner transformation.',
      hi: 'आध्यात्मिकता, वैराग्य, पूर्व कर्म और मोक्ष का काल। रहस्यमय अनुभव और आंतरिक परिवर्तन।'
    },
    Venus: {
      en: 'Period of love, luxury, arts, relationships, and material comforts. Most enjoyable dasha for pleasures.',
      hi: 'प्रेम, विलासिता, कला, रिश्ते और भौतिक सुखों का काल। सुखों के लिए सबसे आनंददायक दशा।'
    },
  };

  return interpretations[planet] || {
    en: `${planet} Dasha period.`,
    hi: `${planet} दशा काल।`
  };
}

/**
 * Get planet symbol for display
 */
export function getPlanetSymbol(planet: string): string {
  const symbols: Record<string, string> = {
    Sun: '☀️', Moon: '🌙', Mars: '♂️', Mercury: '☿️',
    Jupiter: '♃', Venus: '♀️', Saturn: '♄', Rahu: '☊', Ketu: '☋'
  };
  return symbols[planet] || '⭐';
}
