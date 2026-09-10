/**
 * ashtakutaServiceEnhanced.ts
 *
 * Wraps the existing calculateAshtakuta() with a Manglik cross-check.
 * Does NOT re-implement Ashtakuta scoring — calls ashtakutaService directly.
 * Uses geocodingService to resolve placeOfBirth strings to lat/lon.
 */

import {
  calculateAshtakuta,
  type PartnerData,
  type CompatibilityReport,
} from './ashtakutaService';
import { checkManglikDosha, type ManglikResult } from './manglikService';
import { getCoordinates } from './geocodingService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ManglikCrossCheck {
  maleStatus: ManglikResult;
  femaleStatus: ManglikResult;
  /** True when both partners are effectively Manglik — dosha neutralised classically */
  bothManglik: boolean;
  /** True when exactly one partner is effectively Manglik */
  mismatch: boolean;
  /** Human-readable English summary of the Manglik cross-check */
  recommendation: string;
  /** Remedies to apply when there is a mismatch */
  remedies: string[];
}

export type OverallRecommendation =
  | 'Highly Recommended'
  | 'Proceed with Remedies'
  | 'Caution Advised'
  | 'Not Recommended';

export interface EnhancedCompatibilityReport {
  /** Full result from calculateAshtakuta — unmodified */
  ashtakuta: CompatibilityReport;
  /** Manglik analysis for both partners */
  manglikAnalysis: ManglikCrossCheck;
  /**
   * List of critical issues that lower the effective match quality.
   * Each entry is a short English string (e.g. "Nadi Dosha", "Manglik Mismatch").
   */
  criticalIssues: string[];
  /** Overall verdict based on score + critical issues */
  overallRecommendation: OverallRecommendation;
}

// ─── Geocoding helper ─────────────────────────────────────────────────────────

/** India geographic centre — fallback when geocoding fails */
const INDIA_CENTRE = { lat: 20.5937, lon: 78.9629 };

async function resolvePlaceToCoords(
  place: string,
): Promise<{ lat: number; lon: number }> {
  try {
    const coords = await getCoordinates(place);
    if (coords) return { lat: coords.lat, lon: coords.lon };
  } catch {
    // fall through
  }
  console.warn(
    `[ashtakutaServiceEnhanced] Could not geocode "${place}" — using India centre as fallback.`,
  );
  return INDIA_CENTRE;
}

// ─── Recommendation threshold logic ──────────────────────────────────────────

function deriveRecommendation(
  totalPoints: number,
  criticalCount: number,
): OverallRecommendation {
  if (totalPoints < 18) return 'Not Recommended';
  if (totalPoints >= 28 && criticalCount === 0) return 'Highly Recommended';
  if (totalPoints >= 21 && criticalCount <= 1) return 'Proceed with Remedies';
  if (totalPoints >= 18) return 'Caution Advised';
  return 'Not Recommended';
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Enhanced Ashtakuta calculation with Manglik cross-check.
 *
 * @param male    PartnerData (name, dateOfBirth, timeOfBirth, placeOfBirth)
 * @param female  PartnerData
 * @returns       EnhancedCompatibilityReport
 */
export async function calculateEnhancedAshtakuta(
  male: PartnerData,
  female: PartnerData,
): Promise<EnhancedCompatibilityReport> {
  // Run Ashtakuta and geocoding in parallel
  const [ashtakuta, maleCoords, femaleCoords] = await Promise.all([
    calculateAshtakuta(male, female),
    resolvePlaceToCoords(male.placeOfBirth),
    resolvePlaceToCoords(female.placeOfBirth),
  ]);

  // Manglik checks — use precise lat/lon from geocoding
  const [maleStatus, femaleStatus] = await Promise.all([
    Promise.resolve(
      checkManglikDosha(male.dateOfBirth, male.timeOfBirth, maleCoords.lat, maleCoords.lon),
    ),
    Promise.resolve(
      checkManglikDosha(female.dateOfBirth, female.timeOfBirth, femaleCoords.lat, femaleCoords.lon),
    ),
  ]);

  // Cross-check logic — classical rules
  const maleEffective = maleStatus.effectiveManglik;
  const femaleEffective = femaleStatus.effectiveManglik;
  const bothManglik = maleEffective && femaleEffective;
  const mismatch = maleEffective !== femaleEffective;

  let recommendation: string;
  const remedies: string[] = [];

  if (bothManglik) {
    recommendation =
      'Both partners are Manglik — dosha is neutralised classically. No additional remedies required for Manglik.';
  } else if (mismatch) {
    const manglikPartner = maleEffective ? 'Male' : 'Female';
    recommendation = `${manglikPartner} partner is Manglik; the other is not — CAUTION: remedies are strongly recommended.`;
    remedies.push(
      `${manglikPartner} should perform Mangal Shanti Puja before marriage.`,
      'Recite Hanuman Chalisa daily.',
      'Donate red lentils (masoor dal) on Tuesdays.',
      'Kumbh Vivah is recommended — consult a qualified Jyotishi.',
    );
  } else {
    recommendation = 'Neither partner is effectively Manglik — no Manglik-related concern.';
  }

  // Collect critical issues
  const criticalIssues: string[] = [];

  if (mismatch) {
    criticalIssues.push('Manglik Dosha Mismatch — one partner Manglik, other is not');
  }

  // Nadi Dosha — check from Ashtakuta categories
  const nadiCategory = ashtakuta.categories?.find(
    (c: { category: string; points: number }) => c.category === 'Nadi',
  );
  if (nadiCategory && nadiCategory.points === 0) {
    criticalIssues.push('Nadi Dosha — same Nadi (remedies mandatory)');
  }

  // Bhakoot Dosha — score 0 is critical
  const bhakootCategory = ashtakuta.categories?.find(
    (c: { category: string; points: number }) => c.category === 'Bhakoot',
  );
  if (bhakootCategory && bhakootCategory.points === 0) {
    criticalIssues.push('Bhakoot Dosha — incompatible Moon signs');
  }

  const overallRecommendation = deriveRecommendation(
    ashtakuta.totalPoints,
    criticalIssues.length,
  );

  return {
    ashtakuta,
    manglikAnalysis: {
      maleStatus,
      femaleStatus,
      bothManglik,
      mismatch,
      recommendation,
      remedies,
    },
    criticalIssues,
    overallRecommendation,
  };
}

// Re-export PartnerData so consumers need only import from this file
export type { PartnerData, CompatibilityReport };
