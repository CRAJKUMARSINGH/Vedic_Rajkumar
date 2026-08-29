export interface KundliTestCase {
  id: string;
  title: string;
  birthData: {
    name: string;
    date: string;
    time: string;
    timezone: string;
    latitude: number;
    longitude: number;
    place: string;
  };
  expectedApprox: {
    ayanamsa_deg_Lahiri: [number, number];
    sunSign: string;
    moonSign: string;
    nakshatraName: string;
    ascendantSign: string;
    vimshottariSeedLord: string;
  };
  tolerance?: string;
}

export const TEST_CASES: KundliTestCase[] = [
  {
    id: 'TC-001',
    title: 'Priyansh Singh Chauhan (Indore)',
    birthData: {
      name: 'Priyansh Singh Chauhan',
      date: '2000-10-26',
      time: '00:50',
      timezone: 'Asia/Kolkata',
      latitude: 22.72,
      longitude: 75.86,
      place: 'Indore, Madhya Pradesh, India',
    },
    expectedApprox: {
      ayanamsa_deg_Lahiri: [23.8, 24.1],
      sunSign: 'Libra',
      moonSign: 'Scorpio',
      nakshatraName: 'Jyeshtha',
      ascendantSign: 'Scorpio',
      vimshottariSeedLord: 'Mercury',
    },
    tolerance: 'Sun near Libra/Scorpio cusp — Libra or Scorpio acceptable; Nakshatra Jyeshtha or Anuradha acceptable',
  },
  {
    id: 'TC-002',
    title: 'Swami Vivekananda (Kolkata)',
    birthData: {
      name: 'Swami Vivekananda',
      date: '1863-01-12',
      time: '06:12',
      timezone: 'Asia/Kolkata',
      latitude: 22.57,
      longitude: 88.36,
      place: 'Kolkata, West Bengal, India',
    },
    expectedApprox: {
      ayanamsa_deg_Lahiri: [22.9, 23.2],
      sunSign: 'Capricorn',
      moonSign: 'Sagittarius',
      nakshatraName: 'Uttara Ashadha',
      ascendantSign: 'Capricorn',
      vimshottariSeedLord: 'Sun',
    },
    tolerance: 'Moon Nakshatra approx Purva Ashadha or Uttara Ashadha; Ayanamsa loose range for 1863',
  },
  {
    id: 'TC-003',
    title: 'Mahatma Gandhi (Porbandar)',
    birthData: {
      name: 'Mahatma Gandhi',
      date: '1869-10-02',
      time: '07:20',
      timezone: 'Asia/Kolkata',
      latitude: 21.64,
      longitude: 69.61,
      place: 'Porbandar, Gujarat, India',
    },
    expectedApprox: {
      ayanamsa_deg_Lahiri: [22.9, 23.2],
      sunSign: 'Virgo',
      moonSign: 'Libra',
      nakshatraName: 'Hasta',
      ascendantSign: 'Libra',
      vimshottariSeedLord: 'Moon',
    },
    tolerance: 'Sun near Virgo/Libra cusp — Virgo or Libra acceptable; Nakshatra Hasta or Chitra acceptable',
  },
  {
    id: 'TC-004',
    title: 'Albert Einstein (Ulm, Germany)',
    birthData: {
      name: 'Albert Einstein',
      date: '1879-03-14',
      time: '11:30',
      timezone: 'Europe/Berlin',
      latitude: 48.4,
      longitude: 9.99,
      place: 'Ulm, Baden-Wurttemberg, Germany',
    },
    expectedApprox: {
      ayanamsa_deg_Lahiri: [23.0, 23.25],
      sunSign: 'Pisces',
      moonSign: 'Aries',
      nakshatraName: 'Bharani',
      ascendantSign: 'Aries',
      vimshottariSeedLord: 'Venus',
    },
    tolerance: 'Sun approx Pisces/Aquarius — Pisces acceptable; Nakshatra Ashwini or Bharani acceptable',
  },
  {
    id: 'TC-005',
    title: 'Narendra Modi (Vadnagar)',
    birthData: {
      name: 'Narendra Modi',
      date: '1950-09-17',
      time: '06:15',
      timezone: 'Asia/Kolkata',
      latitude: 23.78,
      longitude: 72.64,
      place: 'Vadnagar, Gujarat, India',
    },
    expectedApprox: {
      ayanamsa_deg_Lahiri: [23.3, 23.5],
      sunSign: 'Virgo',
      moonSign: 'Leo',
      nakshatraName: 'Magha',
      ascendantSign: 'Virgo',
      vimshottariSeedLord: 'Ketu',
    },
    tolerance: 'Sun approx Virgo — close to Leo/Virgo cusp, Virgo acceptable; Nakshatra Magha or Purva Phalguni acceptable',
  },
];
