/**
 * DashboardShell.tsx — Vedic Rajkumar Unified Dashboard
 *
 * DROP THIS FILE INTO: src/components/DashboardShell.tsx
 *
 * One birth input → all six engine layers computed simultaneously.
 * Six tabs expose a focused view of each layer — the dedicated panel
 * components (DashaTimeline, ShadbalaPanel, etc.) handle deep-dives.
 *
 * SIX TABS:
 *   1. Overview    — Aggregate snapshot: Lagna, Moon, Atmakaraka, running Mahadasha,
 *                    active Chara Dasha, today's transit status, yoga grade, psych summary.
 *                    Every critical fact about the chart visible at a glance.
 *   2. Dasha       — Vimshottari Mahadasha timeline with Antardasha breakdown.
 *                    Current period highlighted with age/date context.
 *   3. Shadbala    — Planetary strength bar-chart. Functional/dysfunctional split.
 *                    Top 3 strongest + top 3 weakest planets called out.
 *   4. Jaimini     — 7 Chara Karakas, Pada Lagna, Upapada, A10, active Chara Dasha.
 *   5. Psychology  — Nakshatra fear + Rahu/Ketu axis + Saturn wound, each collapsed
 *                    by default. Full synthesis narrative always visible.
 *   6. Transits    — Today's Chandra-rashi transit score for all 9 planets.
 *                    Date picker to switch dates without re-entering birth details.
 *
 * COMPUTATION MODEL:
 *   handleSubmit() calls assembleEngineData() (sync) + calculateDynamicTransits()
 *   (async, WASM) concurrently via Promise.all. Both results are stored and passed
 *   to tab views via props — no panel re-computes anything.
 *
 * DEPENDENCIES:
 *   - src/services/engineDataAssembler.ts    → assembleEngineData(), EngineData
 *   - src/services/dynamicTransitService.ts  → calculateDynamicTransits(), DynamicTransitOutput
 *   - src/services/geocodingService.ts       → searchLocation()
 *   - src/components/EnhancedBirthInputForm.tsx
 *   - (types) src/data/transitData.ts        → TransitResult
 *
 * USAGE:
 *   import { DashboardShell } from '@/components/DashboardShell';
 *   <DashboardShell />
 */

import { useState, useCallback } from "react";
import { assembleEngineData } from '@/services/engineDataAssembler';
import { calculateDynamicTransits } from '@/services/dynamicTransitService';
import { searchLocation } from '@/services/geocodingService';
import { calculateAshtakavarga, type PlanetName } from '@/services/classicalAshtakavargaService';
import EnhancedBirthInputForm, { type BirthSubmitData } from '@/components/EnhancedBirthInputForm';
import type { EngineData } from '@/services/engineDataAssembler';
import type { DynamicTransitOutput } from '@/services/dynamicTransitService';
import type { TransitResult } from '@/data/transitData';

// ─── Constants ──────────────────────────────────────────────────────────────────

const RASHI_NAMES   = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const RASHI_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun:'☀', Moon:'☽', Mars:'♂', Mercury:'☿', Jupiter:'♃', Venus:'♀',
  Saturn:'♄', Rahu:'☊', Ketu:'☋', Ascendant:'↑',
};

const RASHI_LORDS: Record<number, string> = {
  0:'Mars', 1:'Venus', 2:'Mercury', 3:'Moon', 4:'Sun', 5:'Mercury',
  6:'Venus', 7:'Mars', 8:'Jupiter', 9:'Saturn', 10:'Saturn', 11:'Jupiter',
};

const ORDINAL = ['','1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'];

const TRANSIT_STATUS: Record<string, { label:string; color:string; bg:string; border:string; icon:string }> = {
  favorable:   { label:'Favorable',   color:'text-emerald-300', bg:'bg-emerald-500/15', border:'border-emerald-500/35', icon:'✅' },
  unfavorable: { label:'Unfavorable', color:'text-red-300',     bg:'bg-red-500/10',     border:'border-red-500/25',    icon:'⚠'  },
  mixed:       { label:'Mixed',       color:'text-yellow-300',  bg:'bg-yellow-500/10',  border:'border-yellow-500/25', icon:'⚡' },
};

const STRENGTH_BADGE: Record<string, string> = {
  strong:   'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  moderate: 'bg-yellow-500/15  border-yellow-500/30  text-yellow-300',
  weak:     'bg-slate-500/15   border-slate-500/30   text-slate-400',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseBirthDate(date: string, time: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min]  = time.split(':').map(Number);
  return new Date(y, m - 1, d, h, min, 0);
}

function isoDate(d: Date): string { return d.toISOString().split('T')[0]; }

function normaliseScore(raw: number): number {
  return Math.min(100, Math.max(0, Math.round(((raw + 36) / 72) * 100)));
}

function scoreColour(n: number): string {
  return n >= 65 ? '#10b981' : n >= 45 ? '#eab308' : '#ef4444';
}

function currentAge(birthDate: Date): number {
  return (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
}

function getCurrentDashaPieces(engineData: EngineData, birthDate: Date) {
  const age = currentAge(birthDate);
  const dasha: any = engineData.dasha ?? {};
  const periods: any[] = dasha.periods ?? dasha.mahadashas ?? [];
  const current = periods.find((p: any) => {
    if (p.startDate && p.endDate) {
      const now = Date.now();
      return new Date(p.startDate).getTime() <= now && new Date(p.endDate).getTime() > now;
    }
    return typeof p.startAge === 'number' && typeof p.endAge === 'number'
      ? age >= p.startAge && age < p.endAge
      : false;
  });

  const subPeriods: any[] = current?.antadashas ?? current?.antardashas ?? current?.subPeriods ?? [];
  const currentSub = subPeriods.find((p: any) => {
    if (!p.startDate || !p.endDate) return false;
    const now = Date.now();
    return new Date(p.startDate).getTime() <= now && new Date(p.endDate).getTime() > now;
  });

  return {
    md: current?.planet ?? dasha.mahadashaLord ?? dasha.currentMahadasha?.planet ?? 'Unknown',
    ad: currentSub?.planet ?? dasha.antardashaLord ?? dasha.currentAntardasha?.planet ?? 'Unknown',
    period: current,
    subPeriod: currentSub,
  };
}

function getPlanetStrength(engineData: EngineData, planet: string) {
  return (engineData.shadabala ?? []).find((p: any) => p.planet === planet);
}

function shadbalaVerdict(row: any) {
  if (!row) return { label: 'unmeasured', tone: 'text-slate-300', prose: 'its strength is not separately measured in the current Shadbala table' };
  const score = row.totalShadabala ?? 0;
  const required = row.requiredShadabala ?? 390;
  const ratio = required ? score / required : 1;
  if (ratio >= 1.25) return { label: 'very strong', tone: 'text-emerald-300', prose: 'has more than enough force to deliver its promise without much external help' };
  if (ratio >= 1) return { label: 'competent', tone: 'text-green-300', prose: 'has sufficient strength, so its results can materialize when timing supports it' };
  if (ratio >= 0.85) return { label: 'borderline', tone: 'text-yellow-300', prose: 'can give results, but only after discipline, delay, or correction of weak habits' };
  return { label: 'weak', tone: 'text-red-300', prose: 'needs support; otherwise its significations arrive with strain, postponement, or half-results' };
}

function proseList(items: string[]) {
  if (items.length === 0) return 'none';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

// ─── Chip ──────────────────────────────────────────────────────────────────────

function Chip({ label, value, color = 'text-white', small = false }:
  { label: string; value: string; color?: string; small?: boolean }) {
  return (
    <div className={`rounded-lg bg-white/[0.03] border border-white/8 px-2.5 ${small ? 'py-1.5' : 'py-2'}`}>
      <p className="text-[8px] text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`${small ? 'text-xs' : 'text-sm'} font-bold mt-0.5 leading-tight ${color}`}>{value}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB VIEWS (all accept pre-computed data — no birth input, no recomputation)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Tab 1: Overview ───────────────────────────────────────────────────────────

function OverviewTab({ engineData, transit, birthDate, onTabChange }:
  { engineData: EngineData; transit: DynamicTransitOutput | null; birthDate: Date; onTabChange(t: string): void }) {

  const { planets, lagnaRashiIdx, dasha, yogaAnalysis, jaiminiAnalysis, psychologicalProfile } = engineData;

  const moon        = planets.find((p: any) => p.name === 'Moon');
  const atmakaraka  = jaiminiAnalysis?.atmakaraka;
  const activeCD    = jaiminiAnalysis?.charaDasha?.find((cd: any) => {
    const age = currentAge(birthDate);
    return age >= cd.startAge && age < cd.endAge;
  });

  // Yoga grade
  const presentYogas   = yogaAnalysis?.presentYogas ?? [];
  const strongCount    = presentYogas.filter((y: any) => y.strength === 'strong').length;
  const doshaCount     = yogaAnalysis?.doshaYogas?.length ?? 0;
  const yogaGrade =
    strongCount >= 4 ? 'Exceptional' : strongCount >= 2 ? 'Outstanding' :
    strongCount >= 1 ? 'Above Average' : 'Average';

  // Transit
  const norm        = transit ? normaliseScore(transit.totalScore) : null;
  const tStatus     = transit ? (TRANSIT_STATUS[transit.overallStatus] ?? TRANSIT_STATUS.mixed) : null;

  // Running Mahadasha
  const md = (dasha as any)?.mahadashaLord ?? (dasha as any)?.currentMahadasha?.planet ?? '—';
  const ad = (dasha as any)?.antardashaLord ?? (dasha as any)?.currentAntardasha?.planet ?? '—';

  return (
    <div className="space-y-4">
      {/* Core identity strip */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-900/10 p-4">
        <p className="text-[10px] text-amber-500/70 uppercase tracking-wide mb-3">Core Chart Identity</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Chip
            label="Lagna (Rising)"
            value={`${RASHI_SYMBOLS[lagnaRashiIdx]} ${RASHI_NAMES[lagnaRashiIdx]}`}
            color="text-amber-300"
          />
          <Chip
            label="Moon Sign"
            value={moon ? `${RASHI_SYMBOLS[moon.rashiIndex ?? 0]} ${RASHI_NAMES[moon.rashiIndex ?? 0]}` : '—'}
            color="text-blue-300"
          />
          <Chip
            label="Atmakaraka"
            value={atmakaraka ? `${PLANET_SYMBOLS[atmakaraka.planet] ?? ''} ${atmakaraka.planet}` : '—'}
            color="text-purple-300"
          />
          <Chip
            label="Lagna Lord"
            value={`${PLANET_SYMBOLS[RASHI_LORDS[lagnaRashiIdx]] ?? ''} ${RASHI_LORDS[lagnaRashiIdx]}`}
            color="text-cyan-300"
          />
        </div>
      </div>

      {/* Timing strip */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-[9px] text-slate-500 uppercase tracking-wide mb-1">Vimshottari Dasha</p>
          <p className="text-sm font-bold text-white">{PLANET_SYMBOLS[md] ?? ''} {md} MD</p>
          {ad !== '—' && (
            <p className="text-xs text-slate-400 mt-0.5">{PLANET_SYMBOLS[ad] ?? ''} {ad} AD</p>
          )}
          <button onClick={() => onTabChange('dasha')} className="text-[9px] text-amber-400 mt-1.5 hover:text-amber-300">
            See full timeline →
          </button>
        </div>
        <div className="rounded-xl border border-purple-500/20 bg-purple-900/10 p-3">
          <p className="text-[9px] text-purple-400/70 uppercase tracking-wide mb-1">Jaimini Chara Dasha</p>
          {activeCD ? (
            <>
              <p className="text-sm font-bold text-purple-300">
                {RASHI_SYMBOLS[activeCD.rashi]} {activeCD.rashiName}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Age {activeCD.startAge}–{activeCD.endAge}</p>
            </>
          ) : (
            <p className="text-sm text-slate-500">—</p>
          )}
          <button onClick={() => onTabChange('jaimini')} className="text-[9px] text-purple-400 mt-1.5 hover:text-purple-300">
            See Jaimini →
          </button>
        </div>
      </div>

      {/* Yoga + Transit row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-[9px] text-slate-500 uppercase tracking-wide mb-1">Yoga Profile</p>
          <p className="text-sm font-bold text-emerald-300">{yogaGrade}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {presentYogas.length} present · {strongCount} strong · {doshaCount} doshas
          </p>
          <button onClick={() => onTabChange('shadbala')} className="text-[9px] text-amber-400 mt-1.5 hover:text-amber-300">
            See Shadbala & Yogas →
          </button>
        </div>
        {transit && norm !== null && tStatus ? (
          <div className={`rounded-xl border ${tStatus.bg} ${tStatus.border} p-3`}>
            <p className="text-[9px] text-slate-500 uppercase tracking-wide mb-1">Today's Transit</p>
            <p className={`text-sm font-bold ${tStatus.color}`}>{tStatus.icon} {tStatus.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{norm}/100 · {transit.transits.filter((t: TransitResult) => t.effectiveStatus === 'favorable').length} planets favorable</p>
            <button onClick={() => onTabChange('transits')} className="text-[9px] text-amber-400 mt-1.5 hover:text-amber-300">
              See all transits →
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 flex items-center justify-center">
            <p className="text-[10px] text-slate-600">Transits loading…</p>
          </div>
        )}
      </div>

      {/* Psychology synthesis */}
      {psychologicalProfile?.synthesis_narrative && (
        <div className="rounded-xl border border-purple-500/20 bg-purple-900/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🧠</span>
            <p className="text-[10px] text-purple-400/70 uppercase tracking-wide">Psychological Synthesis</p>
            <button onClick={() => onTabChange('psychology')} className="ml-auto text-[9px] text-purple-400 hover:text-purple-300">
              Full profile →
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-[1.8]">{psychologicalProfile.synthesis_narrative}</p>
        </div>
      )}

      {/* Top yogas */}
      {presentYogas.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-amber-500 uppercase tracking-wide font-semibold">Top Yogas</p>
            <button onClick={() => onTabChange('shadbala')} className="text-[9px] text-slate-500 hover:text-amber-400">All yogas →</button>
          </div>
          <div className="space-y-2">
            {[...presentYogas]
              .sort((a: any, b: any) => ({ strong:3, moderate:2, weak:1 }[b.strength as string] ?? 0) - ({ strong:3, moderate:2, weak:1 }[a.strength as string] ?? 0))
              .slice(0, 4)
              .map((y: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-base">{y.category === 'raj' ? '👑' : y.category === 'dhana' ? '💰' : y.category === 'mahapurusha' ? '🏆' : '✨'}</span>
                  <span className="text-xs text-slate-300 flex-1">{y.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border ${STRENGTH_BADGE[y.strength] ?? STRENGTH_BADGE.weak}`}>
                    {y.strength}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 2: Dasha ──────────────────────────────────────────────────────────────

function DashaTab({ engineData, birthDate }: { engineData: EngineData; birthDate: Date }) {
  const { dasha } = engineData;
  const age = currentAge(birthDate);

  // Normalise — the DashaResult shape uses periods[]
  const periods: any[] = (dasha as any)?.periods ?? (dasha as any)?.mahadashas ?? [];
  const current: any   = periods.find((p: any) => {
    if (p.startDate && p.endDate) {
      const now = Date.now();
      return new Date(p.startDate).getTime() <= now && new Date(p.endDate).getTime() > now;
    }
    if (typeof p.startAge === 'number' && typeof p.endAge === 'number') {
      return age >= p.startAge && age < p.endAge;
    }
    return false;
  });

  const antadashas: any[] = current?.antadashas ?? current?.subPeriods ?? [];

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Active</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Future</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 opacity-40 rounded-full bg-white inline-block" /> Past</span>
      </div>

      {/* Active Mahadasha spotlight */}
      {current && (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-900/15 p-4">
          <p className="text-[9px] text-amber-500/70 uppercase tracking-wide mb-1">Active Mahadasha</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{PLANET_SYMBOLS[current.planet] ?? '🪐'}</span>
            <div>
              <p className="text-base font-bold text-amber-300">{current.planet} Mahadasha</p>
              {current.startDate && current.endDate && (
                <p className="text-xs text-slate-400">
                  {new Date(current.startDate).getFullYear()} – {new Date(current.endDate).getFullYear()}
                </p>
              )}
              {typeof current.startAge === 'number' && (
                <p className="text-xs text-slate-400">Age {current.startAge}–{current.endAge}</p>
              )}
            </div>
          </div>
          {/* Antadashas */}
          {antadashas.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <p className="text-[9px] text-slate-500 uppercase tracking-wide">Antardashas</p>
              {antadashas.map((ad: any, i: number) => {
                const adNow = ad.startDate
                  ? new Date(ad.startDate).getTime() <= Date.now() && new Date(ad.endDate).getTime() > Date.now()
                  : false;
                return (
                  <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border text-xs ${adNow ? 'border-amber-500/30 bg-amber-500/10' : 'border-white/5 bg-white/[0.02]'}`}>
                    <span className="text-base shrink-0">{PLANET_SYMBOLS[ad.planet] ?? '🪐'}</span>
                    <span className={adNow ? 'text-amber-300 font-bold' : 'text-slate-400'}>{ad.planet}</span>
                    {ad.startDate && (
                      <span className="ml-auto text-[10px] text-slate-600">
                        {new Date(ad.startDate).toLocaleDateString('en-IN', { month:'short', year:'numeric' })}
                        {' – '}
                        {new Date(ad.endDate).toLocaleDateString('en-IN', { month:'short', year:'numeric' })}
                      </span>
                    )}
                    {adNow && <span className="text-[8px] bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-full px-1.5 font-bold">NOW</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Full Mahadasha timeline */}
      <div className="space-y-1.5">
        {periods.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">No dasha periods found in engineData.dasha.</p>
        )}
        {periods.map((p: any, i: number) => {
          const isActive = p === current;
          const isPast   = !isActive && p.endDate
            ? new Date(p.endDate).getTime() < Date.now()
            : !isActive && typeof p.endAge === 'number' && age >= p.endAge;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all ${
                isActive ? 'border-amber-500/40 bg-amber-500/8'
                : isPast  ? 'border-white/5 bg-white/[0.01] opacity-40'
                           : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <span className="text-base shrink-0">{PLANET_SYMBOLS[p.planet] ?? '🪐'}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${isActive ? 'text-amber-300' : isPast ? 'text-slate-500' : 'text-white'}`}>
                    {p.planet}
                  </span>
                  {isActive && <span className="text-[8px] bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-full px-1.5 font-bold">NOW</span>}
                </div>
                {p.startDate && (
                  <p className="text-[10px] text-slate-500">
                    {new Date(p.startDate).getFullYear()} – {new Date(p.endDate).getFullYear()}
                    {' · '}{p.years ?? ''} years
                  </p>
                )}
                {typeof p.startAge === 'number' && (
                  <p className="text-[10px] text-slate-500">Age {p.startAge}–{p.endAge}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab 3: Shadbala + Yogas ───────────────────────────────────────────────────

function ShadabalaYogaTab({ engineData }: { engineData: EngineData }) {
  const { shadabala, shadabalaAnalysis, yogaAnalysis } = engineData;

  const planets9 = (shadabala ?? []).filter((p: any) => p.planet !== 'Rahu' && p.planet !== 'Ketu' && p.planet !== 'Ascendant');
  const sorted   = [...planets9].sort((a: any, b: any) => (b.totalShadabala ?? 0) - (a.totalShadabala ?? 0));
  const maxScore = sorted[0]?.totalShadabala ?? 1;

  const presentYogas = yogaAnalysis?.presentYogas ?? [];
  const doshaYogas   = yogaAnalysis?.doshaYogas   ?? [];

  const CATEGORIES = ['raj','dhana','mahapurusha','spiritual','special'] as const;
  const CAT_ICONS: Record<string, string> = {
    raj:'👑', dhana:'💰', mahapurusha:'🏆', spiritual:'🪷', special:'✨', dosha:'⚠',
  };

  return (
    <div className="space-y-5">
      {/* Shadbala bars */}
      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
        <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-4">Shadbala — Planetary Strength</p>
        <div className="space-y-3">
          {sorted.map((p: any) => {
            const score    = p.totalShadabala ?? 0;
            const pct      = (score / maxScore) * 100;
            const required = p.requiredShadabala ?? 390;
            const passing  = score >= required;
            return (
              <div key={p.planet} className="space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">
                    {PLANET_SYMBOLS[p.planet] ?? ''} {p.planet}
                  </span>
                  <span className={passing ? 'text-emerald-400' : 'text-red-400'}>
                    {Math.round(score)} / {required} {passing ? '✓' : '✗'}
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${passing ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {(shadabalaAnalysis as any)?.summary && (
          <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
            {typeof (shadabalaAnalysis as any).summary === 'string'
              ? (shadabalaAnalysis as any).summary
              : (shadabalaAnalysis as any).summary?.en ?? ''}
          </p>
        )}
      </div>

      {/* Yoga summary */}
      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
        <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-3">
          Yogas — {presentYogas.length} Present · {doshaYogas.length} Doshas
        </p>
        {CATEGORIES.map(cat => {
          const catYogas = presentYogas.filter((y: any) => y.category === cat);
          if (catYogas.length === 0) return null;
          return (
            <div key={cat} className="mb-3 last:mb-0">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1.5">
                {CAT_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)} ({catYogas.length})
              </p>
              <div className="space-y-1">
                {catYogas.map((y: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-white/5 bg-white/[0.02]">
                    <span className="text-xs text-slate-300 flex-1">{y.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${STRENGTH_BADGE[y.strength] ?? STRENGTH_BADGE.weak}`}>
                      {y.strength}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {/* Doshas */}
        {doshaYogas.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-[10px] text-red-400 uppercase tracking-wide mb-1.5">⚠ Doshas ({doshaYogas.length})</p>
            <div className="space-y-1">
              {doshaYogas.map((y: any, i: number) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-red-500/15 bg-red-900/10">
                  <span className="text-xs text-red-300 flex-1">{y.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border ${STRENGTH_BADGE[y.strength] ?? STRENGTH_BADGE.weak}`}>
                    {y.strength}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {presentYogas.length === 0 && doshaYogas.length === 0 && (
          <p className="text-slate-500 text-xs text-center py-4">No yogas detected.</p>
        )}
      </div>
    </div>
  );
}

// ─── Tab 4: Jaimini ────────────────────────────────────────────────────────────

function JaiminiTab({ engineData, birthDate }: { engineData: EngineData; birthDate: Date }) {
  const { jaiminiAnalysis } = engineData;
  if (!jaiminiAnalysis) return <p className="text-slate-500 text-sm text-center py-8">Jaimini analysis unavailable.</p>;

  const { karakas, atmakaraka, padaLagna, upapadaLagna, a10, charaDasha, narrative } = jaiminiAnalysis as any;
  const age = currentAge(birthDate);

  const KARAKA_ICONS: Record<string, string> = {
    Atmakaraka:'🪬', Amatyakaraka:'💼', Bhratrukaraka:'👥', Matrukaraka:'🏡',
    Putrakaraka:'👶', Gnatikaraka:'⚔', Darakaraka:'💍',
  };
  const KARAKA_COLORS: Record<string, string> = {
    Atmakaraka:'text-amber-300', Amatyakaraka:'text-blue-300', Bhratrukaraka:'text-red-300',
    Matrukaraka:'text-cyan-300', Putrakaraka:'text-green-300', Gnatikaraka:'text-rose-300', Darakaraka:'text-pink-300',
  };

  const padas = [
    { label:'Pada Lagna (AL)', data: padaLagna, icon:'🪞', color:'text-amber-300' },
    { label:'Upapada (UL)',    data: upapadaLagna, icon:'💍', color:'text-pink-300' },
    { label:'A10 (Career)',    data: a10,  icon:'💼', color:'text-blue-300' },
  ].filter(p => p.data);

  return (
    <div className="space-y-4">
      {/* Karakas */}
      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
        <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-3">7 Chara Karakas</p>
        <div className="space-y-2">
          {(karakas ?? []).map((k: any, i: number) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${
                k.karaka === 'Atmakaraka'
                  ? 'border-amber-500/35 bg-amber-500/10'
                  : 'border-white/5 bg-white/[0.02]'
              }`}
            >
              <span className="text-base shrink-0">{KARAKA_ICONS[k.karaka] ?? '🪐'}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold ${KARAKA_COLORS[k.karaka] ?? 'text-white'}`}>{k.karaka}</span>
                  {k.karaka === 'Atmakaraka' && (
                    <span className="text-[8px] bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-full px-1.5 font-bold">SOUL</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">
                  {PLANET_SYMBOLS[k.planet] ?? ''} {k.planet} · {RASHI_NAMES[k.rashiIndex]} · {k.degrees.toFixed(1)}°
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Padas */}
      {padas.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-3">Padas (Arudha)</p>
          <div className="space-y-2">
            {padas.map(({ label, data, icon, color }, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl border border-white/5 bg-white/[0.02]">
                <span className="text-base">{icon}</span>
                <div>
                  <p className={`text-xs font-bold ${color}`}>{label}</p>
                  <p className="text-[10px] text-slate-400">
                    {RASHI_SYMBOLS[data.rashiIndex]} {data.rashiName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chara Dasha (first 8 periods) */}
      {(charaDasha ?? []).length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-3">Chara Dasha Sequence</p>
          <div className="space-y-1.5">
            {(charaDasha as any[]).slice(0, 8).map((cd: any, i: number) => {
              const isActive = age >= cd.startAge && age < cd.endAge;
              const isPast   = age >= cd.endAge;
              const isAK     = atmakaraka?.rashiIndex === cd.rashi;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                    isActive ? 'border-amber-500/40 bg-amber-500/8'
                    : isPast ? 'border-white/5 bg-white/[0.01] opacity-40'
                             : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  <span className="text-base">{RASHI_SYMBOLS[cd.rashi]}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${isActive ? 'text-amber-300' : isPast ? 'text-slate-500' : 'text-white'}`}>
                        {cd.rashiName}
                      </span>
                      {isActive && <span className="text-[8px] bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-full px-1.5 font-bold">NOW</span>}
                      {isAK && <span className="text-[8px] bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full px-1.5">AK</span>}
                    </div>
                    <p className="text-[10px] text-slate-500">Age {cd.startAge}–{cd.endAge} · {cd.years}y</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Narrative */}
      {narrative?.publicVsPrivate && (
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-2">Jaimini Narrative</p>
          <p className="text-xs text-slate-300 leading-relaxed">{narrative.publicVsPrivate}</p>
          {narrative.careerPerception && (
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{narrative.careerPerception}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tab 5: Psychology ─────────────────────────────────────────────────────────

function PsychologyTab({ engineData }: { engineData: EngineData }) {
  const p = engineData.psychologicalProfile as any;
  if (!p) return <p className="text-slate-500 text-sm text-center py-8">Psychological profile unavailable.</p>;

  const { nakshatra_fear: nf, rahu_ketu_karmic_statement: rk, saturn_wound_statement: sw, synthesis_narrative } = p;

  const [open, setOpen] = useState<string | null>(null);
  const toggle = (k: string) => setOpen(o => o === k ? null : k);

  const sections = [
    {
      key: 'fear',
      icon: '😨',
      title: 'Nakshatra Fear Architecture',
      badge: nf ? `${nf.planet} in ${nf.nakshatraName}` : '',
      color: 'border-purple-500/25 bg-purple-900/10',
      content: nf && (
        <div className="space-y-3 text-xs">
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <p className="text-[9px] text-purple-400/70 uppercase tracking-wide mb-1">Core Fear</p>
            <p className="text-slate-200 font-medium">{nf.coreFear}</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <p className="text-[9px] text-slate-500 uppercase tracking-wide mb-1">Manifestation</p>
            <p className="text-slate-300 leading-relaxed">{nf.manifestation}</p>
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-900/10 p-3">
            <p className="text-[9px] text-emerald-400 uppercase tracking-wide mb-1">Vedic Reframe</p>
            <p className="text-emerald-200/90 leading-relaxed">{nf.reframe}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'rahu',
      icon: '☊',
      title: 'Rahu / Ketu Karmic Axis',
      badge: rk ? `${rk.rahu.sign} ↔ ${rk.ketu.sign}` : '',
      color: 'border-orange-500/20 bg-orange-900/10',
      content: rk && (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-orange-500/20 bg-white/[0.02] p-2.5">
              <p className="text-[9px] text-orange-400/70 uppercase tracking-wide mb-1">☊ Rahu — Obsession</p>
              <p className="text-slate-300 leading-relaxed">{rk.rahu.obsession}</p>
            </div>
            <div className="rounded-lg border border-cyan-500/20 bg-white/[0.02] p-2.5">
              <p className="text-[9px] text-cyan-400/70 uppercase tracking-wide mb-1">☋ Ketu — Past Mastery</p>
              <p className="text-slate-300 leading-relaxed">{rk.ketu.masteryClaimed}</p>
            </div>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <p className="text-[9px] text-slate-500 uppercase tracking-wide mb-1">Karmic Curriculum</p>
            <p className="text-white font-semibold">{rk.axisTension}</p>
          </div>
          <p className="text-slate-400 leading-[1.7]">{rk.paragraph}</p>
        </div>
      ),
    },
    {
      key: 'saturn',
      icon: '♄',
      title: 'Saturn Wound',
      badge: sw ? `${sw.sign} · ${ORDINAL[sw.house]} house` : '',
      color: 'border-slate-500/20 bg-slate-900/30',
      content: sw && (
        <div className="space-y-3 text-xs">
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <p className="text-[9px] text-slate-400 uppercase tracking-wide mb-1">Structural Wound</p>
            <p className="text-slate-200 font-medium">{sw.structuralWound}</p>
          </div>
          <div className="rounded-lg border border-red-500/15 bg-red-900/10 p-3">
            <p className="text-[9px] text-red-400/70 uppercase tracking-wide mb-1">Overcompensation Pattern</p>
            <p className="text-slate-300 leading-relaxed">{sw.overcompensation}</p>
          </div>
          <div className="rounded-lg border border-amber-500/15 bg-amber-900/10 p-3">
            <p className="text-[9px] text-amber-400/70 uppercase tracking-wide mb-1">Dasha Reactivation</p>
            <p className="text-slate-300 leading-relaxed">{sw.dashaReactivation}</p>
          </div>
          <p className="text-slate-400 leading-[1.7]">{sw.paragraph}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Synthesis narrative */}
      {synthesis_narrative && (
        <div className="rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-900/20 to-purple-800/5 p-4">
          <p className="text-[9px] text-purple-400/70 uppercase tracking-wide mb-2 tracking-widest">Synthesis</p>
          {synthesis_narrative
            .split(/(?<=[.!?])\s+/)
            .filter((s: string) => s.trim().length > 0)
            .map((s: string, i: number) => (
              <p key={i} className="text-sm text-purple-100/85 leading-[1.9] mb-1.5">{s}</p>
            ))}
        </div>
      )}

      {/* Accordion sections */}
      {sections.map(({ key, icon, title, badge, color, content }) => (
        <div key={key} className={`rounded-xl border ${color} overflow-hidden`}>
          <button
            onClick={() => toggle(key)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left"
          >
            <span className="text-lg shrink-0">{icon}</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-white">{title}</p>
              {badge && <p className="text-[10px] text-slate-400">{badge}</p>}
            </div>
            <span className="text-slate-600 text-xs shrink-0">{open === key ? '▾' : '▸'}</span>
          </button>
          {open === key && content && (
            <div className="border-t border-white/5 px-4 pb-4 pt-3">
              {content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Tab 6: Transits ───────────────────────────────────────────────────────────

function TransitsTab({
  moonRashiIdx, initialTransit,
}: { moonRashiIdx: number; initialTransit: DynamicTransitOutput | null }) {
  const [result,      setResult]      = useState<DynamicTransitOutput | null>(initialTransit);
  const [dateStr,     setDateStr]     = useState(isoDate(new Date()));
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const loadDate = useCallback(async (d: string) => {
    setLoading(true);
    setError(null);
    try {
      const out = await calculateDynamicTransits({ moonRashiIndex: moonRashiIdx, date: new Date(d) });
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transit error');
    } finally { setLoading(false); }
  }, [moonRashiIdx]);

  const norm  = result ? normaliseScore(result.totalScore) : null;
  const tMeta = result ? (TRANSIT_STATUS[result.overallStatus] ?? TRANSIT_STATUS.mixed) : null;

  return (
    <div className="space-y-4">
      {/* Date picker */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={dateStr}
          onChange={e => { setDateStr(e.target.value); loadDate(e.target.value); }}
          className="flex-1 bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
        />
        <button
          onClick={() => { const t = isoDate(new Date()); setDateStr(t); loadDate(t); }}
          className="text-[10px] text-amber-400 border border-amber-500/30 rounded px-2 py-2 hover:bg-amber-500/10 transition-all shrink-0"
        >
          Today
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
          <div className="animate-spin h-6 w-6 border-t-2 border-amber-500 border-solid rounded-full" />
          <span className="text-sm">Computing transits…</span>
        </div>
      )}

      {error && <p className="text-red-300 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}

      {result && !loading && tMeta && norm !== null && (
        <>
          {/* Score card */}
          <div className={`rounded-2xl border ${tMeta.bg} ${tMeta.border} p-4 flex items-center gap-4`}>
            <div className="relative w-14 h-14 shrink-0">
              <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke={scoreColour(norm)} strokeWidth="3"
                  strokeDasharray={`${norm} 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{norm}</span>
              </div>
            </div>
            <div>
              <p className={`text-base font-bold ${tMeta.color}`}>{tMeta.icon} {tMeta.label} Day</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Moon {RASHI_SYMBOLS[moonRashiIdx]} {RASHI_NAMES[moonRashiIdx]}
                {' · '}
                {result.transits.filter((t: TransitResult) => t.effectiveStatus === 'favorable').length} favorable
                {' · '}
                {result.transits.filter((t: TransitResult) => t.effectiveStatus === 'unfavorable').length} unfavorable
              </p>
            </div>
          </div>

          {/* Planet rows */}
          <div className="space-y-1.5">
            {result.transits.map((t: TransitResult, i: number) => {
              const s = TRANSIT_STATUS[t.effectiveStatus] ?? TRANSIT_STATUS.mixed;
              return (
                <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${s.bg} ${s.border}`}>
                  <span className="text-base w-5 text-center">{t.planet.symbol}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{t.planet.en}</span>
                      <span className="text-[10px] text-slate-400">
                        {RASHI_SYMBOLS[t.currentRashi]} {RASHI_NAMES[t.currentRashi]}
                        {' · '}{ORDINAL[t.houseFromMoon]} from Moon
                      </span>
                      {t.vedhaActive && <span className="text-[9px] text-orange-400">⚡ Vedha</span>}
                    </div>
                    {t.effectEn && <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{t.effectEn}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-[10px] font-bold ${s.color}`}>{s.icon}</p>
                    <p className="text-[9px] text-slate-500">{t.scoreContribution > 0 ? '+' : ''}{t.scoreContribution}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Tab 7: Integrated Forecast ────────────────────────────────────────────────

function GrandfatherForecastTab({ engineData, transit, birthDate, subjectLabel }:
  { engineData: EngineData; transit: DynamicTransitOutput | null; birthDate: Date; subjectLabel: string }) {

  const dasha = getCurrentDashaPieces(engineData, birthDate);
  const mdStrength = shadbalaVerdict(getPlanetStrength(engineData, dasha.md));
  const adStrength = shadbalaVerdict(getPlanetStrength(engineData, dasha.ad));
  const avarga = calculateAshtakavarga(engineData.planets, engineData.lagnaRashiIdx);
  const mdPlanet = dasha.md as PlanetName;
  const adPlanet = dasha.ad as PlanetName;
  const presentYogas = engineData.yogaAnalysis?.presentYogas ?? [];
  const doshas = engineData.yogaAnalysis?.doshaYogas ?? [];
  const strongestPlanets = [...(engineData.shadabala ?? [])]
    .filter((p: any) => !['Rahu', 'Ketu', 'Ascendant'].includes(p.planet))
    .sort((a: any, b: any) => (b.totalShadabala ?? 0) - (a.totalShadabala ?? 0))
    .slice(0, 3);
  const weakPlanets = [...(engineData.shadabala ?? [])]
    .filter((p: any) => !['Rahu', 'Ketu', 'Ascendant'].includes(p.planet))
    .sort((a: any, b: any) => (a.totalShadabala ?? 0) - (b.totalShadabala ?? 0))
    .slice(0, 2);
  const transitNorm = transit ? normaliseScore(transit.totalScore) : null;
  const favorableTransits = transit?.transits.filter((t: TransitResult) => t.effectiveStatus === 'favorable') ?? [];
  const difficultTransits = transit?.transits.filter((t: TransitResult) => t.effectiveStatus === 'unfavorable') ?? [];
  const mdBav = avarga.bav[mdPlanet]?.reduced ?? null;
  const adBav = avarga.bav[adPlanet]?.reduced ?? null;
  const mdNatal = engineData.planets.find((p: any) => p.name === dasha.md)?.rashiIndex;
  const adNatal = engineData.planets.find((p: any) => p.name === dasha.ad)?.rashiIndex;
  const mdBavScore = mdBav && typeof mdNatal === 'number' ? mdBav[mdNatal] : null;
  const adBavScore = adBav && typeof adNatal === 'number' ? adBav[adNatal] : null;
  const mdSavScore = typeof mdNatal === 'number' ? avarga.sav.reduced[mdNatal] : null;
  const adSavScore = typeof adNatal === 'number' ? avarga.sav.reduced[adNatal] : null;

  const judgementScore =
    (mdStrength.label === 'very strong' ? 24 : mdStrength.label === 'competent' ? 18 : mdStrength.label === 'borderline' ? 10 : 4) +
    (adStrength.label === 'very strong' ? 18 : adStrength.label === 'competent' ? 14 : adStrength.label === 'borderline' ? 8 : 3) +
    (mdBavScore !== null ? (mdBavScore >= 5 ? 18 : mdBavScore >= 3 ? 11 : 4) : 8) +
    (mdSavScore !== null ? (mdSavScore >= 30 ? 16 : mdSavScore >= 25 ? 10 : 4) : 8) +
    (transitNorm !== null ? Math.round(transitNorm / 4) : 10) +
    Math.min(10, presentYogas.filter((y: any) => y.strength === 'strong').length * 3) -
    Math.min(12, doshas.length * 3);

  const verdict =
    judgementScore >= 78 ? 'A forceful unfolding period' :
    judgementScore >= 62 ? 'A constructive but conditional period' :
    judgementScore >= 45 ? 'A mixed period requiring discrimination' :
    'A repair-and-restraint period';

  const counsel =
    judgementScore >= 78
      ? 'Act, but do not boast. The chart gives permission for work, reputation, learning, and decisive closure of pending matters.'
      : judgementScore >= 62
        ? 'Proceed steadily. Good results come when the native respects sequence: preparation first, public action second.'
        : judgementScore >= 45
          ? 'Choose fewer battles. The promise exists, but it must be filtered through patience, health, paperwork, and timing.'
          : 'Do not force the door. Strengthen the weak planets, reduce exposure, and let the dasha mature before large irreversible steps.';

  const paragraphs = [
    `My child, I would not read ${subjectLabel} by one rule alone. A single score is arithmetic; a forecast is judgement. The active clock is ${dasha.md} Mahadasha with ${dasha.ad !== 'Unknown' ? `${dasha.ad} Antardasha` : 'the current sub-period not separately named'}. The Mahadasha lord is ${mdStrength.label}: ${mdStrength.prose}. The Antardasha lord is ${adStrength.label}: ${adStrength.prose}. Therefore the first conclusion is simple: the period does not merely ask what the chart promises, it asks whether the acting planets have the strength to carry that promise into events.`,
    `Now I put Ashtakavarga on top of this, because without it transit talk becomes hollow. ${dasha.md} has BAV ${mdBavScore ?? 'not available'}/8 in its natal sign and the receiving field has SAV ${mdSavScore ?? 'not available'}. ${dasha.ad !== 'Unknown' ? `${dasha.ad} shows BAV ${adBavScore ?? 'not available'}/8 with SAV ${adSavScore ?? 'not available'}.` : ''} A high BAV says the planet has personal consent to act; a high SAV says the field itself is fertile. When both are low, even a famous yoga waits quietly like a lamp without oil.`,
    `The Shadbala table gives the muscle of the chart. The strongest workers are ${proseList(strongestPlanets.map((p: any) => `${p.planet} (${Math.round(p.totalShadabala ?? 0)})`))}. The weaker or more tired workers are ${proseList(weakPlanets.map((p: any) => `${p.planet} (${Math.round(p.totalShadabala ?? 0)})`))}. So the native should lean on the strong planets' domains and treat the weak planets' domains with correction, humility, and slower commitments.`,
    transit
      ? `Today the gochara score is ${transitNorm}/100, classed as ${transit.overallStatus}. Favor comes through ${proseList(favorableTransits.slice(0, 4).map((t: TransitResult) => t.planet.en))}; resistance comes through ${proseList(difficultTransits.slice(0, 4).map((t: TransitResult) => t.planet.en))}. Transit is not king; it is the messenger. It delivers only what dasha authorizes and what Shadbala can carry.`
      : `The live transit layer has not returned a score, so I will not pretend certainty. In such a case, dasha, Shadbala, and Ashtakavarga must carry the judgement until gochara is available.`,
    `The yogas add the native's stored capital. There are ${presentYogas.length} detected yogas, with ${presentYogas.filter((y: any) => y.strength === 'strong').length} strong ones, and ${doshas.length} dosha warnings. Yogas are not lottery tickets. They behave like ancestral deposits: they pay when dasha opens the account, Shadbala signs the cheque, and transit brings the clerk to the window.`,
    engineData.psychologicalProfile?.synthesis_narrative
      ? `The psychological signature says how the person will experience the forecast from inside: ${engineData.psychologicalProfile.synthesis_narrative}`
      : `The psychological layer is quiet here, but the principle remains: a forecast also depends on temperament. The same Saturn can make one person disciplined and another person bitter.`,
    `Final judgement: ${verdict}. ${counsel} This is the kind of synthesis the application must give; otherwise the mathematics is a museum of numbers and not Jyotish.`
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-900/15 p-5">
        <p className="text-[10px] text-amber-500/70 uppercase tracking-wide mb-2">118-Year Astrologer Grandfather Verdict</p>
        <h2 className="text-lg font-bold text-amber-200 mb-2">{verdict}</h2>
        <p className="text-xs text-slate-300 leading-[1.9]">{counsel}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Chip label="Dasha Gate" value={`${dasha.md} / ${dasha.ad}`} color="text-amber-300" />
        <Chip label="Shadbala Gate" value={`${mdStrength.label} MD`} color={mdStrength.tone} />
        <Chip label="Ashtakavarga Gate" value={`BAV ${mdBavScore ?? '-'} · SAV ${mdSavScore ?? '-'}`} color="text-blue-300" />
        <Chip label="Transit Gate" value={transitNorm !== null ? `${transitNorm}/100` : 'pending'} color={transitNorm !== null && transitNorm >= 65 ? 'text-emerald-300' : 'text-yellow-300'} />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5 space-y-4">
        {paragraphs.map((text, i) => (
          <p key={i} className="text-sm text-slate-200 leading-[1.95]">{text}</p>
        ))}
      </div>

      <div className="rounded-xl border border-blue-500/20 bg-blue-900/10 p-4">
        <p className="text-xs font-semibold text-blue-300 mb-2">What This Forecast Combines</p>
        <p className="text-xs text-slate-300 leading-relaxed">
          Vimshottari timing, Shadbala strength, Ashtakavarga BAV/SAV field support, live Moon-based transits,
          detected yogas/doshas, Jaimini identity markers, and psychological synthesis. This is a rule-based
          narrative forecast, not a random text generator.
        </p>
      </div>
    </div>
  );
}

// MAIN SHELL
// ═══════════════════════════════════════════════════════════════════════════════

export function DashboardShell() {
  type Tab = 'overview' | 'forecast' | 'dasha' | 'shadbala' | 'jaimini' | 'psychology' | 'transits';

  const [tab,          setTab]          = useState<Tab>('overview');
  const [engineData,   setEngineData]   = useState<EngineData | null>(null);
  const [transit,      setTransit]      = useState<DynamicTransitOutput | null>(null);
  const [moonRashiIdx, setMoonRashiIdx] = useState(0);
  const [birthDate,    setBirthDate]    = useState<Date | null>(null);
  const [subjectLabel, setSubjectLabel] = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  async function handleSubmit(form: BirthSubmitData) {
    setLoading(true);
    setError(null);
    try {
      let lat = form.lat ?? 28.6139, lng = form.lng ?? 77.2090;
      if (form.lat === undefined || form.lng === undefined) {
        const geo = await searchLocation(form.location);
        if (geo.length > 0) { lat = geo[0].lat; lng = geo[0].lon; }
      }

      const bd = parseBirthDate(form.date, form.time);
      setBirthDate(bd);

      // Compute sync engine + async transits concurrently
      const ed = assembleEngineData(bd, lat, lng);
      const moonPlanet = ed.planets.find((p: any) => p.name === 'Moon');
      const moonIdx    = moonPlanet?.rashiIndex ?? 0;
      setMoonRashiIdx(moonIdx);

      const [_, transitOut] = await Promise.all([
        Promise.resolve(ed),
        calculateDynamicTransits({ moonRashiIndex: moonIdx, date: new Date() }).catch(() => null),
      ]);

      setEngineData(ed);
      setTransit(transitOut as DynamicTransitOutput | null);
      setSubjectLabel(`${form.location} · ${form.date} ${form.time} IST`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Computation failed');
    } finally {
      setLoading(false);
    }
  }

  // ── Birth input gate ─────────────────────────────────────────────────────────

  if (!engineData || !birthDate) {
    return (
      <div className="glow-card overflow-hidden shadow-lg border border-white/10 bg-[#090b0f]">
        <div className="px-5 pt-5 pb-4 border-b border-white/10 bg-[#111722]">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🌌</span>
            <div>
              <h1 className="text-lg font-bold text-white">Vedic Rajkumar Dashboard</h1>
              <p className="text-xs text-slate-400">All six engine layers · One birth input</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['⏳ Vimshottari Dasha','💪 Shadbala','🧘 100+ Yogas','🪬 Jaimini','🧠 Psychology','🔭 Live Transits'].map(t => (
              <span key={t} className="text-[9px] border border-white/10 text-slate-400 rounded-full px-2 py-0.5">{t}</span>
            ))}
          </div>
        </div>
        <div className="p-5 bg-[#0d1118]">
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 p-3 text-xs">
              <span className="font-bold">Error: </span>{error}
            </div>
          )}
          {loading ? (
            <div className="flex flex-col items-center py-16 gap-4 text-slate-400">
              <div className="animate-spin h-12 w-12 border-t-2 border-amber-500 border-solid rounded-full" />
              <div className="text-center">
                <p className="text-sm font-medium">Computing all six layers…</p>
                <p className="text-xs text-slate-500 mt-1">
                  Shadbala · Dasha · 100+ Yogas · Jaimini · Psychology · Live Transits
                </p>
              </div>
            </div>
          ) : (
            <EnhancedBirthInputForm lang="en" onSubmit={handleSubmit} showAutoSave={false} showProgress={true} />
          )}
        </div>
      </div>
    );
  }

  // ── Shell ────────────────────────────────────────────────────────────────────

  const TABS: { id: Tab; icon: string; label: string }[] = [
    { id:'overview',   icon:'🌌', label:'Overview'  },
    { id:'forecast',   icon:'*', label:'Forecast'  },
    { id:'dasha',      icon:'⏳', label:'Dasha'     },
    { id:'shadbala',   icon:'💪', label:'Strength'  },
    { id:'jaimini',    icon:'🪬', label:'Jaimini'   },
    { id:'psychology', icon:'🧠', label:'Psych'     },
    { id:'transits',   icon:'🔭', label:'Transits'  },
  ];

  return (
    <div className="glow-card overflow-hidden shadow-lg border border-white/10 bg-[#090b0f] text-left">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-0 border-b border-white/10 bg-[#111722]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🌌</span>
          <div>
            <h1 className="text-base font-bold text-white">Vedic Rajkumar Dashboard</h1>
            <p className="text-xs text-slate-400">{subjectLabel}</p>
          </div>
          <button
            onClick={() => { setEngineData(null); setBirthDate(null); setTransit(null); }}
            className="ml-auto text-[10px] text-slate-500 hover:text-amber-400 border border-white/10 hover:border-amber-500/40 rounded px-2 py-0.5 transition-all"
          >
            ↩ New Chart
          </button>
        </div>

        {/* Transit live badge */}
        {transit && (
          <div className="mt-2 mb-3">
            {(() => {
              const s = TRANSIT_STATUS[transit.overallStatus] ?? TRANSIT_STATUS.mixed;
              const n = normaliseScore(transit.totalScore);
              return (
                <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border ${s.bg} ${s.border} ${s.color} font-semibold`}>
                  {s.icon} Today: {s.label} · {n}/100
                </span>
              );
            })()}
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-0.5 overflow-x-auto pb-px scrollbar-hide">
          {TABS.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-3 py-2 text-xs font-semibold flex items-center gap-1 whitespace-nowrap transition-all ${
                tab === id ? 'border-b-2 border-amber-500 text-amber-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 space-y-4 max-h-[700px] overflow-y-auto bg-[#0d1118]">
        {tab === 'overview'   && <OverviewTab   engineData={engineData} transit={transit} birthDate={birthDate} onTabChange={id => setTab(id as Tab)} />}
        {tab === 'forecast'   && <GrandfatherForecastTab engineData={engineData} transit={transit} birthDate={birthDate} subjectLabel={subjectLabel} />}
        {tab === 'dasha'      && <DashaTab      engineData={engineData} birthDate={birthDate} />}
        {tab === 'shadbala'   && <ShadabalaYogaTab engineData={engineData} />}
        {tab === 'jaimini'    && <JaiminiTab    engineData={engineData} birthDate={birthDate} />}
        {tab === 'psychology' && <PsychologyTab engineData={engineData} />}
        {tab === 'transits'   && <TransitsTab   moonRashiIdx={moonRashiIdx} initialTransit={transit} />}
      </div>
    </div>
  );
}
