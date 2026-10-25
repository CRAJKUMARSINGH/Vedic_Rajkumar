/**
 * verdictNormalizer.ts — tolerate the engine's looser output shapes.
 *
 * `remedyTarget` and `DashaLifeAreaForecast.timing` are the two fields the
 * engine types loosely (string / object / array). Normalising here keeps the
 * builder free of shape-guessing and means an unexpected shape degrades to
 * "no remedy" / "no window" instead of throwing.
 */

import type { DashaForecastResult, DashaLifeAreaForecast } from '@/services/dashaForecastService';
import type { LifeArea } from '@/services/conclusiveJatakJudgmentService';
import type { Verdict } from './AnswerCard.types';

/** remedyTarget may be a string, an object, or an array of either. */
export function normalizeRemedies(target: unknown): Array<{ en: string; hi: string }> {
  if (!target) return [];
  const items = Array.isArray(target) ? target : [target];
  return items.flatMap(item => {
    if (typeof item === 'string') return [{ en: item, hi: item }];
    if (item && typeof item === 'object') {
      const o = item as Record<string, unknown>;
      const en = String(o.en ?? o.description ?? o.label ?? o.name ?? '');
      if (!en) return [];
      return [{ en, hi: String(o.hi ?? en) }];
    }
    return [];
  });
}

/** timing may be {startDate,endDate} | {from,to} | a "YYYY-MM-DD … YYYY-MM-DD" string. */
export function normalizeWindow(
  forecast: DashaForecastResult,
  area: LifeArea
): Verdict['window'] {
  const af: DashaLifeAreaForecast | undefined = forecast.lifeAreaForecasts.find(
    f => f.area === area
  );
  const t = af?.timing as unknown;
  if (!t) return null;

  let from = '';
  let to = '';
  if (typeof t === 'string') {
    const m = t.match(/(\d{4}-\d{2}-\d{2})\D+(\d{4}-\d{2}-\d{2})/);
    if (m) [, from, to] = m;
  } else if (typeof t === 'object') {
    const o = t as Record<string, unknown>;
    from = String(o.startDate ?? o.from ?? o.start ?? '');
    to = String(o.endDate ?? o.to ?? o.end ?? '');
  }
  if (!from || !to) return null;

  return {
    from,
    to,
    label: { en: `${from} → ${to}`, hi: `${from} → ${to}` },
    // Transit layer is buildApproxMoonDoubleTransitInput — approximate by name.
    approximate: true,
  };
}
