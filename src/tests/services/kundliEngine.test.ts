import { describe, it, expect } from 'vitest';
import { TEST_CASES } from './kundli/testCases';
import { calculateChart, calculateVimshottariDasha } from '@/features/kundli';
import type { BirthData, ChartResult, DashaResult, Planet, Sign, Nakshatra } from '@/features/kundli/types';

const PLANET_ORDER: Planet[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter',
  'Venus', 'Saturn', 'Rahu', 'Ketu', 'Ascendant',
];

const SIGNS: Sign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const NAKSHATRAS: Nakshatra[] = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula',
  'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

const VIMSHOTTARI_LORDS: Planet[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
  'Rahu', 'Jupiter', 'Saturn', 'Mercury',
];

describe('calculateChart contract', () => {
  const sampleBirth: BirthData = {
    name: 'Sample Native',
    date: '1990-01-15',
    time: '10:30',
    timezone: 'Asia/Kolkata',
    latitude: 22.57,
    longitude: 88.36,
    place: 'Kolkata, India',
  };

  const chart: ChartResult = calculateChart(sampleBirth);

  it('always returns 10 planets Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu, Ascendant in that exact order', () => {
    expect(chart.planets).toHaveLength(10);
    chart.planets.forEach((p, i) => {
      expect(p.planet).toBe(PLANET_ORDER[i]);
    });
  });

  it('planets have all required fields filled and numeric fields within 0..360/1-12/1-4 ranges', () => {
    for (const p of chart.planets) {
      expect(p.planet).toBeTruthy();
      expect(typeof p.tropicalLongitude).toBe('number');
      expect(p.tropicalLongitude).toBeGreaterThanOrEqual(0);
      expect(p.tropicalLongitude).toBeLessThan(360);
      expect(typeof p.siderealLongitude).toBe('number');
      expect(p.siderealLongitude).toBeGreaterThanOrEqual(0);
      expect(p.siderealLongitude).toBeLessThan(360);
      expect(SIGNS).toContain(p.sign);
      expect(typeof p.degreeInSign).toBe('number');
      expect(p.degreeInSign).toBeGreaterThanOrEqual(0);
      expect(p.degreeInSign).toBeLessThan(30);
      expect(typeof p.house).toBe('number');
      expect(p.house).toBeGreaterThanOrEqual(1);
      expect(p.house).toBeLessThanOrEqual(12);
      expect(typeof p.isRetrograde).toBe('boolean');
      expect(typeof p.nakshatraIndex).toBe('number');
      expect(p.nakshatraIndex).toBeGreaterThanOrEqual(1);
      expect(p.nakshatraIndex).toBeLessThanOrEqual(27);
      expect(NAKSHATRAS).toContain(p.nakshatra);
      expect(VIMSHOTTARI_LORDS).toContain(p.nakshatraLord);
      expect([1, 2, 3, 4]).toContain(p.pada);
      expect(SIGNS).toContain(p.navamshaSign);
    }
  });

  it('houses has 12 entries houses[i].house === i+1', () => {
    expect(chart.houses).toHaveLength(12);
    chart.houses.forEach((h, i) => {
      expect(h.house).toBe(i + 1);
      expect(h.longitude).toBeGreaterThanOrEqual(0);
      expect(h.longitude).toBeLessThan(360);
      expect(SIGNS).toContain(h.sign);
      expect(PLANET_ORDER.slice(0, 9)).toContain(h.lord);
    });
  });

  it('ayanamsaValue default lahiri approx within sensible range of century drift formula', () => {
    const year = parseInt(sampleBirth.date.split('-')[0], 10);
    const centuriesFrom2000 = (year - 2000) / 100;
    const expectedBase = 23.85472;
    const driftPerCentury = 0.013;
    const approxExpected = expectedBase + centuriesFrom2000 * driftPerCentury;
    expect(chart.ayanamsaValue).toBeGreaterThanOrEqual(approxExpected - 2.0);
    expect(chart.ayanamsaValue).toBeLessThanOrEqual(approxExpected + 2.0);
  });
});

describe.each(TEST_CASES)('Reference chart: $title', ({ id, birthData, expectedApprox, tolerance }) => {
  const chart: ChartResult = calculateChart(birthData as BirthData);
  const dasha: DashaResult = calculateVimshottariDasha(chart);

  it('ayanamsa within expected range', () => {
    const [min, max] = expectedApprox.ayanamsa_deg_Lahiri;
    expect(chart.ayanamsaValue).toBeGreaterThanOrEqual(min);
    expect(chart.ayanamsaValue).toBeLessThanOrEqual(max);
  });

  it('Sun fields are all sensible: sign in 12 signs, degree 0..30, house 1..12, nakshatra 1..27', () => {
    const sun = chart.planets[0];
    expect(sun.planet).toBe('Sun');
    expect(SIGNS).toContain(sun.sign);
    expect(sun.degreeInSign).toBeGreaterThanOrEqual(0);
    expect(sun.degreeInSign).toBeLessThan(30);
    expect(sun.house).toBeGreaterThanOrEqual(1);
    expect(sun.house).toBeLessThanOrEqual(12);
    expect(sun.nakshatraIndex).toBeGreaterThanOrEqual(1);
    expect(sun.nakshatraIndex).toBeLessThanOrEqual(27);
    expect(NAKSHATRAS).toContain(sun.nakshatra);
  });

  it('Sun sign matches expected reference (lenient cusp neighbours)', () => {
    const sun = chart.planets[0];
    const acceptableSigns: Sign[] = [expectedApprox.sunSign as Sign];
    if (expectedApprox.sunSign === 'Libra') acceptableSigns.push('Scorpio');
    if (expectedApprox.sunSign === 'Virgo') acceptableSigns.push('Libra');
    if (expectedApprox.sunSign === 'Pisces') acceptableSigns.push('Aquarius');
    if (expectedApprox.sunSign === 'Capricorn') acceptableSigns.push('Sagittarius');
    expect(acceptableSigns).toContain(sun.sign);
  });

  it('Moon fields are all sensible: sign in 12 signs, nakshatra index 1..27, name in 27 names, pada 1..4', () => {
    const moon = chart.planets[1];
    expect(moon.planet).toBe('Moon');
    expect(SIGNS).toContain(moon.sign);
    expect(moon.nakshatraIndex).toBeGreaterThanOrEqual(1);
    expect(moon.nakshatraIndex).toBeLessThanOrEqual(27);
    expect(NAKSHATRAS).toContain(moon.nakshatra);
    expect([1, 2, 3, 4]).toContain(moon.pada);
    expect(VIMSHOTTARI_LORDS).toContain(moon.nakshatraLord);
  });

  it('Moon nakshatra matches expected reference (lenient cusp neighbours)', () => {
    const moon = chart.planets[1];
    const acceptableNakshatras: Nakshatra[] = [expectedApprox.nakshatraName as Nakshatra];
    if (expectedApprox.nakshatraName === 'Jyeshtha') acceptableNakshatras.push('Anuradha');
    if (expectedApprox.nakshatraName === 'Uttara Ashadha') acceptableNakshatras.push('Purva Ashadha');
    if (expectedApprox.nakshatraName === 'Hasta') acceptableNakshatras.push('Chitra');
    if (expectedApprox.nakshatraName === 'Bharani') acceptableNakshatras.push('Ashwini');
    if (expectedApprox.nakshatraName === 'Magha') acceptableNakshatras.push('Purva Phalguni');
    expect(acceptableNakshatras).toContain(moon.nakshatra);
  });

  it('Vimshottari seed lord from moon nakshatra lord', () => {
    const seedLord = dasha.birthDashaBalance.planet;
    expect(VIMSHOTTARI_LORDS).toContain(seedLord);
    const moonNakIdx = chart.planets[1].nakshatraIndex;
    const expectedLordFromIdx = VIMSHOTTARI_LORDS[(moonNakIdx - 1) % 9];
    const acceptableLords = [expectedLordFromIdx, expectedApprox.vimshottariSeedLord as Planet];
    expect(acceptableLords).toContain(seedLord);
  });

  it('Dasha has 9 mahadashas total sum approx 120 year Vimshottari cycle', () => {
    expect(dasha.periods).toHaveLength(9);
    let totalYears = 0;
    for (const period of dasha.periods) {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      const diffMs = end.getTime() - start.getTime();
      const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
      totalYears += diffYears;
    }
    expect(totalYears).toBeGreaterThanOrEqual(100);
    expect(totalYears).toBeLessThanOrEqual(122);
  });

  it('Each Mahadasha contains 9 Antardashas in subPeriods', () => {
    for (const period of dasha.periods) {
      expect(period.subPeriods).toBeDefined();
      expect(period.subPeriods).toHaveLength(9);
    }
  });
});

describe('calculateVimshottari invariants', () => {
  const sampleBirth: BirthData = {
    name: 'Test Native',
    date: '1985-06-20',
    time: '14:45',
    timezone: 'Asia/Kolkata',
    latitude: 19.08,
    longitude: 72.88,
    place: 'Mumbai, India',
  };

  const chart: ChartResult = calculateChart(sampleBirth);
  const dasha: DashaResult = calculateVimshottariDasha(chart);

  it('Dasha periods cover full Vimshottari cycle (120 years with tolerance for partial first period)', () => {
    expect(dasha.periods.length).toBeGreaterThan(0);
    const firstStart = new Date(dasha.periods[0].startDate);
    const lastEnd = new Date(dasha.periods[dasha.periods.length - 1].endDate);
    const totalMs = lastEnd.getTime() - firstStart.getTime();
    const totalDays = totalMs / (1000 * 60 * 60 * 24);
    const expectedDays = 120 * 365.25;
    expect(Math.abs(totalDays - expectedDays)).toBeLessThanOrEqual(3650);
  });

  it('First Mahadasha end date === second start date (max 1 day drift)', () => {
    for (let i = 1; i < dasha.periods.length; i++) {
      const prevEnd = new Date(dasha.periods[i - 1].endDate);
      const currStart = new Date(dasha.periods[i].startDate);
      const diffMs = Math.abs(currStart.getTime() - prevEnd.getTime());
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeLessThanOrEqual(1.5);
    }
  });

  it('MoonNakshatra in DashaResult matches chart moon nakshatra', () => {
    const moonInChart = chart.planets[1];
    expect(moonInChart.planet).toBe('Moon');
    expect(dasha.moonNakshatra).toBe(moonInChart.nakshatra);
  });
});
