// Week 14: Comprehensive Testing - Monday Implementation
// Unit Tests for Ascendant Service - Lagna and House Calculations

import { describe, it, expect } from 'vitest';
import { 
  calculateCompleteAscendant,
  calculateLocalSiderealTime,
  calculateHouseCusps,
  type AscendantData
} from '../../services/ascendantService';

describe('AscendantService - Lagna and House Calculations', () => {
  
  describe('Local Sidereal Time Calculation', () => {
    it('should calculate LST for known coordinates', () => {
      const testCases = [
        { 
          date: '2026-03-17', 
          time: '12:00', 
          lat: 28.61, 
          lon: 77.23, // Delhi
          description: 'Delhi coordinates'
        },
        { 
          date: '1963-09-15', 
          time: '06:00', 
          lat: 23.84, 
          lon: 73.71, // Aspur (Rajkumar's birthplace)
          description: 'Aspur coordinates'
        }
      ];

      testCases.forEach(({ date, time, lat, lon, description }) => {
        const lst = calculateLocalSiderealTime(date, time, lon);
        
        // LST should be between 0 and 24 hours
        expect(lst).toBeGreaterThanOrEqual(0);
        expect(lst).toBeLessThan(24);
      });
    });

    it('should show different LST for different longitudes', () => {
      const date = '2026-03-17';
      const time = '12:00';
      
      const lstDelhi = calculateLocalSiderealTime(date, time, 77.23); // Delhi
      const lstMumbai = calculateLocalSiderealTime(date, time, 72.88); // Mumbai
      
      // Should be different due to longitude difference
      expect(Math.abs(lstDelhi - lstMumbai)).toBeGreaterThan(0.1);
    });
  });

  describe('Ascendant Calculation', () => {
    it('should calculate valid ascendant for known locations', () => {
      const testCases = [
        {
          date: '1963-09-15',
          time: '06:00',
          lat: 23.84,
          lon: 73.71,
          description: 'Rajkumar birth data'
        },
        {
          date: '2026-03-17',
          time: '12:00',
          lat: 28.61,
          lon: 77.23,
          description: 'Delhi test case'
        }
      ];

      testCases.forEach(({ date, time, lat, lon, description }) => {
        const ascendantData = calculateCompleteAscendant(date, time, lat, lon);
        
        // Ascendant should have valid rashi
        expect(ascendantData.ascendant.rashiIndex).toBeGreaterThanOrEqual(0);
        expect(ascendantData.ascendant.rashiIndex).toBeLessThanOrEqual(11);
        
        // Degrees should be valid
        expect(ascendantData.ascendant.degrees).toBeGreaterThanOrEqual(0);
        expect(ascendantData.ascendant.degrees).toBeLessThan(30);
        
        // Should have rashi name
        expect(ascendantData.ascendant.rashiName).toBeDefined();
        expect(ascendantData.ascendant.rashiName.length).toBeGreaterThan(0);
      });
    });

    it('should calculate different ascendants for different times', () => {
      const date = '2026-03-17';
      const lat = 28.61;
      const lon = 77.23;
      
      const morning = calculateCompleteAscendant(date, '06:00', lat, lon);
      const evening = calculateCompleteAscendant(date, '18:00', lat, lon);
      
      // Ascendant should change over 12 hours (approximately 6 rashis)
      const rashiDiff = Math.abs(morning.ascendant.rashiIndex - evening.ascendant.rashiIndex);
      expect(rashiDiff).toBeGreaterThan(2); // Should change significantly
    });

    it('should calculate different ascendants for different latitudes', () => {
      const date = '2026-03-17';
      const time = '12:00';
      const lon = 77.23;
      
      const northIndia = calculateCompleteAscendant(date, time, 30.0, lon); // North
      const southIndia = calculateCompleteAscendant(date, time, 10.0, lon); // South
      
      // Should be different due to latitude effect
      const totalDegrees1 = northIndia.ascendant.rashiIndex * 30 + northIndia.ascendant.degrees;
      const totalDegrees2 = southIndia.ascendant.rashiIndex * 30 + southIndia.ascendant.degrees;
      
      expect(Math.abs(totalDegrees1 - totalDegrees2)).toBeGreaterThan(0.1);
    });
  });

  describe('House Cusp Calculation', () => {
    it('should calculate 12 house cusps', () => {
      const ascendantData = calculateCompleteAscendant('2026-03-17', '12:00', 28.61, 77.23);
      
      // Should have 12 houses
      expect(ascendantData.houses).toHaveLength(12);
      
      // Each house should have valid data
      ascendantData.houses.forEach((house, index) => {
        expect(house.houseNumber).toBe(index + 1);
        expect(house.rashiIndex).toBeGreaterThanOrEqual(0);
        expect(house.rashiIndex).toBeLessThanOrEqual(11);
        expect(house.degrees).toBeGreaterThanOrEqual(0);
        expect(house.degrees).toBeLessThan(30);
        expect(house.rashiName).toBeDefined();
        expect(house.lord).toBeDefined();
      });
    });

    it('should have 1st house cusp equal to ascendant', () => {
      const ascendantData = calculateCompleteAscendant('2026-03-17', '12:00', 28.61, 77.23);
      
      const firstHouse = ascendantData.houses[0];
      const ascendant = ascendantData.ascendant;
      
      expect(firstHouse.rashiIndex).toBe(ascendant.rashiIndex);
      expect(Math.abs(firstHouse.degrees - ascendant.degrees)).toBeLessThan(0.1);
    });

    it('should have houses in correct sequence', () => {
      const ascendantData = calculateCompleteAscendant('2026-03-17', '12:00', 28.61, 77.23);
      
      // In equal house system, each house should be 30 degrees apart
      for (let i = 1; i < 12; i++) {
        const prevHouse = ascendantData.houses[i - 1];
        const currentHouse = ascendantData.houses[i];
        
        const prevDegrees = prevHouse.rashiIndex * 30 + prevHouse.degrees;
        const currentDegrees = currentHouse.rashiIndex * 30 + currentHouse.degrees;
        
        let diff = (currentDegrees - prevDegrees + 360) % 360;
        expect(Math.abs(diff - 30)).toBeLessThan(1); // Should be approximately 30 degrees
      }
    });
  });

  describe('House Lords Calculation', () => {
    it('should assign correct house lords', () => {
      const ascendantData = calculateCompleteAscendant('2026-03-17', '12:00', 28.61, 77.23);
      
      // Known house lordships
      const expectedLords = [
        'Mars',     // Aries
        'Venus',    // Taurus
        'Mercury',  // Gemini
        'Moon',     // Cancer
        'Sun',      // Leo
        'Mercury',  // Virgo
        'Venus',    // Libra
        'Mars',     // Scorpio
        'Jupiter',  // Sagittarius
        'Saturn',   // Capricorn
        'Saturn',   // Aquarius
        'Jupiter'   // Pisces
      ];

      ascendantData.houses.forEach(house => {
        const expectedLord = expectedLords[house.rashiIndex];
        expect(house.lord).toBe(expectedLord);
      });
    });

    it('should have valid house lord for each house', () => {
      const ascendantData = calculateCompleteAscendant('2026-03-17', '12:00', 28.61, 77.23);
      
      const validLords = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
      
      ascendantData.houses.forEach(house => {
        expect(validLords).toContain(house.lord);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle extreme latitudes', () => {
      // Test with polar regions
      const arctic = calculateCompleteAscendant('2026-06-21', '12:00', 80.0, 0.0);
      const antarctic = calculateCompleteAscendant('2026-12-21', '12:00', -80.0, 0.0);
      
      // Should still calculate valid ascendants
      expect(arctic.ascendant.rashiIndex).toBeGreaterThanOrEqual(0);
      expect(antarctic.ascendant.rashiIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle date line crossing', () => {
      // Test with coordinates near international date line
      const eastOfDateLine = calculateCompleteAscendant('2026-03-17', '12:00', 0.0, 179.0);
      const westOfDateLine = calculateCompleteAscendant('2026-03-17', '12:00', 0.0, -179.0);
      
      // Should calculate valid ascendants
      expect(eastOfDateLine.ascendant.rashiIndex).toBeGreaterThanOrEqual(0);
      expect(westOfDateLine.ascendant.rashiIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle invalid coordinates gracefully', () => {
      // Should not throw errors for invalid inputs
      expect(() => {
        calculateCompleteAscendant('2026-03-17', '12:00', 91.0, 181.0);
      }).not.toThrow();
      
      expect(() => {
        calculateCompleteAscendant('invalid-date', 'invalid-time', 0, 0);
      }).not.toThrow();
    });
  });

  describe('Performance and Consistency Tests', () => {
    it('should calculate ascendant quickly', () => {
      const startTime = performance.now();
      
      // Calculate ascendant for 50 different coordinates
      for (let i = 0; i < 50; i++) {
        const lat = 10 + (i * 0.5); // Vary latitude
        const lon = 70 + (i * 0.3); // Vary longitude
        calculateCompleteAscendant('2026-03-17', '12:00', lat, lon);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should complete 50 calculations in less than 500ms
      expect(totalTime).toBeLessThan(500);
    });

    it('should give consistent results for same input', () => {
      const date = '2026-03-17';
      const time = '12:00';
      const lat = 28.61;
      const lon = 77.23;
      
      const result1 = calculateCompleteAscendant(date, time, lat, lon);
      const result2 = calculateCompleteAscendant(date, time, lat, lon);
      
      // Should get identical results
      expect(result1.ascendant.rashiIndex).toBe(result2.ascendant.rashiIndex);
      expect(Math.abs(result1.ascendant.degrees - result2.ascendant.degrees)).toBeLessThan(0.001);
      
      // Houses should also match
      result1.houses.forEach((house1, index) => {
        const house2 = result2.houses[index];
        expect(house1.rashiIndex).toBe(house2.rashiIndex);
        expect(Math.abs(house1.degrees - house2.degrees)).toBeLessThan(0.001);
      });
    });
  });

  describe('Real Birth Chart Validation', () => {
    it('should calculate reasonable ascendant for Rajkumar', () => {
      // Rajkumar's birth data
      const ascendantData = calculateCompleteAscendant('1963-09-15', '06:00', 23.84, 73.71);
      
      // Should have valid ascendant
      expect(ascendantData.ascendant.rashiIndex).toBeGreaterThanOrEqual(0);
      expect(ascendantData.ascendant.rashiIndex).toBeLessThanOrEqual(11);
      
      // Should have all 12 houses
      expect(ascendantData.houses).toHaveLength(12);
      
      // Each house should have valid lord
      const validLords = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
      ascendantData.houses.forEach(house => {
        expect(validLords).toContain(house.lord);
      });
    });

    it('should show ascendant progression over time', () => {
      const date = '2026-03-17';
      const lat = 28.61;
      const lon = 77.23;
      
      const times = ['00:00', '06:00', '12:00', '18:00'];
      const ascendants = times.map(time => 
        calculateCompleteAscendant(date, time, lat, lon).ascendant
      );
      
      // Ascendant should progress through the day
      // Each 6-hour period should show significant change
      for (let i = 1; i < ascendants.length; i++) {
        const prev = ascendants[i - 1];
        const curr = ascendants[i];
        
        const prevDegrees = prev.rashiIndex * 30 + prev.degrees;
        const currDegrees = curr.rashiIndex * 30 + curr.degrees;
        
        const diff = Math.abs(currDegrees - prevDegrees);
        expect(diff).toBeGreaterThan(30); // Should change by more than 1 rashi in 6 hours
      }
    });
  });
});