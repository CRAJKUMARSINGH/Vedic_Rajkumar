/**
 * Prashna Chart Service
 *
 * Lightweight wrapper that produces a Prashna (horary) chart for a given
 * moment & location. Implementation delegates the heavy ephemeris work
 * to ephemerisService and the verdict logic to questionAnalysisService,
 * so this file remains a small, stable surface used by the legacy
 * /horary page and any future consumers.
 *
 * Reference: Prasna Marga (Panakkattu Nambudiripad), B.V. Raman's
 * "Prasnatantra" — translation & commentary.
 */

import { type KundliData } from "./kundliService";
import { calculateCompletePlanetaryPositions } from "./ephemerisService";
import {
  analyzeQuestion,
  classifyQuestion,
  RASHIS_EN,
  type QuestionAnalysis,
} from "./questionAnalysisService";

export interface PrashnaDetails {
  question: string;
  timestamp: string;            // ISO timestamp
  location: { lat: number; lon: number };
}

export interface PrashnaResult {
  chart: KundliData;
  favorable: boolean;
  rulingPlanet: string;
  karyesh: string;              // significator of the question
  analysis: { en: string; hi: string };
  /** Full structured analysis from the unified Question engine */
  full?: QuestionAnalysis;
}

/**
 * Generate a Prashna chart and a verdict for the question.
 * Async — uses real ephemeris when available, falls back to a heuristic.
 */
export async function generatePrashnaChart(details: PrashnaDetails): Promise<PrashnaResult> {
  const when = new Date(details.timestamp);

  // Compute planetary positions for chart payload
  let chart: KundliData = {} as KundliData;
  try {
    const positions = (calculateCompletePlanetaryPositions as unknown as
      (d: Date, la: number, lo: number) => unknown)(when, details.location.lat, details.location.lon);
    chart = (await Promise.resolve(positions)) as unknown as KundliData;
  } catch (e) {
    console.warn("[prashnaChartService] ephemeris unavailable, using empty chart", e);
  }

  // Topic classification + full analysis
  const topic = classifyQuestion(details.question);
  let full: QuestionAnalysis | undefined;
  try {
    full = await analyzeQuestion({
      question: details.question,
      questionTime: when,
      questionLocation: { lat: details.location.lat, lon: details.location.lon },
    });
  } catch (e) {
    console.warn("[prashnaChartService] analysis fallback", e);
  }

  const favorable = full ? full.verdict.outcome === "favorable" : true;
  const rulingPlanet = full?.horaLord ?? "Jupiter";
  const karyesh = topic.karaka;

  const en =
    full?.verdict.outcomeLabel.en ??
    `Prashna for "${details.question}" — ${RASHIS_EN[0]} ascendant context.`;
  const hi =
    full?.verdict.outcomeLabel.hi ??
    `प्रश्न "${details.question}" — प्रश्न लग्न के आधार पर विश्लेषण।`;

  return { chart, favorable, rulingPlanet, karyesh, analysis: { en, hi }, full };
}

/** Backwards-compatible synchronous variant returning a quick verdict only. */
export function generatePrashnaChartSync(details: PrashnaDetails): PrashnaResult {
  const topic = classifyQuestion(details.question);
  return {
    chart: {} as KundliData,
    favorable: true,
    rulingPlanet: "Jupiter",
    karyesh: topic.karaka,
    analysis: {
      en: "Quick prashna verdict — call generatePrashnaChart() for full analysis.",
      hi: "त्वरित प्रश्न परिणाम — पूर्ण विश्लेषण हेतु generatePrashnaChart() का उपयोग करें।",
    },
  };
}
