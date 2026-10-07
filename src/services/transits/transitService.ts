import { SwissEphemerisEngine, toJulianDay, type PlanetPosition } from '@/astrology/core/ephemeris';
import { computeDrishti, computeConjunctions, signIndex } from '@/astrology/transits/aspects';
import { detectSadeSati, detectAshtamaShani, detectKantakaShani } from '@/astrology/transits/sadeSati';
import { transitStrength, computeSAV } from '@/astrology/ashtakavarga/bhinnashtakavarga';
import { isVedhaActive } from '@/astrology/transits/vedha';
import { computePanchang } from '@/astrology/panchang/panchang';
import { BENEFICS } from '@/astrology/core/constants';
import { withSpan } from '@/observability/tracing/tracer';
import { metrics } from '@/observability/metrics/registry';
import { createLogger } from '@/observability/logging/logger';
import { checkKillSwitch, KILL_SWITCHES } from '@/config/kill-switches';

const log = createLogger('transits');
const benefics = new Set<string>(BENEFICS);

export interface NatalChart {
  lagnaSign: number;
  planets: Record<string, number>;
}

export interface TransitSnapshot {
  asOf: Date;
  positions: PlanetPosition[];
  aspects: ReturnType<typeof computeDrishti>;
  conjunctions: ReturnType<typeof computeConjunctions>;
  sadeSati: ReturnType<typeof detectSadeSati>;
  ashtamaShani: boolean;
  kantakaShani: boolean;
  sav: number[];
  strengths: Record<string, number>;
  vedha: Record<string, boolean>;
  panchang: ReturnType<typeof computePanchang>;
}

export class TransitService {
  private engine = new SwissEphemerisEngine(import.meta.env.VITE_EPHEMERIS_ENDPOINT);

  async snapshot(natal: NatalChart, asOf: Date): Promise<TransitSnapshot> {
    await checkKillSwitch(KILL_SWITCHES.TRANSITS);
    return withSpan('transit_snapshot', async () => {
      const started = performance.now();
      const jd = toJulianDay(asOf);
      const positions = await this.engine.positions(jd);
      metrics.calcLatency.observe(performance.now() - started);

      const natalSigns: Record<string, number> = { Lagna: natal.lagnaSign };
      for (const [g, l] of Object.entries(natal.planets)) natalSigns[g] = signIndex(l);

      const aspects = positions.flatMap((p) =>
        computeDrishti(p.graha, p.longitude, natalSigns, benefics),
      );
      const conjunctions = positions.flatMap((p) =>
        computeConjunctions(p.graha, p.longitude, natal.planets, benefics),
      );

      const saturn = positions.find((p) => p.graha === 'Saturn');
      const sun = positions.find((p) => p.graha === 'Sun');
      const moon = positions.find((p) => p.graha === 'Moon');
      const natalMoon = natal.planets.Moon ?? 0;
      const natalMoonSign = signIndex(natalMoon);

      const occupied = new Set(
        positions.map((p) => ((signIndex(p.longitude) - natalMoonSign + 12) % 12) + 1),
      );
      const strengths: Record<string, number> = {};
      const vedha: Record<string, boolean> = {};
      for (const p of positions) {
        strengths[p.graha] = transitStrength(p.graha, signIndex(p.longitude), natalSigns);
        const offsetFromMoon = ((signIndex(p.longitude) - natalMoonSign + 12) % 12) + 1;
        vedha[p.graha] = isVedhaActive(p.graha, offsetFromMoon, occupied);
      }

      const snapshot: TransitSnapshot = {
        asOf,
        positions,
        aspects,
        conjunctions,
        sadeSati: saturn
          ? detectSadeSati(saturn.longitude, natalMoon)
          : { phase: 'none', active: false, severity: 'low', saturnSign: '', moonSign: '', progress: 0 },
        ashtamaShani: saturn ? detectAshtamaShani(saturn.longitude, natalMoon) : false,
        kantakaShani: saturn ? detectKantakaShani(saturn.longitude, natalMoon) : false,
        sav: computeSAV(natalSigns),
        strengths,
        vedha,
        panchang: computePanchang(sun?.longitude ?? 0, moon?.longitude ?? 0, jd),
      };

      metrics.chartCalculated.inc();
      log.info('transit_snapshot_complete', { asOf: asOf.toISOString(), aspects: aspects.length });
      return snapshot;
    }, { feature: 'transit' });
  }

  async ingressCalendar(
    _natal: NatalChart,
    from: Date,
    to: Date,
  ): Promise<Array<{ graha: string; sign: number; date: Date }>> {
    const events: Array<{ graha: string; sign: number; date: Date }> = [];
    const days = Math.ceil((to.getTime() - from.getTime()) / 86400000);
    const prev: Record<string, number> = {};

    for (let d = 0; d <= days; d++) {
      const date = new Date(from.getTime() + d * 86400000);
      const positions = await this.engine.positions(toJulianDay(date));
      for (const p of positions) {
        const s = signIndex(p.longitude);
        if (prev[p.graha] !== undefined && prev[p.graha] !== s) {
          events.push({ graha: p.graha, sign: s, date });
        }
        prev[p.graha] = s;
      }
    }
    return events;
  }
}

export const transitService = new TransitService();
