export interface Jatak {
  id: string;
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  coordinates: { latitude: string; longitude: string };
  relationship: string;
  moonNakshatra: string;
  moonRashi: string;
  moonRashiIndex: number;
  moonSidereal: number;
  notes?: string;
}

export const PRIYVRIT_SINGH: Jatak = {
  id: "priyvrit_1999",
  name: "Priyvrit Singh",
  dateOfBirth: "1999-10-08",
  timeOfBirth: "07:43",
  placeOfBirth: "Udaipur, Rajasthan",
  coordinates: { latitude: "24.58°N", longitude: "73.68°E" },
  relationship: "Self",
  moonNakshatra: "Uttara Phalguni",
  moonRashi: "Leo (सिंह)",
  moonRashiIndex: 4,
  moonSidereal: 149.09,
  notes: "Moon in Leo (Singh Rashi) · Nakshatra: Uttara Phalguni Pada 1 · Sun's nakshatra · Deity: Aryaman (god of contracts & partnership) · Calculated via sidereal ephemeris",
};

export const NAKSHATRAS = [
  { id: 1,  name: "Ashwini",           hindi: "अश्विनी",          lord: "Ketu",    rashi: 0,  rashiName: "Aries" },
  { id: 2,  name: "Bharani",           hindi: "भरणी",             lord: "Venus",   rashi: 0,  rashiName: "Aries" },
  { id: 3,  name: "Krittika",          hindi: "कृत्तिका",         lord: "Sun",     rashi: 1,  rashiName: "Taurus" },
  { id: 4,  name: "Rohini",            hindi: "रोहिणी",            lord: "Moon",    rashi: 1,  rashiName: "Taurus" },
  { id: 5,  name: "Mrigashira",        hindi: "मृगशिरा",           lord: "Mars",    rashi: 1,  rashiName: "Taurus" },
  { id: 6,  name: "Ardra",             hindi: "आर्द्रा",            lord: "Rahu",    rashi: 2,  rashiName: "Gemini" },
  { id: 7,  name: "Punarvasu",         hindi: "पुनर्वसु",           lord: "Jupiter", rashi: 2,  rashiName: "Gemini" },
  { id: 8,  name: "Pushya",            hindi: "पुष्य",              lord: "Saturn",  rashi: 3,  rashiName: "Cancer" },
  { id: 9,  name: "Ashlesha",          hindi: "आश्लेषा",            lord: "Mercury", rashi: 3,  rashiName: "Cancer" },
  { id: 10, name: "Magha",             hindi: "मघा",               lord: "Ketu",    rashi: 4,  rashiName: "Leo" },
  { id: 11, name: "Purva Phalguni",    hindi: "पूर्व फाल्गुनी",     lord: "Venus",   rashi: 4,  rashiName: "Leo" },
  { id: 12, name: "Uttara Phalguni",   hindi: "उत्तर फाल्गुनी",    lord: "Sun",     rashi: 5,  rashiName: "Virgo" },
  { id: 13, name: "Hasta",             hindi: "हस्त",              lord: "Moon",    rashi: 5,  rashiName: "Virgo" },
  { id: 14, name: "Chitra",            hindi: "चित्रा",             lord: "Mars",    rashi: 5,  rashiName: "Virgo" },
  { id: 15, name: "Swati",             hindi: "स्वाती",             lord: "Rahu",    rashi: 6,  rashiName: "Libra" },
  { id: 16, name: "Vishakha",          hindi: "विशाखा",             lord: "Jupiter", rashi: 6,  rashiName: "Libra" },
  { id: 17, name: "Anuradha",          hindi: "अनुराधा",            lord: "Saturn",  rashi: 7,  rashiName: "Scorpio" },
  { id: 18, name: "Jyeshtha",          hindi: "ज्येष्ठा",            lord: "Mercury", rashi: 7,  rashiName: "Scorpio" },
  { id: 19, name: "Mula",              hindi: "मूल",               lord: "Ketu",    rashi: 8,  rashiName: "Sagittarius" },
  { id: 20, name: "Purva Ashadha",     hindi: "पूर्व आषाढ़ा",       lord: "Venus",   rashi: 8,  rashiName: "Sagittarius" },
  { id: 21, name: "Uttara Ashadha",    hindi: "उत्तर आषाढ़ा",      lord: "Sun",     rashi: 9,  rashiName: "Capricorn" },
  { id: 22, name: "Shravana",          hindi: "श्रवण",              lord: "Moon",    rashi: 9,  rashiName: "Capricorn" },
  { id: 23, name: "Dhanishta",         hindi: "धनिष्ठा",            lord: "Mars",    rashi: 10, rashiName: "Aquarius" },
  { id: 24, name: "Shatabhisha",       hindi: "शतभिषा",             lord: "Rahu",    rashi: 10, rashiName: "Aquarius" },
  { id: 25, name: "Purva Bhadrapada",  hindi: "पूर्व भाद्रपद",      lord: "Jupiter", rashi: 11, rashiName: "Pisces" },
  { id: 26, name: "Uttara Bhadrapada", hindi: "उत्तर भाद्रपद",     lord: "Saturn",  rashi: 11, rashiName: "Pisces" },
  { id: 27, name: "Revati",            hindi: "रेवती",              lord: "Mercury", rashi: 11, rashiName: "Pisces" },
] as const;

export type NakshatraName = typeof NAKSHATRAS[number]["name"];

export const RASHI_NAMES = [
  "Aries (मेष)", "Taurus (वृषभ)", "Gemini (मिथुन)", "Cancer (कर्क)",
  "Leo (सिंह)", "Virgo (कन्या)", "Libra (तुला)", "Scorpio (वृश्चिक)",
  "Sagittarius (धनु)", "Capricorn (मकर)", "Aquarius (कुम्भ)", "Pisces (मीन)",
];

export interface Prospect {
  id: string;
  name: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nakshatra: string;
  rashiIndex: number;
  notes?: string;
}

export const SEED_PROSPECTS: Prospect[] = [
  { 
    id: "p1", name: "Priya Sharma", dateOfBirth: "2000-03-14", placeOfBirth: "Jaipur", 
    nakshatra: "Ashwini", rashiIndex: 0,
    notes: "Aries moon (Fire sign) matches well with Leo moon. Good Gana and Graha Maitri."
  },
  { 
    id: "p2", name: "Kavya Verma", dateOfBirth: "2001-07-22", placeOfBirth: "Ahmedabad", 
    nakshatra: "Rohini", rashiIndex: 1,
    notes: "Taurus moon. Good overall score but different elements (Earth/Fire)."
  },
  { 
    id: "p3", name: "Sunaina Joshi", dateOfBirth: "1999-11-05", placeOfBirth: "Indore", 
    nakshatra: "Uttara Phalguni", rashiIndex: 5,
    notes: "Virgo moon. Same Nakshatra as groom but different pada/rashi. Nadi Dosha risk."
  },
  { 
    id: "p4", name: "Meera Gupta", dateOfBirth: "2001-02-18", placeOfBirth: "Ajmer", 
    nakshatra: "Revati", rashiIndex: 11,
    notes: "Pisces moon. Average compatibility."
  },
  { 
    id: "p5", name: "Divya Sisodia", dateOfBirth: "2000-09-30", placeOfBirth: "Udaipur", 
    nakshatra: "Anuradha", rashiIndex: 7,
    notes: "Scorpio moon. Mars/Sun relationship. Moderate match."
  },
  {
    id: "p6", name: "Neha Rathore", dateOfBirth: "2000-12-15", placeOfBirth: "Jodhpur",
    nakshatra: "Mula", rashiIndex: 8,
    notes: "Sagittarius moon (Fire). Excellent elemental match with Leo. Both are Sun/Jupiter ruled signs."
  },
  {
    id: "p7", name: "Aditi Chauhan", dateOfBirth: "2002-05-10", placeOfBirth: "Bikaner",
    nakshatra: "Krittika", rashiIndex: 0,
    notes: "Aries moon. Sun ruled nakshatra like groom. Very strong match."
  }
];

export const VIMSHOTTARI_SEQUENCE = [
  { lord: "Ketu",    years: 7  },
  { lord: "Venus",   years: 20 },
  { lord: "Sun",     years: 6  },
  { lord: "Moon",    years: 10 },
  { lord: "Mars",    years: 7  },
  { lord: "Rahu",    years: 18 },
  { lord: "Jupiter", years: 16 },
  { lord: "Saturn",  years: 19 },
  { lord: "Mercury", years: 17 },
];

export const NAKSHATRA_LORD_ORDER = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"];
