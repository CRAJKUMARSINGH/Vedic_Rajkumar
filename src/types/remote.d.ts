// src/types/remote.d.ts
declare module " @vedic/birth-chart-insights\ {
 export interface BirthData {
 name: string;
 dob: string; // ISO date string
 time: string; // HH:mm
 location: { lat: number; lon: number };
 }
 export interface PlanetPosition { name: string; longitude: number; house: number }
 export interface BirthChartResult {
 planets: PlanetPosition[];
 houses: Record<number, string[]>;
 aspects: string[];
 }
 export function analyzeBirthChart(data: BirthData): Promise<BirthChartResult>;
}

declare module \@vedic/marriage-prospect-finder\ {
 export interface Kundli { birthData: any }
 export interface MarriageScore {
 totalPoints: number;
 breakdown: Record<string, number>;
 compatible: boolean;
 }
 export function findMarriageProspect(a: Kundli, b: Kundli): Promise<MarriageScore>;
}

declare module \@vedic/supplements\ {
 export interface Guide { title: string; url: string; description?: string }
 export function listGuides(): Promise<Guide[]>;
}
