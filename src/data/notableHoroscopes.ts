/**
 * Notable Horoscope Library
 * Inspired by B.V. Raman's "Notable Horoscopes" series in The Astrological Magazine
 * Educational purpose only — public domain birth data
 */

export interface NotableHoroscope {
  id: string;
  name: string;
  nameHi: string;
  category: 'saint' | 'scientist' | 'leader' | 'artist' | 'athlete' | 'historical';
  born: string;        // YYYY-MM-DD
  time: string;        // HH:MM
  place: string;
  lat: number;
  lon: number;
  sunSign: string;
  moonSign: string;
  ascendant: string;
  dashaAtBirth: string;
  keyYogas: string[];
  lifeHighlights: { en: string; hi: string };
  astroInsight: { en: string; hi: string };
  source: string;
}

export const NOTABLE_HOROSCOPES: NotableHoroscope[] = [
  {
    id: 'swami-vivekananda',
    name: 'Swami Vivekananda',
    nameHi: 'स्वामी विवेकानंद',
    category: 'saint',
    born: '1863-01-12',
    time: '06:33',
    place: 'Kolkata, India',
    lat: 22.57, lon: 88.36,
    sunSign: 'Sagittarius',
    moonSign: 'Pisces',
    ascendant: 'Sagittarius',
    dashaAtBirth: 'Saturn Mahadasha',
    keyYogas: ['Hamsa Yoga (Jupiter in Kendra)', 'Gaja Kesari Yoga', 'Dharma Karma Adhipati Yoga'],
    lifeHighlights: {
      en: 'Introduced Vedanta and Yoga to the Western world. Founded Ramakrishna Mission. Spoke at Parliament of World Religions (1893).',
      hi: 'वेदांत और योग को पश्चिमी दुनिया से परिचित कराया। रामकृष्ण मिशन की स्थापना की। विश्व धर्म संसद (1893) में भाषण दिया।'
    },
    astroInsight: {
      en: 'Sagittarius ascendant with Jupiter in Kendra gives Hamsa Yoga — wisdom, spirituality, and international recognition. Saturn Dasha at birth shaped his disciplined spiritual path.',
      hi: 'धनु लग्न में केंद्र में गुरु हंस योग देता है — ज्ञान, आध्यात्मिकता और अंतर्राष्ट्रीय पहचान। जन्म के समय शनि दशा ने उनके अनुशासित आध्यात्मिक मार्ग को आकार दिया।'
    },
    source: 'B.V. Raman, Notable Horoscopes',
  },
  {
    id: 'srinivasa-ramanujan',
    name: 'Srinivasa Ramanujan',
    nameHi: 'श्रीनिवास रामानुजन',
    category: 'scientist',
    born: '1887-12-22',
    time: '18:00',
    place: 'Erode, Tamil Nadu',
    lat: 11.34, lon: 77.72,
    sunSign: 'Sagittarius',
    moonSign: 'Cancer',
    ascendant: 'Gemini',
    dashaAtBirth: 'Venus Mahadasha',
    keyYogas: ['Budha-Aditya Yoga', 'Gaja Kesari Yoga', 'Strong 5th house (intellect)'],
    lifeHighlights: {
      en: 'Self-taught mathematical genius. Discovered thousands of formulas. Collaborated with G.H. Hardy at Cambridge. Fellow of Royal Society at age 30.',
      hi: 'स्व-शिक्षित गणितीय प्रतिभा। हजारों सूत्रों की खोज की। कैम्ब्रिज में जी.एच. हार्डी के साथ सहयोग किया। 30 वर्ष की आयु में रॉयल सोसाइटी के फेलो।'
    },
    astroInsight: {
      en: 'Mercury (intellect) and Sun conjunction in Sagittarius creates Budha-Aditya Yoga. Moon in Cancer (exalted) in 2nd house gives intuitive mathematical insight. Jupiter aspects 5th house of intelligence.',
      hi: 'धनु में बुध (बुद्धि) और सूर्य का संयोग बुध-आदित्य योग बनाता है। कर्क में चंद्र (उच्च) दूसरे भाव में सहज गणितीय अंतर्दृष्टि देता है। गुरु बुद्धि के 5वें भाव को देखता है।'
    },
    source: 'B.V. Raman, Notable Horoscopes; public records',
  },
  {
    id: 'mahatma-gandhi',
    name: 'Mahatma Gandhi',
    nameHi: 'महात्मा गांधी',
    category: 'leader',
    born: '1869-10-02',
    time: '07:45',
    place: 'Porbandar, Gujarat',
    lat: 21.64, lon: 69.61,
    sunSign: 'Virgo',
    moonSign: 'Leo',
    ascendant: 'Scorpio',
    dashaAtBirth: 'Venus Mahadasha',
    keyYogas: ['Ruchaka Yoga (Mars in Kendra)', 'Dharma Karma Adhipati Yoga', 'Neecha Bhanga Raja Yoga'],
    lifeHighlights: {
      en: 'Led India\'s independence movement through non-violence. Developed Satyagraha philosophy. Assassinated 1948.',
      hi: 'अहिंसा के माध्यम से भारत के स्वतंत्रता आंदोलन का नेतृत्व किया। सत्याग्रह दर्शन विकसित किया। 1948 में हत्या।'
    },
    astroInsight: {
      en: 'Scorpio ascendant with Mars in Kendra gives Ruchaka Yoga — courage and leadership. Saturn in 10th house (Karma) gave him a life of service and discipline. Venus Dasha at birth shaped his artistic and diplomatic nature.',
      hi: 'वृश्चिक लग्न में केंद्र में मंगल रुचक योग देता है — साहस और नेतृत्व। 10वें भाव (कर्म) में शनि ने उन्हें सेवा और अनुशासन का जीवन दिया। जन्म के समय शुक्र दशा ने उनकी कलात्मक और राजनयिक प्रकृति को आकार दिया।'
    },
    source: 'B.V. Raman, Notable Horoscopes; public records',
  },
  {
    id: 'rabindranath-tagore',
    name: 'Rabindranath Tagore',
    nameHi: 'रवींद्रनाथ टैगोर',
    category: 'artist',
    born: '1861-05-07',
    time: '03:00',
    place: 'Kolkata, India',
    lat: 22.57, lon: 88.36,
    sunSign: 'Aries',
    moonSign: 'Aquarius',
    ascendant: 'Pisces',
    dashaAtBirth: 'Jupiter Mahadasha',
    keyYogas: ['Hamsa Yoga', 'Venus in 3rd (arts/writing)', 'Jupiter in Lagna'],
    lifeHighlights: {
      en: 'First non-European Nobel Prize in Literature (1913). Composed India\'s national anthem. Founded Visva-Bharati University.',
      hi: 'साहित्य में पहला गैर-यूरोपीय नोबेल पुरस्कार (1913)। भारत का राष्ट्रगान रचा। विश्व-भारती विश्वविद्यालय की स्थापना की।'
    },
    astroInsight: {
      en: 'Pisces ascendant with Jupiter in Lagna gives Hamsa Yoga and spiritual creativity. Venus strong in 3rd house of arts and writing. Jupiter Dasha at birth blessed him with wisdom and recognition.',
      hi: 'मीन लग्न में लग्न में गुरु हंस योग और आध्यात्मिक रचनात्मकता देता है। कला और लेखन के 3वें भाव में शुक्र मजबूत। जन्म के समय गुरु दशा ने उन्हें ज्ञान और पहचान का आशीर्वाद दिया।'
    },
    source: 'Public records; astrological tradition',
  },
  {
    id: 'adi-shankaracharya',
    name: 'Adi Shankaracharya',
    nameHi: 'आदि शंकराचार्य',
    category: 'saint',
    born: '0788-04-01',
    time: '08:00',
    place: 'Kalady, Kerala',
    lat: 10.17, lon: 76.42,
    sunSign: 'Pisces',
    moonSign: 'Capricorn',
    ascendant: 'Aries',
    dashaAtBirth: 'Mercury Mahadasha',
    keyYogas: ['Ruchaka Yoga', 'Budha-Aditya Yoga', 'Dharma Karma Adhipati Yoga'],
    lifeHighlights: {
      en: 'Consolidated Advaita Vedanta philosophy. Established four mathas across India. Wrote commentaries on Upanishads, Bhagavad Gita, Brahma Sutras.',
      hi: 'अद्वैत वेदांत दर्शन को समेकित किया। भारत भर में चार मठों की स्थापना की। उपनिषदों, भगवद गीता, ब्रह्म सूत्रों पर भाष्य लिखे।'
    },
    astroInsight: {
      en: 'Aries ascendant with Mars in Kendra gives Ruchaka Yoga — spiritual warrior energy. Mercury Dasha at birth gave extraordinary intellectual capacity. Jupiter in 9th house of dharma and philosophy.',
      hi: 'मेष लग्न में केंद्र में मंगल रुचक योग देता है — आध्यात्मिक योद्धा ऊर्जा। जन्म के समय बुध दशा ने असाधारण बौद्धिक क्षमता दी। धर्म और दर्शन के 9वें भाव में गुरु।'
    },
    source: 'Traditional records; B.V. Raman tradition',
  },
  {
    id: 'bv-raman',
    name: 'Dr. B.V. Raman',
    nameHi: 'डॉ. बी.वी. रमण',
    category: 'scientist',
    born: '1912-08-08',
    time: '19:46',
    place: 'Bangalore, India',
    lat: 12.97, lon: 77.59,
    sunSign: 'Cancer',
    moonSign: 'Scorpio',
    ascendant: 'Capricorn',
    dashaAtBirth: 'Rahu Mahadasha',
    keyYogas: ['Dharma Karma Adhipati Yoga', 'Gaja Kesari Yoga', 'Strong 9th house (dharma/publishing)'],
    lifeHighlights: {
      en: 'Founded The Astrological Magazine (1936). Wrote 26 books on Vedic astrology. Predicted WWII, India\'s independence. Died 1998.',
      hi: 'द एस्ट्रोलॉजिकल मैगज़ीन की स्थापना (1936)। वैदिक ज्योतिष पर 26 पुस्तकें लिखीं। द्वितीय विश्व युद्ध, भारत की स्वतंत्रता की भविष्यवाणी की। 1998 में निधन।'
    },
    astroInsight: {
      en: 'Capricorn ascendant with Saturn as lagna lord gave discipline and longevity. Moon in Scorpio in 11th house gave deep research ability and large following. Rahu Dasha at birth gave unconventional path to fame.',
      hi: 'मकर लग्न में शनि लग्नेश ने अनुशासन और दीर्घायु दी। 11वें भाव में वृश्चिक में चंद्र ने गहरी शोध क्षमता और बड़ा अनुसरण दिया। जन्म के समय राहु दशा ने प्रसिद्धि का अपरंपरागत मार्ग दिया।'
    },
    source: 'B.V. Raman, My Experiences in Astrology; Wikipedia',
  },
];

export function getHoroscopesByCategory(category: NotableHoroscope['category']): NotableHoroscope[] {
  return NOTABLE_HOROSCOPES.filter(h => h.category === category);
}

export function getAllCategories(): NotableHoroscope['category'][] {
  return ['saint', 'scientist', 'leader', 'artist', 'athlete', 'historical'];
}
