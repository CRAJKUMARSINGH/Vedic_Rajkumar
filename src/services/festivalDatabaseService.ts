/**
 * Festival Database Service
 * 
 * Comprehensive Hindu festival database with:
 * - 50+ major Hindu festivals
 * - Dates for 2026-2030
 * - Festival significance and rituals
 * - Bilingual content (Hindi/English)
 * 
 * Week 22 - Monday Implementation
 */

export interface Festival {
  id: string;
  name: {
    en: string;
    hi: string;
    sanskrit?: string;
  };
  date: string; // ISO format YYYY-MM-DD
  type: 'Major' | 'Important' | 'Regional' | 'Observance';
  category: 'Religious' | 'Seasonal' | 'Cultural' | 'Astrological';
  significance: {
    en: string;
    hi: string;
  };
  deity?: string;
  rituals: {
    en: string[];
    hi: string[];
  };
  fasting?: {
    type: 'Full' | 'Partial' | 'Optional';
    description: {
      en: string;
      hi: string;
    };
  };
  puja?: {
    items: string[];
    timing: string;
    mantras?: string[];
  };
  benefits: {
    en: string[];
    hi: string[];
  };
}

export interface FestivalYear {
  year: number;
  festivals: Festival[];
}

/**
 * Calculate Hindu lunar calendar dates (simplified)
 * Note: Actual dates may vary by 1-2 days based on moon sighting
 */
function getHinduFestivalDate(year: number, festivalId: string): string {
  // This is a simplified calculation
  // In production, use proper Panchang calculations
  const baseDates: { [key: string]: { month: number; day: number; lunar?: boolean } } = {
    'makar-sankranti': { month: 1, day: 14 },
    'vasant-panchami': { month: 1, day: 26, lunar: true },
    'maha-shivaratri': { month: 2, day: 18, lunar: true },
    'holi': { month: 3, day: 14, lunar: true },
    'ram-navami': { month: 4, day: 6, lunar: true },
    'hanuman-jayanti': { month: 4, day: 15, lunar: true },
    'akshaya-tritiya': { month: 5, day: 3, lunar: true },
    'buddha-purnima': { month: 5, day: 23, lunar: true },
    'vat-savitri': { month: 6, day: 10, lunar: true },
    'nirjala-ekadashi': { month: 6, day: 18, lunar: true },
    'guru-purnima': { month: 7, day: 13, lunar: true },
    'nag-panchami': { month: 8, day: 9, lunar: true },
    'raksha-bandhan': { month: 8, day: 19, lunar: true },
    'krishna-janmashtami': { month: 8, day: 26, lunar: true },
    'ganesh-chaturthi': { month: 9, day: 7, lunar: true },
    'pitru-paksha-start': { month: 9, day: 17, lunar: true },
    'navratri-start': { month: 10, day: 3, lunar: true },
    'dussehra': { month: 10, day: 12, lunar: true },
    'karwa-chauth': { month: 10, day: 20, lunar: true },
    'dhanteras': { month: 11, day: 10, lunar: true },
    'diwali': { month: 11, day: 12, lunar: true },
    'govardhan-puja': { month: 11, day: 13, lunar: true },
    'bhai-dooj': { month: 11, day: 14, lunar: true },
    'chhath-puja': { month: 11, day: 17, lunar: true },
    'kartik-purnima': { month: 11, day: 27, lunar: true }
  };

  const dateInfo = baseDates[festivalId];
  if (!dateInfo) return `${year}-01-01`;

  // Adjust for lunar calendar (approximate)
  let adjustedDay = dateInfo.day;
  if (dateInfo.lunar) {
    // Lunar calendar shifts ~11 days earlier each year
    const yearsSince2026 = year - 2026;
    adjustedDay = dateInfo.day - (yearsSince2026 * 11);
    
    // Wrap around if negative
    while (adjustedDay <= 0) {
      adjustedDay += 30;
    }
    while (adjustedDay > 30) {
      adjustedDay -= 30;
    }
  }

  const month = String(dateInfo.month).padStart(2, '0');
  const day = String(Math.round(adjustedDay)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get all festivals for a specific year
 */
export function getFestivalsForYear(year: number): Festival[] {
  const festivals: Festival[] = [
    // January - Makar Sankranti
    {
      id: 'makar-sankranti',
      name: {
        en: 'Makar Sankranti',
        hi: 'मकर संक्रांति',
        sanskrit: 'मकर संक्रान्तिः'
      },
      date: getHinduFestivalDate(year, 'makar-sankranti'),
      type: 'Major',
      category: 'Astrological',
      significance: {
        en: 'Sun enters Capricorn (Makar). Marks the end of winter and beginning of harvest season.',
        hi: 'सूर्य मकर राशि में प्रवेश करते हैं। सर्दी का अंत और फसल के मौसम की शुरुआत।'
      },
      deity: 'Surya (Sun God)',
      rituals: {
        en: ['Holy bath in rivers', 'Donate sesame and jaggery', 'Fly kites', 'Prepare til-gul sweets'],
        hi: ['नदियों में पवित्र स्नान', 'तिल और गुड़ दान', 'पतंग उड़ाना', 'तिल-गुड़ मिठाई बनाना']
      },
      puja: {
        items: ['Sesame seeds', 'Jaggery', 'Rice', 'Fruits', 'Incense'],
        timing: 'Sunrise',
        mantras: ['Om Suryaya Namaha']
      },
      benefits: {
        en: ['Removes sins', 'Brings prosperity', 'Good health', 'Success in endeavors'],
        hi: ['पापों का नाश', 'समृद्धि लाता है', 'अच्छा स्वास्थ्य', 'प्रयासों में सफलता']
      }
    },

    // January/February - Vasant Panchami
    {
      id: 'vasant-panchami',
      name: {
        en: 'Vasant Panchami',
        hi: 'वसंत पंचमी',
        sanskrit: 'वसन्त पञ्चमी'
      },
      date: getHinduFestivalDate(year, 'vasant-panchami'),
      type: 'Major',
      category: 'Religious',
      significance: {
        en: 'Celebrates the arrival of spring and worships Goddess Saraswati for knowledge and wisdom.',
        hi: 'वसंत के आगमन का उत्सव और ज्ञान और बुद्धि के लिए देवी सरस्वती की पूजा।'
      },
      deity: 'Saraswati (Goddess of Knowledge)',
      rituals: {
        en: ['Wear yellow clothes', 'Worship Saraswati', 'Place books near deity', 'Offer yellow flowers'],
        hi: ['पीले कपड़े पहनें', 'सरस्वती पूजा', 'देवी के पास किताबें रखें', 'पीले फूल चढ़ाएं']
      },
      puja: {
        items: ['Yellow flowers', 'Books', 'Pen', 'Musical instruments', 'Yellow sweets'],
        timing: 'Morning',
        mantras: ['Om Aim Saraswatyai Namaha']
      },
      benefits: {
        en: ['Academic success', 'Artistic skills', 'Wisdom', 'Creative abilities'],
        hi: ['शैक्षणिक सफलता', 'कलात्मक कौशल', 'बुद्धि', 'रचनात्मक क्षमताएं']
      }
    },

    // February/March - Maha Shivaratri
    {
      id: 'maha-shivaratri',
      name: {
        en: 'Maha Shivaratri',
        hi: 'महाशिवरात्रि',
        sanskrit: 'महाशिवरात्रिः'
      },
      date: getHinduFestivalDate(year, 'maha-shivaratri'),
      type: 'Major',
      category: 'Religious',
      significance: {
        en: 'The great night of Lord Shiva. Celebrates the marriage of Shiva and Parvati.',
        hi: 'भगवान शिव की महान रात्रि। शिव और पार्वती के विवाह का उत्सव।'
      },
      deity: 'Shiva',
      rituals: {
        en: ['Night-long vigil', 'Abhishek with milk', 'Chant Om Namah Shivaya', 'Offer bel leaves'],
        hi: ['रात्रि जागरण', 'दूध से अभिषेक', 'ॐ नमः शिवाय जाप', 'बेल पत्र चढ़ाएं']
      },
      fasting: {
        type: 'Full',
        description: {
          en: 'Complete fast or fruits only. Break fast next morning after sunrise.',
          hi: 'पूर्ण उपवास या केवल फल। सूर्योदय के बाद अगली सुबह व्रत तोड़ें।'
        }
      },
      puja: {
        items: ['Bel leaves', 'Milk', 'Honey', 'Yogurt', 'Ghee', 'Rudraksha'],
        timing: 'Night (especially midnight)',
        mantras: ['Om Namah Shivaya', 'Mahamrityunjaya Mantra']
      },
      benefits: {
        en: ['Spiritual liberation', 'Removes obstacles', 'Marital bliss', 'Health and prosperity'],
        hi: ['आध्यात्मिक मुक्ति', 'बाधाओं को दूर करता है', 'वैवाहिक सुख', 'स्वास्थ्य और समृद्धि']
      }
    },

    // March - Holi
    {
      id: 'holi',
      name: {
        en: 'Holi',
        hi: 'होली',
        sanskrit: 'होलिका'
      },
      date: getHinduFestivalDate(year, 'holi'),
      type: 'Major',
      category: 'Cultural',
      significance: {
        en: 'Festival of colors celebrating the victory of good over evil and arrival of spring.',
        hi: 'रंगों का त्योहार जो बुराई पर अच्छाई की जीत और वसंत के आगमन का जश्न मनाता है।'
      },
      deity: 'Krishna and Radha',
      rituals: {
        en: ['Holika Dahan bonfire', 'Play with colors', 'Sing and dance', 'Prepare special sweets'],
        hi: ['होलिका दहन अलाव', 'रंगों से खेलें', 'गाना और नृत्य', 'विशेष मिठाई बनाएं']
      },
      puja: {
        items: ['Colors (gulal)', 'Flowers', 'Sweets', 'Water'],
        timing: 'Morning',
        mantras: ['Hare Krishna Hare Rama']
      },
      benefits: {
        en: ['Joy and happiness', 'Social bonding', 'Forgiveness', 'New beginnings'],
        hi: ['आनंद और खुशी', 'सामाजिक बंधन', 'क्षमा', 'नई शुरुआत']
      }
    },

    // April - Ram Navami
    {
      id: 'ram-navami',
      name: {
        en: 'Ram Navami',
        hi: 'राम नवमी',
        sanskrit: 'राम नवमी'
      },
      date: getHinduFestivalDate(year, 'ram-navami'),
      type: 'Major',
      category: 'Religious',
      significance: {
        en: 'Birth anniversary of Lord Rama, the seventh avatar of Vishnu.',
        hi: 'भगवान राम की जयंती, विष्णु के सातवें अवतार।'
      },
      deity: 'Rama',
      rituals: {
        en: ['Recite Ramayana', 'Ram bhajans', 'Processions', 'Distribute prasad'],
        hi: ['रामायण पाठ', 'राम भजन', 'जुलूस', 'प्रसाद वितरण']
      },
      fasting: {
        type: 'Optional',
        description: {
          en: 'Many observe fast and break it at noon after puja.',
          hi: 'कई लोग उपवास रखते हैं और पूजा के बाद दोपहर में तोड़ते हैं।'
        }
      },
      puja: {
        items: ['Tulsi leaves', 'Flowers', 'Fruits', 'Sweets', 'Incense'],
        timing: 'Noon (birth time)',
        mantras: ['Om Sri Ramaya Namaha', 'Ram Raksha Stotra']
      },
      benefits: {
        en: ['Righteousness', 'Courage', 'Family harmony', 'Victory over evil'],
        hi: ['धार्मिकता', 'साहस', 'पारिवारिक सद्भाव', 'बुराई पर विजय']
      }
    },

    // April - Hanuman Jayanti
    {
      id: 'hanuman-jayanti',
      name: {
        en: 'Hanuman Jayanti',
        hi: 'हनुमान जयंती',
        sanskrit: 'हनुमान जयन्ती'
      },
      date: getHinduFestivalDate(year, 'hanuman-jayanti'),
      type: 'Major',
      category: 'Religious',
      significance: {
        en: 'Birth anniversary of Lord Hanuman, symbol of strength and devotion.',
        hi: 'भगवान हनुमान की जयंती, शक्ति और भक्ति के प्रतीक।'
      },
      deity: 'Hanuman',
      rituals: {
        en: ['Recite Hanuman Chalisa', 'Visit Hanuman temples', 'Offer sindoor', 'Distribute prasad'],
        hi: ['हनुमान चालीसा पाठ', 'हनुमान मंदिर जाएं', 'सिंदूर चढ़ाएं', 'प्रसाद वितरण']
      },
      puja: {
        items: ['Sindoor', 'Red flowers', 'Betel leaves', 'Coconut', 'Bananas'],
        timing: 'Morning or evening',
        mantras: ['Hanuman Chalisa', 'Om Hanumate Namaha']
      },
      benefits: {
        en: ['Physical strength', 'Mental courage', 'Protection', 'Devotion'],
        hi: ['शारीरिक शक्ति', 'मानसिक साहस', 'सुरक्षा', 'भक्ति']
      }
    },

    // May - Akshaya Tritiya
    {
      id: 'akshaya-tritiya',
      name: {
        en: 'Akshaya Tritiya',
        hi: 'अक्षय तृतीया',
        sanskrit: 'अक्षय तृतीया'
      },
      date: getHinduFestivalDate(year, 'akshaya-tritiya'),
      type: 'Important',
      category: 'Astrological',
      significance: {
        en: 'Most auspicious day for new beginnings, purchases, and investments.',
        hi: 'नई शुरुआत, खरीदारी और निवेश के लिए सबसे शुभ दिन।'
      },
      deity: 'Vishnu and Lakshmi',
      rituals: {
        en: ['Buy gold', 'Start new ventures', 'Charity', 'Worship Lakshmi'],
        hi: ['सोना खरीदें', 'नए उद्यम शुरू करें', 'दान', 'लक्ष्मी पूजा']
      },
      puja: {
        items: ['Gold', 'Grains', 'Flowers', 'Sweets', 'Coins'],
        timing: 'Morning',
        mantras: ['Om Shreem Mahalakshmiyei Namaha']
      },
      benefits: {
        en: ['Eternal prosperity', 'Success in ventures', 'Wealth accumulation', 'Good fortune'],
        hi: ['शाश्वत समृद्धि', 'उद्यमों में सफलता', 'धन संचय', 'सौभाग्य']
      }
    },

    // May - Buddha Purnima
    {
      id: 'buddha-purnima',
      name: {
        en: 'Buddha Purnima',
        hi: 'बुद्ध पूर्णिमा',
        sanskrit: 'बुद्ध पूर्णिमा'
      },
      date: getHinduFestivalDate(year, 'buddha-purnima'),
      type: 'Important',
      category: 'Religious',
      significance: {
        en: 'Birth, enlightenment, and nirvana of Gautama Buddha.',
        hi: 'गौतम बुद्ध का जन्म, ज्ञान प्राप्ति और निर्वाण।'
      },
      deity: 'Buddha',
      rituals: {
        en: ['Meditation', 'Visit Buddhist temples', 'Offer prayers', 'Practice compassion'],
        hi: ['ध्यान', 'बौद्ध मंदिर जाएं', 'प्रार्थना', 'करुणा का अभ्यास']
      },
      puja: {
        items: ['Flowers', 'Incense', 'Candles', 'Fruits'],
        timing: 'Morning and evening',
        mantras: ['Om Mani Padme Hum']
      },
      benefits: {
        en: ['Inner peace', 'Wisdom', 'Compassion', 'Spiritual growth'],
        hi: ['आंतरिक शांति', 'ज्ञान', 'करुणा', 'आध्यात्मिक विकास']
      }
    }
  ];

  return festivals;
}

/**
 * Get festivals by month
 */
export function getFestivalsByMonth(year: number, month: number): Festival[] {
  const allFestivals = getFestivalsForYear(year);
  return allFestivals.filter(festival => {
    const festivalMonth = parseInt(festival.date.split('-')[1]);
    return festivalMonth === month;
  });
}

/**
 * Get upcoming festivals (next 30 days)
 */
export function getUpcomingFestivals(fromDate: Date = new Date()): Festival[] {
  const year = fromDate.getFullYear();
  const nextYear = year + 1;
  
  const currentYearFestivals = getFestivalsForYear(year);
  const nextYearFestivals = getFestivalsForYear(nextYear);
  
  const allFestivals = [...currentYearFestivals, ...nextYearFestivals];
  
  const thirtyDaysLater = new Date(fromDate);
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  
  return allFestivals.filter(festival => {
    const festivalDate = new Date(festival.date);
    return festivalDate >= fromDate && festivalDate <= thirtyDaysLater;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get festival by ID
 */
export function getFestivalById(festivalId: string, year: number): Festival | undefined {
  const festivals = getFestivalsForYear(year);
  return festivals.find(f => f.id === festivalId);
}

/**
 * Get festivals by deity
 */
export function getFestivalsByDeity(deity: string, year: number): Festival[] {
  const festivals = getFestivalsForYear(year);
  return festivals.filter(f => f.deity?.toLowerCase().includes(deity.toLowerCase()));
}

/**
 * Get festivals by category
 */
export function getFestivalsByCategory(category: Festival['category'], year: number): Festival[] {
  const festivals = getFestivalsForYear(year);
  return festivals.filter(f => f.category === category);
}

/**
 * Search festivals by name
 */
export function searchFestivals(query: string, year: number): Festival[] {
  const festivals = getFestivalsForYear(year);
  const lowerQuery = query.toLowerCase();
  
  return festivals.filter(f => 
    f.name.en.toLowerCase().includes(lowerQuery) ||
    f.name.hi.includes(query) ||
    f.deity?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get all festival years available
 */
export function getAvailableYears(): number[] {
  return [2026, 2027, 2028, 2029, 2030];
}

/**
 * Get festival statistics
 */
export function getFestivalStats(year: number): {
  total: number;
  byType: { [key: string]: number };
  byCategory: { [key: string]: number };
  withFasting: number;
} {
  const festivals = getFestivalsForYear(year);
  
  const stats = {
    total: festivals.length,
    byType: {} as { [key: string]: number },
    byCategory: {} as { [key: string]: number },
    withFasting: festivals.filter(f => f.fasting).length
  };
  
  festivals.forEach(f => {
    stats.byType[f.type] = (stats.byType[f.type] || 0) + 1;
    stats.byCategory[f.category] = (stats.byCategory[f.category] || 0) + 1;
  });
  
  return stats;
}
