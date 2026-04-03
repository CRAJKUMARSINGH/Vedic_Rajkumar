/**
 * Multi-Language Service - 9 Language Support System
 * Week 11: AstroSage Feature Integration - Part 1
 * 
 * Expands from 2 languages (Hindi/English) to 9 languages total
 * Supports Bengali, Marathi, Gujarati, Tamil, Telugu, Malayalam, Kannada
 */

export type SupportedLanguage = 
  | 'en'    // English
  | 'hi'    // Hindi
  | 'bn'    // Bengali
  | 'mr'    // Marathi
  | 'gu'    // Gujarati
  | 'ta'    // Tamil
  | 'te'    // Telugu
  | 'ml'    // Malayalam
  | 'kn';   // Kannada

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  fontFamily: string;
  region: string;
}

// Language configurations
export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    fontFamily: 'Inter, sans-serif',
    region: 'Global'
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr',
    fontFamily: 'Noto Sans Devanagari, sans-serif',
    region: 'North India'
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    direction: 'ltr',
    fontFamily: 'Noto Sans Bengali, sans-serif',
    region: 'Bengal'
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    direction: 'ltr',
    fontFamily: 'Noto Sans Devanagari, sans-serif',
    region: 'Maharashtra'
  },
  gu: {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    direction: 'ltr',
    fontFamily: 'Noto Sans Gujarati, sans-serif',
    region: 'Gujarat'
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    direction: 'ltr',
    fontFamily: 'Noto Sans Tamil, sans-serif',
    region: 'Tamil Nadu'
  },
  te: {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    direction: 'ltr',
    fontFamily: 'Noto Sans Telugu, sans-serif',
    region: 'Andhra Pradesh'
  },
  ml: {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    direction: 'ltr',
    fontFamily: 'Noto Sans Malayalam, sans-serif',
    region: 'Kerala'
  },
  kn: {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    direction: 'ltr',
    fontFamily: 'Noto Sans Kannada, sans-serif',
    region: 'Karnataka'
  }
};

// Multi-language text interface
export interface MultiLangText {
  en: string;
  hi: string;
  bn?: string;
  mr?: string;
  gu?: string;
  ta?: string;
  te?: string;
  ml?: string;
  kn?: string;
}
// Common UI translations
export const UI_TRANSLATIONS: Record<string, MultiLangText> = {
  // Navigation
  'home': {
    en: 'Home',
    hi: 'होम',
    bn: 'হোম',
    mr: 'होम',
    gu: 'હોમ',
    ta: 'முகப்பு',
    te: 'హోమ్',
    ml: 'ഹോം',
    kn: 'ಮುಖಪುಟ'
  },
  'birth_chart': {
    en: 'Birth Chart',
    hi: 'जन्म कुंडली',
    bn: 'জন্ম কুণ্ডলী',
    mr: 'जन्म कुंडली',
    gu: 'જન્મ કુંડળી',
    ta: 'ஜாதகம்',
    te: 'జన్మ కుండలి',
    ml: 'ജന്മ കുണ്ഡലി',
    kn: 'ಜನ್ಮ ಕುಂಡಲಿ'
  },
  'horoscope': {
    en: 'Horoscope',
    hi: 'राशिफल',
    bn: 'রাশিফল',
    mr: 'राशिफल',
    gu: 'રાશિફળ',
    ta: 'ராசிபலன்',
    te: 'రాశిఫలం',
    ml: 'രാശിഫലം',
    kn: 'ರಾಶಿಫಲ'
  },
  'match_making': {
    en: 'Match Making',
    hi: 'कुंडली मिलान',
    bn: 'কুণ্ডলী মিলান',
    mr: 'कुंडली जुळवणी',
    gu: 'કુંડળી મિલાન',
    ta: 'ஜாதக பொருத்தம்',
    te: 'కుండలి మిలన',
    ml: 'കുണ്ഡലി മിലനം',
    kn: 'ಕುಂಡಲಿ ಮಿಲನ'
  },
  'career_astrology': {
    en: 'Career Astrology',
    hi: 'करियर ज्योतिष',
    bn: 'ক্যারিয়ার জ্যোতিষ',
    mr: 'करिअर ज्योतिष',
    gu: 'કેરિયર જ્યોતિષ',
    ta: 'தொழில் ஜோதிடம்',
    te: 'కెరీర్ జ్యోతిషం',
    ml: 'കരിയർ ജ്യോതിഷം',
    kn: 'ವೃತ್ತಿ ಜ್ಯೋತಿಷ'
  },

  // Planets
  'sun': {
    en: 'Sun',
    hi: 'सूर्य',
    bn: 'সূর্য',
    mr: 'सूर्य',
    gu: 'સૂર્ય',
    ta: 'சூரியன்',
    te: 'సూర్యుడు',
    ml: 'സൂര്യൻ',
    kn: 'ಸೂರ್ಯ'
  },
  'moon': {
    en: 'Moon',
    hi: 'चंद्र',
    bn: 'চাঁদ',
    mr: 'चंद्र',
    gu: 'ચંદ્ર',
    ta: 'சந்திரன்',
    te: 'చంద్రుడు',
    ml: 'ചന്ദ്രൻ',
    kn: 'ಚಂದ್ರ'
  },
  'mars': {
    en: 'Mars',
    hi: 'मंगल',
    bn: 'মঙ্গল',
    mr: 'मंगळ',
    gu: 'મંગળ',
    ta: 'செவ்வாய்',
    te: 'అంగారకుడు',
    ml: 'ചൊവ്വ',
    kn: 'ಮಂಗಳ'
  },
  'mercury': {
    en: 'Mercury',
    hi: 'बुध',
    bn: 'বুধ',
    mr: 'बुध',
    gu: 'બુધ',
    ta: 'புதன்',
    te: 'బుధుడు',
    ml: 'ബുധൻ',
    kn: 'ಬುಧ'
  },
  'jupiter': {
    en: 'Jupiter',
    hi: 'गुरु',
    bn: 'গুরু',
    mr: 'गुरु',
    gu: 'ગુરુ',
    ta: 'குரு',
    te: 'గురువు',
    ml: 'ഗുരു',
    kn: 'ಗುರು'
  },
  'venus': {
    en: 'Venus',
    hi: 'शुक्र',
    bn: 'শুক্র',
    mr: 'शुक्र',
    gu: 'શુક્ર',
    ta: 'சுக்கிரன்',
    te: 'శుక్రుడు',
    ml: 'ശുക്രൻ',
    kn: 'ಶುಕ್ರ'
  },
  'saturn': {
    en: 'Saturn',
    hi: 'शनि',
    bn: 'শনি',
    mr: 'शनि',
    gu: 'શનિ',
    ta: 'சனி',
    te: 'శనిగ్రహం',
    ml: 'ശനി',
    kn: 'ಶನಿ'
  },
  'rahu': {
    en: 'Rahu',
    hi: 'राहु',
    bn: 'রাহু',
    mr: 'राहू',
    gu: 'રાહુ',
    ta: 'ராகு',
    te: 'రాహు',
    ml: 'രാഹു',
    kn: 'ರಾಹು'
  },
  'ketu': {
    en: 'Ketu',
    hi: 'केतु',
    bn: 'কেতু',
    mr: 'केतू',
    gu: 'કેતુ',
    ta: 'கேது',
    te: 'కేతు',
    ml: 'കേതു',
    kn: 'ಕೇತು'
  },

  // Rashis/Zodiac Signs
  'aries': {
    en: 'Aries',
    hi: 'मेष',
    bn: 'মেষ',
    mr: 'मेष',
    gu: 'મેષ',
    ta: 'மேஷம்',
    te: 'మేషం',
    ml: 'മേടം',
    kn: 'ಮೇಷ'
  },
  'taurus': {
    en: 'Taurus',
    hi: 'वृषभ',
    bn: 'বৃষ',
    mr: 'वृषभ',
    gu: 'વૃષભ',
    ta: 'ரிஷபம்',
    te: 'వృషభం',
    ml: 'ഇടവം',
    kn: 'ವೃಷಭ'
  },
  'gemini': {
    en: 'Gemini',
    hi: 'मिथुन',
    bn: 'মিথুন',
    mr: 'मिथुन',
    gu: 'મિથુન',
    ta: 'மிதுனம்',
    te: 'మిథునం',
    ml: 'മിഥുനം',
    kn: 'ಮಿಥುನ'
  },
  'cancer': {
    en: 'Cancer',
    hi: 'कर्क',
    bn: 'কর্কট',
    mr: 'कर्क',
    gu: 'કર્ક',
    ta: 'கடகம்',
    te: 'కర్కాటకం',
    ml: 'കർക്കടകം',
    kn: 'ಕರ್ಕಾಟಕ'
  },
  'leo': {
    en: 'Leo',
    hi: 'सिंह',
    bn: 'সিংহ',
    mr: 'सिंह',
    gu: 'સિંહ',
    ta: 'சிம்மம்',
    te: 'సింహం',
    ml: 'ചിങ്ങം',
    kn: 'ಸಿಂಹ'
  },
  'virgo': {
    en: 'Virgo',
    hi: 'कन्या',
    bn: 'কন্যা',
    mr: 'कन्या',
    gu: 'કન્યા',
    ta: 'கன்னி',
    te: 'కన్య',
    ml: 'കന്നി',
    kn: 'ಕನ್ಯಾ'
  },
  'libra': {
    en: 'Libra',
    hi: 'तुला',
    bn: 'তুলা',
    mr: 'तुला',
    gu: 'તુલા',
    ta: 'துலாம்',
    te: 'తుల',
    ml: 'തുലാം',
    kn: 'ತುಲಾ'
  },
  'scorpio': {
    en: 'Scorpio',
    hi: 'वृश्चिक',
    bn: 'বৃশ্চিক',
    mr: 'वृश्चिक',
    gu: 'વૃશ્ચિક',
    ta: 'விருச்சிகம்',
    te: 'వృశ్చికం',
    ml: 'വൃശ്ചികം',
    kn: 'ವೃಶ್ಚಿಕ'
  },
  'sagittarius': {
    en: 'Sagittarius',
    hi: 'धनु',
    bn: 'ধনু',
    mr: 'धनु',
    gu: 'ધનુ',
    ta: 'தனுசு',
    te: 'ధనుస్సు',
    ml: 'ധനു',
    kn: 'ಧನುಸ್ಸು'
  },
  'capricorn': {
    en: 'Capricorn',
    hi: 'मकर',
    bn: 'মকর',
    mr: 'मकर',
    gu: 'મકર',
    ta: 'மகரம்',
    te: 'మకరం',
    ml: 'മകരം',
    kn: 'ಮಕರ'
  },
  'aquarius': {
    en: 'Aquarius',
    hi: 'कुंभ',
    bn: 'কুম্ভ',
    mr: 'कुंभ',
    gu: 'કુંભ',
    ta: 'கும்பம்',
    te: 'కుంభం',
    ml: 'കുംഭം',
    kn: 'ಕುಂಭ'
  },
  'pisces': {
    en: 'Pisces',
    hi: 'मीन',
    bn: 'মীন',
    mr: 'मीन',
    gu: 'મીન',
    ta: 'மீனம்',
    te: 'మీనం',
    ml: 'മീനം',
    kn: 'ಮೀನ'
  },

  // Common terms
  'birth_date': {
    en: 'Birth Date',
    hi: 'जन्म तिथि',
    bn: 'জন্ম তারিখ',
    mr: 'जन्म तारीख',
    gu: 'જન્મ તારીખ',
    ta: 'பிறந்த தேதி',
    te: 'జన్మ తేదీ',
    ml: 'ജന്മ തീയതി',
    kn: 'ಜನ್ಮ ದಿನಾಂಕ'
  },
  'birth_time': {
    en: 'Birth Time',
    hi: 'जन्म समय',
    bn: 'জন্ম সময়',
    mr: 'जन्म वेळ',
    gu: 'જન્મ સમય',
    ta: 'பிறந்த நேரம்',
    te: 'జన్మ సమయం',
    ml: 'ജന്മ സമയം',
    kn: 'ಜನ್ಮ ಸಮಯ'
  },
  'birth_place': {
    en: 'Birth Place',
    hi: 'जन्म स्थान',
    bn: 'জন্ম স্থান',
    mr: 'जन्म स्थान',
    gu: 'જન્મ સ્થાન',
    ta: 'பிறந்த இடம்',
    te: 'జన్మ స్థలం',
    ml: 'ജന്മ സ്ഥലം',
    kn: 'ಜನ್ಮ ಸ್ಥಳ'
  },
  'calculate': {
    en: 'Calculate',
    hi: 'गणना करें',
    bn: 'গণনা করুন',
    mr: 'गणना करा',
    gu: 'ગણતરી કરો',
    ta: 'கணக்கிடு',
    te: 'లెక్కించు',
    ml: 'കണക്കാക്കുക',
    kn: 'ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ'
  },
  'loading': {
    en: 'Loading...',
    hi: 'लोड हो रहा है...',
    bn: 'লোড হচ্ছে...',
    mr: 'लोड होत आहे...',
    gu: 'લોડ થઈ રહ્યું છે...',
    ta: 'ஏற்றுகிறது...',
    te: 'లోడ్ అవుతోంది...',
    ml: 'ലോഡ് ചെയ്യുന്നു...',
    kn: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...'
  }
};

/**
 * Get text in specified language with fallback
 */
export function getText(key: string, lang: SupportedLanguage): string {
  const translation = UI_TRANSLATIONS[key];
  if (!translation) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }

  // Try to get text in requested language
  const text = translation[lang];
  if (text) return text;

  // Fallback to English, then Hindi
  return translation.en || translation.hi || key;
}

/**
 * Get language configuration
 */
export function getLanguageConfig(lang: SupportedLanguage): LanguageConfig {
  return LANGUAGE_CONFIGS[lang] || LANGUAGE_CONFIGS.en;
}

/**
 * Detect user's preferred language based on browser/location
 */
export function detectUserLanguage(): SupportedLanguage {
  // Try browser language first
  const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
  if (Object.keys(LANGUAGE_CONFIGS).includes(browserLang)) {
    return browserLang;
  }

  // Try geolocation-based detection (simplified)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  if (timezone.includes('Kolkata') || timezone.includes('Delhi')) {
    return 'hi'; // Hindi for India
  }
  if (timezone.includes('Dhaka')) {
    return 'bn'; // Bengali for Bangladesh
  }

  // Default to English
  return 'en';
}

/**
 * Get available languages list
 */
export function getAvailableLanguages(): LanguageConfig[] {
  return Object.values(LANGUAGE_CONFIGS);
}

/**
 * Check if language is supported
 */
export function isLanguageSupported(lang: string): lang is SupportedLanguage {
  return Object.keys(LANGUAGE_CONFIGS).includes(lang);
}

/**
 * Get font family for language
 */
export function getFontFamily(lang: SupportedLanguage): string {
  return getLanguageConfig(lang).fontFamily;
}

/**
 * Format number according to language locale
 */
export function formatNumber(num: number, lang: SupportedLanguage): string {
  const locales: Record<SupportedLanguage, string> = {
    en: 'en-US',
    hi: 'hi-IN',
    bn: 'bn-BD',
    mr: 'mr-IN',
    gu: 'gu-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    ml: 'ml-IN',
    kn: 'kn-IN'
  };

  return new Intl.NumberFormat(locales[lang] || 'en-US').format(num);
}

/**
 * Format date according to language locale
 */
export function formatDate(date: Date, lang: SupportedLanguage): string {
  const locales: Record<SupportedLanguage, string> = {
    en: 'en-US',
    hi: 'hi-IN',
    bn: 'bn-BD',
    mr: 'mr-IN',
    gu: 'gu-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    ml: 'ml-IN',
    kn: 'kn-IN'
  };

  return new Intl.DateTimeFormat(locales[lang] || 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}