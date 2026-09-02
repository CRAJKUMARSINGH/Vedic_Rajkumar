/**
 * ShadbalaPanel.tsx — Six-fold Planetary Strength Visualiser
 *
 * DROP THIS FILE INTO: src/components/ShadbalaPanel.tsx
 *
 * Visualises the Shadbala system (BPHS Chapter 27) using the data already
 * computed by `assembleEngineData()` — zero recomputation, zero new deps.
 *
 * FOUR TABS:
 *   1. Overview   — all 7 planets ranked by Shadbala ratio, strongest/weakest callout,
 *                   ratio bar relative to the required minimum
 *   2. Six Balas  — per-planet breakdown of all 6 components with proportional bars
 *                   and classical interpretation of each component
 *   3. Modifiers  — Vargottama / Combustion / Neecha Bhanga table with explanations
 *   4. Delivery   — delivery class (full/standard/conditional/diluted/broken) per planet
 *                   with the practical meaning for predictions
 *
 * USAGE (in a dashboard page):
 *   import { ShadbalaPanel } from '@/components/ShadbalaPanel';
 *   <ShadbalaPanel />
 *
 * DEPENDENCIES (all already in the repo):
 *   - src/services/engineDataAssembler.ts  → assembleEngineData()
 *   - src/services/geocodingService.ts     → searchLocation()
 *   - src/components/EnhancedBirthInputForm.tsx
 *
 * TYPES USED (already exported by shadabalaService.ts):
 *   ShadabalaResult, ShadabalaAnalysis
 */

import { useState } from "react";
import { assembleEngineData } from "@/services/engineDataAssembler";
import { searchLocation } from "@/services/geocodingService";
import EnhancedBirthInputForm from "@/components/EnhancedBirthInputForm";
import type { ShadabalaResult, ShadabalaAnalysis } from "@/services/shadabalaService";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ComputedData {
  shadabala:         ShadabalaResult[];
  shadabalaAnalysis: ShadabalaAnalysis;
  subjectLabel:      string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☀', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄',
};

const PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

/** Dig Bala peak house for each planet — BPHS Ch.27 */
const DIG_BALA_HOUSE: Record<string, string> = {
  Sun:     '10th house',
  Moon:    '4th house',
  Mars:    '10th house',
  Mercury: '1st house',
  Jupiter: '1st house',
  Venus:   '4th house',
  Saturn:  '7th house',
};

const STRENGTH_LABEL: Record<string, string> = {
  'very-strong': 'Very Strong',
  'strong':      'Strong',
  'average':     'Average',
  'weak':        'Weak',
  'very-weak':   'Very Weak',
};

const STRENGTH_COLORS: Record<string, { text: string; bg: string; border: string; bar: string }> = {
  'very-strong': { text: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', bar: 'bg-emerald-500' },
  'strong':      { text: 'text-green-300',   bg: 'bg-green-500/10',   border: 'border-green-500/25',   bar: 'bg-green-500'   },
  'average':     { text: 'text-yellow-300',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/25',  bar: 'bg-yellow-500'  },
  'weak':        { text: 'text-red-300',     bg: 'bg-red-500/10',     border: 'border-red-500/25',     bar: 'bg-red-500'     },
  'very-weak':   { text: 'text-red-200',     bg: 'bg-red-800/20',     border: 'border-red-700/40',     bar: 'bg-red-700'     },
};

const DELIVERY_COLORS: Record<string, string> = {
  full:        'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  standard:    'bg-green-500/15  border-green-500/30  text-green-300',
  conditional: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300',
  diluted:     'bg-orange-500/15 border-orange-500/30 text-orange-300',
  broken:      'bg-red-800/20    border-red-700/40    text-red-200',
};

const DELIVERY_DESC: Record<string, string> = {
  full:        'All promised results delivered completely — this planet operates at its full classical potential.',
  standard:    'Results delivered as expected. No special boosts or impediments.',
  conditional: 'Results are contingent on dasha, transit, or house activation. Watch the timing carefully.',
  diluted:     'The planet\'s promises are only partly fulfilled — some interference from combustion, debility, or malefic aspects.',
  broken:      'Severely hampered. Promises may not materialise, or may come with significant delays and struggles.',
};

const BALA_META: Array<{ key: keyof ShadabalaResult; label: string; maxApprox: number; classical: string }> = [
  {
    key:       'sthanaBala',
    label:     'Sthana Bala',
    maxApprox: 4,
    classical: 'Positional strength from exaltation, own-sign, Moolatrikona, and divisional dignity. Highest when the planet is at exact exaltation degree.',
  },
  {
    key:       'digBala',
    label:     'Dig Bala',
    maxApprox: 1,
    classical: 'Directional strength — each planet has a preferred house where it gains full Dig Bala. Weakest in the opposite house.',
  },
  {
    key:       'kalaBala',
    label:     'Kala Bala',
    maxApprox: 3,
    classical: 'Temporal strength from Hora, day/night birth, month, year, and ayana. Sun and benefics are stronger in the day; Moon and malefics at night.',
  },
  {
    key:       'chestaBala',
    label:     'Chesta Bala',
    maxApprox: 1,
    classical: 'Motional strength. Retrograde planets gain maximum Chesta Bala — a retrograde planet acts with exceptional intensity, for good or ill.',
  },
  {
    key:       'naisargikaBala',
    label:     'Naisargika Bala',
    maxApprox: 1,
    classical: 'Natural, fixed strength: Sun > Moon > Venus > Jupiter > Mercury > Mars > Saturn. Never changes — it is the planet\'s inherent cosmic weight.',
  },
  {
    key:       'drikBala',
    label:     'Drik Bala',
    maxApprox: 2,
    classical: 'Aspectual strength. Benefic aspects (Jupiter, Venus) add points; malefic aspects (Saturn, Mars) subtract. Can go negative.',
  },
];

// ─── Helper components ─────────────────────────────────────────────────────────

function RatioBar({ ratio, strength }: { ratio: number; strength: string }) {
  const cl  = STRENGTH_COLORS[strength] ?? STRENGTH_COLORS.average;
  // Cap visual at 200 % so outliers don't break the layout
  const pct = Math.min(ratio / 2, 1) * 100;
  return (
    <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
      <div
        className={`absolute inset-y-0 left-0 rounded-full transition-all ${cl.bar}`}
        style={{ width: `${pct}%` }}
      />
      {/* 100 % marker */}
      <div className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
    </div>
  );
}

function BalaBar({ value, maxApprox }: { value: number; maxApprox: number }) {
  const pct = Math.min(Math.max(value / maxApprox, 0), 1) * 100;
  return (
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-amber-500 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ModifierBadge({ planet }: { planet: ShadabalaResult }) {
  const badges: Array<{ label: string; style: string; tip: string }> = [];

  if (planet.isVargottama)
    badges.push({ label: 'Vargottama', style: 'bg-purple-500/20 border-purple-500/40 text-purple-300', tip: 'Same rashi in D1 & D9 — inherent dignity boost across divisions.' });
  if (planet.isCombust)
    badges.push({ label: 'Combust', style: 'bg-red-500/20 border-red-500/40 text-red-300', tip: 'Within 8–15° of Sun — planet\'s independent significations are suppressed.' });
  if (planet.neechaBhangaActive)
    badges.push({ label: 'Neecha Bhanga', style: 'bg-amber-500/20 border-amber-500/40 text-amber-300', tip: 'Debilitation cancelled — the initial struggle transforms into resilience.' });
  if (badges.length === 0)
    badges.push({ label: 'None', style: 'bg-white/5 border-white/10 text-slate-500', tip: 'No special modifiers active.' });

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map(b => (
        <span key={b.label} title={b.tip} className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${b.style}`}>
          {b.label}
        </span>
      ))}
    </div>
  );
}

// ─── Main panel ────────────────────────────────────────────────────────────────

export function ShadbalaPanel() {
  type Tab = 'overview' | 'sixbalas' | 'modifiers' | 'delivery';

  const [tab,          setTab]         = useState<Tab>('overview');
  const [activePlanet, setActivePlanet]= useState<string>('Jupiter');
  const [data,         setData]        = useState<ComputedData | null>(null);
  const [isComputing,  setIsComputing] = useState(false);
  const [error,        setError]       = useState<string | null>(null);

  function parseBirthDate(date: string, time: string): Date {
    const [y, m, d] = date.split('-').map(Number);
    const [h, min]  = time.split(':').map(Number);
    return new Date(y, m - 1, d, h, min, 0);
  }

  async function handleSubmit(form: { date: string; time: string; location: string }) {
    setIsComputing(true);
    setError(null);
    try {
      let lat = 28.6139, lng = 77.2090;
      const geo = await searchLocation(form.location);
      if (geo.length > 0) { lat = geo[0].lat; lng = geo[0].lon; }
      const birthDate  = parseBirthDate(form.date, form.time);
      const engineData = assembleEngineData(birthDate, lat, lng);
      setData({
        shadabala:         engineData.shadabala,
        shadabalaAnalysis: engineData.shadabalaAnalysis,
        subjectLabel:      `${form.location} · ${form.date} ${form.time} IST`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Computation failed');
    } finally {
      setIsComputing(false);
    }
  }

  // ── Birth input gate ─────────────────────────────────────────────────────────

  if (!data) {
    return (
      <div className="glow-card overflow-hidden shadow-lg border border-white/10 bg-[#090b0f]">
        <div className="px-5 pt-5 pb-4 border-b border-white/10 bg-[#111722]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">⚡</span>
            <h2 className="text-base font-bold text-white">Shadbala — Six-fold Planetary Strength</h2>
          </div>
          <p className="text-xs text-slate-400">
            BPHS Chapter 27 · Sthana · Dig · Kala · Chesta · Naisargika · Drik Bala.
            Enter birth details to compute.
          </p>
        </div>
        <div className="p-5 bg-[#0d1118]">
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 p-3 text-xs">
              <span className="font-bold">Error: </span>{error}
            </div>
          )}
          {isComputing ? (
            <div className="flex flex-col items-center py-16 gap-3 text-slate-400">
              <div className="animate-spin h-10 w-10 border-t-2 border-amber-500 border-solid rounded-full" />
              <p className="text-sm">Computing Shadbala…</p>
              <p className="text-xs text-slate-500">
                Sthana · Dig · Kala · Chesta · Naisargika · Drik Bala · Vargottama · Neecha Bhanga
              </p>
            </div>
          ) : (
            <EnhancedBirthInputForm lang="en" onSubmit={handleSubmit} showAutoSave={false} showProgress={true} />
          )}
        </div>
      </div>
    );
  }

  const { shadabala, shadabalaAnalysis, subjectLabel } = data;

  // Sort by ratio descending for ranking view
  const ranked = [...shadabala].sort((a, b) => b.shadabalaRatio - a.shadabalaRatio);
  const activePlanetData = shadabala.find(p => p.planet === activePlanet) ?? shadabala[0];

  return (
    <div className="glow-card overflow-hidden shadow-lg border border-white/10 bg-[#090b0f] text-left">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-0 border-b border-white/10 bg-[#111722]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">⚡</span>
          <h2 className="text-base font-bold text-white">Shadbala — Six-fold Planetary Strength</h2>
          <button
            onClick={() => setData(null)}
            className="ml-auto text-[10px] text-slate-500 hover:text-amber-400 border border-white/10 hover:border-amber-500/40 rounded px-2 py-0.5 transition-all"
          >
            ↩ New Chart
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          {subjectLabel} · Strongest: {shadabalaAnalysis.strongestPlanet} · Weakest: {shadabalaAnalysis.weakestPlanet}
        </p>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-px scrollbar-hide">
          {([
            { id: 'overview',  icon: '📊', label: 'Overview'   },
            { id: 'sixbalas',  icon: '⚡', label: 'Six Balas'  },
            { id: 'modifiers', icon: '🔮', label: 'Modifiers'  },
            { id: 'delivery',  icon: '🎯', label: 'Delivery'   },
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

        {/* ══ OVERVIEW ══ */}
        {tab === 'overview' && (
          <div className="space-y-4">

            {/* Strongest / Weakest callout */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '🏆 Strongest Planet', planet: shadabalaAnalysis.strongestPlanet },
                { label: '⚠ Weakest Planet',   planet: shadabalaAnalysis.weakestPlanet   },
              ].map(({ label, planet }) => {
                const p = shadabala.find(x => x.planet === planet);
                if (!p) return null;
                const cl = STRENGTH_COLORS[p.strength] ?? STRENGTH_COLORS.average;
                return (
                  <div key={planet} className={`rounded-xl border p-4 ${cl.bg} ${cl.border}`}>
                    <p className="text-[10px] text-slate-400 mb-1">{label}</p>
                    <p className={`text-lg font-bold ${cl.text}`}>
                      {PLANET_SYMBOLS[planet]} {planet}
                    </p>
                    <p className={`text-xs mt-1 ${cl.text}`}>
                      {p.totalRupas.toFixed(2)} Rupas
                      <span className="opacity-60"> / {p.requiredRupas} req.</span>
                    </p>
                    <p className={`text-[10px] mt-1 font-semibold uppercase tracking-wide ${cl.text}`}>
                      {STRENGTH_LABEL[p.strength]}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Ranked planet list */}
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 space-y-3">
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
                All Planets — Ranked by Shadbala Ratio
              </p>
              <p className="text-[10px] text-slate-500">
                Ratio = Total Rupas ÷ Required Rupas. Above 1.0 = planet exceeds classical minimum.
                The vertical line marks 1.0 (exact minimum).
              </p>

              {ranked.map((p, i) => {
                const cl = STRENGTH_COLORS[p.strength] ?? STRENGTH_COLORS.average;
                return (
                  <div key={p.planet} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-4">{i + 1}.</span>
                        <span className={`text-sm font-bold ${cl.text}`}>
                          {PLANET_SYMBOLS[p.planet]} {p.planet}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase ${cl.bg} ${cl.border} ${cl.text}`}>
                          {STRENGTH_LABEL[p.strength]}
                        </span>
                        {p.activeModifier && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded border bg-purple-500/15 border-purple-500/30 text-purple-300 font-semibold">
                            {p.activeModifier}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold tabular-nums ${cl.text}`}>
                          {p.shadabalaRatio.toFixed(2)}×
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">
                          ({p.totalRupas.toFixed(1)} / {p.requiredRupas})
                        </span>
                      </div>
                    </div>
                    <RatioBar ratio={p.shadabalaRatio} strength={p.strength} />
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-900/10 p-3 text-xs text-amber-200/80 leading-relaxed">
              <span className="font-bold text-amber-400">Analysis: </span>
              {shadabalaAnalysis.summary.en}
            </div>
          </div>
        )}

        {/* ══ SIX BALAS ══ */}
        {tab === 'sixbalas' && (
          <div className="space-y-4">

            {/* Planet picker */}
            <div className="flex flex-wrap gap-2">
              {PLANET_ORDER.map(p => {
                const pd = shadabala.find(x => x.planet === p);
                if (!pd) return null;
                const cl = STRENGTH_COLORS[pd.strength] ?? STRENGTH_COLORS.average;
                return (
                  <button
                    key={p}
                    onClick={() => setActivePlanet(p)}
                    className={`px-3 py-1.5 text-xs rounded-full border font-semibold transition-all ${
                      activePlanet === p
                        ? `${cl.bg} ${cl.border} ${cl.text}`
                        : 'border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {PLANET_SYMBOLS[p]} {p}
                  </button>
                );
              })}
            </div>

            {activePlanetData && (() => {
              const cl = STRENGTH_COLORS[activePlanetData.strength] ?? STRENGTH_COLORS.average;
              return (
                <div className="space-y-3">
                  {/* Planet header */}
                  <div className={`rounded-xl border p-4 ${cl.bg} ${cl.border}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{PLANET_SYMBOLS[activePlanetData.planet]}</span>
                        <div>
                          <p className={`text-base font-bold ${cl.text}`}>{activePlanetData.planet}</p>
                          <p className="text-[10px] text-slate-400">{activePlanetData.label.en}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold tabular-nums ${cl.text}`}>
                          {activePlanetData.shadabalaRatio.toFixed(2)}×
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {activePlanetData.totalRupas.toFixed(2)} / {activePlanetData.requiredRupas} Rupas
                        </p>
                      </div>
                    </div>
                    <RatioBar ratio={activePlanetData.shadabalaRatio} strength={activePlanetData.strength} />
                  </div>

                  {/* Six bala breakdown */}
                  {BALA_META.map(({ key, label, maxApprox, classical }) => {
                    const raw   = activePlanetData[key] as number;
                    const value = typeof raw === 'number' ? raw : 0;
                    const pct   = Math.min(value / maxApprox, 1) * 100;
                    const isNaisargika = key === 'naisargikaBala';
                    const isChesta     = key === 'chestaBala';
                    const isDrik       = key === 'drikBala';
                    const isNeg        = isDrik && value < 0;
                    return (
                      <div key={label} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white">{label}</p>
                          <div className="flex items-center gap-2">
                            {isChesta && activePlanetData.isRetrograde && (
                              <span className="text-[9px] bg-purple-500/20 border border-purple-500/30 text-purple-300 px-1.5 rounded">Retrograde ↑</span>
                            )}
                            {isNaisargika && (
                              <span className="text-[9px] text-slate-500">Fixed hierarchy</span>
                            )}
                            <span className={`text-sm font-bold tabular-nums ${isNeg ? 'text-red-400' : 'text-amber-400'}`}>
                              {value.toFixed(3)}
                            </span>
                          </div>
                        </div>
                        {/* Bar */}
                        {!isNeg ? (
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
                          </div>
                        ) : (
                          <div className="h-1.5 bg-red-900/30 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(Math.abs(value) / maxApprox, 1) * 100}%` }} />
                          </div>
                        )}
                        {/* Dig Bala peak note */}
                        {key === 'digBala' && (
                          <p className="text-[10px] text-slate-500">
                            Peak Dig Bala in the {DIG_BALA_HOUSE[activePlanetData.planet]}.
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 leading-relaxed">{classical}</p>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ══ MODIFIERS ══ */}
        {tab === 'modifiers' && (
          <div className="space-y-4">

            {/* Explanation card */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-900/10 p-3 text-xs text-amber-200/80 leading-relaxed space-y-1">
              <p><span className="font-bold text-purple-300">Vargottama</span> — planet occupies the same rashi in both D1 (natal) and D9 (Navamsa). Amplifies all significations.</p>
              <p><span className="font-bold text-red-300">Combustion</span> — planet within 8–15° of the Sun loses independent expression. The Sun absorbs its energy.</p>
              <p><span className="font-bold text-amber-300">Neecha Bhanga</span> — debilitation cancelled by a cancelling condition. Initial suffering transforms into tenacity and eventual success.</p>
            </div>

            {/* Planet modifier table */}
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 space-y-2">
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-3">
                Modifier Status — All Planets
              </p>
              {PLANET_ORDER.map(name => {
                const p = shadabala.find(x => x.planet === name);
                if (!p) return null;
                const cl = STRENGTH_COLORS[p.strength] ?? STRENGTH_COLORS.average;
                const hasModifier = p.isVargottama || p.isCombust || p.neechaBhangaActive;
                return (
                  <div
                    key={name}
                    className={`rounded-lg border p-3 ${hasModifier ? 'border-white/15 bg-white/[0.04]' : 'border-white/5 bg-white/[0.01]'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-sm font-bold ${cl.text}`}>{PLANET_SYMBOLS[name]} {name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-semibold ${cl.bg} ${cl.border} ${cl.text}`}>
                          {STRENGTH_LABEL[p.strength]}
                        </span>
                      </div>
                      <ModifierBadge planet={p} />
                    </div>

                    {/* Modifier detail */}
                    {p.activeModifier && (
                      <div className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                        {p.activeModifier === 'vargottama' && (
                          <>Vargottama {name}: same rashi in D1 and D9 gives inherent dignity across all divisional charts.
                          The planet's core significations are expressed with unusual purity.</>
                        )}
                        {p.activeModifier === 'combustion' && (
                          <>{name} is combust — its independent significations are suppressed.
                          The Sun channels its qualities through solar themes (authority, government, father, will-power)
                          but the planet's own domain (e.g. Venus = relationships, Mercury = communication) suffers.</>
                        )}
                        {p.activeModifier === 'neecha-bhanga' && (
                          <>Neecha Bhanga active for {name} — the debilitation is cancelled.
                          Classic pattern: early life difficulties in {name}'s domains are overcome,
                          and the native develops unusual resilience and skill in those areas.</>
                        )}
                      </div>
                    )}

                    {/* Modifiers applied list */}
                    {p.modifiersApplied.length > 0 && (
                      <p className="mt-1 text-[10px] text-slate-500">
                        Applied: {p.modifiersApplied.join(', ')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Base vs modified Rupas comparison */}
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-3">
                Base Rupas vs. Modified Rupas
              </p>
              {PLANET_ORDER.map(name => {
                const p = shadabala.find(x => x.planet === name);
                if (!p) return null;
                const diff   = p.modifiedRupas - p.baseRupas;
                const cl     = STRENGTH_COLORS[p.strength] ?? STRENGTH_COLORS.average;
                return (
                  <div key={name} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <span className={`text-xs font-semibold ${cl.text}`}>{PLANET_SYMBOLS[name]} {name}</span>
                    <div className="flex items-center gap-3 text-xs tabular-nums">
                      <span className="text-slate-400">{p.baseRupas.toFixed(2)} base</span>
                      {diff !== 0 && (
                        <span className={diff > 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                        </span>
                      )}
                      <span className={`font-bold ${cl.text}`}>{p.modifiedRupas.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ DELIVERY ══ */}
        {tab === 'delivery' && (
          <div className="space-y-4">

            <div className="rounded-lg border border-amber-500/20 bg-amber-900/10 p-3 text-xs text-amber-200/80 leading-relaxed">
              <span className="font-bold text-amber-400">Delivery Class</span> — beyond raw strength, a planet's
              ability to actually deliver its promised results depends on combustion, neecha status,
              house placement, and aspectual support. The class below reflects the practical outcome.
            </div>

            {/* Gate score + delivery class cards */}
            {PLANET_ORDER.map(name => {
              const p = shadabala.find(x => x.planet === name);
              if (!p) return null;
              const cl      = STRENGTH_COLORS[p.strength] ?? STRENGTH_COLORS.average;
              const dcStyle = DELIVERY_COLORS[p.deliveryClass] ?? '';
              const gatePct = Math.min(p.gateScore / 10, 1) * 100;
              return (
                <div key={name} className="rounded-xl border border-white/10 bg-white/[0.025] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-bold ${cl.text}`}>{PLANET_SYMBOLS[name]} {name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold capitalize ${dcStyle}`}>
                        {p.deliveryClass}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Gate Score: </span>
                      <span className={`text-sm font-bold ${cl.text}`}>{p.gateScore.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Gate score bar */}
                  <div className="space-y-1">
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          p.deliveryClass === 'full'        ? 'bg-emerald-500' :
                          p.deliveryClass === 'standard'    ? 'bg-green-500'   :
                          p.deliveryClass === 'conditional' ? 'bg-yellow-500'  :
                          p.deliveryClass === 'diluted'     ? 'bg-orange-500'  :
                          'bg-red-600'
                        }`}
                        style={{ width: `${gatePct}%` }}
                      />
                    </div>
                  </div>

                  {/* Delivery description */}
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {DELIVERY_DESC[p.deliveryClass]}
                  </p>

                  {/* Practical implication */}
                  <div className="text-[10px] text-slate-500 leading-relaxed border-t border-white/5 pt-2">
                    {p.deliveryClass === 'full' && (
                      `${name} operates at maximum capacity. In its mahadasha or antardasha, expect full, unimpeded manifestation of its house and sign significations.`
                    )}
                    {p.deliveryClass === 'standard' && (
                      `${name} delivers what it promises, with proportional results in its dasha periods. No special amplification or suppression.`
                    )}
                    {p.deliveryClass === 'conditional' && (
                      `${name}'s results depend heavily on favourable transits (especially Jupiter's transit over ${name}'s natal position) and supportive antardasha lords.`
                    )}
                    {p.deliveryClass === 'diluted' && (
                      `${name}'s dasha periods will bring the promised results only partially — expect delays, substitutions, or reduced intensity. Remedial measures (gemstones, mantras, charitable acts) are classically indicated.`
                    )}
                    {p.deliveryClass === 'broken' && (
                      `${name}'s significations are severely hampered. Its mahadasha may invert expectations — the areas ${name} governs require conscious effort and remediation to prevent negative outcomes.`
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
