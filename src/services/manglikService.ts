/**
 * Manglik Dosha Service
 * Detects Manglik Dosha (Mars affliction) and calcellation conditions
 * Critical for marriage compatibility in Vedic Astrology
 */

import { calculateCompletePlanetaryPositions } from './ephemerisService';
import { calculateCompleteAscendant } from './ascendantService';

export interface ManglikResult {
  isManglik: boolean;
  severity: 'None' | 'Low' | 'Medium' | 'High' | 'Severe';
  marsHouse: number;
  marsRashi: string;
  affectedHouses: number[];
  cancellations: ManglikCancellation[];
  effectiveManglik: boolean; // After considering cancellations
  description: {
    en: string;
    hi: string;
  };
  remedies: {
    en: string[];
    hi: string[];
  };
}

export interface ManglikCancellation {
  rule: string;
  /** Alias for rule (test compatibility) */
  condition: string;
  applies: boolean;
  /** Alias for applies (test compatibility) */
  applicable: boolean;
  description: {
    en: string;
    hi: string;
  };
}

// Houses that cause Manglik Dosha when Mars is placed
const MANGLIK_HOUSES = [1, 2, 4, 7, 8, 12];

// Rashis where Mars is strong (reduces severity)
const MARS_STRONG_RASHIS = [0, 7]; // Aries (0), Scorpio (7) - Mars own signs
const MARS_EXALTED_RASHI = 9; // Capricorn (9) - Mars exalted

/**
 * Check if Mars placement causes Manglik Dosha
 */
function isMarsInManglikHouse(marsHouse: number): boolean {
  return MANGLIK_HOUSES.includes(marsHouse);
}

/**
 * Calculate Manglik severity based on house and rashi
 */
function calculateSeverity(marsHouse: number, marsRashi: number): 'None' | 'Low' | 'Medium' | 'High' | 'Severe' {
  if (!isMarsInManglikHouse(marsHouse)) {
    return 'None';
  }

  // Check if Mars is in own sign or exalted (reduces severity)
  const isStrong = MARS_STRONG_RASHIS.includes(marsRashi) || marsRashi === MARS_EXALTED_RASHI;

  // Severity by house
  const houseSeverity: Record<number, 'Low' | 'Medium' | 'High' | 'Severe'> = {
    1: 'High',    // Affects personality and health
    2: 'Medium',  // Affects family and speech
    4: 'Medium',  // Affects domestic happiness
    7: 'Severe',  // Directly affects marriage (most critical)
    8: 'High',    // Affects longevity and sudden events
    12: 'Medium'  // Affects expenses and losses
  };

  const baseSeverity = houseSeverity[marsHouse] || 'Medium';

  // Reduce severity if Mars is strong
  if (isStrong) {
    if (baseSeverity === 'Severe') return 'High';
    if (baseSeverity === 'High') return 'Medium';
    if (baseSeverity === 'Medium') return 'Low';
  }

  return baseSeverity;
}

/**
 * Check all Manglik cancellation conditions
 */
function checkCancellations(
  marsHouse: number,
  marsRashi: number,
  planets: Array<{ planet: string; house: number; rashi: number }>
): ManglikCancellation[] {
  const cancellations: ManglikCancellation[] = [];

  // Rule 1: Mars in own sign (Aries/Scorpio) or exalted (Capricorn)
  const isOwnSign = MARS_STRONG_RASHIS.includes(marsRashi);
  const isExalted = marsRashi === MARS_EXALTED_RASHI;
  cancellations.push({
    rule: 'Mars in Own Sign or Exalted',
    applies: isOwnSign || isExalted,
    description: {
      en: isOwnSign 
        ? 'Mars is in its own sign (Aries/Scorpio), significantly reducing negative effects.'
        : isExalted
        ? 'Mars is exalted in Capricorn, greatly reducing Manglik effects.'
        : 'Mars is not in own sign or exalted.',
      hi: isOwnSign
        ? 'मंगल अपनी राशि (मेष/वृश्चिक) में है, नकारात्मक प्रभाव काफी कम हो जाते हैं।'
        : isExalted
        ? 'मंगल मकर में उच्च है, मांगलिक प्रभाव बहुत कम हो जाते हैं।'
        : 'मंगल अपनी राशि या उच्च में नहीं है।'
    }
  });

  // Rule 2: Jupiter in Kendra (1, 4, 7, 10)
  const jupiter = planets.find(p => p.planet === 'Jupiter');
  const jupiterInKendra = jupiter && [1, 4, 7, 10].includes(jupiter.house);
  cancellations.push({
    rule: 'Jupiter in Kendra',
    applies: !!jupiterInKendra,
    description: {
      en: jupiterInKendra
        ? `Jupiter in ${jupiter.house}th house (Kendra) provides protection and cancels Manglik effects.`
        : 'Jupiter is not in Kendra (1st, 4th, 7th, or 10th house).',
      hi: jupiterInKendra
        ? `गुरु ${jupiter.house}वें भाव (केंद्र) में है, सुरक्षा प्रदान करता है और मांगलिक प्रभाव रद्द करता है।`
        : 'गुरु केंद्र (1ला, 4था, 7वां, या 10वां भाव) में नहीं है।'
    }
  });

  // Rule 3: Venus in Kendra
  const venus = planets.find(p => p.planet === 'Venus');
  const venusInKendra = venus && [1, 4, 7, 10].includes(venus.house);
  cancellations.push({
    rule: 'Venus in Kendra',
    applies: !!venusInKendra,
    description: {
      en: venusInKendra
        ? `Venus in ${venus.house}th house (Kendra) brings harmony and cancels Manglik dosha.`
        : 'Venus is not in Kendra.',
      hi: venusInKendra
        ? `शुक्र ${venus.house}वें भाव (केंद्र) में है, सामंजस्य लाता है और मांगलिक दोष रद्द करता है।`
        : 'शुक्र केंद्र में नहीं है।'
    }
  });

  // Rule 4: Mars in 2nd house with Jupiter/Venus
  const marsIn2nd = marsHouse === 2;
  const beneficWith2nd = marsIn2nd && planets.some(p => 
    (p.planet === 'Jupiter' || p.planet === 'Venus') && p.house === 2
  );
  cancellations.push({
    rule: 'Mars in 2nd with Jupiter/Venus',
    applies: beneficWith2nd,
    description: {
      en: beneficWith2nd
        ? 'Mars in 2nd house with Jupiter or Venus cancels the dosha through benefic influence.'
        : marsIn2nd
        ? 'Mars is in 2nd house but not with Jupiter or Venus.'
        : 'Mars is not in 2nd house.',
      hi: beneficWith2nd
        ? 'मंगल 2रे भाव में गुरु या शुक्र के साथ है, शुभ प्रभाव से दोष रद्द हो जाता है।'
        : marsIn2nd
        ? 'मंगल 2रे भाव में है लेकिन गुरु या शुक्र के साथ नहीं।'
        : 'मंगल 2रे भाव में नहीं है।'
    }
  });

  // Rule 5: Mars in 12th house with Jupiter
  const marsIn12th = marsHouse === 12;
  const jupiterWith12th = marsIn12th && jupiter && jupiter.house === 12;
  cancellations.push({
    rule: 'Mars in 12th with Jupiter',
    applies: !!jupiterWith12th,
    description: {
      en: jupiterWith12th
        ? 'Mars in 12th house with Jupiter provides spiritual protection and cancels dosha.'
        : marsIn12th
        ? 'Mars is in 12th house but not with Jupiter.'
        : 'Mars is not in 12th house.',
      hi: jupiterWith12th
        ? 'मंगल 12वें भाव में गुरु के साथ है, आध्यात्मिक सुरक्षा प्रदान करता है और दोष रद्द करता है।'
        : marsIn12th
        ? 'मंगल 12वें भाव में है लेकिन गुरु के साथ नहीं।'
        : 'मंगल 12वें भाव में नहीं है।'
    }
  });

  // Rule 6: Saturn in 7th house
  const saturn = planets.find(p => p.planet === 'Saturn');
  const saturnIn7th = saturn && saturn.house === 7;
  cancellations.push({
    rule: 'Saturn in 7th House',
    applies: !!saturnIn7th,
    description: {
      en: saturnIn7th
        ? 'Saturn in 7th house provides stability to marriage and cancels Mars dosha.'
        : 'Saturn is not in 7th house.',
      hi: saturnIn7th
        ? 'शनि 7वें भाव में है, विवाह को स्थिरता प्रदान करता है और मंगल दोष रद्द करता है।'
        : 'शनि 7वें भाव में नहीं है।'
    }
  });

  // Rule 7: Rahu in 7th house
  const rahu = planets.find(p => p.planet === 'Rahu');
  const rahuIn7th = rahu && rahu.house === 7;
  cancellations.push({
    rule: 'Rahu in 7th House',
    applies: !!rahuIn7th,
    description: {
      en: rahuIn7th
        ? 'Rahu in 7th house neutralizes Mars effects through its own influence.'
        : 'Rahu is not in 7th house.',
      hi: rahuIn7th
        ? 'राहु 7वें भाव में है, अपने प्रभाव से मंगल प्रभाव को निष्प्रभावी करता है।'
        : 'राहु 7वें भाव में नहीं है।'
    }
  });

  // Rule 8: Mars aspected by Jupiter
  // (Simplified: Jupiter in 5th, 7th, or 9th from Mars)
  const marsHouseNum = marsHouse;
  const jupiterAspectsMars = jupiter && (
    jupiter.house === (marsHouseNum + 4) % 12 || jupiter.house === (marsHouseNum + 4) ||
    jupiter.house === (marsHouseNum + 6) % 12 || jupiter.house === (marsHouseNum + 6) ||
    jupiter.house === (marsHouseNum + 8) % 12 || jupiter.house === (marsHouseNum + 8)
  );
  cancellations.push({
    rule: 'Jupiter Aspects Mars',
    applies: !!jupiterAspectsMars,
    description: {
      en: jupiterAspectsMars
        ? 'Jupiter aspects Mars, providing wisdom and reducing aggressive tendencies.'
        : 'Jupiter does not aspect Mars.',
      hi: jupiterAspectsMars
        ? 'गुरु मंगल को दृष्टि देता है, ज्ञान प्रदान करता है और आक्रामक प्रवृत्तियों को कम करता है।'
        : 'गुरु मंगल को दृष्टि नहीं देता।'
    }
  });

  // Rule 9: Both partners are Manglik (mutual cancellation)
  // This would need partner's chart - noted for future
  cancellations.push({
    rule: 'Both Partners Manglik',
    applies: false, // Requires partner chart
    description: {
      en: 'If both partners are Manglik, the dosha cancels out (requires partner chart analysis).',
      hi: 'यदि दोनों साथी मांगलिक हैं, तो दोष रद्द हो जाता है (साथी की कुंडली विश्लेषण की आवश्यकता है)।'
    }
  });

  // Rule 10: Mars in Navamsa chart cancellation
  // (Requires Navamsa calculation - future enhancement)
  cancellations.push({
    rule: 'Navamsa Chart Cancellation',
    applies: false, // Requires Navamsa
    description: {
      en: 'Certain Mars placements in Navamsa (D9) chart can cancel the dosha (requires Navamsa analysis).',
      hi: 'नवमांश (D9) चार्ट में कुछ मंगल स्थितियां दोष को रद्द कर सकती हैं (नवमांश विश्लेषण की आवश्यकता है)।'
    }
  });

  return cancellations;
}

/**
 * Get remedies for Manglik Dosha
 */
function getRemedies(severity: 'None' | 'Low' | 'Medium' | 'High' | 'Severe'): { en: string[]; hi: string[] } {
  if (severity === 'None') {
    return { en: [], hi: [] };
  }

  const commonRemedies = {
    en: [
      'Recite Hanuman Chalisa daily, especially on Tuesdays',
      'Fast on Tuesdays and offer red flowers to Lord Hanuman',
      'Donate red lentils (masoor dal) on Tuesdays',
      'Wear red coral (Moonga) gemstone after consulting an astrologer',
      'Perform Mangal Shanti Puja on Tuesdays',
      'Visit Hanuman temple regularly and offer sindoor'
    ],
    hi: [
      'प्रतिदिन हनुमान चालीसा का पाठ करें, विशेषकर मंगलवार को',
      'मंगलवार को व्रत रखें और हनुमान जी को लाल फूल चढ़ाएं',
      'मंगलवार को मसूर की दाल दान करें',
      'ज्योतिषी से परामर्श के बाद मूंगा रत्न धारण करें',
      'मंगलवार को मंगल शांति पूजा करें',
      'नियमित रूप से हनुमान मंदिर जाएं और सिंदूर चढ़ाएं'
    ]
  };

  if (severity === 'Severe' || severity === 'High') {
    return {
      en: [
        ...commonRemedies.en,
        'Perform Kumbh Vivah (symbolic marriage to a tree/idol) before actual marriage',
        'Chant "Om Angarakaya Namaha" 108 times daily',
        'Donate blood on Tuesdays (if medically fit)'
      ],
      hi: [
        ...commonRemedies.hi,
        'वास्तविक विवाह से पहले कुंभ विवाह (पेड़/मूर्ति से प्रतीकात्मक विवाह) करें',
        'प्रतिदिन 108 बार "ॐ अंगारकाय नमः" का जाप करें',
        'मंगलवार को रक्तदान करें (यदि चिकित्सकीय रूप से स्वस्थ हों)'
      ]
    };
  }

  return commonRemedies;
}

/**
 * Main function to check Manglik Dosha
 */
export function checkManglikDosha(
  birthDate: string,
  birthTime: string,
  latitude: number,
  longitude: number
): ManglikResult {
  try {
    const positions = calculateCompletePlanetaryPositions(birthDate, birthTime);
    const ascendantData = calculateCompleteAscendant(birthDate, birthTime, latitude, longitude);

    // Use ascendant-based houses for Manglik (more accurate than moon-based)
    const ascendantRashi = ascendantData.ascendant.rashi;
    const toHouseFromAsc = (rashi: number) => ((rashi - ascendantRashi + 12) % 12) + 1;

    // Find Mars position
    const mars = positions.planets.find((p: any) => p.name === 'Mars');
    if (!mars) {
      throw new Error('Mars position not found');
    }

    const marsHouse = toHouseFromAsc(mars.rashiIndex);
    const marsRashi = mars.rashiIndex;

    // Check if Manglik
    const isManglik = isMarsInManglikHouse(marsHouse);

    // Calculate severity
    const severity = calculateSeverity(marsHouse, marsRashi);

    // Get all planets for cancellation checks (with ascendant-based houses)
    const planetsForCancellation = positions.planets.map((p: any) => ({
      planet: p.name,
      house: toHouseFromAsc(p.rashiIndex),
      rashi: p.rashiIndex
    }));

    // Check cancellations
    const rawCancellations = checkCancellations(marsHouse, marsRashi, planetsForCancellation);
    // Normalize to include both old and new field names for compatibility
    const cancellations: ManglikCancellation[] = rawCancellations.map(c => ({
      ...c,
      condition: c.rule,
      applicable: c.applies,
    }));

    // Determine if effectively Manglik (after cancellations)
    const activeCancellations = cancellations.filter(c => c.applies);
    const effectiveManglik = isManglik && activeCancellations.length < 2; // Need at least 2 cancellations to nullify

    // Get affected houses
    const affectedHouses = isManglik ? MANGLIK_HOUSES : [];

    // Get remedies — provide whenever isManglik is true (even with cancellations)
    const remedies = getRemedies(isManglik ? severity : 'None');

    // Generate description
    const description = {
      en: isManglik
        ? effectiveManglik
          ? `Mars is placed in ${marsHouse}${marsHouse === 1 ? 'st' : marsHouse === 2 ? 'nd' : marsHouse === 3 ? 'rd' : 'th'} house, causing Manglik Dosha with ${severity.toLowerCase()} severity. This may affect marriage and relationships. ${activeCancellations.length > 0 ? `However, ${activeCancellations.length} cancellation condition(s) are present, reducing the effects.` : 'No significant cancellation conditions are present.'}`
          : `Mars is placed in ${marsHouse}${marsHouse === 1 ? 'st' : marsHouse === 2 ? 'nd' : marsHouse === 3 ? 'rd' : 'th'} house, which normally causes Manglik Dosha. However, ${activeCancellations.length} strong cancellation conditions are present, effectively nullifying the dosha.`
        : `Mars is placed in ${marsHouse}${marsHouse === 1 ? 'st' : marsHouse === 2 ? 'nd' : marsHouse === 3 ? 'rd' : 'th'} house, which does not cause Manglik Dosha. No marriage-related afflictions from Mars.`,
      hi: isManglik
        ? effectiveManglik
          ? `मंगल ${marsHouse}वें भाव में स्थित है, जो ${severity === 'Low' ? 'निम्न' : severity === 'Medium' ? 'मध्यम' : severity === 'High' ? 'उच्च' : 'अत्यधिक'} तीव्रता के साथ मांगलिक दोष उत्पन्न करता है। यह विवाह और संबंधों को प्रभावित कर सकता है। ${activeCancellations.length > 0 ? `हालांकि, ${activeCancellations.length} निवारण स्थितियां मौजूद हैं, जो प्रभाव को कम करती हैं।` : 'कोई महत्वपूर्ण निवारण स्थितियां मौजूद नहीं हैं।'}`
          : `मंगल ${marsHouse}वें भाव में स्थित है, जो सामान्यतः मांगलिक दोष उत्पन्न करता है। हालांकि, ${activeCancellations.length} मजबूत निवारण स्थितियां मौजूद हैं, जो दोष को प्रभावी रूप से निष्प्रभावी कर देती हैं।`
        : `मंगल ${marsHouse}वें भाव में स्थित है, जो मांगलिक दोष उत्पन्न नहीं करता। मंगल से विवाह संबंधी कोई दोष नहीं।`
    };

    return {
      isManglik,
      severity,
      marsHouse,
      marsRashi: positions.planets.find((p: any) => p.name === 'Mars')?.rashiName || 'Unknown',
      affectedHouses,
      cancellations,
      effectiveManglik,
      description,
      remedies
    };

  } catch (error) {
    console.error('Error checking Manglik Dosha:', error);
    // Return safe default
    return {
      isManglik: false,
      severity: 'None',
      marsHouse: 0,
      marsRashi: 'Unknown',
      affectedHouses: [],
      cancellations: [],
      effectiveManglik: false,
      description: {
        en: 'Unable to calculate Manglik Dosha. Please check birth details.',
        hi: 'मांगलिक दोष की गणना करने में असमर्थ। कृपया जन्म विवरण जांचें।'
      },
      remedies: { en: [], hi: [] }
    };
  }
}
