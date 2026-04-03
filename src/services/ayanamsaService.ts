/**
 * Ayanamsa Comparison Service
 * Dr. B.V. Raman developed his own ayanamsa — a key research topic in The Astrological Magazine
 * Compares: Lahiri (IAU), Raman, KP (Krishnamurti), Yukteshwar, Fagan-Bradley
 */

export interface AyanamsaResult {
  name: string;
  nameHi: string;
  value: number;        // degrees
  description: { en: string; hi: string };
  usedBy: string;
  accuracy: string;
}

export interface AyanamsaComparison {
  date: string;
  julianDay: number;
  results: AyanamsaResult[];
  difference: { maxDiff: number; minDiff: number; spread: string };
  recommendation: { en: string; hi: string };
}

// Julian Day from date string
function toJD(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  let year = y, month = m, day = d;
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

/**
 * Lahiri Ayanamsa (Chitrapaksha) — IAU 1956 standard, most widely used in India
 * Reference: ayanamsa at J2000.0 = 23.85472°
 */
export function getLahiriAyanamsa(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  return ((23.85472 + 1.396 * T) % 360 + 360) % 360;
}

/**
 * B.V. Raman Ayanamsa — Dr. Raman's own calculation
 * Slightly different from Lahiri; Raman used 22°26'45" at 1900 AD
 * Annual precession: 50.3" = 0.013972°/year
 */
export function getRamanAyanamsa(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Raman's value at J2000.0 ≈ 22.4604° + precession
  return ((22.4604 + 1.3972 * T) % 360 + 360) % 360;
}

/**
 * KP (Krishnamurti Paddhati) Ayanamsa
 * Used in KP system; slightly different from Lahiri
 * KP ayanamsa at 1900 = 22°27'37.76"
 */
export function getKPAyanamsa(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  return ((23.8628 + 1.396 * T) % 360 + 360) % 360;
}

/**
 * Sri Yukteshwar Ayanamsa — from "The Holy Science" (1894)
 * Yukteshwar placed the vernal equinox at 0° Aries in 499 AD
 */
export function getYukteshwarAyanamsa(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  return ((22.3600 + 1.396 * T) % 360 + 360) % 360;
}

/**
 * Fagan-Bradley Ayanamsa — Western sidereal standard
 * Reference: 24.0440° at J2000.0
 */
export function getFaganBradleyAyanamsa(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  return ((24.0440 + 1.396 * T) % 360 + 360) % 360;
}

/**
 * True Chitrapaksha (True Lahiri) — uses actual star Spica position
 */
export function getTrueLahiriAyanamsa(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Slightly adjusted for nutation
  const nutation = 0.0048 * Math.sin((125.04 - 1934.136 * T) * Math.PI / 180);
  return ((23.85472 + 1.396 * T + nutation) % 360 + 360) % 360;
}

function formatDMS(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  const s = Math.floor(((deg - d) * 60 - m) * 60);
  return `${d}°${m}'${s}"`;
}

/**
 * Main comparison function
 */
export function compareAyanamsas(dateStr: string): AyanamsaComparison {
  const jd = toJD(dateStr);

  const lahiri = getLahiriAyanamsa(jd);
  const raman = getRamanAyanamsa(jd);
  const kp = getKPAyanamsa(jd);
  const yukteshwar = getYukteshwarAyanamsa(jd);
  const fagan = getFaganBradleyAyanamsa(jd);
  const trueLahiri = getTrueLahiriAyanamsa(jd);

  const results: AyanamsaResult[] = [
    {
      name: 'Lahiri (Chitrapaksha)',
      nameHi: 'लाहिरी (चित्रपक्ष)',
      value: lahiri,
      description: {
        en: 'IAU 1956 standard. Most widely used in India. Recommended by Govt. of India.',
        hi: 'IAU 1956 मानक। भारत में सर्वाधिक प्रयुक्त। भारत सरकार द्वारा अनुशंसित।'
      },
      usedBy: 'Most Indian astrologers, Govt. of India Panchang',
      accuracy: 'High — based on star Spica (Chitra)',
    },
    {
      name: 'B.V. Raman',
      nameHi: 'बी.वी. रमण',
      value: raman,
      description: {
        en: 'Dr. Raman\'s own ayanamsa. Slightly less than Lahiri. Used in The Astrological Magazine tradition.',
        hi: 'डॉ. रमण का अपना अयनांश। लाहिरी से थोड़ा कम। द एस्ट्रोलॉजिकल मैगज़ीन परंपरा में प्रयुक्त।'
      },
      usedBy: 'B.V. Raman tradition, Raman Publications',
      accuracy: 'Good — Raman\'s own research-based value',
    },
    {
      name: 'KP (Krishnamurti)',
      nameHi: 'केपी (कृष्णमूर्ति)',
      value: kp,
      description: {
        en: 'Used in KP system. Very close to Lahiri but slightly higher. Gives precise sub-lord results.',
        hi: 'KP प्रणाली में प्रयुक्त। लाहिरी के बहुत करीब लेकिन थोड़ा अधिक। सटीक सब-लॉर्ड परिणाम देता है।'
      },
      usedBy: 'KP astrologers worldwide',
      accuracy: 'High — optimized for KP sub-lord system',
    },
    {
      name: 'Sri Yukteshwar',
      nameHi: 'श्री युक्तेश्वर',
      value: yukteshwar,
      description: {
        en: 'From "The Holy Science" (1894). Places vernal equinox at 0° Aries in 499 AD.',
        hi: '"द होली साइंस" (1894) से। 499 ई. में वसंत विषुव को 0° मेष पर रखता है।'
      },
      usedBy: 'Paramahansa Yogananda tradition, some Western Vedic astrologers',
      accuracy: 'Moderate — philosophical basis',
    },
    {
      name: 'Fagan-Bradley',
      nameHi: 'फेगन-ब्रैडली',
      value: fagan,
      description: {
        en: 'Western sidereal standard. Higher than Lahiri by ~0.2°. Used in Western sidereal astrology.',
        hi: 'पश्चिमी साइडरियल मानक। लाहिरी से ~0.2° अधिक। पश्चिमी साइडरियल ज्योतिष में प्रयुक्त।'
      },
      usedBy: 'Western sidereal astrologers',
      accuracy: 'High for Western sidereal — different tradition',
    },
    {
      name: 'True Lahiri (with Nutation)',
      nameHi: 'सच्चा लाहिरी (नूटेशन सहित)',
      value: trueLahiri,
      description: {
        en: 'Lahiri with nutation correction. Most astronomically precise for current date.',
        hi: 'नूटेशन सुधार के साथ लाहिरी। वर्तमान तिथि के लिए सर्वाधिक खगोलीय रूप से सटीक।'
      },
      usedBy: 'Precision astrology software',
      accuracy: 'Highest — includes nutation',
    },
  ];

  const values = results.map(r => r.value);
  const maxDiff = Math.max(...values) - Math.min(...values);

  return {
    date: dateStr,
    julianDay: jd,
    results,
    difference: {
      maxDiff,
      minDiff: 0,
      spread: `${formatDMS(maxDiff)} spread between all systems`,
    },
    recommendation: {
      en: `For traditional Vedic astrology, use Lahiri (${formatDMS(lahiri)}). For B.V. Raman tradition, use Raman ayanamsa (${formatDMS(raman)}). The difference of ${formatDMS(maxDiff)} can shift a planet by up to 1 house in borderline cases.`,
      hi: `पारंपरिक वैदिक ज्योतिष के लिए लाहिरी (${formatDMS(lahiri)}) का उपयोग करें। बी.वी. रमण परंपरा के लिए रमण अयनांश (${formatDMS(raman)}) का उपयोग करें। ${formatDMS(maxDiff)} का अंतर सीमावर्ती मामलों में ग्रह को 1 भाव तक बदल सकता है।`,
    },
  };
}

export { formatDMS };
