// Week 30-31: Western Astrology Service
// Tropical zodiac, aspects, house systems, predictions

export interface WesternPlanet {
  name: string;
  symbol: string;
  tropicalLongitude: number;
  sign: string;
  signIndex: number;
  house: number;
  degrees: number;
  minutes: number;
  isRetrograde: boolean;
  dignity: string;
}

export interface WesternAspect {
  planet1: string;
  planet2: string;
  aspectName: string;
  orb: number;
  isApplying: boolean;
  influence: string;
  strength: 'strong' | 'moderate' | 'weak';
}

export interface WesternChart {
  sunSign: string;
  moonSign: string;
  ascendant: string;
  planets: WesternPlanet[];
  aspects: WesternAspect[];
  dominantElement: string;
  dominantModality: string;
  chartRuler: string;
  interpretation: string;
}

const WESTERN_SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];

const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇'
};

const ASPECTS: Array<{ name: string; angle: number; orb: number; influence: string }> = [
  { name: 'Conjunction', angle: 0, orb: 8, influence: 'Fusion of energies, intensification' },
  { name: 'Opposition', angle: 180, orb: 8, influence: 'Tension, awareness, balance needed' },
  { name: 'Trine', angle: 120, orb: 8, influence: 'Harmony, ease, natural talent' },
  { name: 'Square', angle: 90, orb: 7, influence: 'Challenge, friction, growth through effort' },
  { name: 'Sextile', angle: 60, orb: 6, influence: 'Opportunity, cooperation, skill' },
  { name: 'Quincunx', angle: 150, orb: 3, influence: 'Adjustment, redirection, health matters' },
  { name: 'Semi-sextile', angle: 30, orb: 2, influence: 'Mild stimulation, minor connections' },
];

const DIGNITIES: Record<string, { domicile: number[]; exaltation: number; detriment: number[]; fall: number }> = {
  Sun:     { domicile: [4], exaltation: 0, detriment: [10], fall: 6 },
  Moon:    { domicile: [3], exaltation: 1, detriment: [9], fall: 7 },
  Mercury: { domicile: [2, 5], exaltation: 5, detriment: [8, 11], fall: 11 },
  Venus:   { domicile: [1, 6], exaltation: 11, detriment: [0, 7], fall: 5 },
  Mars:    { domicile: [0, 7], exaltation: 9, detriment: [1, 6], fall: 3 },
  Jupiter: { domicile: [8, 11], exaltation: 3, detriment: [2, 5], fall: 9 },
  Saturn:  { domicile: [9, 10], exaltation: 6, detriment: [3, 4], fall: 0 },
};

function getDignity(planet: string, signIndex: number): string {
  const d = DIGNITIES[planet];
  if (!d) return 'Peregrine';
  if (d.domicile.includes(signIndex)) return 'Domicile';
  if (d.exaltation === signIndex) return 'Exaltation';
  if (d.detriment.includes(signIndex)) return 'Detriment';
  if (d.fall === signIndex) return 'Fall';
  return 'Peregrine';
}

// Tropical longitude from birth date (simplified)
function getTropicalLongitude(planet: string, jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const base: Record<string, number> = {
    Sun: 280.46646 + 36000.76983 * T,
    Moon: 218.3165 + 481267.8813 * T,
    Mercury: 252.2509 + 149472.6674 * T,
    Venus: 181.9798 + 58517.8156 * T,
    Mars: 355.4330 + 19140.2993 * T,
    Jupiter: 34.3515 + 3034.9057 * T,
    Saturn: 50.0774 + 1222.1138 * T,
    Uranus: 314.0550 + 428.4882 * T,
    Neptune: 304.3487 + 218.4862 * T,
    Pluto: 238.9290 + 145.2078 * T,
  };
  const lon = ((base[planet] ?? 0) % 360 + 360) % 360;
  return lon;
}

function dateToJD(date: string, time: string): number {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = (time || '12:00').split(':').map(Number);
  const ut = h + min / 60;
  const A = Math.floor((14 - m) / 12);
  const Y = y + 4800 - A;
  const M = m + 12 * A - 3;
  return d + Math.floor((153 * M + 2) / 5) + 365 * Y + Math.floor(Y / 4) - Math.floor(Y / 100) + Math.floor(Y / 400) - 32045 + (ut - 12) / 24;
}

function getAscendantTropical(jd: number, lat: number, lon: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  const LST = ((GMST + lon) % 360 + 360) % 360;
  const eps = 23.439291111 - 0.013004167 * T;
  const epsR = eps * Math.PI / 180;
  const LSTR = LST * Math.PI / 180;
  const latR = lat * Math.PI / 180;
  const asc = Math.atan2(Math.cos(LSTR), -(Math.sin(LSTR) * Math.cos(epsR) + Math.tan(latR) * Math.sin(epsR)));
  return ((asc * 180 / Math.PI) % 360 + 360) % 360;
}

function getHouse(planetLon: number, ascLon: number): number {
  const diff = ((planetLon - ascLon) % 360 + 360) % 360;
  return Math.floor(diff / 30) + 1;
}

function calcAspects(planets: WesternPlanet[]): WesternAspect[] {
  const aspects: WesternAspect[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const diff = Math.abs(planets[i].tropicalLongitude - planets[j].tropicalLongitude);
      const angle = diff > 180 ? 360 - diff : diff;
      for (const asp of ASPECTS) {
        const orb = Math.abs(angle - asp.angle);
        if (orb <= asp.orb) {
          aspects.push({
            planet1: planets[i].name,
            planet2: planets[j].name,
            aspectName: asp.name,
            orb: Math.round(orb * 100) / 100,
            isApplying: planets[i].tropicalLongitude < planets[j].tropicalLongitude,
            influence: asp.influence,
            strength: orb <= 2 ? 'strong' : orb <= 5 ? 'moderate' : 'weak',
          });
        }
      }
    }
  }
  return aspects;
}

export function calculateWesternChart(date: string, time: string, lat: number, lon: number): WesternChart {
  const jd = dateToJD(date, time);
  const planetNames = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
  const ascLon = getAscendantTropical(jd, lat, lon);

  const planets: WesternPlanet[] = planetNames.map(name => {
    const tLon = getTropicalLongitude(name, jd);
    const signIndex = Math.floor(tLon / 30);
    const deg = Math.floor(tLon % 30);
    const min = Math.floor((tLon % 1) * 60);
    return {
      name,
      symbol: PLANET_SYMBOLS[name] ?? '●',
      tropicalLongitude: tLon,
      sign: WESTERN_SIGNS[signIndex],
      signIndex,
      house: getHouse(tLon, ascLon),
      degrees: deg,
      minutes: min,
      isRetrograde: false,
      dignity: getDignity(name, signIndex),
    };
  });

  const aspects = calcAspects(planets);
  const sun = planets.find(p => p.name === 'Sun')!;
  const moon = planets.find(p => p.name === 'Moon')!;
  const ascSignIndex = Math.floor(ascLon / 30);

  // Dominant element
  const elements = ['Fire','Earth','Air','Water'];
  const elementMap = [0,1,2,3,0,1,2,3,0,1,2,3];
  const elementCount = [0,0,0,0];
  planets.forEach(p => elementCount[elementMap[p.signIndex]]++);
  const dominantElement = elements[elementCount.indexOf(Math.max(...elementCount))];

  // Dominant modality
  const modalities = ['Cardinal','Fixed','Mutable'];
  const modalityMap = [0,1,2,0,1,2,0,1,2,0,1,2];
  const modalityCount = [0,0,0];
  planets.forEach(p => modalityCount[modalityMap[p.signIndex]]++);
  const dominantModality = modalities[modalityCount.indexOf(Math.max(...modalityCount))];

  // Chart ruler = ruler of ascendant sign
  const rulers = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
  const chartRuler = rulers[ascSignIndex];

  const interpretation = `Your Sun in ${sun.sign} gives you ${getSunSignTrait(sun.signIndex)} nature. Moon in ${moon.sign} reflects your ${getMoonSignTrait(moon.signIndex)} emotional world. Rising in ${WESTERN_SIGNS[ascSignIndex]} shapes how others perceive you as ${getAscendantTrait(ascSignIndex)}.`;

  return {
    sunSign: sun.sign,
    moonSign: moon.sign,
    ascendant: WESTERN_SIGNS[ascSignIndex],
    planets,
    aspects,
    dominantElement,
    dominantModality,
    chartRuler,
    interpretation,
  };
}

function getSunSignTrait(i: number): string {
  const traits = ['bold and pioneering','patient and sensual','curious and adaptable','nurturing and intuitive','confident and creative','analytical and precise','diplomatic and harmonious','intense and transformative','adventurous and philosophical','disciplined and ambitious','innovative and humanitarian','compassionate and imaginative'];
  return traits[i] ?? 'unique';
}

function getMoonSignTrait(i: number): string {
  const traits = ['impulsive','comfort-seeking','changeable','deeply feeling','dramatic','detail-oriented','relationship-focused','deeply private','freedom-loving','controlled','detached','boundless'];
  return traits[i] ?? 'complex';
}

function getAscendantTrait(i: number): string {
  const traits = ['energetic and direct','reliable and grounded','versatile and communicative','sensitive and caring','radiant and confident','modest and helpful','charming and balanced','magnetic and mysterious','optimistic and expansive','serious and capable','original and independent','gentle and empathetic'];
  return traits[i] ?? 'distinctive';
}

export function getWesternSignDescription(sign: string, lang: 'en' | 'hi' = 'en'): string {
  const descriptions: Record<string, { en: string; hi: string }> = {
    Aries: { en: 'Aries (Mar 21 - Apr 19): The Ram. Cardinal Fire. Ruled by Mars. Bold, pioneering, competitive, and energetic. Natural leader with strong initiative.', hi: 'मेष (21 मार्च - 19 अप्रैल): मंगल शासित। साहसी, अग्रणी, प्रतिस्पर्धी।' },
    Taurus: { en: 'Taurus (Apr 20 - May 20): The Bull. Fixed Earth. Ruled by Venus. Patient, reliable, sensual, and determined. Values security and beauty.', hi: 'वृषभ (20 अप्रैल - 20 मई): शुक्र शासित। धैर्यवान, विश्वसनीय, सौंदर्यप्रिय।' },
    Gemini: { en: 'Gemini (May 21 - Jun 20): The Twins. Mutable Air. Ruled by Mercury. Curious, adaptable, communicative, and witty. Loves variety and learning.', hi: 'मिथुन (21 मई - 20 जून): बुध शासित। जिज्ञासु, अनुकूलनीय, संचारी।' },
    Cancer: { en: 'Cancer (Jun 21 - Jul 22): The Crab. Cardinal Water. Ruled by Moon. Nurturing, intuitive, protective, and emotional. Deep family bonds.', hi: 'कर्क (21 जून - 22 जुलाई): चंद्र शासित। पोषणकारी, सहज, भावनात्मक।' },
    Leo: { en: 'Leo (Jul 23 - Aug 22): The Lion. Fixed Fire. Ruled by Sun. Confident, creative, generous, and dramatic. Natural performer and leader.', hi: 'सिंह (23 जुलाई - 22 अगस्त): सूर्य शासित। आत्मविश्वासी, रचनात्मक, उदार।' },
    Virgo: { en: 'Virgo (Aug 23 - Sep 22): The Virgin. Mutable Earth. Ruled by Mercury. Analytical, precise, helpful, and health-conscious. Perfectionist nature.', hi: 'कन्या (23 अगस्त - 22 सितंबर): बुध शासित। विश्लेषणात्मक, सटीक, सहायक।' },
    Libra: { en: 'Libra (Sep 23 - Oct 22): The Scales. Cardinal Air. Ruled by Venus. Diplomatic, fair, social, and aesthetic. Seeks balance and harmony.', hi: 'तुला (23 सितंबर - 22 अक्टूबर): शुक्र शासित। कूटनीतिक, निष्पक्ष, सामाजिक।' },
    Scorpio: { en: 'Scorpio (Oct 23 - Nov 21): The Scorpion. Fixed Water. Ruled by Pluto/Mars. Intense, transformative, perceptive, and passionate. Deep psychological insight.', hi: 'वृश्चिक (23 अक्टूबर - 21 नवंबर): मंगल/प्लूटो शासित। तीव्र, परिवर्तनकारी।' },
    Sagittarius: { en: 'Sagittarius (Nov 22 - Dec 21): The Archer. Mutable Fire. Ruled by Jupiter. Adventurous, philosophical, optimistic, and freedom-loving.', hi: 'धनु (22 नवंबर - 21 दिसंबर): बृहस्पति शासित। साहसी, दार्शनिक, आशावादी।' },
    Capricorn: { en: 'Capricorn (Dec 22 - Jan 19): The Sea-Goat. Cardinal Earth. Ruled by Saturn. Disciplined, ambitious, practical, and responsible. Achieves through persistence.', hi: 'मकर (22 दिसंबर - 19 जनवरी): शनि शासित। अनुशासित, महत्वाकांक्षी।' },
    Aquarius: { en: 'Aquarius (Jan 20 - Feb 18): The Water-Bearer. Fixed Air. Ruled by Uranus/Saturn. Innovative, humanitarian, independent, and original.', hi: 'कुंभ (20 जनवरी - 18 फरवरी): शनि/यूरेनस शासित। नवीन, मानवतावादी।' },
    Pisces: { en: 'Pisces (Feb 19 - Mar 20): The Fish. Mutable Water. Ruled by Neptune/Jupiter. Compassionate, imaginative, spiritual, and empathetic.', hi: 'मीन (19 फरवरी - 20 मार्च): बृहस्पति/नेप्च्यून शासित। दयालु, कल्पनाशील।' },
  };
  return descriptions[sign]?.[lang] ?? sign;
}
