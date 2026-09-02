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
      moonSign: 'Virgo',
      nakshatraName: 'Hasta',
      ascendantSign: 'Scorpio',
      vimshottariSeedLord: 'Moon',
    },
    tolerance: 'Sun in Libra; Moon in Virgo (Hasta)',
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
      ayanamsa_deg_Lahiri: [21.8, 22.2],
      sunSign: 'Sagittarius',
      moonSign: 'Virgo',
      nakshatraName: 'Hasta',
      ascendantSign: 'Capricorn',
      vimshottariSeedLord: 'Moon',
    },
    tolerance: 'Moon Nakshatra Hasta; Ayanamsa range ~21.94° for 1863',
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
      ayanamsa_deg_Lahiri: [21.9, 22.3],
      sunSign: 'Virgo',
      moonSign: 'Cancer',
      nakshatraName: 'Ashlesha',
      ascendantSign: 'Libra',
      vimshottariSeedLord: 'Mercury',
    },
    tolerance: 'Sun in Virgo; Moon in Cancer (Ashlesha); Ayanamsa ~22.04° for 1869',
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
      ayanamsa_deg_Lahiri: [22.0, 22.4],
      sunSign: 'Pisces',
      moonSign: 'Scorpio',
      nakshatraName: 'Jyeshtha',
      ascendantSign: 'Aries',
      vimshottariSeedLord: 'Mercury',
    },
    tolerance: 'Sun in Pisces; Moon in Scorpio (Jyeshtha); Ayanamsa ~22.17° for 1879',
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
      ayanamsa_deg_Lahiri: [23.0, 23.4],
      sunSign: 'Virgo',
      moonSign: 'Scorpio',
      nakshatraName: 'Anuradha',
      ascendantSign: 'Scorpio',
      vimshottariSeedLord: 'Saturn',
    },
    tolerance: 'Sun in Virgo; Moon in Scorpio (Anuradha); Ayanamsa ~23.17° for 1950',
  },
];
