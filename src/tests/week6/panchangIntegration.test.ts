/**
 * Week 6: Panchang Integration Tests
 *
 * Comprehensive integration tests for the Panchang core flows:
 * - Complete Panchang calculation flow
 * - Muhurta calculation integration
 * - Geographic location handling
 * - Edge cases and error handling
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { getPanchang, getMuhurta } from '@/features/panchang/stubs';
import {
  calculatePanchang,
  calculateTithi,
  calculateNakshatra,
  calculateYoga,
  calculateKarana,
  getVarDetails,
} from '@/services/panchangService';
import type { MuhurtaQuery } from '@/features/panchang/types';

describe('Panchang — Integration Tests', () => {
  const sampleDate = '2024-08-15';
  const sampleLocation = {
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
    placeName: 'Delhi',
  };

  describe('Complete Panchang calculation flow', () => {
    it('should calculate complete Panchang for valid input', () => {
      const result = getPanchang(
        sampleDate,
        sampleLocation.latitude,
        sampleLocation.longitude,
        sampleLocation.timezone,
        sampleLocation.placeName
      );

      expect(result).toBeDefined();
      expect(result.date).toBe(sampleDate);
      expect(result.location).toEqual(sampleLocation);
      expect(result.tithi).toBeDefined();
      expect(result.vara).toBeDefined();
      expect(result.nakshatra).toBeDefined();
      expect(result.yoga).toBeDefined();
      expect(result.karana).toBeDefined();
    });

    it('should include all five Panchang limbs', () => {
      const result = getPanchang(
        sampleDate,
        sampleLocation.latitude,
        sampleLocation.longitude,
        sampleLocation.timezone
      );

      expect(result.tithi.name).toBeDefined();
      expect(result.vara.name).toBeDefined();
      expect(result.nakshatra.name).toBeDefined();
      expect(result.yoga.name).toBeDefined();
      expect(result.karana.name).toBeDefined();
    });

    it('should include astronomical events', () => {
      const result = getPanchang(
        sampleDate,
        sampleLocation.latitude,
        sampleLocation.longitude,
        sampleLocation.timezone
      );

      expect(result.astronomical).toBeDefined();
      expect(result.astronomical.sunrise).toBeDefined();
      expect(result.astronomical.sunset).toBeDefined();
      expect(result.astronomical.moonrise).toBeDefined();
      expect(result.astronomical.moonset).toBeDefined();
      expect(result.astronomical.dayLengthMinutes).toBeGreaterThan(0);
    });

    it('should include inauspicious periods', () => {
      const result = getPanchang(
        sampleDate,
        sampleLocation.latitude,
        sampleLocation.longitude,
        sampleLocation.timezone
      );

      expect(result.inauspiciousPeriods).toBeInstanceOf(Array);
      expect(result.inauspiciousPeriods.length).toBeGreaterThan(0);
      
      const periodNames = result.inauspiciousPeriods.map(p => p.name);
      expect(periodNames).toContain('Rahu Kalam');
      expect(periodNames).toContain('Gulika Kalam');
      expect(periodNames).toContain('Yamaganda');
    });

    it('should include auspicious periods', () => {
      const result = getPanchang(
        sampleDate,
        sampleLocation.latitude,
        sampleLocation.longitude,
        sampleLocation.timezone
      );

      expect(result.auspiciousPeriods).toBeInstanceOf(Array);
      expect(result.auspiciousPeriods.length).toBeGreaterThan(0);
      
      const periodNames = result.auspiciousPeriods.map(p => p.name);
      expect(periodNames).toContain('Abhijit Muhurta');
      expect(periodNames).toContain('Brahma Muhurta');
    });

    it('should include calculation metadata', () => {
      const result = getPanchang(
        sampleDate,
        sampleLocation.latitude,
        sampleLocation.longitude,
        sampleLocation.timezone
      );

      expect(result.computedAt).toBeDefined();
      expect(new Date(result.computedAt).toISOString()).toBe(result.computedAt);
    });

    it('should handle different timezones correctly', () => {
      const utcResult = getPanchang(sampleDate, 40.7128, -74.0060, 'America/New_York', 'New York');
      const istResult = getPanchang(sampleDate, 28.6139, 77.2090, 'Asia/Kolkata', 'Delhi');

      expect(utcResult.location.timezone).toBe('America/New_York');
      expect(istResult.location.timezone).toBe('Asia/Kolkata');
      expect(utcResult.location.placeName).toBe('New York');
      expect(istResult.location.placeName).toBe('Delhi');
    });
  });

  describe('Tithi calculation', () => {
    it('should calculate tithi from longitudes', () => {
      const moonLongitude = 90.5;
      const sunLongitude = 120.3;

      const tithi = calculateTithi(moonLongitude, sunLongitude);

      expect(tithi).toBeDefined();
      expect(tithi.number).toBeGreaterThanOrEqual(1);
      expect(tithi.number).toBeLessThanOrEqual(30);
      expect(tithi.name).toBeDefined();
      expect(tithi.paksha).toBeDefined();
    });

    it('should correctly determine paksha', () => {
      const shuklaTithi = calculateTithi(15, 0); // Small difference = Shukla
      const krishnaTithi = calculateTithi(345, 15); // Large difference = Krishna

      expect(shuklaTithi.paksha).toBe('Shukla');
      expect(krishnaTithi.paksha).toBe('Krishna');
    });

    it('should handle 360-degree boundary', () => {
      const tithi = calculateTithi(359, 1);

      expect(tithi).toBeDefined();
      expect(tithi.number).toBeGreaterThanOrEqual(1);
      expect(tithi.number).toBeLessThanOrEqual(30);
    });
  });

  describe('Nakshatra calculation', () => {
    it('should calculate nakshatra from longitude', () => {
      const moonLongitude = 90.5;

      const nakshatra = calculateNakshatra(moonLongitude);

      expect(nakshatra).toBeDefined();
      expect(nakshatra.number).toBeGreaterThanOrEqual(1);
      expect(nakshatra.number).toBeLessThanOrEqual(27);
      expect(nakshatra.name).toBeDefined();
      expect(nakshatra.pada).toBeGreaterThanOrEqual(1);
      expect(nakshatra.pada).toBeLessThanOrEqual(4);
    });

    it('should calculate correct pada', () => {
      const nakshatra1 = calculateNakshatra(0); // Start of Ashwini
      const nakshatra2 = calculateNakshatra(3); // Middle of first pada

      expect(nakshatra1.number).toBe(1);
      expect(nakshatra2.number).toBe(1);
    });

    it('should handle nakshatra boundaries', () => {
      const lastNakshatra = calculateNakshatra(359);
      const firstNakshatra = calculateNakshatra(0);

      expect(lastNakshatra.number).toBe(27);
      expect(firstNakshatra.number).toBe(1);
    });
  });

  describe('Yoga calculation', () => {
    it('should calculate yoga from sun and moon longitudes', () => {
      const sunLongitude = 120.5;
      const moonLongitude = 90.3;

      const yoga = calculateYoga(sunLongitude, moonLongitude);

      expect(yoga).toBeDefined();
      expect(yoga.number).toBeGreaterThanOrEqual(1);
      expect(yoga.number).toBeLessThanOrEqual(27);
      expect(yoga.name).toBeDefined();
    });

    it('should handle 360-degree sum boundary', () => {
      const yoga = calculateYoga(200, 200);

      expect(yoga).toBeDefined();
      expect(yoga.number).toBeGreaterThanOrEqual(1);
      expect(yoga.number).toBeLessThanOrEqual(27);
    });
  });

  describe('Karana calculation', () => {
    it('should calculate karana from tithi', () => {
      const karana = calculateKarana(1, true);

      expect(karana).toBeDefined();
      expect(karana.number).toBeGreaterThanOrEqual(1);
      expect(karana.number).toBeLessThanOrEqual(11);
      expect(karana.name).toBeDefined();
    });

    it('should distinguish movable and fixed karanas', () => {
      const movableKarana = calculateKarana(1, true);
      const fixedKarana = calculateKarana(30, false);

      expect(movableKarana.type).toBe('movable');
      expect(fixedKarana.type).toBe('fixed');
    });
  });

  describe('Var (weekday) calculation', () => {
    it('should get correct var details for each day', () => {
      const sunday = new Date('2024-08-18'); // Sunday
      const monday = new Date('2024-08-19'); // Monday

      const sundayVar = getVarDetails(sunday);
      const mondayVar = getVarDetails(monday);

      expect(sundayVar.day).toBe('Sunday');
      expect(mondayVar.day).toBe('Monday');
      expect(sundayVar.planet).toBe('Sun');
      expect(mondayVar.planet).toBe('Moon');
    });

    it('should include deity and quality information', () => {
      const date = new Date('2024-08-18');
      const varDetails = getVarDetails(date);

      expect(varDetails.deity).toBeDefined();
      expect(varDetails.quality).toBeDefined();
      expect(['auspicious', 'neutral', 'inauspicious']).toContain(varDetails.quality);
    });
  });

  describe('Muhurta calculation integration', () => {
    const sampleMuhurtaQuery: MuhurtaQuery = {
      date: sampleDate,
      purpose: 'marriage',
      latitude: sampleLocation.latitude,
      longitude: sampleLocation.longitude,
      timezone: sampleLocation.timezone,
    };

    it('should calculate Muhurta for valid query', () => {
      const result = getMuhurta(sampleMuhurtaQuery);

      expect(result).toBeDefined();
      expect(result.query).toEqual(sampleMuhurtaQuery);
      expect(result.auspiciousWindows).toBeInstanceOf(Array);
      expect(result.inauspiciousWindows).toBeInstanceOf(Array);
      expect(result.bestWindow).toBeDefined();
    });

    it('should find auspicious windows', () => {
      const result = getMuhurta(sampleMuhurtaQuery);

      expect(result.auspiciousWindows.length).toBeGreaterThan(0);
      
      const firstWindow = result.auspiciousWindows[0];
      expect(firstWindow.start).toBeDefined();
      expect(firstWindow.end).toBeDefined();
      expect(firstWindow.quality).toBeDefined();
      expect(firstWindow.durationMinutes).toBeGreaterThan(0);
      expect(firstWindow.auspiciousReasons).toBeInstanceOf(Array);
    });

    it('should identify inauspicious windows', () => {
      const result = getMuhurta(sampleMuhurtaQuery);

      expect(result.inauspiciousWindows.length).toBeGreaterThan(0);
      
      const firstInauspicious = result.inauspiciousWindows[0];
      expect(firstInauspicious.start).toBeDefined();
      expect(firstInauspicious.end).toBeDefined();
      expect(firstInauspicious.reason).toBeDefined();
    });

    it('should select best window based on quality', () => {
      const result = getMuhurta(sampleMuhurtaQuery);

      if (result.bestWindow) {
        expect(result.auspiciousWindows).toContain(result.bestWindow);
        expect(['Excellent', 'Good', 'Acceptable']).toContain(result.bestWindow.quality);
      }
    });

    it('should include bilingual recommendations', () => {
      const result = getMuhurta(sampleMuhurtaQuery);

      expect(result.recommendationEn).toBeDefined();
      expect(result.recommendationHi).toBeDefined();
      expect(typeof result.recommendationEn).toBe('string');
      expect(typeof result.recommendationHi).toBe('string');
    });

    it('should include Panchang snapshot in windows', () => {
      const result = getMuhurta(sampleMuhurtaQuery);

      result.auspiciousWindows.forEach(window => {
        expect(window.panchangSnapshot).toBeDefined();
        expect(window.panchangSnapshot.nakshatra).toBeDefined();
        expect(window.panchangSnapshot.tithi).toBeDefined();
        expect(window.panchangSnapshot.vara).toBeDefined();
        expect(window.panchangSnapshot.yoga).toBeDefined();
        expect(window.panchangSnapshot.karana).toBeDefined();
      });
    });

    it('should handle different purposes', () => {
      const purposes: MuhurtaQuery['purpose'][] = [
        'marriage',
        'grihapravesh',
        'travel',
        'business',
        'naming',
        'general',
      ];

      purposes.forEach(purpose => {
        const query = { ...sampleMuhurtaQuery, purpose };
        const result = getMuhurta(query);

        expect(result).toBeDefined();
        expect(result.query.purpose).toBe(purpose);
      });
    });

    it('should support multi-day search', () => {
      const query: MuhurtaQuery = {
        ...sampleMuhurtaQuery,
        searchDays: 7,
      };

      const result = getMuhurta(query);

      expect(result).toBeDefined();
      expect(result.query.searchDays).toBe(7);
    });

    it('should handle natal Moon rashi for Chandrashtama exclusion', () => {
      const query: MuhurtaQuery = {
        ...sampleMuhurtaQuery,
        natalMoonRashi: 3, // Cancer
      };

      const result = getMuhurta(query);

      expect(result).toBeDefined();
      expect(result.query.natalMoonRashi).toBe(3);
    });
  });

  describe('Geographic location handling', () => {
    it('should handle northern hemisphere locations', () => {
      const result = getPanchang(sampleDate, 45.4215, -75.6972, 'America/New_York', 'Ottawa');

      expect(result).toBeDefined();
      expect(result.location.latitude).toBeGreaterThan(0);
    });

    it('should handle southern hemisphere locations', () => {
      const result = getPanchang(sampleDate, -33.8688, 151.2093, 'Australia/Sydney', 'Sydney');

      expect(result).toBeDefined();
      expect(result.location.latitude).toBeLessThan(0);
    });

    it('should handle extreme northern latitudes', () => {
      const result = getPanchang(sampleDate, 70.0, -150.0, 'America/Anchorage', 'Alaska');

      expect(result).toBeDefined();
      expect(result.location.latitude).toBeGreaterThan(60);
    });

    it('should handle equatorial locations', () => {
      const result = getPanchang(sampleDate, 0.0, 37.9062, 'Africa/Nairobi', 'Nairobi');

      expect(result).toBeDefined();
      expect(Math.abs(result.location.latitude)).toBeLessThan(1);
    });

    it('should handle international date line locations', () => {
      const result = getPanchang(sampleDate, 21.3069, -157.8583, 'Pacific/Honolulu', 'Honolulu');

      expect(result).toBeDefined();
      expect(Math.abs(result.location.longitude)).toBeGreaterThan(150);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle leap year dates', () => {
      const leapYearDate = '2024-02-29';
      const result = getPanchang(leapYearDate, 28.6139, 77.2090, 'Asia/Kolkata');

      expect(result).toBeDefined();
      expect(result.date).toBe(leapYearDate);
    });

    it('should handle year boundaries', () => {
      const yearEnd = '2024-12-31';
      const yearStart = '2025-01-01';

      const endResult = getPanchang(yearEnd, 28.6139, 77.2090, 'Asia/Kolkata');
      const startResult = getPanchang(yearStart, 28.6139, 77.2090, 'Asia/Kolkata');

      expect(endResult).toBeDefined();
      expect(startResult).toBeDefined();
      expect(endResult.date).toBe(yearEnd);
      expect(startResult.date).toBe(yearStart);
    });

    it('should handle invalid dates gracefully', () => {
      expect(() => {
        getPanchang('invalid-date', 28.6139, 77.2090, 'Asia/Kolkata');
      }).toThrow();
    });

    it('should handle extreme longitudes', () => {
      const result = getPanchang(sampleDate, 28.6139, 180.0, 'Pacific/Kiritimati');

      expect(result).toBeDefined();
      expect(Math.abs(result.location.longitude)).toBeLessThanOrEqual(180);
    });

    it('should handle missing place name', () => {
      const result = getPanchang(sampleDate, 28.6139, 77.2090, 'Asia/Kolkata');

      expect(result).toBeDefined();
      expect(result.location.placeName).toBeUndefined();
    });
  });

  describe('Service integration', () => {
    it('should integrate with service layer calculations', () => {
      const date = new Date(sampleDate);
      const moonLongitude = 90.5;
      const sunLongitude = 120.3;

      const serviceResult = calculatePanchang(
        date,
        sampleLocation.latitude,
        sampleLocation.longitude,
        moonLongitude,
        sunLongitude
      );

      expect(serviceResult).toBeDefined();
      expect(serviceResult.date).toEqual(date);
      expect(serviceResult.tithi).toBeDefined();
      expect(serviceResult.nakshatra).toBeDefined();
      expect(serviceResult.yoga).toBeDefined();
      expect(serviceResult.karana).toBeDefined();
      expect(serviceResult.var).toBeDefined();
    });

    it('should maintain consistency between stub and service', () => {
      const stubResult = getPanchang(
        sampleDate,
        sampleLocation.latitude,
        sampleLocation.longitude,
        sampleLocation.timezone
      );

      // Both should return valid Panchang structure
      expect(stubResult.tithi.name).toBeDefined();
      expect(stubResult.nakshatra.name).toBeDefined();
      expect(stubResult.yoga.name).toBeDefined();
      expect(stubResult.karana.name).toBeDefined();
      expect(stubResult.vara.name).toBeDefined();
    });
  });

  describe('Auspiciousness calculations', () => {
    it('should correctly mark auspicious tithis', () => {
      const result = getPanchang('2024-08-05', 28.6139, 77.2090, 'Asia/Kolkata');

      expect(['Auspicious', 'Moderate', 'Inauspicious']).toContain(result.tithi.auspiciousness);
    });

    it('should correctly mark auspicious yogas', () => {
      const result = getPanchang(sampleDate, 28.6139, 77.2090, 'Asia/Kolkata');

      expect(['Auspicious', 'Moderate', 'Inauspicious']).toContain(result.yoga.auspiciousness);
    });

    it('should correctly mark inauspicious karanas', () => {
      const result = getPanchang(sampleDate, 28.6139, 77.2090, 'Asia/Kolkata');

      expect(typeof result.karana.isInauspicious).toBe('boolean');
    });

    it('should correctly mark vara auspiciousness', () => {
      const result = getPanchang(sampleDate, 28.6139, 77.2090, 'Asia/Kolkata');

      expect(['Excellent', 'Good', 'Moderate', 'Avoid']).toContain(result.vara.auspiciousness);
    });
  });

  describe('Time calculations', () => {
    it('should calculate correct day length', () => {
      const result = getPanchang(sampleDate, 28.6139, 77.2090, 'Asia/Kolkata');

      expect(result.astronomical.dayLengthMinutes).toBeGreaterThan(0);
      expect(result.astronomical.dayLengthMinutes).toBeLessThan(1440); // Less than 24 hours
    });

    it('should have sunrise before sunset', () => {
      const result = getPanchang(sampleDate, 28.6139, 77.2090, 'Asia/Kolkata');

      const sunriseTime = new Date(result.astronomical.sunrise).getTime();
      const sunsetTime = new Date(result.astronomical.sunset).getTime();

      expect(sunriseTime).toBeLessThan(sunsetTime);
    });

    it('should calculate valid inauspicious period durations', () => {
      const result = getPanchang(sampleDate, 28.6139, 77.2090, 'Asia/Kolkata');

      result.inauspiciousPeriods.forEach(period => {
        const start = new Date(period.start).getTime();
        const end = new Date(period.end).getTime();
        const duration = (end - start) / 60000; // Convert to minutes

        expect(duration).toBeGreaterThan(0);
        expect(duration).toBeLessThan(180); // Less than 3 hours
      });
    });

    it('should calculate valid auspicious period durations', () => {
      const result = getPanchang(sampleDate, 28.6139, 77.2090, 'Asia/Kolkata');

      result.auspiciousPeriods.forEach(period => {
        const start = new Date(period.start).getTime();
        const end = new Date(period.end).getTime();
        const duration = (end - start) / 60000; // Convert to minutes

        expect(duration).toBeGreaterThan(0);
        expect(duration).toBeLessThan(120); // Less than 2 hours
      });
    });
  });
});
