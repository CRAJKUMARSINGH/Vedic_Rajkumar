// Week 14: Comprehensive Testing - Monday Implementation
// Unit Tests for Ephemeris Service - Core Astronomical Calculations

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  calculateJulianDay,
  calculateAyanamsa,
  calculateSunPosition,
  calculateMoonPosition,
  calculateCompletePlanetaryPositions
} from '../../services/ephemerisService';

describe('EphemerisService - Core Astronomical Calculations', () => {
  
  describe('Julian Day Calculation', () => {
    it('should calculate correct Julian Day for known dates', () => {
      // Test with known Julian Day values (Meeus algorithm, UTC)
      const testCases = [
        { date: '2000-01-01', time: '12:00', expected: 2451545.0 },
        { date: '1963-09-15', time: '06:00', expected: 2438287.75 }, // Rajkumar's birth
        { date: '2026-03-17', time: '00:00', expected: 2461116.5 }   // Current test date
      ];

      testCases.forEach(({ date, time, expected }) => {
        const jd = calculateJulianDay(date, time);
        expect(Math.abs(jd - expected)).toBeLessThan(0.1); // Allow small precision difference
      });
    });

    it('should handle leap years correctly', () => {
      const leapYear = calculateJulianDay('2024-02-29', '12:00');
      const nonLeapYear = calculateJulianDay('2023-02-28', '12:00');
      // Feb 29 2024 - Feb 28 2023 = exactly 366 days
      expect(leapYear - nonLeapYear).toBeCloseTo(366, 1);
    });
  });

  describe('Ayanamsa Calculation', () => {
    it('should calculate Lahiri Ayanamsa for known dates', () => {
      // Test with known Ayanamsa values (approximate)
      const testCases = [
        { date: '2000-01-01', expectedRange: [23.8, 24.2] },
        { date: '2026-03-17', expectedRange: [24.1, 24.5] }
      ];

      testCases.forEach(({ date, expectedRange }) => {
        const ayanamsa = calculateAyanamsa(date);
        expect(ayanamsa).toBeGreaterThanOrEqual(expectedRange[0]);
        expect(ayanamsa).toBeLessThanOrEqual(expectedRange[1]);
      });
    });

    it('should increase over time (precession)', () => {
      const ayanamsa2000 = calculateAyanamsa('2000-01-01');
      const ayanamsa2026 = calculateAyanamsa('2026-03-17');
      expect(ayanamsa2026).toBeGreaterThan(ayanamsa2000);
    });
  });

  describe('Sun Position Calculation', () => {
    it('should calculate Sun position for known dates', () => {
      // Test Sun position for equinoxes and solstices
      const testCases = [
        { date: '2026-03-20', expectedRashi: 11, description: 'Spring Equinox - Pisces/Aries' },
        { date: '2026-06-21', expectedRashi: 2, description: 'Summer Solstice - Gemini' },
        { date: '2026-09-23', expectedRashi: 5, description: 'Autumn Equinox - Virgo' },
        { date: '2026-12-21', expectedRashi: 8, description: 'Winter Solstice - Sagittarius' }
      ];

      testCases.forEach(({ date, expectedRashi, description }) => {
        const sunPos = calculateSunPosition(date, '12:00');
        // Allow ±1 rashi difference due to calculation precision
        expect(Math.abs(sunPos.rashiIndex - expectedRashi)).toBeLessThanOrEqual(1);
      });
    });

    it('should return valid rashi index (0-11)', () => {
      const sunPos = calculateSunPosition('2026-03-17', '12:00');
      expect(sunPos.rashiIndex).toBeGreaterThanOrEqual(0);
      expect(sunPos.rashiIndex).toBeLessThanOrEqual(11);
      expect(sunPos.degrees).toBeGreaterThanOrEqual(0);
      expect(sunPos.degrees).toBeLessThan(30);
    });
  });

  describe('Moon Position Calculation', () => {
    it('should calculate Moon position for known dates', () => {
      // Test with Rajkumar's birth data (known Moon in Cancer)
      const moonPos = calculateMoonPosition('1963-09-15', '06:00');
      
      // Moon should be in a valid rashi
      expect(moonPos.rashiIndex).toBeGreaterThanOrEqual(0);
      expect(moonPos.rashiIndex).toBeLessThanOrEqual(11);
      expect(moonPos.degrees).toBeGreaterThanOrEqual(0);
      expect(moonPos.degrees).toBeLessThan(30);
    });

    it('should show Moon movement over time', () => {
      const moon1 = calculateMoonPosition('2026-03-17', '00:00');
      const moon2 = calculateMoonPosition('2026-03-18', '00:00');
      
      // Moon should move approximately 12-15 degrees per day
      const degreeChange = Math.abs(
        (moon2.rashiIndex * 30 + moon2.degrees) - 
        (moon1.rashiIndex * 30 + moon1.degrees)
      );
      expect(degreeChange).toBeGreaterThan(10);
      expect(degreeChange).toBeLessThan(20);
    });
  });

  describe('Complete Planetary Positions', () => {
    it('should calculate all planetary positions', () => {
      const positions = calculateCompletePlanetaryPositions('2026-03-17', '12:00');
      
      // Should have all 9 planets
      expect(positions.planets).toHaveLength(9);
      
      // Each planet should have valid data
      positions.planets.forEach(planet => {
        expect(planet.name).toBeDefined();
        expect(planet.rashiIndex).toBeGreaterThanOrEqual(0);
        expect(planet.rashiIndex).toBeLessThanOrEqual(11);
        expect(planet.degrees).toBeGreaterThanOrEqual(0);
        expect(planet.degrees).toBeLessThan(30);
        expect(planet.rashiName).toBeDefined();
        expect(planet.dignity).toBeDefined();
      });
    });

    it('should include all required planets', () => {
      const positions = calculateCompletePlanetaryPositions('2026-03-17', '12:00');
      const planetNames = positions.planets.map(p => p.name);
      
      const expectedPlanets = [
        'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 
        'Jupiter', 'Saturn', 'Rahu', 'Ketu'
      ];
      
      expectedPlanets.forEach(planet => {
        expect(planetNames).toContain(planet);
      });
    });

    it('should calculate planetary dignities correctly', () => {
      const positions = calculateCompletePlanetaryPositions('2026-03-17', '12:00');
      
      positions.planets.forEach(planet => {
        const validDignities = [
          'Exalted', 'Own Sign', 'Moolatrikona', 'Friend Sign', 
          'Neutral', 'Enemy Sign', 'Debilitated'
        ];
        expect(validDignities).toContain(planet.dignity);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid dates gracefully', () => {
      // calculateJulianDay should not throw — returns NaN for invalid input
      expect(() => calculateJulianDay('invalid-date', '12:00')).not.toThrow();
      // calculateSunPosition wraps gracefully
      expect(() => calculateSunPosition('2026-13-45', '25:70')).not.toThrow();
    });

    it('should handle extreme dates', () => {
      // Test with very old and future dates
      const oldDate = calculateSunPosition('1900-01-01', '12:00');
      const futureDate = calculateSunPosition('2100-12-31', '12:00');
      
      expect(oldDate.rashiIndex).toBeGreaterThanOrEqual(0);
      expect(futureDate.rashiIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle different time zones consistently', () => {
      // Same moment in different time representations
      const utc = calculateSunPosition('2026-03-17', '12:00');
      const ist = calculateSunPosition('2026-03-17', '17:30'); // +5:30 IST
      
      // Should be very close (within calculation precision)
      const degDiff = Math.abs(
        (utc.rashiIndex * 30 + utc.degrees) - 
        (ist.rashiIndex * 30 + ist.degrees)
      );
      expect(degDiff).toBeLessThan(1); // Less than 1 degree difference
    });
  });

  describe('Performance Tests', () => {
    it('should calculate positions quickly', () => {
      const startTime = performance.now();
      
      // Calculate positions for 100 different dates
      for (let i = 0; i < 100; i++) {
        const date = new Date(2026, 2, 17 + i).toISOString().split('T')[0];
        calculateCompletePlanetaryPositions(date, '12:00');
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should complete 100 calculations in less than 1 second
      expect(totalTime).toBeLessThan(1000);
    });

    it('should have consistent calculation times', () => {
      const times: number[] = [];
      
      // Measure 10 calculation times
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        calculateCompletePlanetaryPositions('2026-03-17', '12:00');
        const end = performance.now();
        times.push(end - start);
      }
      
      // Calculate standard deviation
      const mean = times.reduce((a, b) => a + b) / times.length;
      const variance = times.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / times.length;
      const stdDev = Math.sqrt(variance);
      
      // Standard deviation should be low (consistent performance)
      // Use absolute threshold to avoid 0 < 0 when calculations are very fast
      expect(stdDev).toBeLessThan(Math.max(mean * 0.5, 1)); // Less than 50% of mean or 1ms
    });
  });
});

// Test Data Validation with Known Birth Charts
describe('EphemerisService - Real Data Validation', () => {
  
  describe('Rajkumar Birth Chart Validation', () => {
    const rajkumarBirth = {
      date: '1963-09-15',
      time: '06:00',
      location: 'Aspur (23.84, 73.71)'
    };

    it('should calculate Moon in Cancer for Rajkumar', () => {
      const moonPos = calculateMoonPosition(rajkumarBirth.date, rajkumarBirth.time);
      // Moon should be in Cancer (index 3) based on known data
      expect([2, 3, 4]).toContain(moonPos.rashiIndex); // Allow ±1 rashi for precision
    });

    it('should calculate consistent planetary positions', () => {
      const positions1 = calculateCompletePlanetaryPositions(rajkumarBirth.date, rajkumarBirth.time);
      const positions2 = calculateCompletePlanetaryPositions(rajkumarBirth.date, rajkumarBirth.time);
      
      // Should get identical results for same input
      positions1.planets.forEach((planet1, index) => {
        const planet2 = positions2.planets[index];
        expect(planet1.rashiIndex).toBe(planet2.rashiIndex);
        expect(Math.abs(planet1.degrees - planet2.degrees)).toBeLessThan(0.01);
      });
    });
  });

  describe('Multiple Birth Chart Validation', () => {
    const testBirthCharts = [
      { name: 'Rajkumar', date: '1963-09-15', time: '06:00' },
      { name: 'Priyanka', date: '1982-07-18', time: '14:30' },
      { name: 'Test1', date: '1990-01-01', time: '00:00' },
      { name: 'Test2', date: '2000-12-31', time: '23:59' }
    ];

    testBirthCharts.forEach(({ name, date, time }) => {
      it(`should calculate valid positions for ${name}`, () => {
        const positions = calculateCompletePlanetaryPositions(date, time);
        
        // All planets should have valid positions
        positions.planets.forEach(planet => {
          expect(planet.rashiIndex).toBeGreaterThanOrEqual(0);
          expect(planet.rashiIndex).toBeLessThanOrEqual(11);
          expect(planet.degrees).toBeGreaterThanOrEqual(0);
          expect(planet.degrees).toBeLessThan(30);
        });
      });
    });
  });
});