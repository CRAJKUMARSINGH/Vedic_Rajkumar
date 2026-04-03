/**
 * Kundli Service - Complete 12-House Birth Chart System
 * Week 11: AstroSage Feature Integration - Part 1
 * 
 * Provides comprehensive kundli/birth chart calculations and visualization data
 * Supports both North Indian and South Indian chart styles
 */

import { calculateCompletePlanetaryPositions, type PlanetPosition } from './ephemerisService';
import { calculateCompleteAscendant, type AscendantData } from './ascendantService';

// Kundli chart styles
export type ChartStyle = 'north-indian' | 'south-indian';

// House information
export interface HouseInfo {
  houseNumber: number;
  rashi: number;
  rashiName: string;
  rashiNameHi: string;
  lord: string;
  lordHi: string;
  planets: PlanetPosition[];
  degrees: number;
  significance: string;
  significanceHi: string;
}

// Complete kundli data structure
export interface KundliData {
  ascendant: AscendantData;
  houses: HouseInfo[];
  planets: PlanetPosition[];
  chartStyle: ChartStyle;
  aspectsData: AspectInfo[];
  dignityData: DignityInfo[];
}

// Planetary aspects
export interface AspectInfo {
  planet: string;
  aspectingHouses: number[];
  aspectingPlanets: string[];
  aspectType: 'full' | 'partial';
  strength: number;
}

// Planetary dignities
export interface DignityInfo {
  planet: string;
  dignity: 'exalted' | 'debilitated' | 'own-sign' | 'moolatrikona' | 'friend' | 'enemy' | 'neutral';
  strength: number;
  description: string;
  descriptionHi: string;
}

// Rashi names and lords
const RASHI_DATA = [
  { name: 'Aries', nameHi: 'मेष', lord: 'Mars', lordHi: 'मंगल' },
  { name: 'Taurus', nameHi: 'वृषभ', lord: 'Venus', lordHi: 'शुक्र' },
  { name: 'Gemini', nameHi: 'मिथुन', lord: 'Mercury', lordHi: 'बुध' },
  { name: 'Cancer', nameHi: 'कर्क', lord: 'Moon', lordHi: 'चंद्र' },
  { name: 'Leo', nameHi: 'सिंह', lord: 'Sun', lordHi: 'सूर्य' },
  { name: 'Virgo', nameHi: 'कन्या', lord: 'Mercury', lordHi: 'बुध' },
  { name: 'Libra', nameHi: 'तुला', lord: 'Venus', lordHi: 'शुक्र' },
  { name: 'Scorpio', nameHi: 'वृश्चिक', lord: 'Mars', lordHi: 'मंगल' },
  { name: 'Sagittarius', nameHi: 'धनु', lord: 'Jupiter', lordHi: 'गुरु' },
  { name: 'Capricorn', nameHi: 'मकर', lord: 'Saturn', lordHi: 'शनि' },
  { name: 'Aquarius', nameHi: 'कुंभ', lord: 'Saturn', lordHi: 'शनि' },
  { name: 'Pisces', nameHi: 'मीन', lord: 'Jupiter', lordHi: 'गुरु' }
];

// House significance
const HOUSE_SIGNIFICANCE = [
  { en: 'Self, Personality, Health', hi: 'स्वयं, व्यक्तित्व, स्वास्थ्य' },
  { en: 'Wealth, Family, Speech', hi: 'धन, परिवार, वाणी' },
  { en: 'Siblings, Courage, Communication', hi: 'भाई-बहन, साहस, संचार' },
  { en: 'Mother, Home, Happiness', hi: 'माता, घर, सुख' },
  { en: 'Children, Education, Intelligence', hi: 'संतान, शिक्षा, बुद्धि' },
  { en: 'Enemies, Disease, Service', hi: 'शत्रु, रोग, सेवा' },
  { en: 'Marriage, Partnership, Business', hi: 'विवाह, साझेदारी, व्यापार' },
  { en: 'Longevity, Transformation, Occult', hi: 'आयु, परिवर्तन, गुप्त विद्या' },
  { en: 'Fortune, Religion, Higher Learning', hi: 'भाग्य, धर्म, उच्च शिक्षा' },
  { en: 'Career, Fame, Authority', hi: 'करियर, प्रसिद्धि, अधिकार' },
  { en: 'Gains, Friends, Aspirations', hi: 'लाभ, मित्र, आकांक्षाएं' },
  { en: 'Loss, Expenses, Spirituality', hi: 'हानि, व्यय, आध्यात्म' }
];

/**
 * Calculate complete kundli data
 */
export function calculateKundli(
  date: string,
  time: string,
  latitude: number,
  longitude: number,
  chartStyle: ChartStyle = 'north-indian'
): KundliData {
  // Calculate ascendant and houses
  const ascendant = calculateCompleteAscendant(date, time, latitude, longitude);
  
  // Calculate planetary positions
  const planetaryData = calculateCompletePlanetaryPositions(date, time);
  
  // Create houses array
  const houses: HouseInfo[] = [];
  
  for (let i = 0; i < 12; i++) {
    const houseRashi = (ascendant.ascendant.rashiIndex + i) % 12;
    const rashiData = RASHI_DATA[houseRashi];
    const significance = HOUSE_SIGNIFICANCE[i];
    
    // Find planets in this house
    const planetsInHouse = planetaryData.planets.filter(planet => planet.house === i + 1);
    
    houses.push({
      houseNumber: i + 1,
      rashi: houseRashi,
      rashiName: rashiData.name,
      rashiNameHi: rashiData.nameHi,
      lord: rashiData.lord,
      lordHi: rashiData.lordHi,
      planets: planetsInHouse,
      degrees: ascendant.houses[i].degrees,
      significance: significance.en,
      significanceHi: significance.hi
    });
  }
  
  // Calculate aspects
  const aspectsData = calculatePlanetaryAspects(planetaryData.planets);
  
  // Calculate dignities
  const dignityData = calculatePlanetaryDignities(planetaryData.planets);
  
  return {
    ascendant,
    houses,
    planets: planetaryData.planets,
    chartStyle,
    aspectsData,
    dignityData
  };
}

/**
 * Calculate planetary aspects
 */
function calculatePlanetaryAspects(planets: PlanetPosition[]): AspectInfo[] {
  const aspects: AspectInfo[] = [];
  
  // Vedic aspects for each planet
  const VEDIC_ASPECTS: Record<string, number[]> = {
    'Sun': [7],
    'Moon': [7],
    'Mars': [4, 7, 8],
    'Mercury': [7],
    'Jupiter': [5, 7, 9],
    'Venus': [7],
    'Saturn': [3, 7, 10],
    'Rahu': [5, 7, 9],
    'Ketu': [5, 7, 9]
  };
  
  planets.forEach(planet => {
    const planetAspects = VEDIC_ASPECTS[planet.name] || [7];
    const aspectingHouses: number[] = [];
    const aspectingPlanets: string[] = [];
    
    planetAspects.forEach(aspectHouse => {
      const targetHouse = ((planet.house - 1 + aspectHouse - 1) % 12) + 1;
      aspectingHouses.push(targetHouse);
      
      // Find planets in aspected house
      const planetsInAspectedHouse = planets.filter(p => p.house === targetHouse && p.name !== planet.name);
      aspectingPlanets.push(...planetsInAspectedHouse.map(p => p.name));
    });
    
    aspects.push({
      planet: planet.name,
      aspectingHouses,
      aspectingPlanets,
      aspectType: 'full',
      strength: calculateAspectStrength(planet)
    });
  });
  
  return aspects;
}

/**
 * Calculate planetary dignities
 */
function calculatePlanetaryDignities(planets: PlanetPosition[]): DignityInfo[] {
  const dignities: DignityInfo[] = [];
  
  // Exaltation degrees
  const EXALTATION_DATA: Record<string, { rashi: number; degree: number }> = {
    'Sun': { rashi: 0, degree: 10 },      // Aries 10°
    'Moon': { rashi: 1, degree: 3 },      // Taurus 3°
    'Mars': { rashi: 9, degree: 28 },     // Capricorn 28°
    'Mercury': { rashi: 5, degree: 15 },  // Virgo 15°
    'Jupiter': { rashi: 3, degree: 5 },   // Cancer 5°
    'Venus': { rashi: 11, degree: 27 },   // Pisces 27°
    'Saturn': { rashi: 6, degree: 20 }    // Libra 20°
  };
  
  // Own signs
  const OWN_SIGNS: Record<string, number[]> = {
    'Sun': [4],           // Leo
    'Moon': [3],          // Cancer
    'Mars': [0, 7],       // Aries, Scorpio
    'Mercury': [2, 5],    // Gemini, Virgo
    'Jupiter': [8, 11],   // Sagittarius, Pisces
    'Venus': [1, 6],      // Taurus, Libra
    'Saturn': [9, 10]     // Capricorn, Aquarius
  };
  
  planets.forEach(planet => {
    let dignity: DignityInfo['dignity'] = 'neutral';
    let strength = 50; // Base strength
    let description = 'Neutral position';
    let descriptionHi = 'तटस्थ स्थिति';
    
    const exaltationData = EXALTATION_DATA[planet.name];
    const ownSigns = OWN_SIGNS[planet.name] || [];
    
    // Check exaltation
    if (exaltationData && planet.rashiIndex === exaltationData.rashi) {
      const degreeDiff = Math.abs(planet.degrees - exaltationData.degree);
      if (degreeDiff <= 5) {
        dignity = 'exalted';
        strength = 90 + (5 - degreeDiff) * 2;
        description = 'Exalted - Very strong and auspicious';
        descriptionHi = 'उच्च - अत्यंत शक्तिशाली और शुभ';
      }
    }
    
    // Check debilitation (opposite of exaltation)
    if (exaltationData && planet.rashiIndex === (exaltationData.rashi + 6) % 12) {
      dignity = 'debilitated';
      strength = 20;
      description = 'Debilitated - Weak and challenging';
      descriptionHi = 'नीच - कमजोर और चुनौतीपूर्ण';
    }
    
    // Check own sign
    if (ownSigns.includes(planet.rashiIndex)) {
      dignity = 'own-sign';
      strength = 80;
      description = 'Own sign - Strong and comfortable';
      descriptionHi = 'स्वराशि - मजबूत और आरामदायक';
    }
    
    dignities.push({
      planet: planet.name,
      dignity,
      strength,
      description,
      descriptionHi
    });
  });
  
  return dignities;
}

/**
 * Calculate aspect strength
 */
function calculateAspectStrength(planet: PlanetPosition): number {
  // Base strength from planetary dignity
  let strength = 50;
  
  // Adjust based on planet type
  const strongPlanets = ['Sun', 'Mars', 'Jupiter', 'Saturn'];
  if (strongPlanets.includes(planet.name)) {
    strength += 20;
  }
  
  return Math.min(100, strength);
}

/**
 * Get chart layout for visualization
 */
export function getChartLayout(kundliData: KundliData): ChartLayout {
  if (kundliData.chartStyle === 'south-indian') {
    return getSouthIndianLayout(kundliData);
  }
  return getNorthIndianLayout(kundliData);
}

// Chart layout interfaces
export interface ChartLayout {
  style: ChartStyle;
  houses: ChartHouse[];
  center: ChartCenter;
}

export interface ChartHouse {
  houseNumber: number;
  position: { x: number; y: number; width: number; height: number };
  rashi: string;
  rashiHi: string;
  planets: string[];
  isAscendant?: boolean;
}

export interface ChartCenter {
  position: { x: number; y: number; width: number; height: number };
  content: string;
  contentHi: string;
}

/**
 * North Indian chart layout (Diamond shape)
 */
function getNorthIndianLayout(kundliData: KundliData): ChartLayout {
  const houses: ChartHouse[] = [];
  const size = 300;
  const houseSize = size / 4;
  
  // North Indian chart positions (12 houses in diamond pattern)
  const positions = [
    { x: houseSize * 1.5, y: 0 },              // House 1 (top)
    { x: houseSize * 2, y: houseSize * 0.5 },  // House 2
    { x: houseSize * 2, y: houseSize },        // House 3
    { x: houseSize * 1.5, y: houseSize * 1.5 }, // House 4 (right)
    { x: houseSize, y: houseSize * 1.5 },      // House 5
    { x: houseSize * 0.5, y: houseSize },      // House 6
    { x: 0, y: houseSize * 0.5 },              // House 7 (bottom)
    { x: houseSize * 0.5, y: 0 },              // House 8
    { x: houseSize, y: 0 },                    // House 9
    { x: houseSize * 1.5, y: houseSize * 0.5 }, // House 10 (left)
    { x: houseSize * 1.5, y: houseSize },      // House 11
    { x: houseSize, y: houseSize * 0.5 }       // House 12
  ];
  
  kundliData.houses.forEach((house, index) => {
    const pos = positions[index];
    houses.push({
      houseNumber: house.houseNumber,
      position: { x: pos.x, y: pos.y, width: houseSize, height: houseSize },
      rashi: house.rashiName,
      rashiHi: house.rashiNameHi,
      planets: house.planets.map(p => p.name),
      isAscendant: index === 0
    });
  });
  
  return {
    style: 'north-indian',
    houses,
    center: {
      position: { x: houseSize, y: houseSize * 0.5, width: houseSize, height: houseSize },
      content: 'Kundli',
      contentHi: 'कुंडली'
    }
  };
}

/**
 * South Indian chart layout (Square grid)
 */
function getSouthIndianLayout(kundliData: KundliData): ChartLayout {
  const houses: ChartHouse[] = [];
  const size = 300;
  const houseSize = size / 4;
  
  // South Indian chart positions (4x4 grid with specific house arrangement)
  const positions = [
    { x: houseSize, y: 0 },                    // House 1
    { x: houseSize * 2, y: 0 },               // House 2
    { x: houseSize * 3, y: 0 },               // House 3
    { x: houseSize * 3, y: houseSize },       // House 4
    { x: houseSize * 3, y: houseSize * 2 },   // House 5
    { x: houseSize * 3, y: houseSize * 3 },   // House 6
    { x: houseSize * 2, y: houseSize * 3 },   // House 7
    { x: houseSize, y: houseSize * 3 },       // House 8
    { x: 0, y: houseSize * 3 },               // House 9
    { x: 0, y: houseSize * 2 },               // House 10
    { x: 0, y: houseSize },                   // House 11
    { x: 0, y: 0 }                            // House 12
  ];
  
  kundliData.houses.forEach((house, index) => {
    const pos = positions[index];
    houses.push({
      houseNumber: house.houseNumber,
      position: { x: pos.x, y: pos.y, width: houseSize, height: houseSize },
      rashi: house.rashiName,
      rashiHi: house.rashiNameHi,
      planets: house.planets.map(p => p.name),
      isAscendant: index === 0
    });
  });
  
  return {
    style: 'south-indian',
    houses,
    center: {
      position: { x: houseSize, y: houseSize, width: houseSize * 2, height: houseSize * 2 },
      content: 'Birth Chart',
      contentHi: 'जन्म कुंडली'
    }
  };
}