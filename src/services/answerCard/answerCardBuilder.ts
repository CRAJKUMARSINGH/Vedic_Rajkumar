/**
 * answerCardBuilder.ts — glue between the shipped verdict engine and a
 * precomputed, machine-readable answer card.
 *
 * No new astrology lives here. The engine
 * (`conclusiveJatakJudgmentService`) already returns verdictType, score,
 * headline, therefore and evidence[]; this module scores the ASKED area (not
 * the chart's strongest one), blends the topic's extra houses, derives an
 * honest confidence, and freezes the result into a card anyone can read.
 *
 * Determinism: `asOf` is threaded all the way into the transit layer and into
 * `provenance.computed_at`, so a card emitted today is byte-identical to the
 * same card emitted tomorrow with the same `--as-of`. That is what makes
 * `npm run answers:check` a meaningful CI gate.
 */

import type { ChartData } from '@/hooks/useChartCalculation';
import {
  buildJudgmentForArea,
  HOUSE_STRENGTH_SCORE,
  type ConclusiveJatakJudgment,
  type LifeArea,
} from '@/services/conclusiveJatakJudgmentService';
import type { DashaForecastResult } from '@/services/dashaForecastService';
import { stableHash } from '@/lib/hash/stableHash';
import { slugify, toSubject, type JatakRecord } from '@/lib/jataks/resolveJatak';
import { buildChartFor, forecastFor } from './chartAdapter';
import { TOPIC_EXTRA_HOUSES, TOPIC_TO_AREA } from './topicMap';
import { deriveConfidence } from './confidence';
import { glossRationale } from './hiGloss';
import { normalizeRemedies, normalizeWindow } from './verdictNormalizer';
import {
  BAND_FROM_VERDICT,
  BAND_WORD,
  TOPIC_LABEL,
  type AnswerCard,
  type Lang,
  type Subject,
  type Topic,
  type Verdict,
} from './AnswerCard.types';

export const ENGINE_VERSION = '0.1.0';
export const DEFAULT_ASK = 'Forecast prospects';

const SOURCE_FILES = [
  'src/services/conclusiveJatakJudgmentService.ts',
  'src/services/dashaForecastService.ts',
  'src/services/ashtakavargaService.ts',
  'src/services/chartBuilderService.ts',
];

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));

function headlineFor(j: ConclusiveJatakJudgment, topic: Topic, lang: Lang): string {
  const band = BAND_WORD[BAND_FROM_VERDICT[j.verdictType]][lang];
  const label = TOPIC_LABEL[topic][lang];
  const conf = Math.round(deriveConfidence(j) * 100);
  return lang === 'hi' ? `${label} ${band} (${conf}%)` : `${label}: ${band} (${conf}%)`;
}

function caveatsFor(j: ConclusiveJatakJudgment, chart: ChartData): Array<{ en: string; hi: string }> {
  const out: Array<{ en: string; hi: string }> = [];
  if (!chart.ashtakavarga) {
    out.push({
      en: 'Ashtakavarga unavailable; Dasha carries more weight.',
      hi: 'अष्टकवर्ग उपलब्ध नहीं; दशा का भार अधिक।',
    });
  }
  if (/cannot be certified/i.test(j.transitVerdict)) {
    out.push({ en: 'Transit timing uncertified.', hi: 'गोचर समय प्रमाणित नहीं।' });
  }
  out.push({ en: 'Windows are approximate.', hi: 'समय-सीमाएँ अनुमानित हैं।' });
  return out;
}

function degraded(topic: Topic, msg: string): Verdict {
  return {
    topic,
    headline: { en: msg, hi: msg },
    score_0_100: 50,
    band: 'average',
    engine_verdict: 'CONDITIONAL',
    confidence_0_1: 0.3,
    window: null,
    rationale: { en: msg, hi: msg },
    conflicts: [],
    evidence: [],
    remedies: [],
    caveats: [{ en: msg, hi: msg }],
  };
}

function buildVerdict(
  chart: ChartData,
  forecast: DashaForecastResult,
  topic: Topic,
  asOf: string
): Verdict {
  const area = TOPIC_TO_AREA[topic];
  const j = buildJudgmentForArea(chart, forecast, area, 'natal', new Date(`${asOf}T00:00:00Z`));
  if (!j) return degraded(topic, 'Engine returned no judgment for this chart.');

  // Extra-house overlay (e.g. 4th house for a new dwelling).
  let score = j.score;
  for (const house of TOPIC_EXTRA_HOUSES[topic] ?? []) {
    const h = chart.ashtakavarga?.houseStrengths.find(x => x.house === house);
    if (h) score = clamp(score * 0.8 + HOUSE_STRENGTH_SCORE[h.strength] * 0.2);
  }
  const merged: ConclusiveJatakJudgment = { ...j, score };

  return {
    topic,
    headline: { en: headlineFor(merged, topic, 'en'), hi: headlineFor(merged, topic, 'hi') },
    score_0_100: merged.score,
    band: BAND_FROM_VERDICT[merged.verdictType],
    engine_verdict: merged.verdictType,
    confidence_0_1: deriveConfidence(merged),
    window: normalizeWindow(forecast, area),
    rationale: { en: merged.therefore, hi: glossRationale(merged.therefore) },
    conflicts: merged.conflictResolution,
    evidence: merged.evidence.map(e => ({
      layer: e.layer,
      score: e.score,
      finding: e.finding,
    })),
    remedies: normalizeRemedies(forecast.remedyTarget),
    caveats: caveatsFor(merged, chart),
  };
}

function composeDirectAnswer(v: Verdict[], lang: Lang): { hi: string; en: string } {
  const line = (x: Verdict, l: Lang) =>
    `${x.headline[l]} (${BAND_WORD[x.band][l]}, ${Math.round(x.confidence_0_1 * 100)}%` +
    `${x.window ? `, ${x.window.label[l]}` : ''})`;
  return {
    en: v.map(x => line(x, 'en')).join(' · '),
    hi: v.map(x => line(x, 'hi')).join(' · '),
  };
}

function provenanceOf(
  body: Omit<AnswerCard, 'provenance'>,
  asOf: string,
  extraSource: string
): AnswerCard['provenance'] {
  const input_hash = stableHash({
    dob: body.subject.dob,
    tob: body.subject.tob,
    lat: body.subject.lat,
    lon: body.subject.lon,
    tz: body.subject.tz,
  });
  return {
    engine_version: ENGINE_VERSION,
    ayanamsa: 'Lahiri (Chitrapaksha)',
    house_system: 'Whole-sign',
    dasha_system: 'Vimshottari',
    ephemeris: import.meta.env?.VITE_USE_SWISS_EPHEMERIS === 'true' ? 'swisseph' : 'local',
    // Pinned to `asOf`, not wall-clock, so answers:check is deterministic.
    computed_at: `${asOf}T00:00:00.000Z`,
    as_of: asOf,
    input_hash,
    card_hash: stableHash(body),
    source_files: [...SOURCE_FILES, extraSource],
  };
}

export function buildAnswerCard(
  jatak: JatakRecord,
  asked: string,
  topics: Topic[],
  language: Lang,
  asOf: string
): AnswerCard {
  const subject = toSubject(jatak);
  const chart = buildChartFor(jatak, asOf);
  const forecast = forecastFor(chart);
  const verdicts = topics.map(t => buildVerdict(chart, forecast, t, asOf));

  const body: Omit<AnswerCard, 'provenance'> = {
    card_version: '1.0',
    subject,
    query: { asked, topics, language, as_of: asOf, reference_type: 'natal' },
    direct_answer: composeDirectAnswer(verdicts, language),
    verdicts,
  };

  return { ...body, provenance: provenanceOf(body, asOf, 'src/services/answerCard/chartAdapter.ts') };
}

/**
 * A person absent from the seed bank must degrade EXPLICITLY: an agent told
 * "not in seed bank" adds them and re-emits, instead of guessing a chart.
 */
export function buildAnswerCardByName(
  name: string,
  asked: string,
  topics: Topic[],
  language: Lang,
  asOf: string
): AnswerCard {
  const subject: Subject = {
    name,
    slug: slugify(name),
    aliases: [],
    jatak_id: null,
    dob: '',
    tob: '',
    place: '',
    lat: 0,
    lon: 0,
    tz: 'Asia/Kolkata',
    tz_defaulted: true,
  };
  const msg = `Person "${name}" is not in seed bank (src/data/jataks/JATAKS_DATABASE.json); add them and run \`npm run answers:emit\`.`;

  const body: Omit<AnswerCard, 'provenance'> = {
    card_version: '1.0',
    subject,
    query: { asked, topics, language, as_of: asOf, reference_type: 'natal' },
    direct_answer: { hi: msg, en: msg },
    verdicts: topics.map(t => degraded(t, 'Person not in seed bank.')),
  };

  return { ...body, provenance: provenanceOf(body, asOf, 'src/services/answerCard/answerCardBuilder.ts') };
}
