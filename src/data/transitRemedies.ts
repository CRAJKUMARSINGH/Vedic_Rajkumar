/**
 * Transit Remedies Data
 * Classical remedies for unfavorable planetary transits
 * Based on Raman tradition: mantra, gemstone, charity, deity, color
 */

export interface TransitRemedy {
  planet: string;
  mantra: { en: string; hi: string };
  count: number;
  gemstone: { en: string; hi: string };
  charityDay: { en: string; hi: string };
  charityItem: { en: string; hi: string };
  deity: { en: string; hi: string };
  color: string;
  fastingDay: { en: string; hi: string };
  yantra: { en: string; hi: string };
}

export const TRANSIT_REMEDIES: Record<string, TransitRemedy> = {
  Sun: {
    planet: 'Sun',
    mantra: { en: 'Om Suryaya Namah', hi: 'ॐ सूर्याय नमः' },
    count: 108,
    gemstone: { en: 'Ruby (Manik)', hi: 'माणिक्य' },
    charityDay: { en: 'Sunday', hi: 'रविवार' },
    charityItem: { en: 'Wheat, jaggery, copper', hi: 'गेहूं, गुड़, तांबा' },
    deity: { en: 'Lord Vishnu / Surya Dev', hi: 'भगवान विष्णु / सूर्य देव' },
    color: 'Red / Saffron',
    fastingDay: { en: 'Sunday', hi: 'रविवार' },
    yantra: { en: 'Surya Yantra', hi: 'सूर्य यंत्र' },
  },
  Moon: {
    planet: 'Moon',
    mantra: { en: 'Om Chandraya Namah', hi: 'ॐ चंद्राय नमः' },
    count: 108,
    gemstone: { en: 'Pearl (Moti)', hi: 'मोती' },
    charityDay: { en: 'Monday', hi: 'सोमवार' },
    charityItem: { en: 'Rice, milk, silver', hi: 'चावल, दूध, चांदी' },
    deity: { en: 'Lord Shiva / Chandra Dev', hi: 'भगवान शिव / चंद्र देव' },
    color: 'White / Silver',
    fastingDay: { en: 'Monday', hi: 'सोमवार' },
    yantra: { en: 'Chandra Yantra', hi: 'चंद्र यंत्र' },
  },
  Mars: {
    planet: 'Mars',
    mantra: { en: 'Om Mangalaya Namah', hi: 'ॐ मंगलाय नमः' },
    count: 108,
    gemstone: { en: 'Red Coral (Moonga)', hi: 'मूंगा' },
    charityDay: { en: 'Tuesday', hi: 'मंगलवार' },
    charityItem: { en: 'Red lentils, copper, red cloth', hi: 'मसूर दाल, तांबा, लाल वस्त्र' },
    deity: { en: 'Lord Hanuman / Mangal Dev', hi: 'भगवान हनुमान / मंगल देव' },
    color: 'Red / Saffron',
    fastingDay: { en: 'Tuesday', hi: 'मंगलवार' },
    yantra: { en: 'Mangal Yantra', hi: 'मंगल यंत्र' },
  },
  Mercury: {
    planet: 'Mercury',
    mantra: { en: 'Om Budhaya Namah', hi: 'ॐ बुधाय नमः' },
    count: 108,
    gemstone: { en: 'Emerald (Panna)', hi: 'पन्ना' },
    charityDay: { en: 'Wednesday', hi: 'बुधवार' },
    charityItem: { en: 'Green moong, books, green cloth', hi: 'हरी मूंग, पुस्तकें, हरा वस्त्र' },
    deity: { en: 'Lord Vishnu / Budh Dev', hi: 'भगवान विष्णु / बुध देव' },
    color: 'Green',
    fastingDay: { en: 'Wednesday', hi: 'बुधवार' },
    yantra: { en: 'Budh Yantra', hi: 'बुध यंत्र' },
  },
  Jupiter: {
    planet: 'Jupiter',
    mantra: { en: 'Om Gurave Namah', hi: 'ॐ गुरवे नमः' },
    count: 108,
    gemstone: { en: 'Yellow Sapphire (Pukhraj)', hi: 'पुखराज' },
    charityDay: { en: 'Thursday', hi: 'गुरुवार' },
    charityItem: { en: 'Yellow gram, turmeric, gold', hi: 'चना, हल्दी, सोना' },
    deity: { en: 'Lord Brahma / Brihaspati', hi: 'भगवान ब्रह्मा / बृहस्पति' },
    color: 'Yellow / Gold',
    fastingDay: { en: 'Thursday', hi: 'गुरुवार' },
    yantra: { en: 'Guru Yantra', hi: 'गुरु यंत्र' },
  },
  Venus: {
    planet: 'Venus',
    mantra: { en: 'Om Shukraya Namah', hi: 'ॐ शुक्राय नमः' },
    count: 108,
    gemstone: { en: 'Diamond / White Sapphire (Heera)', hi: 'हीरा / सफेद पुखराज' },
    charityDay: { en: 'Friday', hi: 'शुक्रवार' },
    charityItem: { en: 'White rice, sugar, white cloth', hi: 'सफेद चावल, चीनी, सफेद वस्त्र' },
    deity: { en: 'Goddess Lakshmi / Shukra Dev', hi: 'देवी लक्ष्मी / शुक्र देव' },
    color: 'White / Pink',
    fastingDay: { en: 'Friday', hi: 'शुक्रवार' },
    yantra: { en: 'Shukra Yantra', hi: 'शुक्र यंत्र' },
  },
  Saturn: {
    planet: 'Saturn',
    mantra: { en: 'Om Shanaye Namah', hi: 'ॐ शनये नमः' },
    count: 108,
    gemstone: { en: 'Blue Sapphire (Neelam)', hi: 'नीलम' },
    charityDay: { en: 'Saturday', hi: 'शनिवार' },
    charityItem: { en: 'Black sesame, iron, black cloth', hi: 'काले तिल, लोहा, काला वस्त्र' },
    deity: { en: 'Lord Shani / Hanuman', hi: 'भगवान शनि / हनुमान' },
    color: 'Black / Dark Blue',
    fastingDay: { en: 'Saturday', hi: 'शनिवार' },
    yantra: { en: 'Shani Yantra', hi: 'शनि यंत्र' },
  },
  Rahu: {
    planet: 'Rahu',
    mantra: { en: 'Om Rahave Namah', hi: 'ॐ राहवे नमः' },
    count: 108,
    gemstone: { en: 'Hessonite (Gomed)', hi: 'गोमेद' },
    charityDay: { en: 'Saturday', hi: 'शनिवार' },
    charityItem: { en: 'Coconut, black sesame, blue cloth', hi: 'नारियल, काले तिल, नीला वस्त्र' },
    deity: { en: 'Goddess Durga / Bhairav', hi: 'देवी दुर्गा / भैरव' },
    color: 'Smoky / Dark',
    fastingDay: { en: 'Saturday', hi: 'शनिवार' },
    yantra: { en: 'Rahu Yantra', hi: 'राहु यंत्र' },
  },
  Ketu: {
    planet: 'Ketu',
    mantra: { en: 'Om Ketave Namah', hi: 'ॐ केतवे नमः' },
    count: 108,
    gemstone: { en: "Cat's Eye (Lehsunia)", hi: 'लहसुनिया' },
    charityDay: { en: 'Tuesday', hi: 'मंगलवार' },
    charityItem: { en: 'Sesame, blanket, grey cloth', hi: 'तिल, कंबल, धूसर वस्त्र' },
    deity: { en: 'Lord Ganesha / Chitragupta', hi: 'भगवान गणेश / चित्रगुप्त' },
    color: 'Grey / Multicolor',
    fastingDay: { en: 'Tuesday', hi: 'मंगलवार' },
    yantra: { en: 'Ketu Yantra', hi: 'केतु यंत्र' },
  },
};

export function getRemedyForPlanet(planet: string): TransitRemedy | null {
  return TRANSIT_REMEDIES[planet] ?? null;
}
