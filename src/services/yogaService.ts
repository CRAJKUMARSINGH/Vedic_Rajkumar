/**
 * Yoga Detection Service - 100+ Yogas (Weeks 35-38)
 * Detects major Vedic astrology yogas from planetary positions
 */
import { detectAllExtendedYogas } from './yogaExtendedService';

export interface YogaResult {
  name: string;
  nameHi: string;
  category: 'raj' | 'dhana' | 'mahapurusha' | 'dosha' | 'spiritual' | 'special';
  isPresent: boolean;
  strength: 'strong' | 'moderate' | 'weak';
  description: { en: string; hi: string };
  planets: string[];
  houses: number[];
}

export interface YogaAnalysis {
  yogas: YogaResult[];
  presentYogas: YogaResult[];
  rajYogas: YogaResult[];
  doshaYogas: YogaResult[];
  summary: { en: string; hi: string };
}

interface PlanetPosition {
  name: string;
  rashiIndex: number; // 0-11
  house: number;      // 1-12
  degrees: number;
  isRetrograde?: boolean;
}

// Kendra houses (1,4,7,10) and Trikona houses (1,5,9)
const KENDRA = [1, 4, 7, 10];
const TRIKONA = [1, 5, 9];
const DUSTHANA = [6, 8, 12];

// Natural benefics and malefics
const NATURAL_BENEFICS = ['Jupiter', 'Venus', 'Moon', 'Mercury'];
const NATURAL_MALEFICS = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];

// Exaltation signs (rashiIndex 0-11)
const EXALTATION: Record<string, number> = {
  Sun: 0,      // Aries
  Moon: 1,     // Taurus
  Mars: 9,     // Capricorn
  Mercury: 5,  // Virgo
  Jupiter: 3,  // Cancer
  Venus: 11,   // Pisces
  Saturn: 6,   // Libra
};

// Own signs
const OWN_SIGNS: Record<string, number[]> = {
  Sun:     [4],       // Leo
  Moon:    [3],       // Cancer
  Mars:    [0, 7],    // Aries, Scorpio
  Mercury: [2, 5],    // Gemini, Virgo
  Jupiter: [8, 11],   // Sagittarius, Pisces
  Venus:   [1, 6],    // Taurus, Libra
  Saturn:  [9, 10],   // Capricorn, Aquarius
};

function isExalted(planet: string, rashiIndex: number): boolean {
  return EXALTATION[planet] === rashiIndex;
}

function isOwnSign(planet: string, rashiIndex: number): boolean {
  return (OWN_SIGNS[planet] || []).includes(rashiIndex);
}

function isStrong(planet: string, rashiIndex: number): boolean {
  return isExalted(planet, rashiIndex) || isOwnSign(planet, rashiIndex);
}

function getPlanet(planets: PlanetPosition[], name: string): PlanetPosition | undefined {
  return planets.find(p => p.name === name);
}

function inKendra(house: number): boolean { return KENDRA.includes(house); }
function inTrikona(house: number): boolean { return TRIKONA.includes(house); }
function inDusthana(house: number): boolean { return DUSTHANA.includes(house); }

/**
 * Detect Gajakesari Yoga: Jupiter in kendra from Moon
 */
function detectGajakesari(planets: PlanetPosition[]): YogaResult {
  const moon = getPlanet(planets, 'Moon');
  const jupiter = getPlanet(planets, 'Jupiter');
  let isPresent = false;
  let strength: 'strong' | 'moderate' | 'weak' = 'weak';

  if (moon && jupiter) {
    const diff = Math.abs(jupiter.house - moon.house);
    const normalizedDiff = diff > 6 ? 12 - diff : diff;
    // Jupiter in 1,4,7,10 from Moon
    isPresent = [0, 3, 6, 9].includes(normalizedDiff);
    if (isPresent) {
      if (isStrong('Jupiter', jupiter.rashiIndex)) strength = 'strong';
      else if (!inDusthana(jupiter.house)) strength = 'moderate';
    }
  }

  return {
    name: 'Gajakesari Yoga',
    nameHi: 'गजकेसरी योग',
    category: 'raj',
    isPresent,
    strength,
    description: {
      en: 'Jupiter in kendra from Moon. Bestows intelligence, fame, wealth, and leadership qualities.',
      hi: 'चंद्रमा से केंद्र में गुरु। बुद्धि, यश, धन और नेतृत्व गुण प्रदान करता है।'
    },
    planets: ['Jupiter', 'Moon'],
    houses: [moon?.house || 0, jupiter?.house || 0],
  };
}

/**
 * Panch Mahapurusha Yogas: Strong planet in kendra in own/exaltation sign
 */
function detectPanchMahapurusha(planets: PlanetPosition[]): YogaResult[] {
  const configs = [
    { planet: 'Mars',    name: 'Ruchaka Yoga',   nameHi: 'रुचक योग',   desc: { en: 'Mars strong in kendra. Gives courage, military success, and leadership.', hi: 'केंद्र में बलवान मंगल। साहस, सैन्य सफलता और नेतृत्व देता है।' } },
    { planet: 'Mercury', name: 'Bhadra Yoga',    nameHi: 'भद्र योग',   desc: { en: 'Mercury strong in kendra. Bestows intelligence, eloquence, and business acumen.', hi: 'केंद्र में बलवान बुध। बुद्धि, वाक्पटुता और व्यापार कौशल देता है।' } },
    { planet: 'Jupiter', name: 'Hamsa Yoga',     nameHi: 'हंस योग',    desc: { en: 'Jupiter strong in kendra. Grants wisdom, spirituality, and good fortune.', hi: 'केंद्र में बलवान गुरु। ज्ञान, आध्यात्मिकता और सौभाग्य देता है।' } },
    { planet: 'Venus',   name: 'Malavya Yoga',   nameHi: 'मालव्य योग', desc: { en: 'Venus strong in kendra. Brings luxury, artistic talent, and romantic success.', hi: 'केंद्र में बलवान शुक्र। विलासिता, कलात्मक प्रतिभा और प्रेम सफलता देता है।' } },
    { planet: 'Saturn',  name: 'Shasha Yoga',    nameHi: 'शश योग',     desc: { en: 'Saturn strong in kendra. Gives authority, discipline, and long-lasting success.', hi: 'केंद्र में बलवान शनि। अधिकार, अनुशासन और दीर्घकालिक सफलता देता है।' } },
  ];

  return configs.map(cfg => {
    const p = getPlanet(planets, cfg.planet);
    const isPresent = !!(p && inKendra(p.house) && isStrong(cfg.planet, p.rashiIndex));
    const strength: 'strong' | 'moderate' | 'weak' = isPresent
      ? (isExalted(cfg.planet, p!.rashiIndex) ? 'strong' : 'moderate')
      : 'weak';

    return {
      name: cfg.name,
      nameHi: cfg.nameHi,
      category: 'mahapurusha' as const,
      isPresent,
      strength,
      description: cfg.desc,
      planets: [cfg.planet],
      houses: [p?.house || 0],
    };
  });
}

/**
 * Raj Yoga: Lords of kendra and trikona conjunct or in each other's houses
 * Simplified: check if any kendra lord is in trikona or vice versa
 */
function detectRajYoga(planets: PlanetPosition[], ascendantRashi: number): YogaResult {
  // House lords based on ascendant (simplified — uses natural lordships)
  // For a proper implementation, we'd need the full house lord table
  // Here we check if benefics occupy both kendra and trikona houses
  const kendraOccupants = planets.filter(p => inKendra(p.house) && NATURAL_BENEFICS.includes(p.name));
  const trikonaOccupants = planets.filter(p => inTrikona(p.house) && NATURAL_BENEFICS.includes(p.name));

  const isPresent = kendraOccupants.length > 0 && trikonaOccupants.length > 0;
  const strength: 'strong' | 'moderate' | 'weak' = isPresent
    ? (kendraOccupants.some(p => isStrong(p.name, p.rashiIndex)) ? 'strong' : 'moderate')
    : 'weak';

  return {
    name: 'Raj Yoga',
    nameHi: 'राज योग',
    category: 'raj',
    isPresent,
    strength,
    description: {
      en: 'Benefic planets in kendra and trikona houses. Indicates power, authority, and high status.',
      hi: 'केंद्र और त्रिकोण भावों में शुभ ग्रह। शक्ति, अधिकार और उच्च पद का संकेत।'
    },
    planets: [...new Set([...kendraOccupants, ...trikonaOccupants].map(p => p.name))],
    houses: [...new Set([...kendraOccupants, ...trikonaOccupants].map(p => p.house))],
  };
}

/**
 * Dhana Yoga: Wealth combinations
 * 2nd and 11th lord strong, or Jupiter/Venus in 2nd/11th
 */
function detectDhanaYoga(planets: PlanetPosition[]): YogaResult {
  const wealthHousePlanets = planets.filter(p => [2, 11].includes(p.house));
  const strongWealthPlanets = wealthHousePlanets.filter(p =>
    isStrong(p.name, p.rashiIndex) || NATURAL_BENEFICS.includes(p.name)
  );

  const isPresent = strongWealthPlanets.length >= 2;
  const strength: 'strong' | 'moderate' | 'weak' = isPresent
    ? (strongWealthPlanets.length >= 3 ? 'strong' : 'moderate')
    : (wealthHousePlanets.length > 0 ? 'weak' : 'weak');

  return {
    name: 'Dhana Yoga',
    nameHi: 'धन योग',
    category: 'dhana',
    isPresent,
    strength,
    description: {
      en: 'Strong planets in 2nd and 11th houses. Indicates wealth accumulation and financial prosperity.',
      hi: 'द्वितीय और एकादश भाव में बलवान ग्रह। धन संचय और आर्थिक समृद्धि का संकेत।'
    },
    planets: strongWealthPlanets.map(p => p.name),
    houses: strongWealthPlanets.map(p => p.house),
  };
}

/**
 * Kaal Sarp Yoga: All planets between Rahu and Ketu
 */
function detectKaalSarp(planets: PlanetPosition[]): YogaResult {
  const rahu = getPlanet(planets, 'Rahu');
  const ketu = getPlanet(planets, 'Ketu');

  if (!rahu || !ketu) {
    return {
      name: 'Kaal Sarp Yoga', nameHi: 'काल सर्प योग', category: 'dosha',
      isPresent: false, strength: 'weak',
      description: { en: 'All planets hemmed between Rahu and Ketu.', hi: 'सभी ग्रह राहु और केतु के बीच।' },
      planets: [], houses: [],
    };
  }

  const rahuHouse = rahu.house;
  const ketuHouse = ketu.house;
  const otherPlanets = planets.filter(p => !['Rahu', 'Ketu'].includes(p.name));

  // Check if all planets are on one side of the Rahu-Ketu axis
  let allBetween = true;
  for (const p of otherPlanets) {
    const h = p.house;
    // Determine if house is between Rahu and Ketu going clockwise
    let between = false;
    let cur = rahuHouse;
    while (cur !== ketuHouse) {
      if (cur === h) { between = true; break; }
      cur = (cur % 12) + 1;
    }
    if (!between) { allBetween = false; break; }
  }

  return {
    name: 'Kaal Sarp Yoga',
    nameHi: 'काल सर्प योग',
    category: 'dosha',
    isPresent: allBetween,
    strength: allBetween ? 'strong' : 'weak',
    description: {
      en: 'All planets hemmed between Rahu and Ketu. Can cause delays, obstacles, and karmic challenges.',
      hi: 'सभी ग्रह राहु और केतु के बीच। विलंब, बाधाएं और कार्मिक चुनौतियां दे सकता है।'
    },
    planets: ['Rahu', 'Ketu'],
    houses: [rahuHouse, ketuHouse],
  };
}

/**
 * Moon-based Yogas: Sunapha, Anapha, Durdhara, Kemadruma
 */
function detectMoonYogas(planets: PlanetPosition[]): YogaResult[] {
  const moon = getPlanet(planets, 'Moon');
  if (!moon) return [];

  const otherPlanets = planets.filter(p => !['Moon', 'Sun', 'Rahu', 'Ketu'].includes(p.name));
  const planetsIn2nd = otherPlanets.filter(p => p.house === (moon.house % 12) + 1);
  const planetsIn12rd = otherPlanets.filter(p => p.house === ((moon.house - 2 + 12) % 12) + 1);

  const results: YogaResult[] = [];

  // 1. Sunapha
  if (planetsIn2nd.length > 0 && planetsIn12rd.length === 0) {
    results.push({
      name: 'Sunapha Yoga', nameHi: 'सुनफा योग', category: 'special',
      isPresent: true, strength: 'moderate',
      description: { en: 'Planets (except Sun) in the 2nd house from Moon. Bestows wealth, status, and happiness.', hi: 'चंद्रमा से द्वितीय भाव में ग्रह (सूर्य को छोड़कर)। धन, पद और सुख प्रदान करता है।' },
      planets: planetsIn2nd.map(p => p.name), houses: planetsIn2nd.map(p => p.house),
    });
  }

  // 2. Anapha
  if (planetsIn12rd.length > 0 && planetsIn2nd.length === 0) {
    results.push({
      name: 'Anapha Yoga', nameHi: 'अनफा योग', category: 'special',
      isPresent: true, strength: 'moderate',
      description: { en: 'Planets (except Sun) in the 12th house from Moon. Indicates good health, moral character, and fame.', hi: 'चंद्रमा से द्वादश भाव में ग्रह (सूर्य को छोड़कर)। अच्छा स्वास्थ्य, नैतिक चरित्र और प्रसिद्धि का संकेत।' },
      planets: planetsIn12rd.map(p => p.name), houses: planetsIn12rd.map(p => p.house),
    });
  }

  // 3. Durdhara
  if (planetsIn2nd.length > 0 && planetsIn12rd.length > 0) {
    results.push({
      name: 'Durdhara Yoga', nameHi: 'दुर्धरा योग', category: 'special',
      isPresent: true, strength: 'strong',
      description: { en: 'Planets in both 2nd and 12th from Moon. Indicates great wealth, power, and enjoyments.', hi: 'चंद्रमा से द्वितीय और द्वादश दोनों भावों में ग्रह। महान धन, शक्ति और उपभोग का संकेत।' },
      planets: [...planetsIn2nd, ...planetsIn12rd].map(p => p.name), houses: [...planetsIn2nd, ...planetsIn12rd].map(p => p.house),
    });
  }

  // 4. Kemadruma (Negative)
  if (planetsIn2nd.length === 0 && planetsIn12rd.length === 0) {
    // Check if any planets in Kendra from Moon
    const planetsInKendraFromMoon = otherPlanets.filter(p => [0, 3, 6, 9].includes((p.house - moon.house + 12) % 12));
    if (planetsInKendraFromMoon.length === 0) {
      results.push({
        name: 'Kemadruma Yoga', nameHi: 'केमद्रुम योग', category: 'dosha',
        isPresent: true, strength: 'strong',
        description: { en: 'No planets in 2nd/12th from Moon and no planets in Kendra from Moon. Indicates isolation and financial struggles.', hi: 'चंद्रमा से 2/12 में कोई ग्रह नहीं और चंद्रमा से केंद्र में भी कोई नहीं। अलगाव और वित्तीय संघर्ष का संकेत।' },
        planets: [], houses: [],
      });
    }
  }

  return results;
}

/**
 * Sun-based Yogas: Veshi, Vashi, Ubhayachara
 */
function detectSunYogas(planets: PlanetPosition[]): YogaResult[] {
  const sun = getPlanet(planets, 'Sun');
  if (!sun) return [];

  const otherPlanets = planets.filter(p => !['Sun', 'Moon', 'Rahu', 'Ketu'].includes(p.name));
  const planetsIn2nd = otherPlanets.filter(p => p.house === (sun.house % 12) + 1);
  const planetsIn12rd = otherPlanets.filter(p => p.house === ((sun.house - 2 + 12) % 12) + 1);

  const results: YogaResult[] = [];

  // 1. Veshi
  if (planetsIn2nd.length > 0 && planetsIn12rd.length === 0) {
    results.push({
      name: 'Veshi Yoga', nameHi: 'वेशी योग', category: 'special',
      isPresent: true, strength: 'moderate',
      description: { en: 'Planets (except Moon) in the 2nd house from Sun. Bestows good speech, wealth, and status.', hi: 'सूर्य से द्वितीय भाव में ग्रह (चंद्रमा को छोड़कर)। अच्छी वाणी, धन और पद प्रदान करता है।' },
      planets: planetsIn2nd.map(p => p.name), houses: planetsIn2nd.map(p => p.house),
    });
  }

  // 2. Vashi
  if (planetsIn12rd.length > 0 && planetsIn2nd.length === 0) {
    results.push({
      name: 'Vashi Yoga', nameHi: 'वाशी योग', category: 'special',
      isPresent: true, strength: 'moderate',
      description: { en: 'Planets (except Moon) in the 12th house from Sun. Indicates intelligence, fame, and success.', hi: 'सूर्य से द्वादश भाव में ग्रह (चंद्रमा को छोड़कर)। बुद्धि, प्रसिद्धि और सफलता का संकेत।' },
      planets: planetsIn12rd.map(p => p.name), houses: planetsIn12rd.map(p => p.house),
    });
  }

  // 3. Ubhayachara
  if (planetsIn2nd.length > 0 && planetsIn12rd.length > 0) {
    results.push({
      name: 'Ubhayachara Yoga', nameHi: 'उभयचारी योग', category: 'special',
      isPresent: true, strength: 'strong',
      description: { en: 'Planets in both 2nd and 12th from Sun. Gives high status, wealth, and balanced personality.', hi: 'सूर्य से द्वितीय और द्वादश दोनों भावों में ग्रह। उच्च पद, धन और संतुलित व्यक्तित्व देता है।' },
      planets: [...planetsIn2nd, ...planetsIn12rd].map(p => p.name), houses: [...planetsIn2nd, ...planetsIn12rd].map(p => p.house),
    });
  }

  return results;
}

/**
 * Budhaditya Yoga: Sun and Mercury conjunct
 */
function detectBudhaditya(planets: PlanetPosition[]): YogaResult {
  const sun = getPlanet(planets, 'Sun');
  const mercury = getPlanet(planets, 'Mercury');
  const isPresent = !!(sun && mercury && sun.house === mercury.house);
  const strength: 'strong' | 'moderate' | 'weak' = isPresent
    ? (isStrong('Mercury', mercury!.rashiIndex) ? 'strong' : 'moderate')
    : 'weak';

  return {
    name: 'Budhaditya Yoga',
    nameHi: 'बुधादित्य योग',
    category: 'special',
    isPresent,
    strength,
    description: {
      en: 'Sun and Mercury conjunct. Bestows sharp intellect, communication skills, and analytical ability.',
      hi: 'सूर्य और बुध की युति। तीव्र बुद्धि, संचार कौशल और विश्लेषण क्षमता देता है।'
    },
    planets: ['Sun', 'Mercury'],
    houses: [sun?.house || 0],
  };
}

/**
 * Chandra-Mangal Yoga: Moon and Mars conjunct
 */
function detectChandraMangal(planets: PlanetPosition[]): YogaResult {
  const moon = getPlanet(planets, 'Moon');
  const mars = getPlanet(planets, 'Mars');
  const isPresent = !!(moon && mars && moon.house === mars.house);

  return {
    name: 'Chandra-Mangal Yoga',
    nameHi: 'चंद्र-मंगल योग',
    category: 'dhana',
    isPresent,
    strength: isPresent ? 'moderate' : 'weak',
    description: {
      en: 'Moon and Mars conjunct. Gives financial gains through bold actions and real estate.',
      hi: 'चंद्र और मंगल की युति। साहसी कार्यों और अचल संपत्ति से धन लाभ देता है।'
    },
    planets: ['Moon', 'Mars'],
    houses: [moon?.house || 0],
  };
}

/**
 * Viparita Raj Yoga: Lords of dusthana (6,8,12) in dusthana
 */
function detectViparitaRaj(planets: PlanetPosition[]): YogaResult {
  const dusthanaPlanets = planets.filter(p => inDusthana(p.house));
  // If 2+ dusthana planets are in dusthana houses, it can create Viparita Raj Yoga
  const isPresent = dusthanaPlanets.length >= 2;

  return {
    name: 'Viparita Raj Yoga',
    nameHi: 'विपरीत राज योग',
    category: 'raj',
    isPresent,
    strength: isPresent ? 'moderate' : 'weak',
    description: {
      en: 'Lords of dusthana houses placed in dusthana. Turns adversity into success through unexpected reversals.',
      hi: 'दुस्थान भावों के स्वामी दुस्थान में। अप्रत्याशित उलटफेर से विपरीत परिस्थितियों को सफलता में बदलता है।'
    },
    planets: dusthanaPlanets.map(p => p.name),
    houses: dusthanaPlanets.map(p => p.house),
  };
}

/**
 * Neecha Bhanga Raj Yoga: Debilitated planet gets cancellation
 */
const DEBILITATION: Record<string, number> = {
  Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0,
};

function detectNeechaBhanga(planets: PlanetPosition[]): YogaResult {
  const debilitatedPlanets = planets.filter(p =>
    DEBILITATION[p.name] !== undefined && DEBILITATION[p.name] === p.rashiIndex
  );

  if (debilitatedPlanets.length === 0) {
    return {
      name: 'Neecha Bhanga Raj Yoga', nameHi: 'नीच भंग राज योग', category: 'raj',
      isPresent: false, strength: 'weak',
      description: { en: 'Debilitated planet gets cancellation, turning weakness into strength.', hi: 'नीच ग्रह का भंग होकर शक्ति में परिवर्तन।' },
      planets: [], houses: [],
    };
  }

  // Check if the lord of the debilitation sign is in kendra from ascendant or Moon
  const moon = getPlanet(planets, 'Moon');
  let cancellationFound = false;
  const cancelledPlanets: string[] = [];

  for (const dp of debilitatedPlanets) {
    // Simplified: if the debilitated planet is in kendra, partial cancellation
    if (inKendra(dp.house)) {
      cancellationFound = true;
      cancelledPlanets.push(dp.name);
    }
  }

  return {
    name: 'Neecha Bhanga Raj Yoga',
    nameHi: 'नीच भंग राज योग',
    category: 'raj',
    isPresent: cancellationFound,
    strength: cancellationFound ? 'moderate' : 'weak',
    description: {
      en: 'Debilitated planet gets cancellation, turning weakness into strength and conferring royal status.',
      hi: 'नीच ग्रह का भंग होकर दुर्बलता शक्ति में बदलती है और राजयोग फल देती है।'
    },
    planets: cancelledPlanets,
    houses: debilitatedPlanets.filter(p => cancelledPlanets.includes(p.name)).map(p => p.house),
  };
}

/**
 * Parivartana Yoga: Exchange of signs between two house lords
 */
function detectParivartanaYoga(planets: PlanetPosition[], ascendantRashi: number): YogaResult[] {
  const RASHI_LORDS: Record<number, string> = {
    0: 'Mars', 1: 'Venus', 2: 'Mercury', 3: 'Moon',
    4: 'Sun', 5: 'Mercury', 6: 'Venus', 7: 'Mars',
    8: 'Jupiter', 9: 'Saturn', 10: 'Saturn', 11: 'Jupiter',
  };

  // Get house lord for each house (1-12)
  const getHouseLord = (h: number) => {
    const rashiOfHouse = (ascendantRashi + h - 1) % 12;
    return RASHI_LORDS[rashiOfHouse];
  };

  const planetMap = Object.fromEntries(planets.map(p => [p.name, p]));
  const results: YogaResult[] = [];

  for (let h1 = 1; h1 <= 12; h1++) {
    for (let h2 = h1 + 1; h2 <= 12; h2++) {
      const lord1Name = getHouseLord(h1);
      const lord2Name = getHouseLord(h2);
      const lord1 = planetMap[lord1Name];
      const lord2 = planetMap[lord2Name];

      if (lord1 && lord2 && lord1Name !== lord2Name) {
        // Exchange means Lord 1 is in House 2 and Lord 2 is in House 1
        if (lord1.house === h2 && lord2.house === h1) {
          let name = 'Parivartana Yoga';
          let nameHi = 'परिवर्तन योग';
          let category: 'raj' | 'special' | 'dosha' = 'special';
          let type = '';

          const isDainya = [6, 8, 12].includes(h1) || [6, 8, 12].includes(h2);
          const isKahala = h1 === 3 || h2 === 3;

          if (isDainya) {
            name = 'Dainya Parivartana Yoga';
            nameHi = 'दैन्य परिवर्तन योग';
            category = 'dosha';
            type = 'dainya';
          } else if (isKahala) {
            name = 'Kahala Parivartana Yoga';
            nameHi = 'काहल परिवर्तन योग';
            category = 'special';
            type = 'kahala';
          } else {
            name = 'Maha Parivartana Yoga';
            nameHi = 'महा परिवर्तन योग';
            category = 'raj';
            type = 'maha';
          }

          results.push({
            name, nameHi, category,
            isPresent: true, strength: 'strong',
            description: {
              en: `${name} between houses ${h1} and ${h2}. ${category === 'raj' ? 'Indicates great success and harmony between these areas.' : category === 'dosha' ? 'Indicates struggles or transformations related to these areas.' : 'Indicates courage and mixed results.'}`,
              hi: `${h1} और ${h2} भावों के बीच ${nameHi}।`
            },
            planets: [lord1Name, lord2Name],
            houses: [h1, h2],
          });
        }
      }
    }
  }

  return results;
}

/**
 * Adhi Yoga: Benefics (Mercury, Jupiter, Venus) in 6, 7, 8 from Moon
 */
function detectAdhiYoga(planets: PlanetPosition[]): YogaResult {
  const moon = getPlanet(planets, 'Moon');
  if (!moon) return { name: 'Adhi Yoga', nameHi: 'अधि योग', category: 'raj', isPresent: false, strength: 'weak', description: { en: '', hi: '' }, planets: [], houses: [] };

  const benefics = planets.filter(p => ['Mercury', 'Jupiter', 'Venus'].includes(p.name));
  const adhiHouses = [6, 7, 8].map(h => ((moon.house + h - 2) % 12) + 1);
  const presentBenefics = benefics.filter(p => adhiHouses.includes(p.house));

  return {
    name: 'Moon Adhi Yoga',
    nameHi: 'चंद्र अधि योग',
    category: 'raj',
    isPresent: presentBenefics.length >= 2,
    strength: presentBenefics.length === 3 ? 'strong' : 'moderate',
    description: {
      en: 'Benefics in 6, 7, 8 from Moon. Indicates leadership, wealth, and victory over enemies.',
      hi: 'चंद्रमा से 6, 7, 8 भावों में शुभ ग्रह। नेतृत्व, धन और शत्रुओं पर विजय का संकेत।'
    },
    planets: presentBenefics.map(p => p.name),
    houses: presentBenefics.map(p => p.house),
  };
}

/**
 * Amala Yoga: Benefic in 10th from Lagna or Moon
 */
function detectAmalaYoga(planets: PlanetPosition[]): YogaResult {
  const benefics = planets.filter(p => ['Mercury', 'Jupiter', 'Venus'].includes(p.name));
  const tenthFromLagna = 10;
  const mercury = getPlanet(planets, 'Mercury');
  const jupiter = getPlanet(planets, 'Jupiter');
  const venus = getPlanet(planets, 'Venus');
  const moon = getPlanet(planets, 'Moon');

  const in10thLagna = benefics.some(p => p.house === 10);
  const in10thMoon = moon ? benefics.some(p => p.house === ((moon.house + 9 - 1) % 12) + 1) : false;

  return {
    name: 'Amala Yoga',
    nameHi: 'अमला योग',
    category: 'raj',
    isPresent: in10thLagna || in10thMoon,
    strength: 'moderate',
    description: {
      en: 'Benefic in 10th house from Lagna or Moon. Indicates spotless character, prosperity, and professional success.',
      hi: 'लग्न या चंद्रमा से दशम भाव में शुभ ग्रह। निष्कलंक चरित्र, समृद्धि और व्यावसायिक सफलता का संकेत।'
    },
    planets: benefics.filter(p => p.house === 10 || (moon && p.house === ((moon.house + 9 - 1) % 12) + 1)).map(p => p.name),
    houses: [10],
  };
}

/**
 * Main function: Analyze all yogas (100+ yogas)
 */
export function analyzeYogas(
  planets: PlanetPosition[],
  ascendantRashi = 0
): YogaAnalysis {
  const yogas: YogaResult[] = [
    detectGajakesari(planets),
    ...detectPanchMahapurusha(planets),
    detectRajYoga(planets, ascendantRashi),
    detectDhanaYoga(planets),
    detectKaalSarp(planets),
    detectBudhaditya(planets),
    detectChandraMangal(planets),
    detectViparitaRaj(planets),
    detectNeechaBhanga(planets),
    ...detectMoonYogas(planets),
    ...detectSunYogas(planets),
    ...detectParivartanaYoga(planets, ascendantRashi),
    detectAdhiYoga(planets),
    detectAmalaYoga(planets),
    ...detectAllExtendedYogas(planets) as YogaResult[],
  ];

  const presentYogas = yogas.filter(y => y.isPresent);
  const rajYogas = presentYogas.filter(y => y.category === 'raj');
  const doshaYogas = presentYogas.filter(y => y.category === 'dosha');

  const count = presentYogas.length;
  const strongCount = presentYogas.filter(y => y.strength === 'strong').length;

  const summary = {
    en: count === 0
      ? 'No major yogas detected in this chart.'
      : `${count} yoga${count > 1 ? 's' : ''} detected (${strongCount} strong). ${rajYogas.length > 0 ? `${rajYogas.length} Raj Yoga${rajYogas.length > 1 ? 's' : ''} present.` : ''}`,
    hi: count === 0
      ? 'इस कुंडली में कोई प्रमुख योग नहीं मिला।'
      : `${count} योग मिले (${strongCount} बलवान)। ${rajYogas.length > 0 ? `${rajYogas.length} राज योग उपस्थित।` : ''}`,
  };

  return { yogas, presentYogas, rajYogas, doshaYogas, summary };
}
