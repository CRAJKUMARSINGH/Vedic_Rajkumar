/**
 * TransitsPanel.tsx — Real-time Vedic Transit Visualiser
 *
 * DROP THIS FILE INTO: src/components/TransitsPanel.tsx
 *
 * `engineData.transits` is always [] (assembler can't call async ephemeris).
 * This panel calls `calculateDynamicTransits()` directly — the async Swiss
 * Ephemeris service that returns real-time sidereal transit results.
 *
 * FLOW:
 *   1. Birth input  → assembleEngineData() → extract moonRashiIndex (natal Moon sign)
 *   2. Date picker  → calculateDynamicTransits({ moonRashiIndex, date })
 *   3. Render result
 *
 * FOUR TABS:
 *   1. Today         — Overall score gauge, 9-planet status grid, date picker.
 *                      Switch any date to re-run the transit calculation.
 *   2. Planets       — Full detail card per planet: house from Moon, base favorable,
 *                      vedha active/note, score contribution, effect (EN + HI).
 *   3. 14-day View   — Fetches all 14 days in parallel (Promise.all) on demand.
 *                      Bar-chart of daily scores coloured by overall status.
 *                      Best-day and worst-day call-outs.
 *   4. Guide         — Explains Chandra-rashi transit scoring, vedha obstruction,
 *                      and how to interpret the panel for day-to-day planning.
 *
 * DEPENDENCIES (all already in the repo):
 *   - src/services/engineDataAssembler.ts    → assembleEngineData()
 *   - src/services/dynamicTransitService.ts  → calculateDynamicTransits()
 *   - src/services/geocodingService.ts       → searchLocation()
 *   - src/components/EnhancedBirthInputForm.tsx
 *   - (types) src/data/transitData.ts        → TransitResult, PlanetInfo
 *
 * USAGE:
 *   import { TransitsPanel } from '@/components/TransitsPanel';
 *   <TransitsPanel />
 */

import { useState, useCallback } from "react";
import { assembleEngineData }       from "@/services/engineDataAssembler";
import { calculateDynamicTransits } from "@/services/dynamicTransitService";
import { searchLocation }           from "@/services/geocodingService";
import EnhancedBirthInputForm      from "@/components/EnhancedBirthInputForm";
import type { TransitResult }       from "../data/transitData";
import type { DynamicTransitOutput } from "@/services/dynamicTransitService";

// ─── Constants ──────────────────────────────────────────────────────────────────

const RASHI_NAMES = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];
const RASHI_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  favorable:   { label: 'Favorable',   color: 'text-emerald-300', bg: 'bg-emerald-500/15',  border: 'border-emerald-500/35', icon: '✅' },
  unfavorable: { label: 'Unfavorable', color: 'text-red-300',     bg: 'bg-red-500/10',      border: 'border-red-500/25',    icon: '⚠' },
  mixed:       { label: 'Mixed',       color: 'text-yellow-300',  bg: 'bg-yellow-500/10',   border: 'border-yellow-500/25', icon: '⚡' },
};

const ORDINAL = ['','1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'];

const DAYS_OF_WEEK = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function parseBirthDate(date: string, time: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min]  = time.split(':').map(Number);
  return new Date(y, m - 1, d, h, min, 0);
}

/** Offset today by N days */
function dayOffset(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

/** Score → 0-100 normalised (max raw score ~9 planets * ~4 each = 36) */
function normaliseScore(raw: number): number {
  return Math.min(100, Math.max(0, Math.round(((raw + 36) / 72) * 100)));
}

function scoreColour(norm: number): string {
  if (norm >= 65) return '#10b981';  // emerald
  if (norm >= 45) return '#eab308';  // yellow
  return '#ef4444';                  // red
}

// ─── Planet row (Today tab) ─────────────────────────────────────────────────────

function PlanetRow({ t }: { t: TransitResult }) {
  const s = STATUS_META[t.effectiveStatus] ?? STATUS_META.mixed;
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${s.bg} ${s.border}`}>
      <span className="text-base w-5 text-center">{t.planet.symbol}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-white">{t.planet.en}</span>
          <span className="text-[9px] text-slate-500">{t.planet.hi}</span>
          <span className="text-[9px] text-slate-400">
            {RASHI_SYMBOLS[t.currentRashi]} {RASHI_NAMES[t.currentRashi]}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 flex-wrap">
          <span>{ORDINAL[t.houseFromMoon]} from Moon</span>
          {t.vedhaActive && (
            <span className="text-orange-400/80">⚡ Vedha</span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-[10px] font-bold ${s.color}`}>{s.icon} {s.label}</p>
        <p className="text-[9px] text-slate-500">
          {t.scoreContribution > 0 ? '+' : ''}{t.scoreContribution}
        </p>
      </div>
    </div>
  );
}

// ─── Planet detail card (Planets tab) ──────────────────────────────────────────

function PlanetCard({ t }: { t: TransitResult }) {
  const s = STATUS_META[t.effectiveStatus] ?? STATUS_META.mixed;
  return (
    <div className={`rounded-xl border p-4 space-y-3 ${s.bg} ${s.border}`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 border ${s.border} bg-white/5`}>
          {t.planet.symbol}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-white">{t.planet.en}</span>
            <span className="text-[10px] text-slate-400">{t.planet.hi}</span>
            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${s.color} ${s.border} ${s.bg}`}>
              {s.icon} {s.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5 flex-wrap">
            <span>{RASHI_SYMBOLS[t.currentRashi]} {RASHI_NAMES[t.currentRashi]}</span>
            <span>·</span>
            <span>{ORDINAL[t.houseFromMoon]} house from Moon</span>
            <span>·</span>
            <span className={t.scoreContribution >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {t.scoreContribution > 0 ? '+' : ''}{t.scoreContribution} pts
            </span>
          </div>
        </div>
      </div>

      {/* Effect */}
      <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3 space-y-1.5">
        <p className="text-xs text-slate-200 leading-relaxed">{t.effectEn}</p>
        {t.effectHi && (
          <p className="text-[11px] text-slate-500 leading-relaxed">{t.effectHi}</p>
        )}
      </div>

      {/* Vedha note */}
      {t.vedhaActive && t.vedhaNote && (
        <div className="rounded-lg bg-orange-500/10 border border-orange-500/25 p-2.5">
          <p className="text-[10px] text-orange-300">
            <span className="font-bold">⚡ Vedha active: </span>{t.vedhaNote}
          </p>
        </div>
      )}

      {/* Base favorable houses */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] text-slate-500">Favorable houses for {t.planet.en}:</span>
        {t.planet.favorableHouses.map(h => (
          <span
            key={h}
            className={`text-[9px] px-1.5 py-0.5 rounded border ${
              h === t.houseFromMoon
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                : 'bg-white/5 border-white/10 text-slate-500'
            }`}
          >
            H{h}
          </span>
        ))}
      </div>

      {/* Rating stars */}
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`text-sm ${i < t.rating ? 'text-amber-400' : 'text-slate-700'}`}>★</span>
        ))}
        <span className="text-[10px] text-slate-500 ml-1">{t.rating}/5</span>
      </div>
    </div>
  );
}

// ─── 14-day bar chart ───────────────────────────────────────────────────────────

interface DayResult {
  date:   Date;
  output: DynamicTransitOutput;
  norm:   number;
}

function ForecastTab({ moonRashiIndex }: { moonRashiIndex: number }) {
  const [days,       setDays]      = useState<DayResult[] | null>(null);
  const [loading,    setLoading]   = useState(false);
  const [error,      setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today  = new Date();
      const dates  = Array.from({ length: 14 }, (_, i) => dayOffset(today, i));
      const results = await Promise.all(
        dates.map(d =>
          calculateDynamicTransits({ moonRashiIndex, date: d })
        )
      );
      setDays(
        results.map((output, i) => ({
          date:   dates[i],
          output,
          norm:   normaliseScore(output.totalScore),
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Forecast failed');
    } finally {
      setLoading(false);
    }
  }, [moonRashiIndex]);

  if (!days && !loading) {
    return (
      <div className="flex flex-col items-center py-12 gap-3 text-slate-400">
        <span className="text-3xl">📅</span>
        <p className="text-sm">14-day transit score forecast</p>
        <p className="text-xs text-slate-500 text-center max-w-xs">
          Fetches all 14 days in parallel using the Swiss Ephemeris service.
          Takes ~3–5 seconds.
        </p>
        <button
          onClick={load}
          className="mt-2 px-4 py-2 text-sm font-semibold bg-amber-500/15 border border-amber-500/35 text-amber-300 rounded-xl hover:bg-amber-500/25 transition-all"
        >
          Load 14-Day Forecast
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-slate-400">
        <div className="animate-spin h-10 w-10 border-t-2 border-amber-500 border-solid rounded-full" />
        <p className="text-sm">Fetching 14 days in parallel…</p>
        <p className="text-xs text-slate-500">Swiss Ephemeris · 14 × calculateDynamicTransits()</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 p-4 text-xs">
        <p className="font-bold mb-1">Forecast failed</p>
        <p>{error}</p>
        <button onClick={load} className="mt-2 text-amber-400 hover:text-amber-300 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (!days) return null;

  const best  = days.reduce((a, b) => a.norm >= b.norm ? a : b);
  const worst = days.reduce((a, b) => a.norm <= b.norm ? a : b);
  const maxBar = 100;

  return (
    <div className="space-y-4">
      {/* Best / Worst callout */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-900/10 p-3 text-center">
          <p className="text-[9px] text-emerald-400/70 uppercase tracking-wide">Best Day</p>
          <p className="text-sm font-bold text-emerald-300 mt-0.5">
            {best.date.toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' })}
          </p>
          <p className="text-[10px] text-slate-400">Score {best.norm}/100</p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-900/10 p-3 text-center">
          <p className="text-[9px] text-red-400/70 uppercase tracking-wide">Most Caution</p>
          <p className="text-sm font-bold text-red-300 mt-0.5">
            {worst.date.toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' })}
          </p>
          <p className="text-[10px] text-slate-400">Score {worst.norm}/100</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
        <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-4">
          14-Day Transit Score
        </p>
        <div className="flex items-end gap-1 h-28">
          {days.map(({ date, norm, output }, i) => {
            const isToday = i === 0;
            const col = scoreColour(norm);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <p className="text-[8px] text-slate-500 tabular-nums">{norm}</p>
                <div
                  className="w-full rounded-t transition-all"
                  style={{
                    height:           `${Math.max(8, (norm / maxBar) * 80)}px`,
                    backgroundColor:  col,
                    opacity:          isToday ? 1 : 0.65,
                    outline:          isToday ? `2px solid ${col}` : 'none',
                    outlineOffset:    '1px',
                  }}
                  title={`${isoDate(date)} — ${output.overallStatus} (${norm}/100)`}
                />
                <p className={`text-[7px] ${isToday ? 'text-white font-bold' : 'text-slate-600'}`}>
                  {DAYS_OF_WEEK[date.getDay()]}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-2 text-[9px] text-slate-600">
          <span>Today</span>
          <span>+13 days</span>
        </div>
      </div>

      {/* Day list */}
      <div className="space-y-1.5">
        {days.map(({ date, norm, output }, i) => {
          const s = STATUS_META[output.overallStatus] ?? STATUS_META.mixed;
          const isToday = i === 0;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${s.bg} ${s.border} ${isToday ? 'ring-1 ring-amber-500/30' : ''}`}
            >
              <div className="w-8 text-center shrink-0">
                <p className="text-[10px] font-bold text-slate-400">
                  {DAYS_OF_WEEK[date.getDay()]}
                </p>
                <p className="text-sm font-bold text-white">{date.getDate()}</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-300">
                  {date.toLocaleDateString('en-IN', { month:'long', day:'numeric', year:'numeric' })}
                  {isToday && <span className="ml-1.5 text-[9px] text-amber-400 font-bold">TODAY</span>}
                </p>
                <p className={`text-[10px] font-semibold ${s.color}`}>{s.icon} {s.label}</p>
              </div>
              <div className="shrink-0 text-right">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border border-white/10"
                  style={{ color: scoreColour(norm), borderColor: scoreColour(norm) + '50' }}
                >
                  {norm}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={load}
        className="w-full text-xs text-slate-500 hover:text-amber-400 transition-colors py-1 border border-white/5 rounded-lg hover:border-amber-500/20"
      >
        ↻ Refresh forecast
      </button>
    </div>
  );
}

// ─── Guide tab ─────────────────────────────────────────────────────────────────

function GuideTab() {
  const sections = [
    {
      icon: '🌙',
      title: 'Chandra-Rashi Transit Scoring',
      body: `In Vedic astrology, transits are primarily assessed from the natal Moon sign (Chandra-rashi), not the Ascendant. Each transiting planet lands in a house counted from your natal Moon. Classical texts (Phaladeepika, BPHS) assign specific houses as favorable or unfavorable for each planet.`,
    },
    {
      icon: '⚡',
      title: 'Vedha (Obstruction)',
      body: `Even when a planet is in a favorable house from the Moon, another planet in the "vedha" house for that configuration can neutralise the effect. E.g. Jupiter in the 2nd is favorable — but if another planet is simultaneously in the 12th (its vedha pair), Jupiter's benefit is obstructed. The score reflects this.`,
    },
    {
      icon: '📊',
      title: 'Score Interpretation',
      body: `The score is a net sum across all 9 planets. Each planet contributes +score (favorable, no vedha), reduced score (vedha active), or negative score (unfavorable house). A normalised 0–100 gauge is shown for readability. Above 65 = favorable day. 45–65 = mixed. Below 45 = exercise caution.`,
    },
    {
      icon: '📅',
      title: 'Using the 14-Day Forecast',
      body: `The 14-day view computes all days simultaneously using the Swiss Ephemeris WASM service. Use it for scheduling: choose the best-day window for important decisions, meetings, or launches. Avoid initiating major new ventures on worst-day windows — delay by 1–2 days if possible.`,
    },
    {
      icon: '🔭',
      title: 'Slow Planets vs. Fast Planets',
      body: `Jupiter (stays ~1 year per sign) and Saturn (~2.5 years) set the macro-backdrop of a period. Sun, Mercury, Venus, and Mars are faster movers that shift the day-to-day texture. Moon changes sign every ~2.5 days and contributes the fastest variation. The 14-day view captures Moon movement, which creates the biggest swings in the short-term score.`,
    },
    {
      icon: '⚠',
      title: 'What Transits Don\'t Tell You',
      body: `Transits show the weather, not your destiny. A favorable transit doesn't guarantee results — it opens a window. An unfavorable transit doesn't cause harm — it requires more effort. Results depend on the natal chart's promise (Yoga strength) and the running Mahadasha/Antardasha. Always read transits alongside the Dasha panel.`,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-amber-500/20 bg-amber-900/10 p-3 text-xs text-amber-200/80 leading-relaxed">
        <span className="font-bold text-amber-400">How to use this panel: </span>
        Enter your birth details once → the panel captures your natal Moon sign automatically →
        view real-time Chandra-rashi transits for any date → use the 14-day forecast for planning.
      </div>
      {sections.map(({ icon, title, body }, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{icon}</span>
            <p className="text-xs font-semibold text-white">{title}</p>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function TransitsPanel() {
  type Tab = 'today' | 'planets' | 'forecast' | 'guide';

  const [tab,            setTab]          = useState<Tab>('today');
  const [moonRashiIdx,   setMoonRashiIdx] = useState<number | null>(null);
  const [subjectLabel,   setSubjectLabel] = useState('');
  const [birthError,     setBirthError]   = useState<string | null>(null);
  const [birthLoading,   setBirthLoading] = useState(false);

  // Transit result for the selected date
  const [transitDate,    setTransitDate]  = useState<string>(isoDate(new Date()));
  const [result,         setResult]       = useState<DynamicTransitOutput | null>(null);
  const [transitLoading, setTransitLoading] = useState(false);
  const [transitError,   setTransitError] = useState<string | null>(null);

  // Load transit for a given date + moonRashiIdx
  const loadTransit = useCallback(async (moon: number, dateStr: string) => {
    setTransitLoading(true);
    setTransitError(null);
    try {
      const out = await calculateDynamicTransits({
        moonRashiIndex: moon,
        date: new Date(dateStr),
      });
      setResult(out);
    } catch (e) {
      setTransitError(e instanceof Error ? e.message : 'Transit calculation failed');
    } finally {
      setTransitLoading(false);
    }
  }, []);

  async function handleBirthSubmit(form: { date: string; time: string; location: string }) {
    setBirthLoading(true);
    setBirthError(null);
    try {
      let lat = 28.6139, lng = 77.2090;
      const geo = await searchLocation(form.location);
      if (geo.length > 0) { lat = geo[0].lat; lng = geo[0].lon; }
      const bd         = parseBirthDate(form.date, form.time);
      const engineData = assembleEngineData(bd, lat, lng);
      // Find Moon in planets
      const moonPlanet = engineData.planets.find((p: any) => p.name === 'Moon');
      const moon       = moonPlanet?.rashiIndex ?? 0;
      setMoonRashiIdx(moon);
      setSubjectLabel(`${form.location} · ${form.date} ${form.time} IST · Moon in ${RASHI_NAMES[moon]}`);
      // Immediately compute today's transits
      await loadTransit(moon, isoDate(new Date()));
    } catch (e) {
      setBirthError(e instanceof Error ? e.message : 'Computation failed');
    } finally {
      setBirthLoading(false);
    }
  }

  async function handleDateChange(dateStr: string) {
    setTransitDate(dateStr);
    if (moonRashiIdx !== null) {
      await loadTransit(moonRashiIdx, dateStr);
    }
  }

  // ── Birth input gate ─────────────────────────────────────────────────────────

  if (moonRashiIdx === null) {
    return (
      <div className="glow-card overflow-hidden shadow-lg border border-white/10 bg-[#090b0f]">
        <div className="px-5 pt-5 pb-4 border-b border-white/10 bg-[#111722]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🔭</span>
            <h2 className="text-base font-bold text-white">Real-time Vedic Transits</h2>
          </div>
          <p className="text-xs text-slate-400">
            Chandra-rashi transit scoring for any date — with vedha analysis and a 14-day forecast.
            Enter birth details to detect your natal Moon sign.
          </p>
        </div>
        <div className="p-5 bg-[#0d1118]">
          {birthError && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 p-3 text-xs">
              <span className="font-bold">Error: </span>{birthError}
            </div>
          )}
          {birthLoading ? (
            <div className="flex flex-col items-center py-16 gap-3 text-slate-400">
              <div className="animate-spin h-10 w-10 border-t-2 border-amber-500 border-solid rounded-full" />
              <p className="text-sm">Computing birth chart + today's transits…</p>
              <p className="text-xs text-slate-500">Swiss Ephemeris · Chandra-rashi scoring · Vedha detection</p>
            </div>
          ) : (
            <EnhancedBirthInputForm lang="en" onSubmit={handleBirthSubmit} showAutoSave={false} showProgress={true} />
          )}
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const norm       = result ? normaliseScore(result.totalScore) : 0;
  const overallMeta = result ? (STATUS_META[result.overallStatus] ?? STATUS_META.mixed) : STATUS_META.mixed;
  const favorableCount   = result?.transits.filter((t: TransitResult) => t.effectiveStatus === 'favorable').length   ?? 0;
  const unfavorableCount = result?.transits.filter((t: TransitResult) => t.effectiveStatus === 'unfavorable').length ?? 0;
  const mixedCount       = result?.transits.filter((t: TransitResult) => t.effectiveStatus === 'mixed').length       ?? 0;

  return (
    <div className="glow-card overflow-hidden shadow-lg border border-white/10 bg-[#090b0f] text-left">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-0 border-b border-white/10 bg-[#111722]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🔭</span>
          <h2 className="text-base font-bold text-white">Real-time Vedic Transits</h2>
          <button
            onClick={() => { setMoonRashiIdx(null); setResult(null); }}
            className="ml-auto text-[10px] text-slate-500 hover:text-amber-400 border border-white/10 hover:border-amber-500/40 rounded px-2 py-0.5 transition-all"
          >
            ↩ New Chart
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          {subjectLabel}
        </p>

        {/* Quick score strip */}
        {result && (
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            <div className={`rounded-lg border ${overallMeta.bg} ${overallMeta.border} px-2 py-2 text-center`}>
              <p className="text-[8px] text-slate-500 uppercase tracking-wide">Overall</p>
              <p className={`text-sm font-bold mt-0.5 ${overallMeta.color}`}>{overallMeta.label}</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/[0.02] px-2 py-2 text-center">
              <p className="text-[8px] text-slate-500 uppercase tracking-wide">Score</p>
              <p className="text-sm font-bold mt-0.5 text-white" style={{ color: scoreColour(norm) }}>
                {norm}/100
              </p>
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-900/10 px-2 py-2 text-center">
              <p className="text-[8px] text-emerald-400/70 uppercase tracking-wide">Favors</p>
              <p className="text-sm font-bold mt-0.5 text-emerald-300">{favorableCount}</p>
            </div>
            <div className="rounded-lg border border-red-500/15 bg-red-900/10 px-2 py-2 text-center">
              <p className="text-[8px] text-red-400/70 uppercase tracking-wide">Unfavors</p>
              <p className="text-sm font-bold mt-0.5 text-red-300">{unfavorableCount}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-px scrollbar-hide">
          {([
            { id: 'today',    icon: '📊', label: 'Today'    },
            { id: 'planets',  icon: '🪐', label: 'Planets'  },
            { id: 'forecast', icon: '📅', label: '14-Day'   },
            { id: 'guide',    icon: '📖', label: 'Guide'    },
          ] as { id: Tab; icon: string; label: string }[]).map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-3 py-2 text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                tab === id ? 'border-b-2 border-amber-500 text-amber-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 space-y-4 max-h-[640px] overflow-y-auto bg-[#0d1118]">

        {/* ══ TODAY ══ */}
        {tab === 'today' && (
          <div className="space-y-4">
            {/* Date picker */}
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-400 shrink-0">Transit date:</label>
              <input
                type="date"
                value={transitDate}
                onChange={e => handleDateChange(e.target.value)}
                className="flex-1 bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              <button
                onClick={() => handleDateChange(isoDate(new Date()))}
                className="text-[10px] text-amber-400 border border-amber-500/30 rounded px-2 py-1.5 hover:bg-amber-500/10 transition-all shrink-0"
              >
                Today
              </button>
            </div>

            {/* Loading */}
            {transitLoading && (
              <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
                <div className="animate-spin h-6 w-6 border-t-2 border-amber-500 border-solid rounded-full" />
                <span className="text-sm">Computing transits…</span>
              </div>
            )}

            {transitError && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 p-3 text-xs">
                <span className="font-bold">Error: </span>{transitError}
              </div>
            )}

            {/* Score gauge */}
            {result && !transitLoading && (
              <>
                <div className={`rounded-2xl border p-4 ${overallMeta.bg} ${overallMeta.border}`}>
                  <div className="flex items-center gap-4">
                    {/* Circular gauge */}
                    <div className="relative shrink-0 w-16 h-16">
                      <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15.9" fill="none"
                          stroke={scoreColour(norm)} strokeWidth="3"
                          strokeDasharray={`${(norm / 100) * 100} 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{norm}</span>
                      </div>
                    </div>
                    <div>
                      <p className={`text-base font-bold ${overallMeta.color}`}>
                        {overallMeta.icon} {overallMeta.label} Day
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {favorableCount} favorable · {mixedCount} mixed · {unfavorableCount} unfavorable
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Moon in {RASHI_SYMBOLS[moonRashiIdx]} {RASHI_NAMES[moonRashiIdx]}
                        {' · '}
                        {new Date(transitDate).toLocaleDateString('en-IN', { weekday:'long', month:'long', day:'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Planet grid */}
                <div className="space-y-1.5">
                  {result.transits.map((t: TransitResult, i: number) => (
                    <PlanetRow key={i} t={t} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ PLANETS ══ */}
        {tab === 'planets' && (
          <div className="space-y-3">
            {transitLoading && (
              <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
                <div className="animate-spin h-6 w-6 border-t-2 border-amber-500 border-solid rounded-full" />
                <span className="text-sm">Loading…</span>
              </div>
            )}
            {result && !transitLoading && result.transits.map((t: TransitResult, i: number) => (
              <PlanetCard key={i} t={t} />
            ))}
            {!result && !transitLoading && (
              <p className="text-slate-500 text-sm text-center py-8">Select a date in the Today tab first.</p>
            )}
          </div>
        )}

        {/* ══ 14-DAY FORECAST ══ */}
        {tab === 'forecast' && (
          <ForecastTab moonRashiIndex={moonRashiIdx} />
        )}

        {/* ══ GUIDE ══ */}
        {tab === 'guide' && <GuideTab />}

      </div>
    </div>
  );
}
