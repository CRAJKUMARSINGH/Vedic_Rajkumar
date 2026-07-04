/**
 * Yoga Detection Service - 100+ Yogas (Weeks 35-38)
 * Detects major Vedic astrology yogas from planetary positions
 */
import { detectAllExtendedYogas } from './yogaExtendedService';

export interface YogaLifecycle {
  status: 'ACTIVE' | 'EMERGING' | 'LATENT' | 'BROKEN';
  statusReason: string;
  shadbalaGate: string;
  dashaActivation: string;
  transitSupport?: string;
  involvedPlanets: string[];
}

export interface YogaResult {
  name: string;
  nameHi: string;
  category: 'raj' | 'dhana' | 'mahapurusha' | 'dosha' | 'spiritual' | 'special';
  isPresent: boolean;
  strength: 'strong' | 'moderate' | 'weak';
  description: { en: string; hi: string };
  planets: string[];
  houses: number[];
  lifecycle?: YogaLifecycle;
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
  house: number; // 1-12
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
  Sun: 0, // Aries
  Moon: 1, // Taurus
  Mars: 9, // Capricorn
  Mercury: 5, // Virgo
  Jupiter: 3, // Cancer
  Venus: 11, // Pisces
  Saturn: 6, // Libra
};

// Own signs
const OWN_SIGNS: Record<string, number[]> = {
  Sun: [4], // Leo
  Moon: [3], // Cancer
  Mars: [0, 7], // Aries, Scorpio
  Mercury: [2, 5], // Gemini, Virgo
  Jupiter: [8, 11], // Sagittarius, Pisces
  Venus: [1, 6], // Taurus, Libra
  Saturn: [9, 10], // Capricorn, Aquarius
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

function inKendra(house: number): boolean {
  return KENDRA.includes(house);
}
function inTrikona(house: number): boolean {
  return TRIKONA.includes(house);
}
function inDusthana(house: number): boolean {
  return DUSTHANA.includes(house);
}

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
      hi: 'चंद्रमा से केंद्र में गुरु। बुद्धि, यश, धन और नेतृत्व गुण प्रदान करता है।',
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
    {
      planet: 'Mars',
      name: 'Ruchaka Yoga',
      nameHi: 'रुचक योग',
      desc: {
        en: 'Mars strong in kendra. Gives courage, military success, and leadership.',
        hi: 'केंद्र में बलवान मंगल। साहस, सैन्य सफलता और नेतृत्व देता है।',
      },
    },
    {
      planet: 'Mercury',
      name: 'Bhadra Yoga',
      nameHi: 'भद्र योग',
      desc: {
        en: 'Mercury strong in kendra. Bestows intelligence, eloquence, and business acumen.',
        hi: 'केंद्र में बलवान बुध। बुद्धि, वाक्पटुता और व्यापार कौशल देता है।',
      },
    },
    {
      planet: 'Jupiter',
      name: 'Hamsa Yoga',
      nameHi: 'हंस योग',
      desc: {
        en: 'Jupiter strong in kendra. Grants wisdom, spirituality, and good fortune.',
        hi: 'केंद्र में बलवान गुरु। ज्ञान, आध्यात्मिकता और सौभाग्य देता है।',
      },
    },
    {
      planet: 'Venus',
      name: 'Malavya Yoga',
      nameHi: 'मालव्य योग',
      desc: {
        en: 'Venus strong in kendra. Brings luxury, artistic talent, and romantic success.',
        hi: 'केंद्र में बलवान शुक्र। विलासिता, कलात्मक प्रतिभा और प्रेम सफलता देता है।',
      },
    },
    {
      planet: 'Saturn',
      name: 'Shasha Yoga',
      nameHi: 'शश योग',
      desc: {
        en: 'Saturn strong in kendra. Gives authority, discipline, and long-lasting success.',
        hi: 'केंद्र में बलवान शनि। अधिकार, अनुशासन और दीर्घकालिक सफलता देता है।',
      },
    },
  ];

  return configs.map(cfg => {
    const p = getPlanet(planets, cfg.planet);
    const isPresent = !!(p && inKendra(p.house) && isStrong(cfg.planet, p.rashiIndex));
    const strength: 'strong' | 'moderate' | 'weak' = isPresent
      ? isExalted(cfg.planet, p!.rashiIndex)
        ? 'strong'
        : 'moderate'
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
  const kendraOccupants = planets.filter(
    p => inKendra(p.house) && NATURAL_BENEFICS.includes(p.name)
  );
  const trikonaOccupants = planets.filter(
    p => inTrikona(p.house) && NATURAL_BENEFICS.includes(p.name)
  );

  const isPresent = kendraOccupants.length > 0 && trikonaOccupants.length > 0;
  const strength: 'strong' | 'moderate' | 'weak' = isPresent
    ? kendraOccupants.some(p => isStrong(p.name, p.rashiIndex))
      ? 'strong'
      : 'moderate'
    : 'weak';

  return {
    name: 'Raj Yoga',
    nameHi: 'राज योग',
    category: 'raj',
    isPresent,
    strength,
    description: {
      en: 'Benefic planets in kendra and trikona houses. Indicates power, authority, and high status.',
      hi: 'केंद्र और त्रिकोण भावों में शुभ ग्रह। शक्ति, अधिकार और उच्च पद का संकेत।',
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
  const strongWealthPlanets = wealthHousePlanets.filter(
    p => isStrong(p.name, p.rashiIndex) || NATURAL_BENEFICS.includes(p.name)
  );

  const isPresent = strongWealthPlanets.length >= 2;
  const strength: 'strong' | 'moderate' | 'weak' = isPresent
    ? strongWealthPlanets.length >= 3
      ? 'strong'
      : 'moderate'
    : wealthHousePlanets.length > 0
      ? 'weak'
      : 'weak';

  return {
    name: 'Dhana Yoga',
    nameHi: 'धन योग',
    category: 'dhana',
    isPresent,
    strength,
    description: {
      en: 'Strong planets in 2nd and 11th houses. Indicates wealth accumulation and financial prosperity.',
      hi: 'द्वितीय और एकादश भाव में बलवान ग्रह। धन संचय और आर्थिक समृद्धि का संकेत।',
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
      name: 'Kaal Sarp Yoga',
      nameHi: 'काल सर्प योग',
      category: 'dosha',
      isPresent: false,
      strength: 'weak',
      description: {
        en: 'All planets hemmed between Rahu and Ketu.',
        hi: 'सभी ग्रह राहु और केतु के बीच।',
      },
      planets: [],
      houses: [],
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
      if (cur === h) {
        between = true;
        break;
      }
      cur = (cur % 12) + 1;
    }
    if (!between) {
      allBetween = false;
      break;
    }
  }

  return {
    name: 'Kaal Sarp Yoga',
    nameHi: 'काल सर्प योग',
    category: 'dosha',
    isPresent: allBetween,
    strength: allBetween ? 'strong' : 'weak',
    description: {
      en: 'All planets hemmed between Rahu and Ketu. Can cause delays, obstacles, and karmic challenges.',
      hi: 'सभी ग्रह राहु और केतु के बीच। विलंब, बाधाएं और कार्मिक चुनौतियां दे सकता है।',
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
      name: 'Sunapha Yoga',
      nameHi: 'सुनफा योग',
      category: 'special',
      isPresent: true,
      strength: 'moderate',
      description: {
        en: 'Planets (except Sun) in the 2nd house from Moon. Bestows wealth, status, and happiness.',
        hi: 'चंद्रमा से द्वितीय भाव में ग्रह (सूर्य को छोड़कर)। धन, पद और सुख प्रदान करता है।',
      },
      planets: planetsIn2nd.map(p => p.name),
      houses: planetsIn2nd.map(p => p.house),
    });
  }

  // 2. Anapha
  if (planetsIn12rd.length > 0 && planetsIn2nd.length === 0) {
    results.push({
      name: 'Anapha Yoga',
      nameHi: 'अनफा योग',
      category: 'special',
      isPresent: true,
      strength: 'moderate',
      description: {
        en: 'Planets (except Sun) in the 12th house from Moon. Indicates good health, moral character, and fame.',
        hi: 'चंद्रमा से द्वादश भाव में ग्रह (सूर्य को छोड़कर)। अच्छा स्वास्थ्य, नैतिक चरित्र और प्रसिद्धि का संकेत।',
      },
      planets: planetsIn12rd.map(p => p.name),
      houses: planetsIn12rd.map(p => p.house),
    });
  }

  // 3. Durdhara
  if (planetsIn2nd.length > 0 && planetsIn12rd.length > 0) {
    results.push({
      name: 'Durdhara Yoga',
      nameHi: 'दुर्धरा योग',
      category: 'special',
      isPresent: true,
      strength: 'strong',
      description: {
        en: 'Planets in both 2nd and 12th from Moon. Indicates great wealth, power, and enjoyments.',
        hi: 'चंद्रमा से द्वितीय और द्वादश दोनों भावों में ग्रह। महान धन, शक्ति और उपभोग का संकेत।',
      },
      planets: [...planetsIn2nd, ...planetsIn12rd].map(p => p.name),
      houses: [...planetsIn2nd, ...planetsIn12rd].map(p => p.house),
    });
  }

  // 4. Kemadruma (Negative)
  if (planetsIn2nd.length === 0 && planetsIn12rd.length === 0) {
    // Check if any planets in Kendra from Moon
    const planetsInKendraFromMoon = otherPlanets.filter(p =>
      [0, 3, 6, 9].includes((p.house - moon.house + 12) % 12)
    );
    if (planetsInKendraFromMoon.length === 0) {
      results.push({
        name: 'Kemadruma Yoga',
        nameHi: 'केमद्रुम योग',
        category: 'dosha',
        isPresent: true,
        strength: 'strong',
        description: {
          en: 'No planets in 2nd/12th from Moon and no planets in Kendra from Moon. Indicates isolation and financial struggles.',
          hi: 'चंद्रमा से 2/12 में कोई ग्रह नहीं और चंद्रमा से केंद्र में भी कोई नहीं। अलगाव और वित्तीय संघर्ष का संकेत।',
        },
        planets: [],
        houses: [],
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
      name: 'Veshi Yoga',
      nameHi: 'वेशी योग',
      category: 'special',
      isPresent: true,
      strength: 'moderate',
      description: {
        en: 'Planets (except Moon) in the 2nd house from Sun. Bestows good speech, wealth, and status.',
        hi: 'सूर्य से द्वितीय भाव में ग्रह (चंद्रमा को छोड़कर)। अच्छी वाणी, धन और पद प्रदान करता है।',
      },
      planets: planetsIn2nd.map(p => p.name),
      houses: planetsIn2nd.map(p => p.house),
    });
  }

  // 2. Vashi
  if (planetsIn12rd.length > 0 && planetsIn2nd.length === 0) {
    results.push({
      name: 'Vashi Yoga',
      nameHi: 'वाशी योग',
      category: 'special',
      isPresent: true,
      strength: 'moderate',
      description: {
        en: 'Planets (except Moon) in the 12th house from Sun. Indicates intelligence, fame, and success.',
        hi: 'सूर्य से द्वादश भाव में ग्रह (चंद्रमा को छोड़कर)। बुद्धि, प्रसिद्धि और सफलता का संकेत।',
      },
      planets: planetsIn12rd.map(p => p.name),
      houses: planetsIn12rd.map(p => p.house),
    });
  }

  // 3. Ubhayachara
  if (planetsIn2nd.length > 0 && planetsIn12rd.length > 0) {
    results.push({
      name: 'Ubhayachara Yoga',
      nameHi: 'उभयचारी योग',
      category: 'special',
      isPresent: true,
      strength: 'strong',
      description: {
        en: 'Planets in both 2nd and 12th from Sun. Gives high status, wealth, and balanced personality.',
        hi: 'सूर्य से द्वितीय और द्वादश दोनों भावों में ग्रह। उच्च पद, धन और संतुलित व्यक्तित्व देता है।',
      },
      planets: [...planetsIn2nd, ...planetsIn12rd].map(p => p.name),
      houses: [...planetsIn2nd, ...planetsIn12rd].map(p => p.house),
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
    ? isStrong('Mercury', mercury!.rashiIndex)
      ? 'strong'
      : 'moderate'
    : 'weak';

  return {
    name: 'Budhaditya Yoga',
    nameHi: 'बुधादित्य योग',
    category: 'special',
    isPresent,
    strength,
    description: {
      en: 'Sun and Mercury conjunct. Bestows sharp intellect, communication skills, and analytical ability.',
      hi: 'सूर्य और बुध की युति। तीव्र बुद्धि, संचार कौशल और विश्लेषण क्षमता देता है।',
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
      hi: 'चंद्र और मंगल की युति। साहसी कार्यों और अचल संपत्ति से धन लाभ देता है।',
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
      hi: 'दुस्थान भावों के स्वामी दुस्थान में। अप्रत्याशित उलटफेर से विपरीत परिस्थितियों को सफलता में बदलता है।',
    },
    planets: dusthanaPlanets.map(p => p.name),
    houses: dusthanaPlanets.map(p => p.house),
  };
}

/**
 * Neecha Bhanga Raj Yoga: Debilitated planet gets cancellation
 */
const DEBILITATION: Record<string, number> = {
  Sun: 6,
  Moon: 7,
  Mars: 3,
  Mercury: 11,
  Jupiter: 9,
  Venus: 5,
  Saturn: 0,
};

function detectNeechaBhanga(planets: PlanetPosition[]): YogaResult {
  const debilitatedPlanets = planets.filter(
    p => DEBILITATION[p.name] !== undefined && DEBILITATION[p.name] === p.rashiIndex
  );

  if (debilitatedPlanets.length === 0) {
    return {
      name: 'Neecha Bhanga Raj Yoga',
      nameHi: 'नीच भंग राज योग',
      category: 'raj',
      isPresent: false,
      strength: 'weak',
      description: {
        en: 'Debilitated planet gets cancellation, turning weakness into strength.',
        hi: 'नीच ग्रह का भंग होकर शक्ति में परिवर्तन।',
      },
      planets: [],
      houses: [],
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
      hi: 'नीच ग्रह का भंग होकर दुर्बलता शक्ति में बदलती है और राजयोग फल देती है।',
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
    0: 'Mars',
    1: 'Venus',
    2: 'Mercury',
    3: 'Moon',
    4: 'Sun',
    5: 'Mercury',
    6: 'Venus',
    7: 'Mars',
    8: 'Jupiter',
    9: 'Saturn',
    10: 'Saturn',
    11: 'Jupiter',
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
            name,
            nameHi,
            category,
            isPresent: true,
            strength: 'strong',
            description: {
              en: `${name} between houses ${h1} and ${h2}. ${category === 'raj' ? 'Indicates great success and harmony between these areas.' : category === 'dosha' ? 'Indicates struggles or transformations related to these areas.' : 'Indicates courage and mixed results.'}`,
              hi: `${h1} और ${h2} भावों के बीच ${nameHi}।`,
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
  if (!moon)
    return {
      name: 'Adhi Yoga',
      nameHi: 'अधि योग',
      category: 'raj',
      isPresent: false,
      strength: 'weak',
      description: { en: '', hi: '' },
      planets: [],
      houses: [],
    };

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
      hi: 'चंद्रमा से 6, 7, 8 भावों में शुभ ग्रह। नेतृत्व, धन और शत्रुओं पर विजय का संकेत।',
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
      hi: 'लग्न या चंद्रमा से दशम भाव में शुभ ग्रह। निष्कलंक चरित्र, समृद्धि और व्यावसायिक सफलता का संकेत।',
    },
    planets: benefics
      .filter(p => p.house === 10 || (moon && p.house === ((moon.house + 9 - 1) % 12) + 1))
      .map(p => p.name),
    houses: [10],
  };
}

/**
 * Helper to check if a planet aspects a given house using Graha Drishti rules
 */
function planetAspectsHouse(p: PlanetPosition, targetHouse: number): boolean {
  if (p.house === targetHouse) return true;
  const diff = (targetHouse - p.house + 12) % 12;
  const aspectHousesOffset = [6]; // Every planet aspects the 7th house (opposition)
  if (p.name === 'Jupiter' || p.name === 'Rahu' || p.name === 'Ketu') {
    aspectHousesOffset.push(4, 8); // 5th and 9th aspect
  }
  if (p.name === 'Mars') {
    aspectHousesOffset.push(3, 7); // 4th and 8th aspect
  }
  if (p.name === 'Saturn') {
    aspectHousesOffset.push(2, 9); // 3rd and 10th aspect
  }
  return aspectHousesOffset.includes(diff);
}

/**
 * Detect Videsh Yoga (Foreign Travel & Settlement) as per Vedic Astrology
 */
function detectVideshYoga(planets: PlanetPosition[], ascendantRashi: number): YogaResult {
  const RASHI_LORDS: Record<number, string> = {
    0: 'Mars',
    1: 'Venus',
    2: 'Mercury',
    3: 'Moon',
    4: 'Sun',
    5: 'Mercury',
    6: 'Venus',
    7: 'Mars',
    8: 'Jupiter',
    9: 'Saturn',
    10: 'Saturn',
    11: 'Jupiter',
  };

  const getHouseLord = (h: number) => {
    const rashiOfHouse = (ascendantRashi + h - 1) % 12;
    return RASHI_LORDS[rashiOfHouse];
  };

  const planetMap = Object.fromEntries(planets.map(p => [p.name, p]));
  const lord1 = planetMap[getHouseLord(1)];
  const lord2 = planetMap[getHouseLord(2)];
  const lord4 = planetMap[getHouseLord(4)];
  const lord10 = planetMap[getHouseLord(10)];
  const lord11 = planetMap[getHouseLord(11)];
  const lord12 = planetMap[getHouseLord(12)];

  // 1. Rashi Parivartan between Lagna Lord & 12th house Lord
  const rule1 = !!(lord1 && lord12 && lord1.house === 12 && lord12.house === 1);

  // 2. Rashi Parivartan between 4th house Lord & 12th house Lord
  const rule2 = !!(lord4 && lord12 && lord4.house === 12 && lord12.house === 4);

  // 3. Rashi Parivartan between 11th & 12th house Lord
  const rule3 = !!(lord11 && lord12 && lord11.house === 12 && lord12.house === 11);

  // 4. Lagnesh + Dhanesh conjunction in 12th house with benefic aspect (Moon, Mercury, Venus, Jupiter)
  const benefics = ['Moon', 'Mercury', 'Venus', 'Jupiter'];
  const beneficAspects12 = planets.some(
    p => benefics.includes(p.name) && planetAspectsHouse(p, 12)
  );
  const rule4 = !!(lord1 && lord2 && lord1.house === 12 && lord2.house === 12 && beneficAspects12);

  // 5. Lagnesh + Labhesh conjunction in 12th house with benefic aspect (Moon, Mercury, Venus, Jupiter)
  const rule5 = !!(
    lord1 &&
    lord11 &&
    lord1.house === 12 &&
    lord11.house === 12 &&
    beneficAspects12
  );

  // 6. 4th house Lord sitting in 3rd house
  const rule6 = !!(lord4 && lord4.house === 3);

  // 7. 12th house Lord sitting in 9th house (long journeys over water)
  const rule7 = !!(lord12 && lord12.house === 9);

  // 8. 4th house of birth chart afflicted
  const malefics = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];
  const hasMaleficIn4th = planets.some(p => malefics.includes(p.name) && p.house === 4);
  const hasMaleficAspect4th = planets.some(
    p => malefics.includes(p.name) && planetAspectsHouse(p, 4)
  );
  const isLord4Debilitated = !!(lord4 && DEBILITATION[lord4.name] === lord4.rashiIndex);
  const rule8 = hasMaleficIn4th || hasMaleficAspect4th || isLord4Debilitated;

  // 9. Two or more malefic planets aspecting/in the 4th house
  const countMalefics4th = planets.filter(
    p => malefics.includes(p.name) && (p.house === 4 || planetAspectsHouse(p, 4))
  ).length;
  const rule9 = countMalefics4th >= 2;

  // 10. Rahu in 4th or 10th house
  const rahu = planetMap['Rahu'];
  const rule10 = !!(rahu && (rahu.house === 4 || rahu.house === 10));

  // 11. 10th & 2nd house Lord strongly signify 12th house
  const rule11 = !!(
    (lord10 && lord10.house === 12) ||
    (lord2 && lord2.house === 12) ||
    (lord12 && (lord12.house === 10 || lord12.house === 2))
  );

  const activeRulesEn: string[] = [];
  const activeRulesHi: string[] = [];
  const involvedPlanets = new Set<string>();
  const involvedHouses = new Set<number>();

  if (rule1 && lord1 && lord12) {
    activeRulesEn.push('Sign exchange (Parivartan) between Lagna Lord and 12th Lord.');
    activeRulesHi.push('लग्नेश और द्वादशेश के बीच राशि परिवर्तन योग।');
    involvedPlanets.add(lord1.name);
    involvedPlanets.add(lord12.name);
    involvedHouses.add(1);
    involvedHouses.add(12);
  }
  if (rule2 && lord4 && lord12) {
    activeRulesEn.push(
      'Sign exchange (Parivartan) between 4th Lord (motherland) and 12th Lord (abroad).'
    );
    activeRulesHi.push('चतुर्थेश और द्वादशेश के बीच राशि परिवर्तन योग।');
    involvedPlanets.add(lord4.name);
    involvedPlanets.add(lord12.name);
    involvedHouses.add(4);
    involvedHouses.add(12);
  }
  if (rule3 && lord11 && lord12) {
    activeRulesEn.push(
      'Sign exchange (Parivartan) between 11th Lord (gains) and 12th Lord (abroad).'
    );
    activeRulesHi.push('एकादशेश और द्वादशेश के बीच राशि परिवर्तन योग।');
    involvedPlanets.add(lord11.name);
    involvedPlanets.add(lord12.name);
    involvedHouses.add(11);
    involvedHouses.add(12);
  }
  if (rule4 && lord1 && lord2) {
    activeRulesEn.push(
      'Lagna Lord and 2nd Lord conjunct in the 12th house (abroad) with a benefic aspect.'
    );
    activeRulesHi.push('लग्नेश और द्वितीयेश की द्वादश भाव में युति और शुभ ग्रह की दृष्टि।');
    involvedPlanets.add(lord1.name);
    involvedPlanets.add(lord2.name);
    involvedHouses.add(12);
  }
  if (rule5 && lord1 && lord11) {
    activeRulesEn.push(
      'Lagna Lord and 11th Lord conjunct in the 12th house (abroad) with a benefic aspect.'
    );
    activeRulesHi.push('लग्नेश और एकादशेश की द्वादश भाव में युति और शुभ ग्रह की दृष्टि।');
    involvedPlanets.add(lord1.name);
    involvedPlanets.add(lord11.name);
    involvedHouses.add(12);
  }
  if (rule6 && lord4) {
    activeRulesEn.push('4th Lord (motherland) placed in the 3rd house (travels).');
    activeRulesHi.push('चतुर्थेश का तृतीय भाव (यात्रा) में होना।');
    involvedPlanets.add(lord4.name);
    involvedHouses.add(3);
    involvedHouses.add(4);
  }
  if (rule7 && lord12) {
    activeRulesEn.push('12th Lord (abroad) placed in the 9th house (long journeys over water).');
    activeRulesHi.push('द्वादशेश का नवम भाव (लंबी समुद्री यात्रा) में होना।');
    involvedPlanets.add(lord12.name);
    involvedHouses.add(9);
    involvedHouses.add(12);
  }
  if (rule8) {
    activeRulesEn.push('4th house (motherland) is afflicted, favoring settlement away from home.');
    activeRulesHi.push('चतुर्थ भाव पीड़ित है, जो गृहस्थान से दूर बसने में सहायक है।');
    if (lord4) involvedPlanets.add(lord4.name);
    involvedHouses.add(4);
  }
  if (rule9) {
    activeRulesEn.push(
      'Multiple malefics aspecting/in the 4th house, showing high chances of abroad settlement.'
    );
    activeRulesHi.push(
      'दो या अधिक पापग्रहों की चतुर्थ भाव पर दृष्टि या उपस्थिति, जो विदेश में बसने के मजबूत संकेत हैं।'
    );
    involvedHouses.add(4);
  }
  if (rule10 && rahu) {
    activeRulesEn.push('Rahu in 4th/10th house, creating sudden foreign opportunities.');
    activeRulesHi.push(
      'राहु चतुर्थ या दशम भाव में स्थित है, जो अचानक विदेशी अवसर उत्पन्न करता है।'
    );
    involvedPlanets.add('Rahu');
    involvedHouses.add(rahu.house);
  }
  if (rule11) {
    activeRulesEn.push('10th and 2nd Lords strongly signify the 12th house of foreign affairs.');
    activeRulesHi.push('दशमेश और द्वितीयेश का द्वादश भाव (विदेश) से मजबूत संबंध।');
    if (lord10) involvedPlanets.add(lord10.name);
    if (lord2) involvedPlanets.add(lord2.name);
    if (lord12) involvedPlanets.add(lord12.name);
    involvedHouses.add(12);
  }

  const isPresent = activeRulesEn.length > 0;
  const strength =
    activeRulesEn.length >= 4 ? 'strong' : activeRulesEn.length >= 2 ? 'moderate' : 'weak';

  const descEn = isPresent
    ? `Videsh Yoga (Foreign Travel & Settlement) is present in your chart. Met conditions:\n- ${activeRulesEn.join('\n- ')}`
    : 'No strong Videsh Yoga conditions met in the chart.';

  const descHi = isPresent
    ? `आपकी कुंडली में विदेश योग (विदेश यात्रा और निवास) उपस्थित है। पूर्ण शर्तें:\n- ${activeRulesHi.join('\n- ')}`
    : 'कुंडली में कोई मजबूत विदेश योग की शर्तें नहीं मिली हैं।';

  return {
    name: 'Videsh Yoga',
    nameHi: 'विदेश योग',
    category: 'special',
    isPresent,
    strength,
    description: { en: descEn, hi: descHi },
    planets: Array.from(involvedPlanets),
    houses: Array.from(involvedHouses),
  };
}

/**
 * Main function: Analyze all yogas (100+ yogas)
 */
export function analyzeYogas(planets: PlanetPosition[], ascendantRashi = 0): YogaAnalysis {
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
    detectVideshYoga(planets, ascendantRashi),
    ...(detectAllExtendedYogas(planets) as YogaResult[]),
  ];

  const presentYogas = yogas.filter(y => y.isPresent);
  const rajYogas = presentYogas.filter(y => y.category === 'raj');
  const doshaYogas = presentYogas.filter(y => y.category === 'dosha');

  const count = presentYogas.length;
  const strongCount = presentYogas.filter(y => y.strength === 'strong').length;

  const summary = {
    en:
      count === 0
        ? 'No major yogas detected in this chart.'
        : `${count} yoga${count > 1 ? 's' : ''} detected (${strongCount} strong). ${rajYogas.length > 0 ? `${rajYogas.length} Raj Yoga${rajYogas.length > 1 ? 's' : ''} present.` : ''}`,
    hi:
      count === 0
        ? 'इस कुंडली में कोई प्रमुख योग नहीं मिला।'
        : `${count} योग मिले (${strongCount} बलवान)। ${rajYogas.length > 0 ? `${rajYogas.length} राज योग उपस्थित।` : ''}`,
  };

  return { yogas, presentYogas, rajYogas, doshaYogas, summary };
}

export type YogaStatus = 'ACTIVE' | 'EMERGING' | 'LATENT' | 'BROKEN';
export type DashaLevel = 1 | 2 | 3 | 4 | 5;

export interface EnhancedYogaResult extends YogaResult {
  status: YogaStatus;
  shadabalaGated: number;        // weakest forming planet's totalRupas
  activationDasha?: string;      // "Jupiter MD / Saturn AD"
  activationWindow?: string;     // "2027–2029"
  dashaLevel: DashaLevel;
  thereforeVerdict: string;      // Single forced conclusion
  shadabalaTier: string;         // "Extremely Strong" | "Strong" | "Moderate" | "Weak" | "Extremely Weak"
}

/**
 * Determine yoga activation status based on Shadbala gate + Dasha cross-reference.
 * SHADBALA GATE: If weakest planet < 0.40 rupas -> BROKEN regardless of other factors.
 */
export function getEnhancedYogaStatus(
  yoga: YogaResult,
  shadabalaResults: Array<{ planet: string; totalRupas: number }>,
  activeDasha: { mdLord: string; adLord: string; pdLord?: string } | null,
  upcomingDashaChange?: { newMdLord: string; startDate: Date } | null
): {
  status: YogaStatus;
  shadabalaGated: number;
  shadabalaTier: string;
  activationDasha?: string;
  activationWindow?: string;
  dashaLevel: DashaLevel;
  thereforeVerdict: string;
} {
  // Find weakest forming planet
  const yogaPlanets = yoga.planets;
  const planetRupas = yogaPlanets.map(name => {
    const found = shadabalaResults.find(s => s.planet === name);
    return { planet: name, rupas: found?.totalRupas ?? 0 };
  });
  const weakest = planetRupas.reduce((min, p) => p.rupas < min.rupas ? p : min, planetRupas[0] || { planet: 'Unknown', rupas: 0 });
  const weakestRupas = weakest?.rupas ?? 0;

  // Shadbala tier
  let shadabalaTier: string;
  if (weakestRupas >= 2.0) shadabalaTier = 'Extremely Strong';
  else if (weakestRupas >= 1.25) shadabalaTier = 'Strong';
  else if (weakestRupas >= 0.75) shadabalaTier = 'Moderate';
  else if (weakestRupas >= 0.40) shadabalaTier = 'Weak';
  else shadabalaTier = 'Extremely Weak';

  // SHADBALA GATE: < 0.40 -> BROKEN
  if (weakestRupas < 0.40) {
    return {
      status: 'BROKEN',
      shadabalaGated: weakestRupas,
      shadabalaTier,
      dashaLevel: 1,
      thereforeVerdict: `${yoga.name} is broken. ${weakest.planet} at ${weakestRupas.toFixed(2)} rupas cannot deliver. The event may occur but will be followed by reversal or disappointment.`,
    };
  }

  // Check Dasha activation
  const isMdActive = activeDasha && yogaPlanets.includes(activeDasha.mdLord);
  const isAdActive = activeDasha && yogaPlanets.includes(activeDasha.adLord);
  const isPdActive = activeDasha?.pdLord && yogaPlanets.includes(activeDasha.pdLord);

  let status: YogaStatus;
  let activationDasha: string | undefined;
  let activationWindow: string | undefined;
  let dashaLevel: DashaLevel;
  let thereforeVerdict: string;

  if ((isMdActive || isAdActive) && weakestRupas >= 0.75) {
    status = 'ACTIVE';
    activationDasha = `${activeDasha!.mdLord} MD / ${activeDasha!.adLord} AD`;
    dashaLevel = isPdActive ? 5 : isAdActive ? 4 : 3;
    const levelTag = `[Level ${dashaLevel}: ${activationDasha}]`;
    thereforeVerdict = `${yoga.name} delivers with confidence. ${weakest.planet} at ${weakestRupas.toFixed(2)} rupas supports full manifestation in the current Dasha window. ${levelTag}`;
  } else if (upcomingDashaChange && yogaPlanets.includes(upcomingDashaChange.newMdLord)) {
    status = 'EMERGING';
    const startYear = upcomingDashaChange.startDate.getFullYear();
    activationWindow = `${startYear}-${startYear + 3}`;
    activationDasha = `${upcomingDashaChange.newMdLord} MD`;
    dashaLevel = 2;
    thereforeVerdict = `${yoga.name} is emerging. Activation in ${upcomingDashaChange.newMdLord} MD, begins ${upcomingDashaChange.startDate.toLocaleDateString()}. [Level 2: Await ${upcomingDashaChange.newMdLord} MD]`;
  } else if (weakestRupas >= 0.75) {
    status = 'LATENT';
    dashaLevel = 2;
    const activatingPlanet = yogaPlanets[0];
    thereforeVerdict = `${yoga.name} is latent until ${activatingPlanet} MD/AD activates it. [Level 2: Wait for ${activatingPlanet} period]`;
  } else {
    status = 'BROKEN';
    dashaLevel = 1;
    thereforeVerdict = `${yoga.name} is broken. ${weakest.planet} at ${weakestRupas.toFixed(2)} rupas creates intermittent results — grant, then removal; rise, then obstacle.`;
  }

  return { status, shadabalaGated: weakestRupas, shadabalaTier, activationDasha, activationWindow, dashaLevel, thereforeVerdict };
}

/**
 * Upgrade a standard YogaAnalysis to use EnhancedYogaResults.
 * Call this from the interpretationEngine or any consumer.
 */
export function enhanceYogaAnalysis(
  analysis: YogaAnalysis,
  shadabalaResults: Array<{ planet: string; totalRupas: number }>,
  activeDasha: { mdLord: string; adLord: string; pdLord?: string } | null,
  upcomingDashaChange?: { newMdLord: string; startDate: Date } | null
): YogaAnalysis & { enhancedYogas: EnhancedYogaResult[] } {
  const enhancedYogas: EnhancedYogaResult[] = analysis.presentYogas
    .filter(y => y.isPresent)
    .map(yoga => {
      const enhanced = getEnhancedYogaStatus(yoga, shadabalaResults, activeDasha, upcomingDashaChange);
      return {
        ...yoga,
        ...enhanced,
      };
    });

  return {
    ...analysis,
    enhancedYogas,
  };
}

/**
 * When multiple yogas combine, apply multiplicative (not additive) synthesis.
 */
export function synthesizeYogaCombo(
  yoga1: EnhancedYogaResult,
  yoga2: EnhancedYogaResult
): { combination: string; narrative: string } {
  const combo = [yoga1.name, yoga2.name].sort().join(' + ');
  
  const syntheses: Record<string, string> = {
    'Raj Yoga + Viparita Yoga': 'Rise through adversity, scandal, or institutional collapse. Power is forged in crisis, not comfort.',
    'Neecha Bhanga + Raj Yoga': 'Catastrophic early conditions -> spectacular second-half reversal. The greater the fall, the greater the rise.',
    'Gaja Kesari + Dhana Yoga': 'Wealth through wisdom and public reputation. Money follows knowledge, never precedes it.',
    'Rahu in 10th + Strong Sun': 'Viral, unconventional world fame. The native becomes a category of one.',
    'Viparita Raj Yoga + Rahu': 'Fame from ashes or scandal. Self-transformation is the only path to lasting recognition.',
  };

  return {
    combination: combo,
    narrative: syntheses[combo] ?? `Combined influence: ${yoga1.name} (${yoga1.status}) + ${yoga2.name} (${yoga2.status}). Effects are multiplicative, not additive.`,
  };
}
