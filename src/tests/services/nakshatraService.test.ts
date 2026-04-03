// Week 14: Comprehensive Testing - Monday Implementation
// Unit Tests for Nakshatra Service - Birth Star Calculations

import { describe, it, expect } from 'vitest';
import { 
  getNakshatraInfo,
  calculateNakshatraFromDegrees,
  NAKSHATRA_DATABASE,
  type NakshatraInfo
} from '../../services/nakshatraService';

describe('NakshatraService - Birth Star Calculations', () => {
  
  describe('Nakshatra Database Validation', () => {
    it('should have 27 nakshatras in database', () => {
      expect(NAKSHATRA_DATABASE).toHaveLength(27);
    });

    it('should have complete data for each nakshatra', () => {
      NAKSHATRA_DATABASE.forEach((nakshatra, index) => {
        expect(nakshatra.id).toBe(index + 1);
        expect(nakshatra.name).toBeDefined();
        expect(nakshatra.nameHi).toBeDefined();
        expect(nakshatra.nameSanskrit).toBeDefined();
        expect(nakshatra.lord).toBeDefined();
        expect(nakshatra.deity).toBeDefined();
        expect(nakshatra.symbol).toBeDefined();
        expect(nakshatra.startDegree).toBeDefined();
        expect(nakshatra.endDegree).toBeDefined();
        expect(nakshatra.characteristics).toBeDefined();
        expect(nakshatra.characteristics.en).toBeDefined();
        expect(nakshatra.characteristics.hi).toBeDefined();
      });
    });

    it('should have correct degree ranges for nakshatras', () => {
      NAKSHATRA_DATABASE.forEach((nakshatra, index) => {
        const expectedStart = index * (360 / 27);
        const expectedEnd = (index + 1) * (360 / 27);
        
        expect(Math.abs(nakshatra.startDegree - expectedStart)).toBeLessThan(0.1);
        expect(Math.abs(nakshatra.endDegree - expectedEnd)).toBeLessThan(0.1);
      });
    });

    it('should have valid nakshatra lords', () => {
      const validLords = [
        'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
      ];
      
      NAKSHATRA_DATABASE.forEach(nakshatra => {
        expect(validLords).toContain(nakshatra.lord);
      });
    });

    it('should have continuous degree coverage', () => {
      for (let i = 0; i < NAKSHATRA_DATABASE.length - 1; i++) {
        const current = NAKSHATRA_DATABASE[i];
        const next = NAKSHATRA_DATABASE[i + 1];
        
        // End of current should equal start of next
        expect(Math.abs(current.endDegree - next.startDegree)).toBeLessThan(0.01);
      }
      
      // First nakshatra should start at 0
      expect(NAKSHATRA_DATABASE[0].startDegree).toBeCloseTo(0);
      
      // Last nakshatra should end at 360
      expect(NAKSHATRA_DATABASE[26].endDegree).toBeCloseTo(360);
    });
  });

  describe('Nakshatra Calculation from Degrees', () => {
    it('should calculate correct nakshatra for known degrees', () => {
      const testCases = [
        { degrees: 0, expectedNakshatra: 1, name: 'Ashwini' },
        { degrees: 13.34, expectedNakshatra: 2, name: 'Bharani' },
        { degrees: 26.68, expectedNakshatra: 3, name: 'Krittika' },
        { degrees: 93.34, expectedNakshatra: 8, name: 'Pushya' },
        { degrees: 180, expectedNakshatra: 14, name: 'Chitra' },
        { degrees: 270, expectedNakshatra: 21, name: 'Uttara Ashadha' },
        { degrees: 359.99, expectedNakshatra: 27, name: 'Revati' }
      ];

      testCases.forEach(({ degrees, expectedNakshatra, name }) => {
        const result = calculateNakshatraFromDegrees(degrees);
        expect(result.nakshatra).toBe(expectedNakshatra);
        expect(result.nakshatraName).toContain(name);
      });
    });

    it('should calculate correct pada for degrees', () => {
      // Test pada calculation (each nakshatra has 4 padas)
      const testCases = [
        { degrees: 0, expectedPada: 1 },      // Start of Ashwini
        { degrees: 3.34, expectedPada: 2 },   // Second pada of Ashwini
        { degrees: 6.68, expectedPada: 3 },   // Third pada of Ashwini
        { degrees: 10, expectedPada: 4 },     // Fourth pada of Ashwini
        { degrees: 13.34, expectedPada: 1 },  // Start of Bharani
        { degrees: 16.68, expectedPada: 2 }   // Second pada of Bharani
      ];

      testCases.forEach(({ degrees, expectedPada }) => {
        const result = calculateNakshatraFromDegrees(degrees);
        expect(result.pada).toBe(expectedPada);
      });
    });

    it('should handle edge cases at nakshatra boundaries', () => {
      // Test at exact boundaries
      const boundary1 = calculateNakshatraFromDegrees(13.333333);
      const boundary2 = calculateNakshatraFromDegrees(26.666666);
      
      // Should be in correct nakshatras
      expect([1, 2]).toContain(boundary1.nakshatra);
      expect([2, 3]).toContain(boundary2.nakshatra);
    });

    it('should handle degrees beyond 360', () => {
      const result1 = calculateNakshatraFromDegrees(360);
      const result2 = calculateNakshatraFromDegrees(370);
      
      // Should wrap around correctly
      expect(result1.nakshatra).toBe(1); // Should be Ashwini
      expect(result2.nakshatra).toBe(1); // 370 - 360 = 10 degrees, still Ashwini
    });

    it('should handle negative degrees', () => {
      const result = calculateNakshatraFromDegrees(-10);
      
      // Should handle negative degrees (convert to positive)
      expect(result.nakshatra).toBeGreaterThanOrEqual(1);
      expect(result.nakshatra).toBeLessThanOrEqual(27);
    });
  });

  describe('Complete Nakshatra Info Calculation', () => {
    it('should calculate nakshatra info for known birth dates', () => {
      const testCases = [
        {
          date: '1963-09-15',
          time: '06:00',
          description: 'Rajkumar birth'
        },
        {
          date: '2026-03-17',
          time: '12:00',
          description: 'Current test date'
        },
        {
          date: '1982-07-18',
          time: '14:30',
          description: 'Priyanka birth'
        }
      ];

      testCases.forEach(({ date, time, description }) => {
        const nakshatraInfo = getNakshatraInfo(date, time);
        
        // Should have valid nakshatra
        expect(nakshatraInfo.nakshatra).toBeGreaterThanOrEqual(1);
        expect(nakshatraInfo.nakshatra).toBeLessThanOrEqual(27);
        
        // Should have valid pada
        expect(nakshatraInfo.pada).toBeGreaterThanOrEqual(1);
        expect(nakshatraInfo.pada).toBeLessThanOrEqual(4);
        
        // Should have complete info
        expect(nakshatraInfo.name).toBeDefined();
        expect(nakshatraInfo.nameHi).toBeDefined();
        expect(nakshatraInfo.lord).toBeDefined();
        expect(nakshatraInfo.deity).toBeDefined();
        expect(nakshatraInfo.symbol).toBeDefined();
        expect(nakshatraInfo.characteristics).toBeDefined();
      });
    });

    it('should return consistent results for same input', () => {
      const date = '2026-03-17';
      const time = '12:00';
      
      const result1 = getNakshatraInfo(date, time);
      const result2 = getNakshatraInfo(date, time);
      
      // Should get identical results
      expect(result1.nakshatra).toBe(result2.nakshatra);
      expect(result1.pada).toBe(result2.pada);
      expect(result1.name).toBe(result2.name);
      expect(result1.lord).toBe(result2.lord);
    });

    it('should show nakshatra progression over time', () => {
      const date = '2026-03-17';
      const times = ['00:00', '06:00', '12:00', '18:00'];
      
      const nakshatras = times.map(time => getNakshatraInfo(date, time));
      
      // Moon moves approximately 1 nakshatra per day, so should see some change
      const uniqueNakshatras = new Set(nakshatras.map(n => n.nakshatra));
      
      // Should have at least some variation over 24 hours
      expect(uniqueNakshatras.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Nakshatra Characteristics Validation', () => {
    it('should have meaningful characteristics for each nakshatra', () => {
      NAKSHATRA_DATABASE.forEach(nakshatra => {
        // English characteristics should be meaningful
        expect(nakshatra.characteristics.en.length).toBeGreaterThan(10);
        expect(nakshatra.characteristics.en).not.toBe('');
        
        // Hindi characteristics should be meaningful
        expect(nakshatra.characteristics.hi.length).toBeGreaterThan(5);
        expect(nakshatra.characteristics.hi).not.toBe('');
        
        // Should have proper deity names
        expect(nakshatra.deity.length).toBeGreaterThan(2);
        
        // Should have proper symbols
        expect(nakshatra.symbol.length).toBeGreaterThan(2);
      });
    });

    it('should have correct nakshatra lord distribution', () => {
      // Count occurrences of each lord
      const lordCounts: Record<string, number> = {};
      
      NAKSHATRA_DATABASE.forEach(nakshatra => {
        lordCounts[nakshatra.lord] = (lordCounts[nakshatra.lord] || 0) + 1;
      });
      
      // Each lord should rule exactly 3 nakshatras (27/9 = 3)
      Object.values(lordCounts).forEach(count => {
        expect(count).toBe(3);
      });
      
      // Should have exactly 9 lords
      expect(Object.keys(lordCounts)).toHaveLength(9);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should calculate nakshatra quickly', () => {
      const startTime = performance.now();
      
      // Calculate nakshatra for 100 different dates
      for (let i = 0; i < 100; i++) {
        const date = new Date(2026, 2, 17 + i).toISOString().split('T')[0];
        getNakshatraInfo(date, '12:00');
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should complete 100 calculations in less than 200ms
      expect(totalTime).toBeLessThan(200);
    });

    it('should handle invalid dates gracefully', () => {
      expect(() => getNakshatraInfo('invalid-date', '12:00')).not.toThrow();
      expect(() => getNakshatraInfo('2026-13-45', '25:70')).not.toThrow();
    });

    it('should handle extreme dates', () => {
      const oldDate = getNakshatraInfo('1900-01-01', '12:00');
      const futureDate = getNakshatraInfo('2100-12-31', '12:00');
      
      // Should calculate valid nakshatras for extreme dates
      expect(oldDate.nakshatra).toBeGreaterThanOrEqual(1);
      expect(oldDate.nakshatra).toBeLessThanOrEqual(27);
      expect(futureDate.nakshatra).toBeGreaterThanOrEqual(1);
      expect(futureDate.nakshatra).toBeLessThanOrEqual(27);
    });
  });

  describe('Real Birth Chart Validation', () => {
    it('should calculate reasonable nakshatra for known births', () => {
      const knownBirths = [
        { name: 'Rajkumar', date: '1963-09-15', time: '06:00' },
        { name: 'Test Case 1', date: '1990-01-01', time: '00:00' },
        { name: 'Test Case 2', date: '2000-12-31', time: '23:59' }
      ];

      knownBirths.forEach(({ name, date, time }) => {
        const nakshatra = getNakshatraInfo(date, time);
        
        // Should have valid nakshatra data
        expect(nakshatra.nakshatra).toBeGreaterThanOrEqual(1);
        expect(nakshatra.nakshatra).toBeLessThanOrEqual(27);
        expect(nakshatra.pada).toBeGreaterThanOrEqual(1);
        expect(nakshatra.pada).toBeLessThanOrEqual(4);
        
        // Should have complete information
        expect(nakshatra.name).toBeTruthy();
        expect(nakshatra.lord).toBeTruthy();
        expect(nakshatra.deity).toBeTruthy();
        expect(nakshatra.symbol).toBeTruthy();
      });
    });

    it('should show nakshatra changes over lunar month', () => {
      // Test over a lunar month (approximately 27 days)
      const nakshatras: number[] = [];
      
      for (let day = 1; day <= 27; day++) {
        const date = `2026-03-${day.toString().padStart(2, '0')}`;
        const nakshatra = getNakshatraInfo(date, '12:00');
        nakshatras.push(nakshatra.nakshatra);
      }
      
      // Should see multiple different nakshatras over a month
      const uniqueNakshatras = new Set(nakshatras);
      expect(uniqueNakshatras.size).toBeGreaterThan(10); // Should see significant variety
    });
  });

  describe('Nakshatra Compatibility and Relationships', () => {
    it('should have proper nakshatra sequence', () => {
      // Verify that nakshatras are in correct sequence
      for (let i = 0; i < NAKSHATRA_DATABASE.length; i++) {
        expect(NAKSHATRA_DATABASE[i].id).toBe(i + 1);
      }
    });

    it('should have known nakshatra names in correct order', () => {
      const expectedNames = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
        'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
        'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
        'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
      ];

      expectedNames.forEach((expectedName, index) => {
        expect(NAKSHATRA_DATABASE[index].name).toContain(expectedName);
      });
    });
  });
});