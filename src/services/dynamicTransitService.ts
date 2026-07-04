/**
 * src/services/dynamicTransitService.ts
 * Dynamic Transit Calculator with Real-time Ephemeris
 * 
 * Features:
 * 1. Real ephemeris API integration (Swiss Ephemeris WASM)
 * 2. Dynamic date-based calculations
 * 3. User-selectable date picker
 * 4. Accurate sidereal (Lahiri) positions
 */

import { calcPlanetsAccurate, initSwissEphemeris } from './swissEphemerisService';
import { PLANETS, RASHIS, VEDHA_PAIRS, TransitResult, PLANET_REMEDIES } from '../data/transitData';

export interface DynamicTransitInput {
  moonRashiIndex: number;
  date: Date;
  time?: string; // HH:mm format, defaults to 00:00 UTC
}

export interface DynamicTransitOutput {
  date: Date;
  time: string;
  transits: TransitResult[];
  totalScore: number;
  overallStatus: 'favorable' | 'unfavorable' | 'mixed';
  moonRashiIndex: number;
  planetPositions: Record<string, number>; // planet name -> rashi index
}

/**
 * Calculate transits for a specific date using real ephemeris data
 */
export async function calculateDynamicTransits(
  input: DynamicTransitInput
): Promise<DynamicTransitOutput> {
  const startTime = performance.now();
  console.log('[Transit] Calculation started', { input });

  // Validate input
  if (!input || !input.date) {
    const error = 'Invalid input: date is required';
    console.error('[Transit] Validation failed:', error);
    throw new Error(error);
  }

  if (typeof input.moonRashiIndex !== 'number' || input.moonRashiIndex < 0 || input.moonRashiIndex > 11) {
    const error = 'Invalid moon rashi index: must be between 0 and 11';
    console.error('[Transit] Validation failed:', error);
    throw new Error(error);
  }

  // Initialize Swiss Ephemeris
  await initSwissEphemeris();

  const { moonRashiIndex, date, time = '00:00' } = input;

  // Validate date
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    const error = 'Invalid date provided';
    console.error('[Transit] Validation failed:', error);
    throw new Error(error);
  }

  // Validate time format (HH:mm)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    const error = 'Invalid time format. Use HH:mm (e.g., 14:30)';
    console.error('[Transit] Validation failed:', error);
    throw new Error(error);
  }

  // Format date as YYYY-MM-DD
  const dateStr = date.toISOString().split('T')[0];
  console.log('[Transit] Processing date:', { dateStr, time });

  // Get accurate planetary positions
  let ephemerisData;
  try {
    ephemerisData = await calcPlanetsAccurate(dateStr, time);
    console.log('[Transit] Ephemeris data retrieved successfully');
  } catch (err) {
    console.error('[Transit] Ephemeris calculation failed:', err);
    throw new Error('Failed to calculate planetary positions. Please try again.');
  }

  if (!ephemerisData) {
    const error = 'No ephemeris data returned';
    console.error('[Transit]', error);
    throw new Error(error);
  }

  // Extract rashi indices from ephemeris data
  const planetPositions: Record<string, number> = {};
  const planetRashiMap: Record<string, number> = {};

  if (ephemerisData.planets) {
    for (const planet of ephemerisData.planets) {
      const rashiIndex = planet.rashiIndex ?? Math.floor(planet.sidereal / 30);
      // Ensure rashi index is within bounds (0-11)
      planetRashiMap[planet.name] = Math.max(0, Math.min(11, rashiIndex % 12));
    }
  } else {
    // Fallback: use individual planet data
    const getRashiIndex = (sidereal: number) => Math.max(0, Math.min(11, Math.floor(sidereal / 30) % 12));
    
    planetRashiMap['Sun'] = getRashiIndex(ephemerisData.sun.sidereal);
    planetRashiMap['Moon'] = getRashiIndex(ephemerisData.moon.sidereal);
    planetRashiMap['Mercury'] = getRashiIndex(ephemerisData.mercury.sidereal);
    planetRashiMap['Venus'] = getRashiIndex(ephemerisData.venus.sidereal);
    planetRashiMap['Mars'] = getRashiIndex(ephemerisData.mars.sidereal);
    planetRashiMap['Jupiter'] = getRashiIndex(ephemerisData.jupiter.sidereal);
    planetRashiMap['Saturn'] = getRashiIndex(ephemerisData.saturn.sidereal);
    planetRashiMap['Rahu'] = getRashiIndex(ephemerisData.rahu.sidereal);
    planetRashiMap['Ketu'] = getRashiIndex(ephemerisData.ketu.sidereal);
  }

  // Calculate transits using the same logic as before
  const results: TransitResult[] = [];
  let totalScore = 0;

  for (const planet of PLANETS) {
    const currentRashi = planetRashiMap[planet.en] ?? 0;
    const houseFromMoon = ((currentRashi - moonRashiIndex + 12) % 12) + 1;
    const baseFavorable = planet.favorableHouses.includes(houseFromMoon);

    // Check vedha
    let vedhaActive = false;
    let vedhaNote = '';
    if (baseFavorable) {
      const vedhaHouse = VEDHA_PAIRS[planet.en]?.[houseFromMoon];
      if (vedhaHouse !== undefined && vedhaHouse !== null) {
        for (const otherPlanet of PLANETS) {
          if (otherPlanet.en === planet.en) continue;
          const otherRashi = planetRashiMap[otherPlanet.en];
          if (otherRashi === undefined) continue;
          const otherHouse = ((otherRashi - moonRashiIndex + 12) % 12) + 1;
          if (otherHouse === vedhaHouse) {
            vedhaActive = true;
            vedhaNote = `${otherPlanet.en} in ${vedhaHouse}th`;
            break;
          }
        }
      }
    }

    const effectiveStatus = baseFavorable
      ? vedhaActive ? 'mixed' : 'favorable'
      : 'unfavorable';
    const scoreContribution = effectiveStatus === 'favorable' ? 1 : 0;
    totalScore += scoreContribution;

    // Get house-specific effect
    const HOUSE_EFFECTS_EN: Record<string, Record<number, string>> = {
      Sun: {
        3: 'Courage, success over rivals, good health & energy',
        6: 'Victory over enemies, health improvement, debt relief',
        8: 'Challenges: health issues, stress, financial losses, obstacles. Avoid risks',
        10: 'Authority, fame, professional success, government favor',
        11: 'Income gains, fulfillment of desires, social recognition',
      },
      Moon: {
        1: 'Comfort, mental peace, good results in endeavors',
        3: 'Wealth gain, good relations, mental strength',
        6: 'Victory, health recovery, overcoming challenges',
        7: 'Respect, happiness in marriage, social gains',
        10: 'Career boost, productivity, recognition. Good for professional pursuits',
        11: 'Financial gains, happiness, fulfillment of wishes',
      },
      Mercury: {
        2: 'Wealth gain, eloquent speech, family harmony',
        4: 'Domestic happiness, property gains, education success',
        6: 'Victory in disputes, sharp intellect, health relief',
        8: 'Anxiety, miscommunication, hidden issues, document errors. Be careful with travel',
        10: 'Professional success, good communication, recognition',
        11: 'Income gain, trade profits, intellectual achievement',
      },
      Venus: {
        1: 'Physical comfort, beauty, romantic happiness',
        2: 'Wealth, family joy, fine food, luxuries',
        3: 'Courage, artistic success, good sibling relations',
        4: 'Property gain, vehicles, domestic happiness',
        5: 'Romance, creativity, children\'s welfare, entertainment',
        8: 'Relationship/finance ups-downs, unexpected expenses, emotional turmoil. Hidden gains possible',
        9: 'Fortune, spiritual growth, long journeys',
        11: 'Income, social status, fulfillment of desires',
        12: 'Bed pleasures, spiritual growth, foreign connections',
      },
      Mars: {
        3: 'Courage, victory, physical strength, sibling support',
        6: 'Defeat of enemies, strength, overcoming illness',
        7: 'Partnership tensions, arguments, health concerns for spouse. Avoid confrontations',
        11: 'Income, fulfillment of ambitions, property gains',
      },
      Jupiter: {
        2: 'Wealth, knowledge, family happiness, good speech',
        5: 'Children\'s welfare, education, spiritual merit, creativity',
        7: 'Marriage harmony, partnerships, social status',
        9: 'Fortune, dharma, higher education, pilgrimage',
        11: 'Great gains, achievement, recognition, prosperity',
        12: 'Increased expenses, isolation, setbacks in growth. Supports spiritual pursuits, foreign matters',
      },
      Saturn: {
        3: 'Courage, property, servant support, stability',
        6: 'Victory over enemies, health recovery, fame',
        9: 'Delays in luck, travel, higher education. Feels burdensome',
        11: 'Income, achievement, position improvement',
      },
      Rahu: {
        3: 'Bravery, success in competition, gain through foreigners',
        6: 'Victory, removal of obstacles, health improvement',
        8: 'Sudden changes, mysteries, health scares. Potential for transformative insights. Unpredictable',
        10: 'Professional success, foreign opportunities, authority',
        11: 'Major gains, wish fulfillment, social elevation',
      },
      Ketu: {
        2: 'Family/finance/speech disruptions, spiritual detachment. Detachment-oriented effects',
        3: 'Spiritual courage, overcoming fear, gains',
        6: 'Victory, health relief, spiritual progress',
        11: 'Income, fulfillment, rare achievements',
      },
    };

    const GENERIC_EFFECTS = {
      favorable: 'Generally positive results expected in this transit',
      unfavorable: 'Challenges expected; exercise caution and patience',
    };

    const effectEn = HOUSE_EFFECTS_EN[planet.en]?.[houseFromMoon]
      ?? GENERIC_EFFECTS[baseFavorable ? 'favorable' : 'unfavorable'];

    // Hindi effects (same as in transitData.ts)
    const HOUSE_EFFECTS_HI: Record<string, Record<number, string>> = {
      Sun: {
        3: 'साहस, प्रतिद्वंद्वियों पर सफलता, अच्छा स्वास्थ्य व ऊर्जा',
        6: 'शत्रु पर विजय, स्वास्थ्य सुधार, ऋण मुक्ति',
        8: 'चुनौतियाँ: स्वास्थ्य, तनाव, आर्थिक हानि, बाधाएं। जोखिम से बचें',
        10: 'अधिकार, यश, व्यावसायिक सफलता, सरकारी कृपा',
        11: 'आय लाभ, इच्छा पूर्ति, सामाजिक मान्यता',
      },
      Moon: {
        1: 'सुख, मानसिक शांति, कार्यों में शुभ परिणाम',
        3: 'धन लाभ, अच्छे संबंध, मानसिक बल',
        6: 'विजय, स्वास्थ्य सुधार, चुनौतियों पर काबू',
        7: 'सम्मान, वैवाहिक सुख, सामाजिक लाभ',
        10: 'कार्य सफलता, उत्पादकता, मान्यता। व्यावसायिक कार्यों में शुभ',
        11: 'आर्थिक लाभ, प्रसन्नता, मनोकामना पूर्ति',
      },
      Mercury: {
        2: 'धन लाभ, वाक्पटुता, पारिवारिक सामंजस्य',
        4: 'गृह सुख, संपत्ति लाभ, शिक्षा सफलता',
        6: 'विवाद में विजय, तीक्ष्ण बुद्धि, स्वास्थ्य राहत',
        8: 'चिंता, गलत संवाद, छिपी समस्याएं, दस्तावेज़ त्रुटि। यात्रा में सावधानी',
        10: 'व्यावसायिक सफलता, अच्छा संवाद, मान्यता',
        11: 'आय लाभ, व्यापार मुनाफा, बौद्धिक उपलब्धि',
      },
      Venus: {
        1: 'शारीरिक सुख, सौंदर्य, प्रेम में प्रसन्नता',
        2: 'धन, पारिवारिक आनंद, उत्तम भोजन, विलासिता',
        3: 'साहस, कलात्मक सफलता, भाई-बहन से शुभ संबंध',
        4: 'संपत्ति लाभ, वाहन, गृह सुख',
        5: 'प्रेम, रचनात्मकता, संतान कल्याण, मनोरंजन',
        8: 'संबंधों/वित्त में उतार-चढ़ाव, अप्रत्याशित खर्च, भावनात्मक उथल-पुथल। छिपे लाभ संभव',
        9: 'भाग्य, आध्यात्मिक वृद्धि, लंबी यात्राएं',
        11: 'आय, सामाजिक प्रतिष्ठा, इच्छा पूर्ति',
        12: 'शयन सुख, आध्यात्मिक वृद्धि, विदेशी संबंध',
      },
      Mars: {
        3: 'साहस, विजय, शारीरिक बल, भाई-बहन सहयोग',
        6: 'शत्रु पराजय, शक्ति, रोग पर विजय',
        7: 'साझेदारी में तनाव, वाद-विवाद, जीवनसाथी स्वास्थ्य चिंता। टकराव से बचें',
        11: 'आय, महत्वाकांक्षा पूर्ति, संपत्ति लाभ',
      },
      Jupiter: {
        2: 'धन, ज्ञान, पारिवारिक सुख, अच्छी वाणी',
        5: 'संतान कल्याण, शिक्षा, पुण्य, रचनात्मकता',
        7: 'वैवाहिक सामंजस्य, साझेदारी, सामाजिक प्रतिष्ठा',
        9: 'भाग्य, धर्म, उच्च शिक्षा, तीर्थयात्रा',
        11: 'महान लाभ, उपलब्धि, मान्यता, समृद्धि',
        12: 'खर्च वृद्धि, एकांत, विकास में बाधा। आध्यात्मिक कार्य, विदेशी मामलों में सहायक',
      },
      Saturn: {
        3: 'साहस, संपत्ति, सेवक सहयोग, स्थिरता',
        6: 'शत्रु पर विजय, स्वास्थ्य सुधार, यश',
        9: 'भाग्य/यात्रा/उच्च शिक्षा में विलंब। बोझिल अनुभव',
        11: 'आय, उपलब्धि, पद सुधार',
      },
      Rahu: {
        3: 'वीरता, प्रतियोगिता में सफलता, विदेशियों से लाभ',
        6: 'विजय, बाधा निवारण, स्वास्थ्य सुधार',
        8: 'अचानक परिवर्तन, रहस्य, स्वास्थ्य भय। परिवर्तनकारी अंतर्दृष्टि संभव। अप्रत्याशित',
        10: 'व्यावसायिक सफलता, विदेशी अवसर, अधिकार',
        11: 'बड़ा लाभ, इच्छा पूर्ति, सामाजिक उन्नति',
      },
      Ketu: {
        2: 'परिवार/वित्त/वाणी में व्यवधान, आध्यात्मिक वैराग्य। विरक्ति उन्मुख प्रभाव',
        3: 'आध्यात्मिक साहस, भय पर विजय, लाभ',
        6: 'विजय, स्वास्थ्य राहत, आध्यात्मिक प्रगति',
        11: 'आय, पूर्ति, दुर्लभ उपलब्धियां',
      },
    };

    const effectHi = HOUSE_EFFECTS_HI[planet.en]?.[houseFromMoon]
      ?? GENERIC_EFFECTS[baseFavorable ? 'favorable' : 'unfavorable'];

    const rating = baseFavorable && !vedhaActive
      ? 7 + (planet.favorableHouses.length > 4 ? 1 : 0)
      : baseFavorable && vedhaActive
      ? 4
      : 3;

    results.push({
      planet,
      currentRashi,
      houseFromMoon,
      baseFavorable,
      vedhaActive,
      vedhaNote: vedhaNote || 'None',
      effectiveStatus,
      scoreContribution,
      rating,
      effectEn,
      effectHi,
    });

    planetPositions[planet.en] = currentRashi;
  }

  const overallStatus = totalScore >= 6 ? 'favorable' : totalScore >= 3 ? 'mixed' : 'unfavorable';

  const result = {
    date,
    time,
    transits: results,
    totalScore,
    overallStatus,
    moonRashiIndex,
    planetPositions,
  };

  const endTime = performance.now();
  console.log('[Transit] Calculation completed', {
    duration: `${(endTime - startTime).toFixed(2)}ms`,
    score: totalScore,
    status: overallStatus,
  });

  return result;
}

/**
 * Get today's transits
 */
export async function getTodayTransits(moonRashiIndex: number): Promise<DynamicTransitOutput> {
  return calculateDynamicTransits({
    moonRashiIndex,
    date: new Date(),
  });
}

/**
 * Get transits for a specific date range (for analysis)
 */
export async function getTransitRange(
  moonRashiIndex: number,
  startDate: Date,
  endDate: Date,
  step: 'daily' | 'weekly' = 'daily'
): Promise<DynamicTransitOutput[]> {
  // Validate date range
  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
    throw new Error('Invalid start date');
  }
  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    throw new Error('Invalid end date');
  }
  if (startDate > endDate) {
    throw new Error('Start date must be before end date');
  }

  // Limit date range to 1 year to prevent performance issues
  const maxRangeMs = 365 * 24 * 60 * 60 * 1000; // 1 year
  if (endDate.getTime() - startDate.getTime() > maxRangeMs) {
    throw new Error('Date range cannot exceed 1 year');
  }

  const results: DynamicTransitOutput[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const transit = await calculateDynamicTransits({
      moonRashiIndex,
      date: new Date(current),
    });
    results.push(transit);

    // Increment by step
    if (step === 'daily') {
      current.setDate(current.getDate() + 1);
    } else {
      current.setDate(current.getDate() + 7);
    }
  }

  return results;
}

export interface DoubleTransitResult {
  confirmedByJupiter: boolean;
  confirmedBySaturn: boolean;
  doubleTransitConfirmed: boolean;
  supportLevel: 'none' | 'partial' | 'full';
  explanation: string;
}

/**
 * Stage 2 Interpretation: Evaluate Double Transit Protocol (Jupiter + Saturn)
 * A major event is confirmed when both Jupiter and Saturn aspect/transit the topic house.
 */
export function evaluateDoubleTransitSupport(
  queryTopicHouse: number, // 1 to 12
  ascendantRashi: number,  // 0 to 11
  transitData: DynamicTransitOutput
): DoubleTransitResult {
  // Target rashi for the topic house
  const targetRashi = (ascendantRashi + queryTopicHouse - 1) % 12;

  // Transit positions
  const jupRashi = transitData.planetPositions['Jupiter'];
  const satRashi = transitData.planetPositions['Saturn'];

  if (jupRashi === undefined || satRashi === undefined) {
    return { 
      confirmedByJupiter: false, 
      confirmedBySaturn: false, 
      doubleTransitConfirmed: false, 
      supportLevel: 'none', 
      explanation: 'Ephemeris data missing for Jupiter or Saturn.' 
    };
  }

  // Jupiter aspects: conjunct (+0), 5th (+4), 7th (+6), 9th (+8)
  const jupAspectRashis = [0, 4, 6, 8].map(offset => (jupRashi + offset) % 12);
  const confirmedByJupiter = jupAspectRashis.includes(targetRashi);

  // Saturn aspects: conjunct (+0), 3rd (+2), 7th (+6), 10th (+9)
  const satAspectRashis = [0, 2, 6, 9].map(offset => (satRashi + offset) % 12);
  const confirmedBySaturn = satAspectRashis.includes(targetRashi);

  const doubleTransitConfirmed = confirmedByJupiter && confirmedBySaturn;

  let supportLevel: 'none' | 'partial' | 'full' = 'none';
  if (doubleTransitConfirmed) supportLevel = 'full';
  else if (confirmedByJupiter || confirmedBySaturn) supportLevel = 'partial';

  let explanation = '';
  if (doubleTransitConfirmed) {
    explanation = `Double Transit CONFIRMED: Both Jupiter and Saturn are aspecting or transiting the topic sign. Strong activation of event.`;
  } else if (confirmedByJupiter) {
    explanation = `Partial Transit: Only Jupiter activates the topic sign. Blessings are present but might lack structural manifestation.`;
  } else if (confirmedBySaturn) {
    explanation = `Partial Transit: Only Saturn activates the topic sign. Effort and delays are indicated without Jupiter's grace.`;
  } else {
    explanation = `No major transit support for the topic sign at this time. Event is not structurally activated.`;
  }

  return {
    confirmedByJupiter,
    confirmedBySaturn,
    doubleTransitConfirmed,
    supportLevel,
    explanation
  };
}

// === V2.1 DOUBLE TRANSIT PROTOCOL ===

export type DoubleTransitType = 
  | 'DOUBLE_TRANSIT_CERTIFIED' 
  | 'DOUBLE_TRANSIT_SUPPORTED'
  | 'DOUBLE_TRANSIT_PEAK'
  | 'SINGLE_TRANSIT_TEMPORARY'
  | 'NO_TRANSIT_IGNITION';

export interface TransitData {
  planet: string;
  house: number;
  aspectsHouse?: number;
  isRetrograde: boolean;
  degrees: number;
}

export interface DoubleTransitResultV2 {
  type: DoubleTransitType;
  activePlanet?: 'Jupiter' | 'Saturn';
  label: string;
  certifies: boolean;      // true if permanent structural change
  description: string;
  jupiterHouse?: number;
  saturnHouse?: number;
}

/**
 * LAYER 7 — Double Transit Protocol
 * Check Jupiter + Saturn simultaneous influence on a house/point.
 * Single Jupiter transit = temporary window only (not structural).
 * Single Saturn transit = pressure without expansion (test without reward).
 * Both together = CERTIFIED permanent structural change.
 */
export function checkDoubleTransit(
  targetHouse: number,
  jupiterTransits: TransitData[],
  saturnTransits: TransitData[],
  targetName: string = 'the target'
): DoubleTransitResultV2 {
  const jupiterInHouse = jupiterTransits.some(t => t.house === targetHouse);
  const jupiterAspects = jupiterTransits.some(t => t.aspectsHouse === targetHouse);
  const jupiterActive = jupiterInHouse || jupiterAspects;
  const jupiterHouse = jupiterTransits.find(t => t.house === targetHouse || t.aspectsHouse === targetHouse)?.house;

  const saturnInHouse = saturnTransits.some(t => t.house === targetHouse);
  const saturnAspects = saturnTransits.some(t => t.aspectsHouse === targetHouse);
  const saturnActive = saturnInHouse || saturnAspects;
  const saturnHouse = saturnTransits.find(t => t.house === targetHouse || t.aspectsHouse === targetHouse)?.house;

  // Both Jupiter AND Saturn transiting same house = PEAK WINDOW
  if (jupiterInHouse && saturnInHouse) {
    return {
      type: 'DOUBLE_TRANSIT_PEAK',
      certifies: true,
      label: 'PEAK WINDOW — Maximum Manifestation Pressure',
      description: `Both Jupiter and Saturn are simultaneously transiting ${targetName} (house ${targetHouse}). This is the maximum-pressure window for manifestation. The event is not only certified — it is forced into being. [Level 5: Immediate 18-month window]`,
      jupiterHouse,
      saturnHouse,
    };
  }

  // Jupiter transits + Saturn aspects = CERTIFIED
  if (jupiterActive && saturnActive) {
    return {
      type: 'DOUBLE_TRANSIT_CERTIFIED',
      certifies: true,
      label: 'CERTIFIED — Permanent Structural Change',
      description: `Jupiter ${jupiterInHouse ? 'transits' : 'aspects'} ${targetName} while Saturn ${saturnInHouse ? 'transits' : 'aspects'} it. This double convergence certifies a permanent structural change, not a temporary window. The event will happen and will endure.`,
      jupiterHouse,
      saturnHouse,
    };
  }

  // Only Jupiter active = TEMPORARY
  if (jupiterActive && !saturnActive) {
    return {
      type: 'SINGLE_TRANSIT_TEMPORARY',
      activePlanet: 'Jupiter',
      certifies: false,
      label: 'Temporary Window — Jupiter Only',
      description: `Jupiter ${jupiterInHouse ? 'transits' : 'aspects'} ${targetName}, but Saturn is not involved. This is a temporary blessing window only — not a structural change. Benefits may arrive and then dissipate. [SINGLE TRANSIT: Temporary]`,
      jupiterHouse,
    };
  }

  // Only Saturn active = TEMPORARY (pressure without expansion)
  if (!jupiterActive && saturnActive) {
    return {
      type: 'SINGLE_TRANSIT_TEMPORARY',
      activePlanet: 'Saturn',
      certifies: false,
      label: 'Temporary Pressure — Saturn Only',
      description: `Saturn ${saturnInHouse ? 'transits' : 'aspects'} ${targetName}, but Jupiter is not involved. This is pressure without expansion — a test without guaranteed reward. Work done now matters, but results are not assured without Jupiter's blessing. [SINGLE TRANSIT: Test Period]`,
      saturnHouse,
    };
  }

  // Neither active
  return {
    type: 'NO_TRANSIT_IGNITION',
    certifies: false,
    label: 'No Transit Ignition',
    description: `Neither Jupiter nor Saturn is currently influencing ${targetName}. No transit ignition is present. Wait for the next convergence window.`,
  };
}

/** Check Double Transit for Marriage (7th house) */
export function checkMarriageDoubleTransit(
  jupiterTransits: TransitData[],
  saturnTransits: TransitData[],
  seventhLordHouse?: number
): DoubleTransitResultV2 {
  const house7 = checkDoubleTransit(7, jupiterTransits, saturnTransits, '7th house');
  if (house7.certifies) return house7;
  
  // Also check 7th lord's position if known
  if (seventhLordHouse) {
    const lordCheck = checkDoubleTransit(seventhLordHouse, jupiterTransits, saturnTransits, '7th lord');
    if (lordCheck.certifies) return lordCheck;
  }
  
  return house7;
}

/** Check Double Transit for Career/Fame (10th house) */
export function checkCareerDoubleTransit(
  jupiterTransits: TransitData[],
  saturnTransits: TransitData[]
): DoubleTransitResultV2 {
  return checkDoubleTransit(10, jupiterTransits, saturnTransits, '10th house');
}

/** Check Double Transit for Wealth (2nd/11th houses) */
export function checkWealthDoubleTransit(
  jupiterTransits: TransitData[],
  saturnTransits: TransitData[]
): DoubleTransitResultV2 {
  const h2 = checkDoubleTransit(2, jupiterTransits, saturnTransits, '2nd house');
  if (h2.certifies) return h2;
  return checkDoubleTransit(11, jupiterTransits, saturnTransits, '11th house');
}

