/**
 * mundaneCharts.ts — National Horoscope Data
 * Source: BV Raman Magazine Enhancement Plan — Feature 7
 * India Independence chart + major nations
 */

export interface NatalChart {
  country: string;
  label: { en: string; hi: string };
  date: string;
  time: string;
  lat: number;
  lon: number;
  timezone: string;
  sunSign: string;
  moonSign: string;
  ascendant: string;
  flag: string;
}

export const INDIA_NATAL_CHART: NatalChart = {
  country: 'India',
  label: { en: 'Republic of India', hi: 'भारत गणराज्य' },
  date: '1947-08-15',
  time: '00:00',
  lat: 28.6139,
  lon: 77.209,
  timezone: 'Asia/Kolkata',
  sunSign: 'Cancer',
  moonSign: 'Capricorn',
  ascendant: 'Taurus',
  flag: '',
};

export const USA_NATAL_CHART: NatalChart = {
  country: 'USA',
  label: { en: 'United States of America', hi: 'संयुक्त राज्य अमेरिका' },
  date: '1776-07-04',
  time: '17:10',
  lat: 39.9526,
  lon: -75.1652,
  timezone: 'America/New_York',
  sunSign: 'Cancer',
  moonSign: 'Aquarius',
  ascendant: 'Sagittarius',
  flag: '',
};

export const UK_NATAL_CHART: NatalChart = {
  country: 'UK',
  label: { en: 'United Kingdom', hi: 'यूनाइटेड किंगडम' },
  date: '1801-01-01',
  time: '00:00',
  lat: 51.5074,
  lon: -0.1278,
  timezone: 'Europe/London',
  sunSign: 'Capricorn',
  moonSign: 'Cancer',
  ascendant: 'Libra',
  flag: '',
};

export const ALL_NATIONAL_CHARTS: NatalChart[] = [
  INDIA_NATAL_CHART,
  USA_NATAL_CHART,
  UK_NATAL_CHART,
];

/** Mundane house significations (Raman tradition) */
export const MUNDANE_HOUSES: Record<number, { en: string; hi: string }> = {
  1: { en: 'Nation, people, general conditions', hi: 'रषटर, जनत, समनय सथत' },
  2: { en: 'National wealth, banks, revenue', hi: 'रषटरय धन, बक, रजसव' },
  3: { en: 'Transport, communication, neighbors', hi: 'परवहन, सचर, पडस दश' },
  4: { en: 'Agriculture, land, opposition party', hi: 'कष, भम, वपकष दल' },
  5: { en: 'Stock market, children, entertainment', hi: 'शयर बजर, बचच, मनरजन' },
  6: { en: 'Military, public health, labor', hi: 'सन, सरवजनक सवसथय, शरम' },
  7: { en: 'Foreign relations, war, treaties', hi: 'वदश सबध, यदध, सधय' },
  8: { en: 'Death rate, taxes, national debt', hi: 'मतय दर, कर, रषटरय ऋण' },
  9: { en: 'Religion, judiciary, higher education', hi: 'धरम, नययपलक, उचच शकष' },
  10: { en: 'Government, ruling party, PM/President', hi: 'सरकर, सततरढ दल, परधनमतर' },
  11: { en: 'Parliament, national income, allies', hi: 'ससद, रषटरय आय, मतर दश' },
  12: { en: 'Prisons, hospitals, secret enemies', hi: 'जल, असपतल, गपत शतर' },
};
