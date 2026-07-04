/**
 * Tarabala Service — Nakshatra Transit Quality
 * Based on classical Vedic principle from BPHS & Raman tradition:
 * Quality of Moon's daily transit measured from birth nakshatra.
 * 9 categories cycle through all 27 nakshatras.
 */

export interface TarabalaResult {
  transitNakshatra: string;
  category: string;
  categoryHi: string;
  index: number;          // 0-8
  isBenefic: boolean;
  strength: 'Excellent' | 'Good' | 'Neutral' | 'Caution' | 'Avoid';
  advice: { en: string; hi: string };
  color: string;
}

const NAKSHATRA_NAMES_EN = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu',
  'Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta',
  'Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha',
  'Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada',
  'Uttara Bhadrapada','Revati'
];

const NAKSHATRA_NAMES_HI = [
  'अश्विनी','भरणी','कृत्तिका','रोहिणी','मृगशिरा','आर्द्रा','पुनर्वसु',
  'पुष्य','आश्लेषा','मघा','पूर्व फाल्गुनी','उत्तर फाल्गुनी','हस्त',
  'चित्रा','स्वाती','विशाखा','अनुराधा','ज्येष्ठा','मूल','पूर्व आषाढ़',
  'उत्तर आषाढ़','श्रवण','धनिष्ठा','शतभिषा','पूर्व भाद्रपद',
  'उत्तर भाद्रपद','रेवती'
];

// 9 Tarabala categories (cycle repeats 3x across 27 nakshatras)
const TARABALA: Array<{
  en: string; hi: string;
  isBenefic: boolean;
  strength: TarabalaResult['strength'];
  advice: { en: string; hi: string };
  color: string;
}> = [
  {
    en: 'Janma', hi: 'जन्म',
    isBenefic: false,
    strength: 'Caution',
    advice: { en: 'Birth star — avoid major decisions, health needs attention', hi: 'जन्म नक्षत्र — बड़े निर्णय टालें, स्वास्थ्य का ध्यान रखें' },
    color: 'orange'
  },
  {
    en: 'Sampat', hi: 'संपत्',
    isBenefic: true,
    strength: 'Excellent',
    advice: { en: 'Wealth star — excellent for financial decisions and new ventures', hi: 'संपत्ति नक्षत्र — वित्तीय निर्णय और नए उद्यम के लिए उत्तम' },
    color: 'green'
  },
  {
    en: 'Vipat', hi: 'विपत्',
    isBenefic: false,
    strength: 'Avoid',
    advice: { en: 'Danger star — avoid travel, risky activities, and important work', hi: 'विपत् नक्षत्र — यात्रा, जोखिम भरे कार्य और महत्वपूर्ण काम टालें' },
    color: 'red'
  },
  {
    en: 'Kshema', hi: 'क्षेम',
    isBenefic: true,
    strength: 'Good',
    advice: { en: 'Comfort star — good for family matters, health, and well-being', hi: 'क्षेम नक्षत्र — परिवार, स्वास्थ्य और सुख के लिए शुभ' },
    color: 'green'
  },
  {
    en: 'Pratyak', hi: 'प्रत्यक्',
    isBenefic: false,
    strength: 'Caution',
    advice: { en: 'Obstacle star — efforts may face resistance, proceed carefully', hi: 'बाधा नक्षत्र — प्रयासों में रुकावट संभव, सावधानी से आगे बढ़ें' },
    color: 'orange'
  },
  {
    en: 'Sadhana', hi: 'साधन',
    isBenefic: true,
    strength: 'Good',
    advice: { en: 'Achievement star — good for hard work, study, and spiritual practice', hi: 'साधन नक्षत्र — परिश्रम, अध्ययन और साधना के लिए शुभ' },
    color: 'blue'
  },
  {
    en: 'Naidhana', hi: 'नैधन',
    isBenefic: false,
    strength: 'Avoid',
    advice: { en: 'Death star — most inauspicious; avoid all important activities', hi: 'नैधन नक्षत्र — सर्वाधिक अशुभ; सभी महत्वपूर्ण कार्य टालें' },
    color: 'red'
  },
  {
    en: 'Mitra', hi: 'मित्र',
    isBenefic: true,
    strength: 'Good',
    advice: { en: 'Friend star — good for partnerships, meetings, and social activities', hi: 'मित्र नक्षत्र — साझेदारी, बैठकें और सामाजिक कार्यों के लिए शुभ' },
    color: 'green'
  },
  {
    en: 'Parama Mitra', hi: 'परम मित्र',
    isBenefic: true,
    strength: 'Excellent',
    advice: { en: 'Best friend star — most auspicious; ideal for all important work', hi: 'परम मित्र नक्षत्र — सर्वाधिक शुभ; सभी महत्वपूर्ण कार्यों के लिए आदर्श' },
    color: 'gold'
  },
];

/**
 * Calculate Tarabala for a given transit nakshatra from birth nakshatra
 * @param birthNakshatraIndex  0-26 (Ashwini=0)
 * @param transitNakshatraIndex 0-26
 */
export function getTarabala(
  birthNakshatraIndex: number,
  transitNakshatraIndex: number
): TarabalaResult {
  const diff = ((transitNakshatraIndex - birthNakshatraIndex) + 27) % 27;
  const categoryIndex = diff % 9;
  const cat = TARABALA[categoryIndex];

  return {
    transitNakshatra: NAKSHATRA_NAMES_EN[transitNakshatraIndex],
    category: cat.en,
    categoryHi: cat.hi,
    index: categoryIndex,
    isBenefic: cat.isBenefic,
    strength: cat.strength,
    advice: cat.advice,
    color: cat.color,
  };
}

/**
 * Get full 27-nakshatra Tarabala table for a birth nakshatra
 * Useful for showing a monthly calendar view
 */
export function getFullTarabalaTable(birthNakshatraIndex: number): TarabalaResult[] {
  return NAKSHATRA_NAMES_EN.map((_, i) => getTarabala(birthNakshatraIndex, i));
}

/**
 * Get today's Tarabala from Moon's current nakshatra
 */
export function getTodayTarabala(
  birthNakshatraIndex: number,
  moonLongitudeDeg: number
): TarabalaResult {
  const transitNakshatra = Math.floor((moonLongitudeDeg % 360) / (360 / 27));
  return getTarabala(birthNakshatraIndex, transitNakshatra);
}

export { NAKSHATRA_NAMES_EN, NAKSHATRA_NAMES_HI };
