/**
 * YogaInsightsPanel.tsx — Vedic Yoga Visualiser
 *
 * DROP THIS FILE INTO: src/components/YogaInsightsPanel.tsx
 *
 * Visualises the `yogaAnalysis` already computed by `assembleEngineData()`
 * — zero recomputation, all data is pre-built by yogaService + yogaExtendedService.
 *
 * FOUR TABS:
 *   1. Summary    — category counts, overall grade, top-5 strongest present yogas,
 *                   summary narrative from yogaService
 *   2. Active     — all present yogas grouped by category (raj/dhana/mahapurusha/spiritual/special)
 *                   with strength badge, Hindi name, planet list, classical description
 *   3. Doshas     — dosha yogas only; lifecycle status (ACTIVE/EMERGING/LATENT/BROKEN)
 *                   plus the remediation note from the lifecycle gate
 *   4. Timing     — per-yoga lifecycle detail: Shadbala gate, dasha activation window,
 *                   transit support note — answers "when will this yoga deliver?"
 *
 * DEPENDENCIES (all already in the repo):
 *   - src/services/engineDataAssembler.ts      → assembleEngineData()
 *   - src/services/geocodingService.ts         → searchLocation()
 *   - src/components/EnhancedBirthInputForm.tsx
 *   - (types only) src/services/yogaService.ts
 *
 * USAGE:
 *   import { YogaInsightsPanel } from '@/components/YogaInsightsPanel';
 *   <YogaInsightsPanel />
 */

import { useState, useMemo } from "react";
import { assembleEngineData }  from "../services/engineDataAssembler";
import { searchLocation }      from "../services/geocodingService";
import EnhancedBirthInputForm from "./EnhancedBirthInputForm";
import type { YogaResult, YogaAnalysis } from "../services/yogaService";

// ─── Constants ──────────────────────────────────────────────────────────────────

type YogaCategory = 'raj' | 'dhana' | 'mahapurusha' | 'dosha' | 'spiritual' | 'special';

const CATEGORY_META: Record<YogaCategory, { label: string; icon: string; color: string; bg: string; border: string; desc: string }> = {
  raj:          { label: 'Rajayoga',       icon: '👑', color: 'text-amber-300',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   desc: 'Kendra-Trikona combinations that grant power, authority, and recognition.' },
  dhana:        { label: 'Dhana Yoga',     icon: '💰', color: 'text-green-300',   bg: 'bg-green-500/10',   border: 'border-green-500/25',   desc: 'Wealth-producing yogas from lords of 2nd, 11th, and trine houses.' },
  mahapurusha:  { label: 'Mahapurusha',    icon: '🏆', color: 'text-purple-300',  bg: 'bg-purple-500/10',  border: 'border-purple-500/25',  desc: 'Panch Mahapurusha — a planet strong in a kendra in own or exaltation sign.' },
  dosha:        { label: 'Dosha',          icon: '⚠',  color: 'text-red-300',     bg: 'bg-red-500/10',     border: 'border-red-500/25',     desc: 'Challenging combinations that need conscious management or remediation.' },
  spiritual:    { label: 'Spiritual',      icon: '🪷', color: 'text-cyan-300',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/25',    desc: 'Yogas associated with moksha, renunciation, and spiritual attainment.' },
  special:      { label: 'Special',        icon: '✨', color: 'text-rose-300',    bg: 'bg-rose-500/10',    border: 'border-rose-500/25',    desc: 'Rare or unique combinations not covered by the standard categories.' },
};

const STRENGTH_STYLE: Record<string, { label: string; style: string }> = {
  strong:   { label: 'Strong',   style: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' },
  moderate: { label: 'Moderate', style: 'bg-yellow-500/15  border-yellow-500/30  text-yellow-300'  },
  weak:     { label: 'Weak',     style: 'bg-slate-500/15   border-slate-500/30   text-slate-400'   },
};

const LIFECYCLE_STYLE: Record<string, { label: string; style: string; icon: string }> = {
  ACTIVE:   { label: 'Active',   style: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', icon: '🟢' },
  EMERGING: { label: 'Emerging', style: 'bg-blue-500/15    border-blue-500/30    text-blue-300',    icon: '🔵' },
  LATENT:   { label: 'Latent',   style: 'bg-yellow-500/15  border-yellow-500/30  text-yellow-300',  icon: '🟡' },
  BROKEN:   { label: 'Broken',   style: 'bg-red-800/20     border-red-700/40     text-red-300',     icon: '🔴' },
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☀', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function planetSymbols(planets: string[]): string {
  return planets.map(p => `${PLANET_SYMBOLS[p] ?? ''}${p}`).join(' · ');
}

function parseBirthDate(date: string, time: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min]  = time.split(':').map(Number);
  return new Date(y, m - 1, d, h, min, 0);
}

// ─── Yoga card ─────────────────────────────────────────────────────────────────

function YogaCard({ yoga, showLifecycle = false }: { yoga: YogaResult; showLifecycle?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const cat  = CATEGORY_META[yoga.category as YogaCategory] ?? CATEGORY_META.special;
  const str  = STRENGTH_STYLE[yoga.strength]   ?? STRENGTH_STYLE.weak;
  const lc   = yoga.lifecycle ? (LIFECYCLE_STYLE[yoga.lifecycle.status] ?? LIFECYCLE_STYLE.LATENT) : null;

  return (
    <div className={`rounded-xl border ${cat.border} ${cat.bg} transition-all`}>
      {/* Header */}
      <button
        className="w-full flex items-start gap-3 px-4 py-3 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <span className="text-xl shrink-0 mt-0.5">{cat.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className={`text-sm font-bold ${cat.color}`}>{yoga.name}</span>
            {yoga.nameHi && (
              <span className="text-[11px] text-slate-500 font-normal">{yoga.nameHi}</span>
            )}
            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase ${str.style}`}>
              {str.label}
            </span>
            {lc && (
              <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${lc.style}`}>
                {lc.icon} {lc.label}
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400">{planetSymbols(yoga.planets)}</p>
        </div>
        <span className="text-slate-600 text-xs shrink-0 mt-1">{expanded ? '▾' : '▸'}</span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-white/5 px-4 pb-3 pt-2 space-y-3">
          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed">{yoga.description.en}</p>
          {yoga.description.hi && (
            <p className="text-[11px] text-slate-500 leading-relaxed">{yoga.description.hi}</p>
          )}

          {/* Houses involved */}
          {yoga.houses.filter(h => h > 0).length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-slate-500">Houses:</span>
              {yoga.houses.filter(h => h > 0).map((h, i) => (
                <span key={i} className="text-[10px] bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-slate-300">
                  H{h}
                </span>
              ))}
            </div>
          )}

          {/* Lifecycle block */}
          {showLifecycle && yoga.lifecycle && (
            <div className={`rounded-lg border p-3 text-xs space-y-1.5 ${lc?.style ?? ''}`}>
              <p className="font-bold">{lc?.icon} {lc?.label} — {yoga.lifecycle.statusReason}</p>
              {yoga.lifecycle.shadbalaGate && (
                <p className="opacity-80"><span className="font-semibold">Shadbala gate: </span>{yoga.lifecycle.shadbalaGate}</p>
              )}
              {yoga.lifecycle.dashaActivation && (
                <p className="opacity-80"><span className="font-semibold">Dasha activation: </span>{yoga.lifecycle.dashaActivation}</p>
              )}
              {yoga.lifecycle.transitSupport && (
                <p className="opacity-80"><span className="font-semibold">Transit support: </span>{yoga.lifecycle.transitSupport}</p>
              )}
              {yoga.lifecycle.involvedPlanets?.length > 0 && (
                <p className="opacity-70"><span className="font-semibold">Planets: </span>{planetSymbols(yoga.lifecycle.involvedPlanets)}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function YogaInsightsPanel() {
  type Tab = 'summary' | 'active' | 'doshas' | 'timing';

  const [tab,          setTab]         = useState<Tab>('summary');
  const [yogaAnalysis, setYogaAnalysis]= useState<YogaAnalysis | null>(null);
  const [subjectLabel, setSubjectLabel]= useState('');
  const [isComputing,  setIsComputing] = useState(false);
  const [error,        setError]       = useState<string | null>(null);
  const [showAll,      setShowAll]     = useState(false);

  async function handleSubmit(form: { date: string; time: string; location: string }) {
    setIsComputing(true);
    setError(null);
    try {
      let lat = 28.6139, lng = 77.2090;
      const geo = await searchLocation(form.location);
      if (geo.length > 0) { lat = geo[0].lat; lng = geo[0].lon; }
      const birthDate  = parseBirthDate(form.date, form.time);
      const engineData = assembleEngineData(birthDate, lat, lng);
      setYogaAnalysis(engineData.yogaAnalysis);
      setSubjectLabel(`${form.location} · ${form.date} ${form.time} IST`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Computation failed');
    } finally {
      setIsComputing(false);
    }
  }

  // ── Birth input gate ─────────────────────────────────────────────────────────

  if (!yogaAnalysis) {
    return (
      <div className="glow-card overflow-hidden shadow-lg border border-white/10 bg-[#090b0f]">
        <div className="px-5 pt-5 pb-4 border-b border-white/10 bg-[#111722]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🧘</span>
            <h2 className="text-base font-bold text-white">Yoga Insights — 100+ Vedic Yogas</h2>
          </div>
          <p className="text-xs text-slate-400">
            Rajayoga · Dhana · Mahapurusha · Dosha · Spiritual · Special —
            with lifecycle status and dasha activation windows.
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
              <p className="text-sm">Detecting Yogas…</p>
              <p className="text-xs text-slate-500">Scanning 100+ combinations · Rajayoga · Dhana · Mahapurusha · Dosha</p>
            </div>
          ) : (
            <EnhancedBirthInputForm lang="en" onSubmit={handleSubmit} showAutoSave={false} showProgress={true} />
          )}
        </div>
      </div>
    );
  }

  // ── Derived data ─────────────────────────────────────────────────────────────

  const { yogas, presentYogas, doshaYogas, summary } = yogaAnalysis;

  // Group present (non-dosha) by category for the Active tab
  const byCategory = useMemo(() => {
    const groups: Partial<Record<YogaCategory, YogaResult[]>> = {};
    for (const y of presentYogas.filter(y => y.category !== 'dosha')) {
      if (!groups[y.category as YogaCategory]) groups[y.category as YogaCategory] = [];
      groups[y.category as YogaCategory]!.push(y);
    }
    return groups;
  }, [presentYogas]);

  // Top-5 strongest present yogas for Summary
  const topYogas = useMemo(() => {
    const ranked = [...presentYogas].sort((a, b) => {
      const order = { strong: 3, moderate: 2, weak: 1 };
      return (order[b.strength] ?? 0) - (order[a.strength] ?? 0);
    });
    return ranked.slice(0, 5);
  }, [presentYogas]);

  // Category counts
  const catCounts = useMemo(() => {
    const counts: Partial<Record<YogaCategory, number>> = {};
    for (const y of presentYogas) {
      counts[y.category as YogaCategory] = (counts[y.category as YogaCategory] ?? 0) + 1;
    }
    return counts;
  }, [presentYogas]);

  // Yogas with lifecycle for Timing tab
  const withLifecycle = useMemo(() =>
    presentYogas.filter(y => y.lifecycle),
  [presentYogas]);

  // Overall grade: count of strong + moderate yogas (excluding doshas)
  const positiveYogas = presentYogas.filter(y => y.category !== 'dosha');
  const strongCount   = positiveYogas.filter(y => y.strength === 'strong').length;
  const modCount      = positiveYogas.filter(y => y.strength === 'moderate').length;
  const grade =
    strongCount >= 4   ? { label: 'Exceptional',  color: 'text-emerald-400', sub: 'Rare combination of strong yogas — profound life advantages.' } :
    strongCount >= 2   ? { label: 'Outstanding',  color: 'text-green-400',   sub: 'Multiple strong yogas ensure significant achievements.'       } :
    strongCount >= 1   ? { label: 'Above Average', color: 'text-lime-400',   sub: 'At least one strong yoga gives distinct advantage in life.'   } :
    modCount >= 3      ? { label: 'Good',          color: 'text-yellow-400',  sub: 'Several moderate yogas bring steady progress and support.'    } :
    modCount >= 1      ? { label: 'Average',       color: 'text-amber-400',   sub: 'Some support, but yogas need dasha activation to fully deliver.' } :
                         { label: 'Challenging',   color: 'text-red-400',     sub: 'Few positive yogas detected — focus on remediation and effort.'   };

  return (
    <div className="glow-card overflow-hidden shadow-lg border border-white/10 bg-[#090b0f] text-left">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-0 border-b border-white/10 bg-[#111722]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🧘</span>
          <h2 className="text-base font-bold text-white">Yoga Insights</h2>
          <button
            onClick={() => setYogaAnalysis(null)}
            className="ml-auto text-[10px] text-slate-500 hover:text-amber-400 border border-white/10 hover:border-amber-500/40 rounded px-2 py-0.5 transition-all"
          >
            ↩ New Chart
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          {subjectLabel} · {presentYogas.length} yogas detected · {strongCount} strong · {doshaYogas.length} doshas
        </p>
        <div className="flex gap-1 overflow-x-auto pb-px scrollbar-hide">
          {([
            { id: 'summary', icon: '📊', label: 'Summary'  },
            { id: 'active',  icon: '⭐', label: 'Active'   },
            { id: 'doshas',  icon: '⚠',  label: 'Doshas'   },
            { id: 'timing',  icon: '⏳', label: 'Timing'   },
          ] as { id: Tab; icon: string; label: string }[]).map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-3 py-2 text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                tab === id ? 'border-b-2 border-amber-500 text-amber-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              {icon} {label}
              {id === 'doshas' && doshaYogas.length > 0 && (
                <span className="text-[9px] bg-red-500/20 border border-red-500/30 text-red-300 rounded-full px-1.5">
                  {doshaYogas.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 space-y-4 max-h-[640px] overflow-y-auto bg-[#0d1118]">

        {/* ══ SUMMARY ══ */}
        {tab === 'summary' && (
          <div className="space-y-4">

            {/* Overall grade */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-900/10 p-4 flex items-center gap-4">
              <div className="text-center shrink-0">
                <p className={`text-2xl font-bold ${grade.color}`}>{grade.label}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Yoga Profile</p>
              </div>
              <div className="border-l border-white/10 pl-4">
                <p className="text-xs text-slate-300 leading-relaxed">{grade.sub}</p>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">{summary.en}</p>
              </div>
            </div>

            {/* Category count grid */}
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(CATEGORY_META) as [YogaCategory, typeof CATEGORY_META[YogaCategory]][]).map(([cat, meta]) => {
                const count = catCounts[cat] ?? 0;
                return (
                  <div key={cat} className={`rounded-lg border p-2.5 text-center ${count > 0 ? `${meta.bg} ${meta.border}` : 'bg-white/[0.02] border-white/5 opacity-40'}`}>
                    <p className="text-lg">{meta.icon}</p>
                    <p className={`text-xl font-bold ${count > 0 ? meta.color : 'text-slate-600'}`}>{count}</p>
                    <p className="text-[9px] text-slate-500 leading-tight">{meta.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Strength breakdown */}
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-3">
                Strength Breakdown — Present Yogas
              </p>
              {[
                { label: 'Strong',   count: strongCount,                              style: 'bg-emerald-500' },
                { label: 'Moderate', count: modCount,                                 style: 'bg-yellow-500' },
                { label: 'Weak',     count: positiveYogas.filter(y=>y.strength==='weak').length, style: 'bg-slate-500' },
              ].map(({ label, count, style }) => (
                <div key={label} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-slate-400 w-16">{label}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${style}`}
                      style={{ width: `${positiveYogas.length > 0 ? (count / positiveYogas.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white w-4 text-right">{count}</span>
                </div>
              ))}
            </div>

            {/* Top 5 yogas */}
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-3">Top Yogas</p>
              {topYogas.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No strong yogas detected. Effort and remediation are the path forward.</p>
              ) : (
                <div className="space-y-2">
                  {topYogas.map((y, i) => {
                    const cat = CATEGORY_META[y.category as YogaCategory] ?? CATEGORY_META.special;
                    const str = STRENGTH_STYLE[y.strength] ?? STRENGTH_STYLE.weak;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-base">{cat.icon}</span>
                        <div className="flex-1">
                          <p className={`text-xs font-bold ${cat.color}`}>{y.name}</p>
                          <p className="text-[10px] text-slate-500">{planetSymbols(y.planets)}</p>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${str.style}`}>
                          {str.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ ACTIVE YOGAS ══ */}
        {tab === 'active' && (
          <div className="space-y-5">
            {positiveYogas.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
                <p className="text-slate-500 text-sm">No positive yogas detected.</p>
                <p className="text-slate-600 text-xs mt-1">Check the Doshas tab for any challenging combinations.</p>
              </div>
            ) : (
              (Object.entries(CATEGORY_META) as [YogaCategory, typeof CATEGORY_META[YogaCategory]][])
                .filter(([cat]) => cat !== 'dosha' && (byCategory[cat]?.length ?? 0) > 0)
                .map(([cat, meta]) => (
                  <div key={cat}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{meta.icon}</span>
                      <p className={`text-xs font-bold uppercase tracking-wide ${meta.color}`}>{meta.label}</p>
                      <span className={`text-[9px] px-1.5 rounded-full border ${meta.bg} ${meta.border} ${meta.color}`}>
                        {byCategory[cat]?.length ?? 0}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-2 ml-7">{meta.desc}</p>
                    <div className="space-y-1.5 ml-2">
                      {byCategory[cat]!.map((y, i) => (
                        <YogaCard key={i} yoga={y} />
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* ══ DOSHAS ══ */}
        {tab === 'doshas' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-red-500/20 bg-red-900/10 p-3 text-xs text-red-200/80 leading-relaxed">
              <span className="font-bold text-red-400">About Doshas: </span>
              Doshas are challenging planetary combinations that require awareness and management.
              A dosha does not doom the native — many great individuals have prominent doshas.
              The lifecycle status (Active/Emerging/Latent/Broken) indicates the current phase.
              Cancellation (Bhanga) conditions can fully or partially neutralise a dosha.
            </div>

            {doshaYogas.length === 0 ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-900/10 p-6 text-center">
                <p className="text-emerald-400 font-bold text-sm">No doshas detected 🌿</p>
                <p className="text-slate-400 text-xs mt-1">The chart is free of major challenging combinations.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {doshaYogas.map((y, i) => (
                  <YogaCard key={i} yoga={y} showLifecycle />
                ))}
              </div>
            )}

            {/* General remediation note */}
            {doshaYogas.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 text-xs space-y-2 text-slate-400">
                <p className="font-semibold text-white text-sm">General Remediation Principles</p>
                <p>• <span className="text-slate-300 font-medium">Awareness</span> — understanding a dosha's domain reduces its unconscious impact.</p>
                <p>• <span className="text-slate-300 font-medium">Dasha timing</span> — doshas intensify during the mahadasha of the involved planet(s).</p>
                <p>• <span className="text-slate-300 font-medium">Gemstones</span> — strengthen the lord of the most benefic house in your chart (not the dosha planet).</p>
                <p>• <span className="text-slate-300 font-medium">Charitable acts</span> — donate items associated with the dosha planet on its weekday.</p>
                <p>• <span className="text-slate-300 font-medium">Mantra</span> — recite the beeja mantra of the dosha planet to consciously channel its energy.</p>
              </div>
            )}
          </div>
        )}

        {/* ══ TIMING ══ */}
        {tab === 'timing' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-500/20 bg-amber-900/10 p-3 text-xs text-amber-200/80 leading-relaxed">
              <span className="font-bold text-amber-400">How yogas activate: </span>
              A yoga in the birth chart is a promise — it delivers results when three gates align:
              (1) the Shadbala of the yoga planets meets the minimum required,
              (2) the mahadasha or antardasha of an involved planet is running,
              and (3) a supporting transit (typically Jupiter or the yoga's planet itself) confirms it.
            </div>

            {withLifecycle.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center">
                <p className="text-slate-500 text-sm">No lifecycle data available for the detected yogas.</p>
                <p className="text-slate-600 text-xs mt-1">This may be added in a future update of yogaService.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {withLifecycle.map((y, i) => {
                  const lc   = LIFECYCLE_STYLE[y.lifecycle!.status] ?? LIFECYCLE_STYLE.LATENT;
                  const cat  = CATEGORY_META[y.category as YogaCategory] ?? CATEGORY_META.special;
                  return (
                    <div key={i} className={`rounded-xl border p-4 space-y-3 ${lc.style}`}>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base">{cat.icon}</span>
                            <span className="text-sm font-bold">{y.name}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${STRENGTH_STYLE[y.strength]?.style}`}>
                              {STRENGTH_STYLE[y.strength]?.label}
                            </span>
                          </div>
                          <p className="text-[10px] mt-0.5 opacity-70">{planetSymbols(y.planets)}</p>
                        </div>
                        <span className="shrink-0 font-bold text-xs">{lc.icon} {lc.label}</span>
                      </div>

                      {/* Three gates */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex gap-1.5">
                          <span className="shrink-0 opacity-60">①</span>
                          <div>
                            <span className="font-semibold opacity-90">Shadbala gate: </span>
                            <span className="opacity-80">{y.lifecycle!.shadbalaGate || 'Not specified.'}</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <span className="shrink-0 opacity-60">②</span>
                          <div>
                            <span className="font-semibold opacity-90">Dasha activation: </span>
                            <span className="opacity-80">{y.lifecycle!.dashaActivation || 'Not specified.'}</span>
                          </div>
                        </div>
                        {y.lifecycle!.transitSupport && (
                          <div className="flex gap-1.5">
                            <span className="shrink-0 opacity-60">③</span>
                            <div>
                              <span className="font-semibold opacity-90">Transit support: </span>
                              <span className="opacity-80">{y.lifecycle!.transitSupport}</span>
                            </div>
                          </div>
                        )}
                        {y.lifecycle!.statusReason && (
                          <div className="border-t border-current/20 pt-1.5 opacity-80 italic">
                            {y.lifecycle!.statusReason}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Show all yogas toggle */}
            <div className="pt-2 border-t border-white/5">
              <button
                onClick={() => setShowAll(s => !s)}
                className="text-xs text-slate-500 hover:text-amber-400 transition-colors"
              >
                {showAll ? '▴ Show fewer' : `▾ Show all ${yogas.length} yogas including absent ones`}
              </button>
              {showAll && (
                <div className="mt-3 space-y-1.5">
                  {yogas.filter(y => !y.isPresent).map((y, i) => {
                    const cat = CATEGORY_META[y.category as YogaCategory] ?? CATEGORY_META.special;
                    return (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 opacity-40">
                        <span className="text-xs">{cat.icon}</span>
                        <span className="text-xs text-slate-500 line-through">{y.name}</span>
                        <span className="text-[9px] text-slate-600">{y.nameHi}</span>
                        <span className="ml-auto text-[9px] text-slate-600 uppercase">absent</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
