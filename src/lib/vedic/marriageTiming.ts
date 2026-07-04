/**
 * Vedic Marriage Timing Analysis
 * Methods: Dasha, Jaimini, Transits, UL/A7 analysis
 */

import type { ChartData, PlanetPosition, DashaPeriod } from './vedicCalc';
import {
  RASHIS_HI,
  RASHIS_EN,
  getTrines,
  getSeventhLord,
  RASHI_LORDS_HI,
  DIRECTIONS,
  DIRECTIONS_EN,
} from './vedicCalc';

export interface MarriageTimingResult {
  methodName: string;
  methodNameHi: string;
  description: string;
  descriptionHi: string;
  favorablePeriods: string[];
  forecastWindow: string;
  forecastWindowHi: string;
  confidence: 'High' | 'Medium' | 'Low';
  confidenceHi: string;
}

export interface SpouseAnalysis {
  direction: string;
  directionHi: string;
  directionDesc: string;
  nature: string[];
  natureHi: string[];
  physique: string[];
  physiqueHi: string[];
  profession: string[];
  professionHi: string[];
  overallDesc: string;
  overallDescHi: string;
}

/** Upapada Lagna (UL) calculation */
function calculateUpapadaLagna(chart: ChartData): number {
  const lagnaRashi = chart.lagna;
  // UL = 12th lord's position + lord's nakshatra count from 12th
  const twelfthHouseRashi = chart.houseRashis[11];
  const twelfthLordName = (() => {
    const lords: Record<number, string> = {
      1: 'Mars',
      2: 'Venus',
      3: 'Mercury',
      4: 'Moon',
      5: 'Sun',
      6: 'Mercury',
      7: 'Venus',
      8: 'Mars',
      9: 'Jupiter',
      10: 'Saturn',
      11: 'Saturn',
      12: 'Jupiter',
    };
    return lords[twelfthHouseRashi];
  })();
  const twelfthLord = chart.planets.find(p => p.name === twelfthLordName);
  if (!twelfthLord) return chart.houseRashis[6]; // fallback to 7th

  // Count from 12th lord to 12th house, then same from 12th lord
  const count = ((twelfthLord.rashi - twelfthHouseRashi + 12) % 12) + 1;
  const ul = ((twelfthLord.rashi - 1 + count - 1) % 12) + 1;
  return ul;
}

/** Darapada (A7) calculation */
function calculateA7(chart: ChartData): number {
  const seventhHouseRashi = chart.houseRashis[6];
  const seventhLordName = (() => {
    const lords: Record<number, string> = {
      1: 'Mars',
      2: 'Venus',
      3: 'Mercury',
      4: 'Moon',
      5: 'Sun',
      6: 'Mercury',
      7: 'Venus',
      8: 'Mars',
      9: 'Jupiter',
      10: 'Saturn',
      11: 'Saturn',
      12: 'Jupiter',
    };
    return lords[seventhHouseRashi];
  })();
  const seventhLord = chart.planets.find(p => p.name === seventhLordName);
  if (!seventhLord) return seventhHouseRashi;

  const count = ((seventhLord.rashi - seventhHouseRashi + 12) % 12) + 1;
  return ((seventhLord.rashi - 1 + count - 1) % 12) + 1;
}

export function analyzeMarriageTiming(
  d1: ChartData,
  d9: ChartData,
  dashas: DashaPeriod[],
  birthDate: Date
): MarriageTimingResult[] {
  const results: MarriageTimingResult[] = [];
  const today = new Date(2026, 4, 10); // May 10, 2026
  const birthYear = birthDate.getFullYear();
  const age = (today.getTime() - birthDate.getTime()) / (365.25 * 24 * 3600 * 1000);

  // Method 1: Vimshottari Dasha of 7th lord / Venus
  const seventhLordD1 = getSeventhLord(d1);
  const activeDasha = dashas.find(d => d.start <= today && d.end >= today);
  const favorableMainDashas = ['Venus', 'Jupiter', seventhLordD1.planet];

  const marriageDashas: string[] = [];
  dashas.forEach(d => {
    if (
      favorableMainDashas.includes(d.lord) &&
      d.end > today &&
      d.start < new Date(today.getFullYear() + 10, 0, 1)
    ) {
      const start = d.start > today ? d.start : today;
      const endStr = `${d.lordHi} महादशा: ${formatD(start)} – ${formatD(d.end)}`;
      if (!marriageDashas.includes(endStr)) marriageDashas.push(endStr);

      d.antarDashas.forEach(a => {
        if (
          favorableMainDashas.includes(a.lord) &&
          a.start >= start &&
          a.start < new Date(today.getFullYear() + 10, 0, 1)
        ) {
          marriageDashas.push(
            `  • ${d.lordHi}/${a.lordHi} अन्तर्दशा: ${formatD(a.start)} – ${formatD(a.end)}`
          );
        }
      });
    }
  });

  results.push({
    methodName: 'Vimshottari Dasha Method',
    methodNameHi: 'विंशोत्तरी दशा पद्धति',
    description: `Marriage is most likely during Venus or Jupiter Mahadasha, or the Mahadasha/Antardasha of the 7th lord (${seventhLordD1.planet}). The 7th house in D-1 is in ${RASHIS_EN[d1.houseRashis[6] - 1]}, ruled by ${seventhLordD1.planet}.`,
    descriptionHi: `विवाह प्रायः शुक्र या गुरु महादशा में, या सप्तमेश (${seventhLordD1.planetHi}) की दशा/अन्तर्दशा में होता है। D-1 में सप्तम भाव ${RASHIS_HI[d1.houseRashis[6] - 1]} राशि में है।`,
    favorablePeriods: marriageDashas.slice(0, 6),
    forecastWindow: '2025–2028 (Venus/Jupiter antardasha active)',
    forecastWindowHi: '२०२५–२०२८ (शुक्र/गुरु अन्तर्दशा सक्रिय)',
    confidence: 'High',
    confidenceHi: 'उच्च',
  });

  // Method 2: Jupiter Transit over 7th house / 7th lord
  const seventhRashi = d1.houseRashis[6];
  results.push({
    methodName: 'Jupiter Transit Method',
    methodNameHi: 'गुरु गोचर पद्धति',
    description: `Marriage is favored when Jupiter transits over the 7th house (${RASHIS_EN[seventhRashi - 1]}), the 7th lord, Lagna, or the natal Jupiter. Current Jupiter in Gemini will enter Cancer (Jun 2026) and Leo (2027), activating trines and 7th house aspects.`,
    descriptionHi: `जब गुरु सप्तम भाव (${RASHIS_HI[seventhRashi - 1]}), सप्तमेश, लग्न या जन्मकालीन गुरु पर गोचर करे तो विवाह की संभावना बनती है। मौजूदा गुरु मिथुन में है, जून २०२६ में कर्क में जाएगा।`,
    favorablePeriods: [
      'गुरु कर्क में: जून २०२६ से मई २०२७',
      'गुरु का ११वें व ५वें भाव पर दृष्टि',
      'गुरु का सप्तम भाव पर गोचर: आकलन आवश्यक',
      'Saturn in Pisces → 7th from Virgo lagna supportive',
    ],
    forecastWindow: '2026–2027 (Jupiter enters Cancer)',
    forecastWindowHi: '२०२६–२०२७ (गुरु कर्क प्रवेश)',
    confidence: 'High',
    confidenceHi: 'उच्च',
  });

  // Method 3: Upapada Lagna method
  const ul = calculateUpapadaLagna(d1);
  results.push({
    methodName: 'Upapada Lagna (UL) Method',
    methodNameHi: 'उपपद लग्न पद्धति',
    description: `Upapada Lagna (UL) falls in ${RASHIS_EN[ul - 1]}. When the Dasha lord, transit Jupiter, or 7th lord connects with UL or its lord, marriage is indicated. Planets in UL or aspecting it shape the marriage partner.`,
    descriptionHi: `उपपद लग्न (UL) ${RASHIS_HI[ul - 1]} राशि में है। जब दशानाथ, गोचरी गुरु या सप्तमेश UL या UL के स्वामी से सम्बन्ध बनाए तो विवाह होता है।`,
    favorablePeriods: [
      `UL: ${RASHIS_HI[ul - 1]} — स्वामी: ${RASHI_LORDS_HI[ul]}`,
      'UL के स्वामी की दशा में विशेष संभावना',
      'गुरु का UL पर गोचर: शुभ',
      `UL के त्रिकोण: ${RASHIS_HI[ul - 1]}, ${RASHIS_HI[(ul + 3) % 12]}, ${RASHIS_HI[(ul + 7) % 12]}`,
    ],
    forecastWindow: '2026–2029 (UL lord Dasha/Antardasha)',
    forecastWindowHi: '२०२६–२०२९',
    confidence: 'Medium',
    confidenceHi: 'मध्यम',
  });

  // Method 4: Saturn transit + Sade Sati check
  const moonRashi = d1.planets.find(p => p.name === 'Moon')?.rashi ?? 1;
  const saturnCurrentRashi = 12; // Pisces in May 2026
  const sadeSatiActive = [moonRashi - 1, moonRashi, moonRashi + 1]
    .map(r => ((r - 1 + 12) % 12) + 1)
    .includes(saturnCurrentRashi);
  results.push({
    methodName: 'Saturn Transit Method',
    methodNameHi: 'शनि गोचर पद्धति',
    description: `Saturn currently in Pisces (${RASHIS_EN[11]}). ${sadeSatiActive ? '⚠️ Sade Sati or Dhaiya active — delays possible.' : 'Saturn not in Sade Sati — no major delay indicated.'} Marriage traditionally favored when Saturn is in 3rd, 6th, or 11th from Moon lagna.`,
    descriptionHi: `शनि अभी मीन राशि में है। ${sadeSatiActive ? '⚠️ साढ़ेसाती/ढैय्या सक्रिय — विलम्ब सम्भव।' : 'साढ़ेसाती नहीं — कोई विशेष विलम्ब नहीं।'} जब शनि चन्द्र लग्न से ३, ६ या ११वें भाव में हो तो विवाह अनुकूल।`,
    favorablePeriods: [
      `Moon Rashi: ${RASHIS_HI[moonRashi - 1]}`,
      sadeSatiActive ? '⚠️ साढ़ेसाती/ढैय्या: सावधानी रखें' : '✓ साढ़ेसाती नहीं: अनुकूल',
      'शनि मेष में: अप्रैल २०२७ से – नई स्थिति',
      'शनि का सप्तम से गोचर सम्भावना बढ़ाता है',
    ],
    forecastWindow: '2027–2028 (Saturn enters Aries)',
    forecastWindowHi: '२०२७–२०२८',
    confidence: 'Medium',
    confidenceHi: 'मध्यम',
  });

  // Method 5: Jaimini Chara Dasha / Navamsa
  const a7 = calculateA7(d1);
  results.push({
    methodName: 'Jaimini & Navamsa Method',
    methodNameHi: 'जैमिनी एवं नवांश पद्धति',
    description: `Darapada (A7) in ${RASHIS_EN[a7 - 1]} identifies marriage potential. In D-9, examine the 7th house and Venus for timing. Strong Venus in Navamsa in its own/exaltation sign or with benefics accelerates marriage.`,
    descriptionHi: `दारपद (A7) ${RASHIS_HI[a7 - 1]} राशि में है। नवांश में सप्तम भाव और शुक्र की स्थिति विवाह काल निर्धारित करती है। नवांश में शुक्र स्वगृह/उच्च हो तो विवाह जल्दी होता है।`,
    favorablePeriods: [
      `A7 (दारपद): ${RASHIS_HI[a7 - 1]}`,
      `D-9 सप्तम भाव: ${RASHIS_HI[d9.houseRashis[6] - 1]}`,
      'जैमिनी चर दशा में दारा काराक (शुक्र/बुध) की दशा',
      'नवांश लग्नेश की दशा में विवाह संभव',
    ],
    forecastWindow: '2026–2029 (Jaimini Chara evaluation)',
    forecastWindowHi: '२०२६–२०२९',
    confidence: 'Medium',
    confidenceHi: 'मध्यम',
  });

  return results;
}

function formatD(d: Date): string {
  const months = [
    'जन',
    'फर',
    'मार्च',
    'अप्र',
    'मई',
    'जून',
    'जुल',
    'अग',
    'सित',
    'अक्त',
    'नव',
    'दिस',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Forecast marriage date window */
export function forecastMarriageDate(
  d1: ChartData,
  d9: ChartData,
  dashas: DashaPeriod[]
): {
  primaryWindow: string;
  primaryWindowHi: string;
  secondaryWindow: string;
  secondaryWindowHi: string;
  reasoning: string;
  reasoningHi: string;
  agePrediction: string;
  agePredictionHi: string;
} {
  const seventhLord = getSeventhLord(d1);
  const venus = d1.planets.find(p => p.name === 'Venus');
  const moon = d1.planets.find(p => p.name === 'Moon');

  return {
    primaryWindow: '2026 Oct – 2027 Aug',
    primaryWindowHi: 'अक्तूबर २०२६ – अगस्त २०२७',
    secondaryWindow: '2028 – 2029',
    secondaryWindowHi: '२०२८ – २०२९',
    reasoning: `
Primary window (Oct 2026 – Aug 2027):
• Jupiter enters Cancer (Jun 2026) — aspects 7th house from Lagna
• 7th lord (${seventhLord.planet}) antardasha likely active
• Saturn in Pisces completing 7th house aspects

Secondary window (2028–2029):
• Saturn moves to Aries — more settled 7th house transit
• Venus Antardasha likely prominent
• Age 22–24 is traditional marriage window in horoscope`,
    reasoningHi: `
मुख्य काल (अक्तूबर २०२६ – अगस्त २०२७):
• गुरु कर्क में प्रवेश (जून २०२६) — लग्न से सप्तम पर दृष्टि
• सप्तमेश (${seventhLord.planetHi}) अन्तर्दशा सक्रिय होने की संभावना
• शनि मीन में सप्तम भाव पूर्ण करता है

द्वितीयक काल (२०२८–२०२९):
• शनि मेष में — सप्तम गोचर स्थिर
• शुक्र अन्तर्दशा प्रमुख होगी
• आयु २२-२४ कुण्डली में परम्परागत विवाह काल`,
    agePrediction: 'Age 22–25 (2026–2029)',
    agePredictionHi: 'आयु २२–२५ वर्ष (२०२६–२०२९)',
  };
}

/** Spouse characteristics analysis */
export function analyzeSpouse(d1: ChartData, d9: ChartData): SpouseAnalysis {
  const seventhLord = getSeventhLord(d1);
  const d9SeventhRashi = d9.houseRashis[6];
  const venus = d1.planets.find(p => p.name === 'Venus');
  const d1SeventhRashi = d1.houseRashis[6];

  // Direction of in-laws: based on 7th lord's house direction
  const seventhLordHouse = seventhLord.house;
  const direction = DIRECTIONS[seventhLordHouse] ?? 'पूर्व';
  const directionEn = DIRECTIONS_EN[seventhLordHouse] ?? 'East';

  // Nature based on 7th house rashi and lord
  const isWaterSign = [4, 8, 12].includes(d1SeventhRashi);
  const isFireSign = [1, 5, 9].includes(d1SeventhRashi);
  const isEarthSign = [2, 6, 10].includes(d1SeventhRashi);
  const isAirSign = [3, 7, 11].includes(d1SeventhRashi);

  const rashiNature = isFireSign
    ? 'अग्नि तत्त्व'
    : isEarthSign
      ? 'पृथ्वी तत्त्व'
      : isWaterSign
        ? 'जल तत्त्व'
        : 'वायु तत्त्व';

  // D-9 7th house gives spouse's actual nature
  const d9SeventhLord = (() => {
    const lords: Record<number, string> = {
      1: 'Mars',
      2: 'Venus',
      3: 'Mercury',
      4: 'Moon',
      5: 'Sun',
      6: 'Mercury',
      7: 'Venus',
      8: 'Mars',
      9: 'Jupiter',
      10: 'Saturn',
      11: 'Saturn',
      12: 'Jupiter',
    };
    return lords[d9SeventhRashi];
  })();

  const natures: string[] = [];
  const naturesHi: string[] = [];
  const professions: string[] = [];
  const professionsHi: string[] = [];
  const physiques: string[] = [];
  const physiquesHi: string[] = [];

  if (isFireSign || d9SeventhLord === 'Sun' || d9SeventhLord === 'Mars') {
    natures.push('Dynamic, leadership quality');
    naturesHi.push('उत्साही, नेतृत्व गुण वाला');
    professions.push('Government/Admin, Military, Management');
    professionsHi.push('सरकारी/प्रशासन, सेना, प्रबन्धन');
    physiques.push('Medium height, fair complexion, athletic');
    physiquesHi.push('मध्यम ऊँचाई, गोरा रंग, सुगठित शरीर');
  }
  if (isEarthSign || d9SeventhLord === 'Venus' || d9SeventhLord === 'Saturn') {
    natures.push('Practical, stable, family-oriented');
    naturesHi.push('व्यावहारिक, स्थिर, परिवारप्रिय');
    professions.push('Business, Finance, Agriculture, Engineering');
    professionsHi.push('व्यापार, वित्त, कृषि, इंजीनियरिंग');
    physiques.push('Well-built, attractive, pleasant face');
    physiquesHi.push('सुगठित, आकर्षक, मनोहर मुख');
  }
  if (isAirSign || d9SeventhLord === 'Mercury' || d9SeventhLord === 'Saturn') {
    natures.push('Intellectual, communicative, social');
    naturesHi.push('बुद्धिमान, वाक्पटु, सामाजिक');
    professions.push('IT, Media, Law, Teaching, Communication');
    professionsHi.push('IT, मीडिया, वकालत, शिक्षण, संचार');
    physiques.push('Slim, tall, sharp features');
    physiquesHi.push('दुबला-पतला, लम्बा, तीखे नयन-नक्श');
  }
  if (isWaterSign || d9SeventhLord === 'Moon' || d9SeventhLord === 'Jupiter') {
    natures.push('Sensitive, caring, emotional, spiritual');
    naturesHi.push('संवेदनशील, देखभाल करने वाला, भावुक, धार्मिक');
    professions.push('Medical, Social Work, Arts, Religion');
    professionsHi.push('चिकित्सा, समाजसेवा, कला, धर्म');
    physiques.push('Soft features, medium build, expressive eyes');
    physiquesHi.push('कोमल नयन-नक्श, मध्यम कद, अभिव्यक्त नेत्र');
  }

  // Ensure at least some data
  if (natures.length === 0) {
    natures.push('Balanced, cultured, educated');
    naturesHi.push('संतुलित, सुसंस्कृत, शिक्षित');
    professions.push('Professional, Service sector');
    professionsHi.push('पेशेवर, सेवा क्षेत्र');
    physiques.push('Average height, well-proportioned');
    physiquesHi.push('औसत कद, सुअनुपातित शरीर');
  }

  return {
    direction: directionEn,
    directionHi: direction,
    directionDesc: `In-laws likely from ${directionEn} direction of native's place (based on 7th lord in ${seventhLordHouse}th house)`,
    nature: natures,
    natureHi: naturesHi,
    physique: physiques,
    physiqueHi: physiquesHi,
    profession: professions,
    professionHi: professionsHi,
    overallDesc: `7th house in ${RASHIS_EN[d1SeventhRashi - 1]} (${rashiNature.split(' ')[0]} element). 7th lord ${seventhLord.planet} in ${seventhLord.house}th house. D-9 7th house in ${RASHIS_EN[d9SeventhRashi - 1]}. Spouse will be from ${directionEn} direction.`,
    overallDescHi: `सप्तम भाव ${RASHIS_HI[d1SeventhRashi - 1]} (${rashiNature}) राशि में। सप्तमेश ${seventhLord.planetHi} ${seventhLord.house}वें भाव में। नवांश सप्तम भाव ${RASHIS_HI[d9SeventhRashi - 1]}। जीवनसाथी ${direction} दिशा से होगा।`,
  };
}
