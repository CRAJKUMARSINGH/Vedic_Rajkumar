/**
 * Single source of truth for feature routes, labels, and navigation order.
 * User journey: chart foundation → timing → daily/muhurat → marriage → life domains
 * → classical systems → world systems → remedies → AI/prashna → platform.
 */

export type FeatureCategoryId =
  | 'foundation'
  | 'timing'
  | 'daily-muhurat'
  | 'marriage'
  | 'life-domains'
  | 'advanced-classical'
  | 'world-systems'
  | 'remedies'
  | 'ai-prashna'
  | 'platform';

export type NavLink = {
  href: string;
  label: string;
  labelHi: string;
  badge?: string;
  group?: string;
  isSectionHeader?: boolean;
  isCoreFeature?: boolean;
};

export type FeatureEntry = {
  path: string;
  label: string;
  labelHi: string;
  description: string;
  descriptionHi: string;
  icon: string;
  category: FeatureCategoryId;
  badge?: string;
  isNew?: boolean;
  isPremium?: boolean;
  showInDesktop?: boolean;
  showInMobileSheet?: boolean;
  showInBottomBar?: boolean;
  isCoreFeature?: boolean;
};

export const FEATURE_CATEGORIES: {
  id: FeatureCategoryId;
  label: string;
  labelHi: string;
  allFeaturesLabel: string;
}[] = [
  { id: 'foundation', label: 'Chart Foundation', labelHi: 'कुंडली आधार', allFeaturesLabel: 'Core' },
  { id: 'timing', label: 'Timing & Cycles', labelHi: 'समय और चक्र', allFeaturesLabel: 'Core' },
  {
    id: 'daily-muhurat',
    label: 'Daily & Muhurat',
    labelHi: 'दैनिक और मुहूर्त',
    allFeaturesLabel: 'Tools',
  },
  {
    id: 'marriage',
    label: 'Marriage & Match',
    labelHi: 'विवाह और मिलान',
    allFeaturesLabel: 'Compatibility',
  },
  {
    id: 'life-domains',
    label: 'Life Domains',
    labelHi: 'जीवन क्षेत्र',
    allFeaturesLabel: 'Life Areas',
  },
  {
    id: 'advanced-classical',
    label: 'Classical Systems',
    labelHi: 'पारंपरिक पद्धतियाँ',
    allFeaturesLabel: 'Advanced',
  },
  {
    id: 'world-systems',
    label: 'World Systems',
    labelHi: 'विश्व पद्धतियाँ',
    allFeaturesLabel: 'Global',
  },
  {
    id: 'remedies',
    label: 'Remedies & Vaastu',
    labelHi: 'उपाय और वास्तु',
    allFeaturesLabel: 'Remedies',
  },
  {
    id: 'ai-prashna',
    label: 'AI & Prashna',
    labelHi: 'AI और प्रश्न',
    allFeaturesLabel: 'AI & Tech',
  },
  { id: 'platform', label: 'Platform', labelHi: 'प्लेटफ़ॉर्म', allFeaturesLabel: 'Community' },
];

/** Chronologically ordered catalog — do not sort elsewhere. */
export const FEATURE_CATALOG: FeatureEntry[] = [
  // ── Chart foundation ──
  {
    path: '/',
    label: 'Home',
    labelHi: 'होम',
    description: 'Platform home and overview',
    descriptionHi: 'प्लेटफ़ॉर्म होम और अवलोकन',
    icon: '🪔',
    category: 'foundation',
    showInBottomBar: true,
  },
  {
    path: '/horoscope',
    label: 'Kundli',
    labelHi: 'कुंडली',
    description: 'Complete Vedic birth chart with planets and houses',
    descriptionHi: 'ग्रह और भावों के साथ पूर्ण जन्म कुंडली',
    icon: '🌟',
    category: 'foundation',
    showInBottomBar: true,
    isCoreFeature: true,
  },
  {
    path: '/divisional-charts',
    label: 'D-Charts',
    labelHi: 'विभागीय',
    description: 'D9, D10, D12 and more divisional charts',
    descriptionHi: 'D9, D10, D12 और अन्य विभागीय चार्ट',
    icon: '📊',
    category: 'foundation',
  },
  {
    path: '/planetary-strength',
    label: 'Strength',
    labelHi: 'ग्रह शक्ति',
    description: 'Shadbala and planetary strength analysis',
    descriptionHi: 'षड्बल और ग्रह शक्ति विश्लेषण',
    icon: '💪',
    category: 'foundation',
  },
  {
    path: '/yogas',
    label: 'Yogas',
    labelHi: 'योग',
    description: '100+ Vedic yogas identification',
    descriptionHi: '100+ वैदिक योग पहचान',
    icon: '✨',
    category: 'foundation',
  },
  {
    path: '/ashtakavarga',
    label: 'Ashtakavarga',
    labelHi: 'अष्टकवर्ग',
    description: 'Transit strength with bindu scoring',
    descriptionHi: 'बिंदु स्कोरिंग के साथ गोचर शक्ति',
    icon: '🎯',
    category: 'foundation',
    isNew: true,
  },
  {
    path: '/comprehensive',
    label: 'Comprehensive',
    labelHi: 'व्यापक रिपोर्ट',
    description: 'Complete astrological report with PDF export',
    descriptionHi: 'PDF निर्यात के साथ पूर्ण ज्योतिष रिपोर्ट',
    icon: '📄',
    category: 'foundation',
  },

  // ── Timing & cycles ──
  {
    path: '/dasha',
    label: 'Dasha',
    labelHi: 'दशा',
    description: 'Vimshottari Dasha periods and predictions',
    descriptionHi: 'विम्शोत्तरी दशा अवधि और भविष्यवाणी',
    icon: '🕒',
    category: 'timing',
  },
  {
    path: '/dasha-timeline',
    label: 'Dasha Timeline',
    labelHi: 'दशा टाइमलाइन',
    description: 'Visual dasha period timeline',
    descriptionHi: 'दृश्य दशा अवधि टाइमलाइन',
    icon: '📈',
    category: 'timing',
    badge: 'New',
    isNew: true,
  },
  {
    path: '/dynamic-transit',
    label: 'Transit',
    labelHi: 'गोचर',
    description: 'Daily planetary transit effects on your chart',
    descriptionHi: 'आपकी कुंडली पर दैनिक गोचर प्रभाव',
    icon: '🔄',
    category: 'timing',
  },
  {
    path: '/varshaphal',
    label: 'Varshaphal',
    labelHi: 'वार्षफल',
    description: 'Annual horoscope and solar return analysis',
    descriptionHi: 'वार्षिक राशिफल और सौर वापसी विश्लेषण',
    icon: '☀️',
    category: 'timing',
  },
  {
    path: '/sade-sati',
    label: 'Sade Sati',
    labelHi: 'साढ़े साती',
    description: "Saturn's 7.5 year transit with phase analysis",
    descriptionHi: 'शनि की 7.5 वर्ष की साढ़े साती विश्लेषण',
    icon: '🪐',
    category: 'timing',
    isNew: true,
  },
  {
    path: '/mahadasha-children',
    label: 'Children',
    labelHi: 'संतान',
    description: 'Mahadasha analysis for children',
    descriptionHi: 'संतान के लिए महादशा विश्लेषण',
    icon: '👶',
    category: 'timing',
  },

  // ── Daily & muhurat ──
  {
    path: '/panchang',
    label: 'Panchang',
    labelHi: 'पंचांग',
    description: 'Tithi, Nakshatra, Yoga, Karana for any date',
    descriptionHi: 'किसी भी तिथि के लिए तिथि, नक्षत्र, योग, करण',
    icon: '📅',
    category: 'daily-muhurat',
    isNew: true,
    showInBottomBar: true,
    isCoreFeature: true,
  },
  {
    path: '/muhurat',
    label: 'Muhurat',
    labelHi: 'मुहूर्त',
    description: 'Auspicious timing calendar',
    descriptionHi: 'शुभ मुहूर्त कैलेंडर',
    icon: '🕐',
    category: 'daily-muhurat',
  },
  {
    path: '/enhanced-muhurat',
    label: 'Enhanced Muhurat',
    labelHi: 'विस्तृत मुहूर्त',
    description: 'Advanced muhurat finder with filters',
    descriptionHi: 'फ़िल्टर के साथ उन्नत मुहूर्त खोज',
    icon: '⏰',
    category: 'daily-muhurat',
  },
  {
    path: '/wedding-muhurat',
    label: 'Wedding Muhurat',
    labelHi: 'विवाह मुहूर्त',
    description: 'Auspicious wedding date selection',
    descriptionHi: 'शुभ विवाह तिथि चयन',
    icon: '💒',
    category: 'daily-muhurat',
    badge: 'New',
    isNew: true,
  },
  {
    path: '/priyansh-joining-muhurat',
    label: 'Priyansh Joining Muhurat',
    labelHi: 'प्रियांश योगदान मुहूर्त',
    description: 'Priyansh S.C. Miami USA job joining muhurat + Ganesha motif PDF',
    descriptionHi: 'प्रियांश एस.सी. मियामी यूएसए नौकरी योगदान मुहूर्त + गणेश मोटिफ PDF',
    icon: '🌟',
    category: 'daily-muhurat',
    badge: 'Special Report',
    isNew: true,
  },
  {
    path: '/festival-calendar',
    label: 'Festivals',
    labelHi: 'त्योहार',
    description: 'Hindu festivals and auspicious dates',
    descriptionHi: 'हिंदू त्योहार और शुभ तिथियाँ',
    icon: '🎉',
    category: 'daily-muhurat',
  },
  {
    path: '/nakshatra-precautions',
    label: 'Precautions',
    labelHi: 'सावधानियां',
    description: 'Nakshatra-based daily precautions',
    descriptionHi: 'नक्षत्र आधारित दैनिक सावधानियाँ',
    icon: '⚠️',
    category: 'daily-muhurat',
    badge: 'New',
    isNew: true,
  },

  // ── Marriage & matchmaking ──
  {
    path: '/matchmaking',
    label: 'Matchmaking',
    labelHi: 'मिलान',
    description: 'Complete 36-point marriage compatibility',
    descriptionHi: 'पूर्ण 36-बिंदु विवाह मिलान',
    icon: '👫',
    category: 'marriage',
    showInBottomBar: true,
    isCoreFeature: true,
  },
  {
    path: '/enhanced-matchmaking',
    label: 'Enhanced Match',
    labelHi: 'विस्तृत मिलान',
    description: 'Enhanced Kundli Milan analysis',
    descriptionHi: 'विस्तृत कुंडली मिलान विश्लेषण',
    icon: '💑',
    category: 'marriage',
  },
  {
    path: '/kundli-compare',
    label: 'Kundli Compare',
    labelHi: 'कुंडली मिलान',
    description: 'Side-by-side kundli comparison',
    descriptionHi: 'साथ-साथ कुंडली तुलना',
    icon: '⚖️',
    category: 'marriage',
    badge: 'New',
    isNew: true,
  },
  {
    path: '/marriage',
    label: 'Vedic Marriage',
    labelHi: 'वैदिक विवाह',
    description: 'Classical Vedic marriage analysis',
    descriptionHi: 'पारंपरिक वैदिक विवाह विश्लेषण',
    icon: '💍',
    category: 'marriage',
    badge: 'Pro',
    isPremium: true,
  },
  {
    path: '/mtss',
    label: 'MTSS',
    labelHi: 'MTSS',
    description: 'Marriage timing and spouse suitability system',
    descriptionHi: 'विवाह समय और पति/पत्नी उपयुक्तता',
    icon: '❤️',
    category: 'marriage',
  },
  {
    path: '/love-astrology',
    label: 'Love',
    labelHi: 'प्रेम',
    description: 'Relationship and romance predictions',
    descriptionHi: 'संबंध और रोमांस भविष्यवाणी',
    icon: '💖',
    category: 'marriage',
  },

  // ── Life domains ──
  {
    path: '/career-astrology',
    label: 'Career',
    labelHi: 'करियर',
    description: 'Career guidance and professional predictions',
    descriptionHi: 'करियर मार्गदर्शन और व्यावसायिक भविष्यवाणी',
    icon: '💼',
    category: 'life-domains',
  },
  {
    path: '/vidhya-karma',
    label: 'Vidhya-Karma',
    labelHi: 'विद्या-कर्म',
    description: 'Education and karma path analysis',
    descriptionHi: 'शिक्षा और कर्म पथ विश्लेषण',
    icon: '📚',
    category: 'life-domains',
    badge: 'New',
    isNew: true,
  },
  {
    path: '/business-astrology',
    label: 'Business',
    labelHi: 'व्यापार',
    description: 'Business timing and partnership analysis',
    descriptionHi: 'व्यापार समय और साझेदारी विश्लेषण',
    icon: '🏢',
    category: 'life-domains',
  },
  {
    path: '/medical-astrology',
    label: 'Medical',
    labelHi: 'चिकित्सा',
    description: 'Health predictions and Ayurvedic constitution',
    descriptionHi: 'स्वास्थ्य भविष्यवाणी और आयुर्वेदिक संविधान',
    icon: '🌿',
    category: 'life-domains',
    isNew: true,
  },
  {
    path: '/financial-astrology',
    label: 'Financial',
    labelHi: 'वित्तीय',
    description: 'Wealth yogas and investment timing',
    descriptionHi: 'धन योग और निवेश समय',
    icon: '💰',
    category: 'life-domains',
    isNew: true,
  },
  {
    path: '/baby-names',
    label: 'Baby Names',
    labelHi: 'बच्चों के नाम',
    description: 'Nakshatra-based baby name suggestions',
    descriptionHi: 'नक्षत्र आधारित बच्चे के नाम सुझाव',
    icon: '👶',
    category: 'life-domains',
  },

  // ── Classical systems ──
  {
    path: '/jaimini',
    label: 'Jaimini',
    labelHi: 'जैमिनी',
    description: 'Jaimini astrology with Chara Dasha',
    descriptionHi: 'चर दशा के साथ जैमिनी ज्योतिष',
    icon: '📜',
    category: 'advanced-classical',
  },
  {
    path: '/tajik',
    label: 'Tajik',
    labelHi: 'ताजक',
    description: 'Tajik annual horoscope system',
    descriptionHi: 'ताजक वार्षिक राशिफल पद्धति',
    icon: '📅',
    category: 'advanced-classical',
  },
  {
    path: '/lal-kitab',
    label: 'Lal Kitab',
    labelHi: 'लाल किताब',
    description: 'Lal Kitab predictions and totke remedies',
    descriptionHi: 'लाल किताब भविष्यवाणी और टोटके',
    icon: '📖',
    category: 'advanced-classical',
  },
  {
    path: '/kp-system',
    label: 'KP System',
    labelHi: 'केपी पद्धति',
    description: 'Krishnamurti Paddhati for precise timing',
    descriptionHi: 'सटीक समय के लिए कृष्णमूर्ति पद्धति',
    icon: '🔭',
    category: 'advanced-classical',
  },
  {
    path: '/nadi-astrology',
    label: 'Nadi',
    labelHi: 'नाड़ी',
    description: 'Ancient Nadi astrology predictions',
    descriptionHi: 'प्राचीन नाड़ी ज्योतिष भविष्यवाणी',
    icon: '🌿',
    category: 'advanced-classical',
  },
  {
    path: '/kaalsarp',
    label: 'Kaal Sarp',
    labelHi: 'काल सर्प',
    description: 'Kaal Sarp Yoga detection and remedies',
    descriptionHi: 'काल सर्प योग पहचान और उपाय',
    icon: '🐍',
    category: 'advanced-classical',
  },
  {
    path: '/horary',
    label: 'Horary',
    labelHi: 'प्रश्न कुंडली',
    description: 'Horary chart for immediate questions',
    descriptionHi: 'तात्कालिक प्रश्नों के लिए होरेरी चार्ट',
    icon: '🔮',
    category: 'advanced-classical',
    isNew: true,
  },
  {
    path: '/bv-raman',
    label: 'BV Raman',
    labelHi: 'बी.वी. रमण',
    description: 'BV Raman classical methodology',
    descriptionHi: 'बी.वी. रमण पारंपरिक पद्धति',
    icon: '📚',
    category: 'advanced-classical',
    badge: 'New',
    isNew: true,
  },
  {
    path: '/raman-archive',
    label: 'Raman Archive',
    labelHi: 'रमण संग्रह',
    description: 'BV Raman writings archive',
    descriptionHi: 'बी.वी. रमण लेख संग्रह',
    icon: '🗂️',
    category: 'advanced-classical',
  },
  {
    path: '/kanchi',
    label: 'Kanchi',
    labelHi: 'कांची',
    description: 'Kanchi Kamakoti tradition insights',
    descriptionHi: 'कांची कामकोटि परंपरा अंतर्दृष्टि',
    icon: '🛕',
    category: 'advanced-classical',
  },

  // ── World systems ──
  {
    path: '/western-astrology',
    label: 'Western',
    labelHi: 'पाश्चात्य',
    description: 'Tropical zodiac, aspects, and Western chart',
    descriptionHi: 'ट्रॉपिकल राशि, दृष्टि और पश्चिमी चार्ट',
    icon: '⭐',
    category: 'world-systems',
  },
  {
    path: '/chinese-astrology',
    label: 'Chinese',
    labelHi: 'चीनी',
    description: 'Animal signs, Five Elements, BaZi',
    descriptionHi: 'पशु चिह्न, पंच तत्व, बा ज़ी',
    icon: '🐉',
    category: 'world-systems',
    isNew: true,
  },
  {
    path: '/comparative-astrology',
    label: 'Comparative',
    labelHi: 'तुलनात्मक',
    description: 'Vedic vs Western side-by-side comparison',
    descriptionHi: 'वैदिक बनाम पश्चिमी तुलना',
    icon: '⚖️',
    category: 'world-systems',
    isNew: true,
  },
  {
    path: '/world-astrology',
    label: 'World',
    labelHi: 'विश्व',
    description: 'Mayan, Egyptian & Celtic astrology systems',
    descriptionHi: 'माया, मिस्र और सेल्टिक ज्योतिष',
    icon: '🌍',
    category: 'world-systems',
    isNew: true,
  },
  {
    path: '/electional-astrology',
    label: 'Electional',
    labelHi: 'निर्वाचन',
    description: 'Best dates for marriage, business, travel',
    descriptionHi: 'विवाह, व्यापार, यात्रा के शुभ तिथियाँ',
    icon: '🗳️',
    category: 'world-systems',
    isNew: true,
  },
  {
    path: '/mundane-astrology',
    label: 'Mundane',
    labelHi: 'मुंडेन',
    description: 'World events and national charts',
    descriptionHi: 'विश्व घटनाएँ और राष्ट्रीय चार्ट',
    icon: '🌐',
    category: 'world-systems',
    isNew: true,
  },

  // ── Remedies & vaastu ──
  {
    path: '/remedies',
    label: 'Remedies',
    labelHi: 'उपाय',
    description: 'Gemstones, mantras, yantras, and more',
    descriptionHi: 'रत्न, मंत्र, यंत्र और अधिक',
    icon: '🙏',
    category: 'remedies',
  },
  {
    path: '/spiritual-remedies',
    label: 'Spiritual',
    labelHi: 'आध्यात्मिक',
    description: 'Mantra, yantra, and spiritual corrective actions',
    descriptionHi: 'मंत्र, यंत्र और आध्यात्मिक उपाय',
    icon: '🕉️',
    category: 'remedies',
  },
  {
    path: '/gemstones',
    label: 'Gemstones',
    labelHi: 'रत्न',
    description: 'Personalized gemstone recommendations',
    descriptionHi: 'व्यक्तिगत रत्न सुझाव',
    icon: '💎',
    category: 'remedies',
    isNew: true,
  },
  {
    path: '/lucky-elements',
    label: 'Lucky Elements',
    labelHi: 'शुभ तत्व',
    description: 'Lucky numbers, colors, days, and gemstones',
    descriptionHi: 'शुभ अंक, रंग, दिन और रत्न',
    icon: '🍀',
    category: 'remedies',
  },
  {
    path: '/vaastu',
    label: 'Vaastu',
    labelHi: 'वास्तु',
    description: 'Vaastu Shastra for home and office',
    descriptionHi: 'घर और कार्यालय के लिए वास्तु शास्त्र',
    icon: '🏠',
    category: 'remedies',
  },

  // ── AI & Prashna ──
  {
    path: '/prashna',
    label: 'Prashna',
    labelHi: 'प्रश्न',
    description: 'Horary astrology and AI-powered Prashna engine',
    descriptionHi: 'घोर ज्योतिष और AI संचालित प्रश्न इंजन',
    icon: '🔮',
    category: 'ai-prashna',
    badge: 'AI',
    isNew: true,
    showInBottomBar: true,
    isCoreFeature: true,
  },
  {
    path: '/prashna-ai',
    label: 'Prashna AI',
    labelHi: 'प्रश्न AI',
    description: 'AI-powered Prashna engine with verdicts',
    descriptionHi: 'AI संचालित प्रश्न इंजन और निर्णय',
    icon: '🤖',
    category: 'ai-prashna',
    badge: 'AI',
    isNew: true,
  },
  {
    path: '/prashna-history',
    label: 'Prashna History',
    labelHi: 'प्रश्न इतिहास',
    description: 'Past Prashna readings and history',
    descriptionHi: 'पिछले प्रश्न रीडिंग और इतिहास',
    icon: '📋',
    category: 'ai-prashna',
  },
  {
    path: '/question',
    label: 'Question',
    labelHi: 'प्रश्न',
    description: 'Classical Prasna Marga chart analysis',
    descriptionHi: 'पारंपरिक प्रश्न मार्ग विश्लेषण',
    icon: '❓',
    category: 'ai-prashna',
    isNew: true,
  },
  {
    path: '/ai-predictions',
    label: 'AI Predictions',
    labelHi: 'AI भविष्यवाणी',
    description: 'AI-powered personalized astrological insights',
    descriptionHi: 'AI संचालित व्यक्तिगत ज्योतिष अंतर्दृष्टि',
    icon: '🔮',
    category: 'ai-prashna',
    badge: 'AI',
    isNew: true,
  },
  {
    path: '/numerology',
    label: 'Numerology',
    labelHi: 'अंकज्योतिष',
    description: 'Life Path, Expression, and Soul Urge numbers',
    descriptionHi: 'जीवन पथ, अभिव्यक्ति और आत्मा संख्या',
    icon: '🔢',
    category: 'ai-prashna',
    isNew: true,
  },

  // ── Platform ──
  {
    path: '/knowledge',
    label: 'Knowledge',
    labelHi: 'ज्ञान',
    description: 'Classical texts and knowledge base',
    descriptionHi: 'पारंपरिक ग्रंथ और ज्ञान आधार',
    icon: '📖',
    category: 'platform',
    badge: 'New',
    isNew: true,
  },
  {
    path: '/learn',
    label: 'Learn',
    labelHi: 'सीखें',
    description: 'Structured Vedic astrology courses',
    descriptionHi: 'संरचित वैदिक ज्योतिष पाठ्यक्रम',
    icon: '🎓',
    category: 'platform',
    isNew: true,
  },
  {
    path: '/marketplace',
    label: 'Marketplace',
    labelHi: 'बाज़ार',
    description: 'Book consultations with expert astrologers',
    descriptionHi: 'विशेषज्ञ ज्योतिषियों से परामर्श बुक करें',
    icon: '🛒',
    category: 'platform',
    isNew: true,
  },
  {
    path: '/community',
    label: 'Community',
    labelHi: 'समुदाय',
    description: 'Discuss and ask questions with astrologers',
    descriptionHi: 'ज्योतिषियों के साथ चर्चा और प्रश्न',
    icon: '👥',
    category: 'platform',
    isNew: true,
  },
  {
    path: '/consultation',
    label: 'Consultation',
    labelHi: 'परामर्श',
    description: 'Book personal astrology consultations',
    descriptionHi: 'व्यक्तिगत ज्योतिष परामर्श बुक करें',
    icon: '🗣️',
    category: 'platform',
  },
  {
    path: '/my-readings',
    label: 'My Readings',
    labelHi: 'मेरी रीडिंग',
    description: 'Your saved charts and readings',
    descriptionHi: 'आपकी सहेजी कुंडली और रीडिंग',
    icon: '📚',
    category: 'platform',
  },
  {
    path: '/enterprise',
    label: 'Enterprise',
    labelHi: 'एंटरप्राइज',
    description: 'White-label platform and API access',
    descriptionHi: 'व्हाइट-लेबल प्लेटफ़ॉर्म और API',
    icon: '🏢',
    category: 'platform',
    isNew: true,
  },
  {
    path: '/pricing',
    label: 'Pricing',
    labelHi: 'मूल्य',
    description: 'Plans and subscription pricing',
    descriptionHi: 'योजनाएँ और सदस्यता मूल्य',
    icon: '💳',
    category: 'platform',
  },
  {
    path: '/feedback',
    label: 'Feedback',
    labelHi: 'प्रतिक्रिया',
    description: 'Share feedback and suggestions',
    descriptionHi: 'प्रतिक्रिया और सुझाव साझा करें',
    icon: '💬',
    category: 'platform',
  },
  {
    path: '/features',
    label: 'All Features',
    labelHi: 'सभी सुविधाएँ',
    description: 'Browse the complete feature catalog',
    descriptionHi: 'पूर्ण सुविधा कैटलॉग ब्राउज़ करें',
    icon: '🕉️',
    category: 'platform',
  },
];

export function featureToNavLink(feature: FeatureEntry): NavLink {
  return {
    href: feature.path,
    label: feature.label,
    labelHi: feature.labelHi,
    badge: feature.badge,
    isCoreFeature: feature.isCoreFeature,
  };
}

function isShown(feature: FeatureEntry, flag: 'showInDesktop' | 'showInMobileSheet'): boolean {
  const value = feature[flag];
  return value === undefined ? true : value;
}

const CORE_PATHS = ['/horoscope', '/prashna', '/matchmaking', '/panchang'];

function isCore(feature: FeatureEntry): boolean {
  return feature.isCoreFeature === true;
}

const allDesktopFeatures = FEATURE_CATALOG.filter(f => isShown(f, 'showInDesktop'));
const coreDesktopFeatures = allDesktopFeatures.filter(f => isCore(f) || f.path === '/');
const otherDesktopFeatures = allDesktopFeatures.filter(f => !isCore(f) && f.path !== '/');

export const DESKTOP_NAV_LINKS: NavLink[] = [
  ...coreDesktopFeatures.map(featureToNavLink),
  {
    href: '',
    label: 'More',
    labelHi: 'अधिक',
    group: 'more',
    isSectionHeader: true,
  },
  ...otherDesktopFeatures.map(f => ({ ...featureToNavLink(f), group: 'more' })),
];

const allMobileFeatures = FEATURE_CATALOG.filter(f => isShown(f, 'showInMobileSheet'));
const coreMobileFeatures = allMobileFeatures.filter(f => isCore(f) || f.path === '/');
const otherMobileFeatures = allMobileFeatures.filter(f => !isCore(f) && f.path !== '/');

export const MOBILE_SHEET_NAV_LINKS: NavLink[] = [
  {
    href: '',
    label: 'Core Tools',
    labelHi: 'मुख्य टूल्स',
    group: 'core',
    isSectionHeader: true,
  },
  ...coreMobileFeatures.map(f => ({ ...featureToNavLink(f), group: 'core' })),
  {
    href: '',
    label: 'Advanced / Coming Soon',
    labelHi: 'उन्नत / जल्द आ रहा है',
    group: 'advanced',
    isSectionHeader: true,
  },
  ...otherMobileFeatures.map(f => ({ ...featureToNavLink(f), group: 'advanced' })),
];

const BOTTOM_BAR_ORDER = ['/', '/horoscope', '/prashna', '/matchmaking', '/panchang'];
export const BOTTOM_BAR_NAV_LINKS: NavLink[] = BOTTOM_BAR_ORDER.map(path => {
  const feature = FEATURE_CATALOG.find(f => f.path === path);
  return feature ? featureToNavLink(feature) : null;
}).filter((x): x is NavLink => x !== null);

/** Category labels for All Features page filter tabs */
export const ALL_FEATURES_CATEGORY_TABS = [
  'All',
  'Core',
  'Compatibility',
  'Advanced',
  'Global',
  'Life Areas',
  'AI & Tech',
  'Remedies',
  'Tools',
  'Community',
] as const;

export function getFeatureCategoryTab(category: FeatureCategoryId): string {
  const meta = FEATURE_CATEGORIES.find(c => c.id === category);
  return meta?.allFeaturesLabel ?? 'Core';
}

export function getFeatureByPath(path: string): FeatureEntry | undefined {
  return FEATURE_CATALOG.find(f => f.path === path);
}
