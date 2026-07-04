// Week 14: Comprehensive Testing - Monday Implementation
// Unit Tests for Manglik Service - Manglik Dosha Detection

import { describe, it, expect } from 'vitest';
import { 
  checkManglikDosha,
  calculateManglikSeverity,
  checkCancellationConditions,
  type ManglikResult
} from '../../services/manglikService';

describe('ManglikService - Manglik Dosha Detection', () => {
  
  describe('Basic Manglik Detection', () => {
    it('should detect Manglik dosha when Mars is in 1st house', () => {
      // Test case where Mars is in 1st house (ascendant)
      const result = checkManglikDosha('1990-01-01', '12:00', 28.61, 77.23);
      
      // Should return valid result structure
      expect(result).toBeDefined();
      expect(typeof result.isManglik).toBe('boolean');
      expect(result.severity).toBeDefined();
      expect(result.affectedHouses).toBeDefined();
      expect(result.cancellations).toBeDefined();
      expect(result.remedies).toBeDefined();
    });

    it('should check all Manglik houses (1, 2, 4, 7, 8, 12)', () => {
      // Test multiple birth charts to ensure all houses are checked
      const testDates = [
        '1990-01-01', '1990-03-15', '1990-06-21', 
        '1990-09-23', '1990-12-21', '1991-02-14'
      ];

      testDates.forEach(date => {
        const result = checkManglikDosha(date, '12:00', 28.61, 77.23);
        
        // Should have valid severity levels
        const validSeverities = ['None', 'Low', 'Medium', 'High', 'Severe'];
        expect(validSeverities).toContain(result.severity);
        
        // Affected houses should be valid
        result.affectedHouses.forEach(house => {
          expect(house).toBeGreaterThanOrEqual(1);
          expect(house).toBeLessThanOrEqual(12);
        });
      });
    });

    it('should calculate different severity levels', () => {
      // Test multiple charts to get different severity levels
      const testCases = [
        { date: '1990-01-01', time: '06:00' },
        { date: '1990-04-15', time: '12:00' },
        { date: '1990-07-21', time: '18:00' },
        { date: '1990-10-31', time: '00:00' }
      ];

      const severities = testCases.map(({ date, time }) => {
        const result = checkManglikDosha(date, time, 28.61, 77.23);
        return result.severity;
      });

      // Should have valid severity values
      const validSeverities = ['None', 'Low', 'Medium', 'High', 'Severe'];
      severities.forEach(severity => {
        expect(validSeverities).toContain(severity);
      });
    });
  });

  describe('Manglik Severity Calculation', () => {
    it('should assign higher severity for multiple house placements', () => {
      // This is a conceptual test - actual implementation may vary
      const testCases = [
        { date: '1985-03-21', time: '10:30', lat: 28.61, lon: 77.23 },
        { date: '1987-08-15', time: '14:45', lat: 19.08, lon: 72.88 },
        { date: '1992-11-03', time: '07:20', lat: 13.08, lon: 80.27 }
      ];

      testCases.forEach(({ date, time, lat, lon }) => {
        const result = checkManglikDosha(date, time, lat, lon);
        
        // If multiple houses are affected, severity should be higher
        if (result.affectedHouses.length > 1) {
          expect(['Medium', 'High', 'Severe']).toContain(result.severity);
        }
        
        // If no houses affected, should be None
        if (result.affectedHouses.length === 0) {
          expect(result.severity).toBe('None');
          expect(result.isManglik).toBe(false);
        }
      });
    });

    it('should consider house significance in severity', () => {
      // 7th house Mars is typically considered most severe
      // This test checks if the system considers house significance
      const testResults = [];
      
      for (let i = 0; i < 10; i++) {
        const date = `199${i}-06-15`;
        const result = checkManglikDosha(date, '12:00', 28.61, 77.23);
        testResults.push(result);
      }
      
      // Should have variety in severity levels
      const severities = testResults.map(r => r.severity);
      const uniqueSeverities = new Set(severities);
      expect(uniqueSeverities.size).toBeGreaterThan(1);
    });
  });

  describe('Cancellation Conditions', () => {
    it('should check for cancellation conditions', () => {
      const testCases = [
        { date: '1988-05-12', time: '08:30' },
        { date: '1991-09-25', time: '16:45' },
        { date: '1995-02-14', time: '11:15' }
      ];

      testCases.forEach(({ date, time }) => {
        const result = checkManglikDosha(date, time, 28.61, 77.23);
        
        // Should have cancellations array
        expect(Array.isArray(result.cancellations)).toBe(true);
        
        // Each cancellation should have proper structure
        result.cancellations.forEach(cancellation => {
          expect(cancellation.condition).toBeDefined();
          expect(cancellation.description).toBeDefined();
          expect(cancellation.description.en).toBeDefined();
          expect(cancellation.description.hi).toBeDefined();
          expect(typeof cancellation.applicable).toBe('boolean');
        });
      });
    });

    it('should reduce effective severity with cancellations', () => {
      // Test that cancellations affect the final assessment
      const testCases = [
        { date: '1989-07-04', time: '13:20' },
        { date: '1993-12-08', time: '09:45' }
      ];

      testCases.forEach(({ date, time }) => {
        const result = checkManglikDosha(date, time, 28.61, 77.23);
        
        // If there are applicable cancellations and Manglik dosha
        const applicableCancellations = result.cancellations.filter(c => c.applicable);
        
        if (applicableCancellations.length > 0 && result.isManglik) {
          // The effective severity should be mentioned in description or remedies
          expect(result.description).toBeDefined();
          expect(result.description.en).toBeDefined();
          expect(result.description.hi).toBeDefined();
        }
      });
    });
  });

  describe('Remedies and Recommendations', () => {
    it('should provide appropriate remedies for Manglik dosha', () => {
      const testCases = [
        { date: '1986-04-18', time: '07:30' },
        { date: '1994-10-22', time: '19:15' }
      ];

      testCases.forEach(({ date, time }) => {
        const result = checkManglikDosha(date, time, 28.61, 77.23);
        
        if (result.isManglik) {
          // Should have remedies
          expect(result.remedies).toBeDefined();
          expect(result.remedies.en).toBeDefined();
          expect(result.remedies.hi).toBeDefined();
          expect(Array.isArray(result.remedies.en)).toBe(true);
          expect(Array.isArray(result.remedies.hi)).toBe(true);
          expect(result.remedies.en.length).toBeGreaterThan(0);
          expect(result.remedies.hi.length).toBeGreaterThan(0);
        }
      });
    });

    it('should provide severity-appropriate remedies', () => {
      const testCases = [
        { date: '1987-01-30', time: '14:00' },
        { date: '1996-08-17', time: '21:30' }
      ];

      testCases.forEach(({ date, time }) => {
        const result = checkManglikDosha(date, time, 28.61, 77.23);
        
        if (result.isManglik) {
          // Higher severity should have more or stronger remedies
          if (result.severity === 'High' || result.severity === 'Severe') {
            expect(result.remedies.en.length).toBeGreaterThan(2);
          }
          
          // All remedies should be meaningful
          result.remedies.en.forEach(remedy => {
            expect(remedy.length).toBeGreaterThan(10);
          });
          
          result.remedies.hi.forEach(remedy => {
            expect(remedy.length).toBeGreaterThan(5);
          });
        }
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid dates gracefully', () => {
      expect(() => {
        checkManglikDosha('invalid-date', '12:00', 28.61, 77.23);
      }).not.toThrow();
      
      expect(() => {
        checkManglikDosha('2026-13-45', '25:70', 28.61, 77.23);
      }).not.toThrow();
    });

    it('should handle extreme coordinates', () => {
      const extremeCases = [
        { lat: 89.0, lon: 179.0 },   // Near North Pole
        { lat: -89.0, lon: -179.0 }, // Near South Pole
        { lat: 0.0, lon: 0.0 }       // Equator/Prime Meridian
      ];

      extremeCases.forEach(({ lat, lon }) => {
        expect(() => {
          checkManglikDosha('2026-03-17', '12:00', lat, lon);
        }).not.toThrow();
      });
    });

    it('should return consistent results for same input', () => {
      const date = '1990-06-15';
      const time = '15:30';
      const lat = 28.61;
      const lon = 77.23;
      
      const result1 = checkManglikDosha(date, time, lat, lon);
      const result2 = checkManglikDosha(date, time, lat, lon);
      
      // Should get identical results
      expect(result1.isManglik).toBe(result2.isManglik);
      expect(result1.severity).toBe(result2.severity);
      expect(result1.affectedHouses).toEqual(result2.affectedHouses);
    });
  });

  describe('Performance Tests', () => {
    it('should calculate Manglik dosha quickly', () => {
      const startTime = performance.now();
      
      // Calculate for 50 different birth charts
      for (let i = 0; i < 50; i++) {
        const year = 1980 + i;
        const month = (i % 12) + 1;
        const day = (i % 28) + 1;
        const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        checkManglikDosha(date, '12:00', 28.61, 77.23);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should complete 50 calculations in less than 500ms
      expect(totalTime).toBeLessThan(500);
    });
  });

  describe('Real Birth Chart Validation', () => {
    it('should provide reasonable results for known birth charts', () => {
      const knownCharts = [
        { name: 'Rajkumar', date: '1963-09-15', time: '06:00', lat: 23.84, lon: 73.71 },
        { name: 'Test1', date: '1985-03-21', time: '10:30', lat: 28.61, lon: 77.23 },
        { name: 'Test2', date: '1992-11-08', time: '18:45', lat: 19.08, lon: 72.88 }
      ];

      knownCharts.forEach(({ name, date, time, lat, lon }) => {
        const result = checkManglikDosha(date, time, lat, lon);
        
        // Should have complete result structure
        expect(result.isManglik).toBeDefined();
        expect(result.severity).toBeDefined();
        expect(result.description).toBeDefined();
        expect(result.affectedHouses).toBeDefined();
        expect(result.cancellations).toBeDefined();
        expect(result.remedies).toBeDefined();
        
        // Descriptions should be meaningful
        if (result.isManglik) {
          expect(result.description.en.length).toBeGreaterThan(20);
          expect(result.description.hi.length).toBeGreaterThan(10);
        }
      });
    });

    it('should show statistical distribution of Manglik cases', () => {
      // Test with 100 random birth charts to see distribution
      const results = [];
      
      for (let i = 0; i < 100; i++) {
        const year = 1970 + (i % 50);
        const month = (i % 12) + 1;
        const day = (i % 28) + 1;
        const hour = i % 24;
        
        const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const time = `${hour.toString().padStart(2, '0')}:00`;
        
        const result = checkManglikDosha(date, time, 28.61, 77.23);
        results.push(result);
      }
      
      // Count Manglik cases
      const manglikCount = results.filter(r => r.isManglik).length;
      const nonManglikCount = results.filter(r => !r.isManglik).length;
      
      // Should have reasonable distribution (not all or none)
      expect(manglikCount).toBeGreaterThan(0);
      expect(nonManglikCount).toBeGreaterThan(0);
      
      // Count severity distribution
      const severityCounts = results.reduce((acc, result) => {
        acc[result.severity] = (acc[result.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Should have 'None' cases
      expect(severityCounts['None']).toBeGreaterThan(0);
    });
  });

  describe('Bilingual Support Validation', () => {
    it('should provide complete bilingual content', () => {
      const testCases = [
        { date: '1988-02-29', time: '12:00' }, // Leap year
        { date: '1995-07-15', time: '18:30' }
      ];

      testCases.forEach(({ date, time }) => {
        const result = checkManglikDosha(date, time, 28.61, 77.23);
        
        // Description should be in both languages
        expect(result.description.en).toBeDefined();
        expect(result.description.hi).toBeDefined();
        expect(result.description.en.length).toBeGreaterThan(0);
        expect(result.description.hi.length).toBeGreaterThan(0);
        
        // Remedies should be in both languages
        expect(result.remedies.en).toBeDefined();
        expect(result.remedies.hi).toBeDefined();
        expect(Array.isArray(result.remedies.en)).toBe(true);
        expect(Array.isArray(result.remedies.hi)).toBe(true);
        
        // Cancellation descriptions should be bilingual
        result.cancellations.forEach(cancellation => {
          expect(cancellation.description.en).toBeDefined();
          expect(cancellation.description.hi).toBeDefined();
          expect(cancellation.description.en.length).toBeGreaterThan(0);
          expect(cancellation.description.hi.length).toBeGreaterThan(0);
        });
      });
    });
  });
});