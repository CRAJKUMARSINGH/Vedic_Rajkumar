/**
 * src/utils/seoMetadata.ts
 * Centralized SEO metadata for all pages — Week 29
 * Used by the SEO component for consistent meta tags, OG, Twitter cards, structured data.
 */

export interface PageSEO {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogImage?: string;
  schema?: Record<string, unknown>;
}

const BASE_URL = 'https://gochar-phal.vercel.app';
const DEFAULT_OG = `${BASE_URL}/og-image.png`;

export const SEO_PAGES: Record<string, PageSEO> = {
  home: {
    title: 'Vedic Rajkumar – Free Vedic Astrology & Gochar Phal',
    description: 'Get accurate Vedic astrology readings: transit predictions, birth chart, Kundli Milan, Dasha, Yogas, Ashtakavarga and 100+ features. Free, bilingual (Hindi/English), PWA.',
    keywords: 'vedic astrology, gochar phal, kundli, birth chart, transit predictions, jyotish, free astrology',
    canonical: '/',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Vedic Rajkumar',
      url: BASE_URL,
      description: 'Comprehensive Vedic astrology platform with 100+ features',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  },

  matchmaking: {
    title: 'Kundli Milan – Free 36-Point Marriage Compatibility | Vedic Rajkumar',
    description: 'Check marriage compatibility with accurate Kundli Milan. Full 36-point Ashtakuta analysis, Nadi dosha, Bhakoot dosha, Gana matching and remedies.',
    keywords: 'kundli milan, gun milan, marriage compatibility, ashtakuta, 36 guna, nadi dosha, bhakoot dosha, vedic astrology',
    canonical: '/matchmaking',
  },

  dasha: {
    title: 'Vimshottari Dasha Calculator – Mahadasha & Antardasha | Vedic Rajkumar',
    description: 'Calculate your Vimshottari Dasha periods with sub-periods (Antardasha, Pratyantar). Get detailed predictions for each planetary period.',
    keywords: 'vimshottari dasha, dasha calculator, antardasha, mahadasha, planetary periods, vedic astrology dasha',
    canonical: '/dasha',
  },

  yogas: {
    title: 'Yoga Analysis – Raj Yoga, Dhana Yoga, Panch Mahapurusha | Vedic Rajkumar',
    description: 'Detect all major Vedic astrology yogas in your birth chart. Raj Yoga, Dhana Yoga, Gajakesari, Panch Mahapurusha, Neecha Bhanga and 50+ more.',
    keywords: 'yoga analysis, raj yoga, dhana yoga, gajakesari yoga, panch mahapurusha, vedic astrology yogas',
    canonical: '/yogas',
  },

  divisionalCharts: {
    title: 'Divisional Charts – D9 Navamsha, D10 Dashamsha, Shodashvarga | Vedic Rajkumar',
    description: 'Complete Shodashvarga analysis with all 16 divisional charts (D1 to D60). Navamsha, Dashamsha, Drekkana, Chaturthamsha and Vimshopaka Bala.',
    keywords: 'divisional charts, shodashvarga, navamsha, dashamsha, D9, D10, varga charts, vedic astrology',
    canonical: '/divisional-charts',
  },

  ashtakavarga: {
    title: 'Ashtakavarga – Transit Strength & Sarvashtakavarga | Vedic Rajkumar',
    description: 'Calculate Ashtakavarga scores for all planets. Understand transit strength, favorable periods, and life predictions through Sarvashtakavarga.',
    keywords: 'ashtakavarga, sarvashtakavarga, transit strength, bindus, vedic astrology ashtakavarga',
    canonical: '/ashtakavarga',
  },

  kaalsarp: {
    title: 'Kaal Sarp Yoga – All 12 Types with Remedies | Vedic Rajkumar',
    description: 'Check if you have Kaal Sarp Yoga in your birth chart. Detailed analysis of all 12 types (Anant to Sheshnag) with remedies and predictions.',
    keywords: 'kaal sarp yoga, kaal sarp dosha, kundli analysis, rahu ketu, vedic astrology',
    canonical: '/kaalsarp',
  },

  sadeSati: {
    title: 'Sade Sati Calculator – Saturn 7.5 Year Period | Vedic Rajkumar',
    description: 'Check your Sade Sati status and phases. Understand Saturn\'s 7.5-year transit over your Moon sign with predictions and remedies.',
    keywords: 'sade sati, saturn transit, shani sade sati, 7.5 years, moon sign, vedic astrology',
    canonical: '/sade-sati',
  },

  careerAstrology: {
    title: 'Career Astrology – 10th House Analysis & Career Guidance | Vedic Rajkumar',
    description: 'Get personalized career guidance through Vedic astrology. 10th house analysis, planetary career indicators, best career fields and timing.',
    keywords: 'career astrology, 10th house, career guidance, vedic astrology career, profession astrology',
    canonical: '/career-astrology',
  },

  loveAstrology: {
    title: 'Love Astrology – Relationship & Romance Predictions | Vedic Rajkumar',
    description: 'Discover your love life through Vedic astrology. 5th and 7th house analysis, Venus placement, relationship timing and compatibility.',
    keywords: 'love astrology, relationship astrology, romance predictions, venus astrology, 7th house',
    canonical: '/love-astrology',
  },

  muhurat: {
    title: 'Muhurat Calculator – Auspicious Timing for All Events | Vedic Rajkumar',
    description: 'Find the most auspicious muhurat for marriage, business, travel, house warming and more. Complete Panchang with Rahu Kaal and Abhijit Muhurat.',
    keywords: 'muhurat calculator, auspicious timing, panchang, rahu kaal, abhijit muhurat, vedic calendar',
    canonical: '/muhurat',
  },

  gemstones: {
    title: 'Gemstone Recommendations – Personalized Ratna Suggestions | Vedic Rajkumar',
    description: 'Get personalized gemstone recommendations based on your birth chart. Ruby, Pearl, Emerald, Diamond, Yellow Sapphire and more with wearing instructions.',
    keywords: 'gemstone recommendations, ratna, ruby, pearl, emerald, diamond, yellow sapphire, vedic astrology gems',
    canonical: '/gemstones',
  },

  numerology: {
    title: 'Numerology Calculator – Life Path, Destiny & Lucky Numbers | Vedic Rajkumar',
    description: 'Calculate your numerology profile: Life Path Number, Destiny Number, Soul Urge, lucky numbers and colors based on Chaldean numerology.',
    keywords: 'numerology calculator, life path number, destiny number, lucky numbers, chaldean numerology',
    canonical: '/numerology',
  },

  panchang: {
    title: 'Daily Panchang – Tithi, Nakshatra, Yoga, Karana | Vedic Rajkumar',
    description: 'Get today\'s complete Panchang with Tithi, Nakshatra, Yoga, Karana, Var and auspicious/inauspicious timings. Updated daily.',
    keywords: 'panchang, tithi, nakshatra, yoga, karana, hindu calendar, vedic panchang',
    canonical: '/panchang',
  },

  babyNames: {
    title: 'Baby Name Suggestions – Nakshatra-Based Hindu Names | Vedic Rajkumar',
    description: 'Find the perfect baby name based on birth nakshatra and lucky letters. 1000+ Hindu names with meanings, numerology scores and pronunciation.',
    keywords: 'baby names, nakshatra names, hindu baby names, lucky letters, vedic naming',
    canonical: '/baby-names',
  },

  vaastu: {
    title: 'Vaastu Assessment – Home & Office Vaastu Analysis | Vedic Rajkumar',
    description: 'Get a complete Vaastu Shastra assessment for your home or office. Identify doshas, get remedies and improve energy flow.',
    keywords: 'vaastu assessment, vaastu shastra, vaastu dosha, home vaastu, office vaastu',
    canonical: '/vaastu',
  },
};

/**
 * Get SEO metadata for a page by key, with safe fallback.
 */
export function getPageSEO(key: keyof typeof SEO_PAGES): PageSEO {
  return SEO_PAGES[key] ?? {
    title: 'Vedic Rajkumar – Vedic Astrology Platform',
    description: 'Comprehensive Vedic astrology platform with 100+ features.',
    keywords: 'vedic astrology, jyotish, kundli, birth chart',
    canonical: '/',
  };
}

/**
 * Build full page title with site name suffix.
 */
export function buildTitle(pageTitle: string): string {
  if (pageTitle.includes('Vedic Rajkumar')) return pageTitle;
  return `${pageTitle} | Vedic Rajkumar`;
}

/**
 * Generate JSON-LD structured data string for a page.
 */
export function buildStructuredData(schema: Record<string, unknown>): string {
  return JSON.stringify(schema);
}
