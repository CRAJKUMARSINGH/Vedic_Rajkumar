/**
 * AshtakavargaPanel.tsx — Complete Ashtakavarga UI Panel
 *
 * DROP THIS FILE INTO: src/components/AshtakavargaPanel.tsx
 *
 * Implements all features from Brihat Jataka (Varahamihira, Ch.IX):
 *   ● SAV Chart   — 12-house colour-coded score grid (≥30 green, 25-29 yellow, <25 red)
 *   ● BAV Tabs    — per-planet charts (Sun/Moon/Mars/Mercury/Jupiter/Venus/Saturn)
 *   ● Wealth      — Varahamihira's three-condition wealth formula verdict
 *   ● Life Thirds — happiest phase of life from SAV sign totals
 *   ● Transits    — BAV-based verdict for current planet transit positions
 *   ● Insights    — children count (Jupiter), disease windows (Saturn), Sade Sati severity
 *
 * DEPENDENCIES:
 *   - src/services/ashtakavargaService.ts     → calculateAshtakavarga(), classifiers
 *   - src/services/engineDataAssembler.ts     → assembleEngineData()
 *   - src/services/geocodingService.ts        → searchLocation()
 *   - src/components/EnhancedBirthInputForm.tsx
 *
 * USAGE (in a page or dashboard):
 *   import { AshtakavargaPanel } from '@/components/AshtakavargaPanel';
 *   <AshtakavargaPanel />
 */

import { useState } from "react";
import {
  calculateAshtakavarga,
  classifySAVScore,
  classifyBAVScore,
  RASHI_NAMES_SHORT,
  type AshtakavargaResult,
  type PlanetName,
} from '@/services/classicalAshtakavargaService';
import { assembleEngineData } from '@/services/engineDataAssembler';
import { searchLocation } from '@/services/geocodingService';
import EnhancedBirthInputForm, { type BirthSubmitData } from '@/components/EnhancedBirthInputForm';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const SEVEN_PLANETS: PlanetName[] = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];

const PLANET_SYMBOLS: Record<PlanetName, string> = {
  Sun: '☀', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄',
};

const VERDICT_STYLE: Record<string, string> = {
  Excellent: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  Good:      'bg-green-500/15  border-green-500/30  text-green-300',
  Neutral:   'bg-yellow-500/15 border-yellow-500/30 text-yellow-300',
  Difficult: 'bg-red-500/15    border-red-500/30    text-red-300',
  Severe:    'bg-red-800/30    border-red-700/50    text-red-200 font-bold',
};

function parseBirthDate(date: string, time: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min]  = time.split(':').map(Number);
  return new Date(y, m - 1, d, h, min, 0);
}

// ─── SAV Score Cell ────────────────────────────────────────────────────────────

function SAVCell({ score, house, signName }: { score: number; house: number; signName: string }) {
  const cls = classifySAVScore(score);
  const bg =
    cls.color === 'green'  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' :
    cls.color === 'yellow' ? 'bg-yellow-500/15  border-yellow-500/30  text-yellow-200' :
                             'bg-red-500/15     border-red-500/30     text-red-200';
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border p-2 ${bg}`}>
      <span className="text-[9px] text-slate-400 leading-tight">{signName}</span>
      <span className="text-xs text-slate-400 leading-tight">H{house}</span>
      <span className="text-xl font-bold leading-tight">{score}</span>
      <span className="text-[8px] leading-tight opacity-70">{cls.label}</span>
    </div>
  );
}

// ─── BAV Score Cell ────────────────────────────────────────────────────────────

function BAVCell({ score }: { score: number }) {
  const bg =
    score >= 5  ? 'bg-emerald-500/20 text-emerald-300' :
    score >= 3  ? 'bg-yellow-500/15  text-yellow-300'  :
    score === 0 ? 'bg-red-800/30     text-red-200 font-bold' :
                  'bg-red-500/10     text-red-300';
  return (
    <div className={`flex items-center justify-center rounded text-sm font-bold h-8 w-8 ${bg}`}>
      {score}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function AshtakavargaPanel() {
  type Tab = 'sav' | 'bav' | 'wealth' | 'thirds' | 'transits' | 'forecast' | 'insights';
  const [tab,          setTab]         = useState<Tab>('sav');
  const [activePlanet, setActivePlanet]= useState<PlanetName>('Jupiter');
  const [avarga,       setAvarga]      = useState<AshtakavargaResult | null>(null);
  const [subjectLabel, setSubjectLabel]= useState<string>('');
  const [isComputing,  setIsComputing] = useState(false);
  const [error,        setError]       = useState<string | null>(null);

  // ── Form submit ──────────────────────────────────────────────────────────────

  async function handleSubmit(data: BirthSubmitData) {
    setIsComputing(true);
    setError(null);
    try {
      let lat = data.lat ?? 28.6139, lng = data.lng ?? 77.2090;
      if (data.lat === undefined || data.lng === undefined) {
        const geo = await searchLocation(data.location);
        if (geo.length > 0) { lat = geo[0].lat; lng = geo[0].lon; }
      }

      const birthDate  = parseBirthDate(data.date, data.time);
      const engineData = assembleEngineData(birthDate, lat, lng);
      const result     = calculateAshtakavarga(engineData.planets, engineData.lagnaRashiIdx);

      setAvarga(result);
      setSubjectLabel(`${data.location} · ${data.date} ${data.time} IST`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Computation failed');
    } finally {
      setIsComputing(false);
    }
  }

  // ── Birth input gate ─────────────────────────────────────────────────────────

  if (!avarga) {
    return (
      <div className="glow-card overflow-hidden shadow-lg border border-white/10 bg-[#090b0f]">
        <div className="px-5 pt-5 pb-4 border-b border-white/10 bg-[#111722]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🔢</span>
            <h2 className="text-base font-bold text-white">Ashtakavarga — Varahamihira System</h2>
          </div>
          <p className="text-xs text-slate-400">
            Complete BAV + SAV analysis from Brihat Jataka Ch.IX. Enter birth details to begin.
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
              <p className="text-sm">Computing Ashtakavarga…</p>
              <p className="text-xs text-slate-500">Calculating 7 BAV charts · Trikona + Ekadhipataya reduction · SAV synthesis</p>
            </div>
          ) : (
            <EnhancedBirthInputForm lang="en" onSubmit={handleSubmit} showAutoSave={false} showProgress={true} />
          )}
        </div>
      </div>
    );
  }

  const { sav, bav, wealthFormula, lifeThirds, transitForToday, planetInsights, lagnaRashiIdx } = avarga;

  // House labels: rashi names reindexed from Lagna
  const houseRashis    = Array.from({ length: 12 }, (_, i) => (lagnaRashiIdx + i) % 12);
  const houseSignNames = houseRashis.map(r => RASHI_NAMES_SHORT[r]);

  return (
    <div className="glow-card overflow-hidden shadow-lg border border-white/10 bg-[#090b0f] text-left">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-0 border-b border-white/10 bg-[#111722]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🔢</span>
          <h2 className="text-base font-bold text-white">Ashtakavarga — Varahamihira System</h2>
          <button
            onClick={() => { setAvarga(null); setTab('sav'); }}
            className="ml-auto text-[10px] text-slate-500 hover:text-amber-400 border border-white/10 hover:border-amber-500/40 rounded px-2 py-0.5 transition-all"
          >
            ↩ New Chart
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-3">{subjectLabel} · SAV total: {sav.total} pts</p>
        <div className="flex gap-1 overflow-x-auto pb-px scrollbar-hide">
          {([
            { id: 'sav',      icon: '📊', label: 'SAV Chart'   },
            { id: 'bav',      icon: '🪐', label: 'Planet BAV'  },
            { id: 'wealth',   icon: '💰', label: 'Wealth'      },
            { id: 'thirds',   icon: '⏳', label: 'Life Thirds' },
            { id: 'transits', icon: '🌐', label: 'Transits'    },
            { id: 'forecast', icon: '*', label: 'BAV Forecast' },
            { id: 'insights', icon: '📖', label: 'Insights'    },
          ] as { id: Tab; icon: string; label: string }[]).map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-3 py-2 text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                tab === id ? 'border-b-2 border-amber-500 text-amber-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{icon}</span>{label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 space-y-4 max-h-[640px] overflow-y-auto bg-[#0d1118]">

        {/* ══ SAV CHART ══ */}
        {tab === 'sav' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
                  Sarvashtakavarga — 12-House Score Map
                </p>
                <span className="text-[10px] text-slate-400">Total: {sav.total} / 337</span>
              </div>
              <div className="grid grid-cols-6 gap-2 mb-2">
                {houseRashis.map((r, i) => (
                  <SAVCell
                    key={i}
                    score={sav.reduced[r]}
                    house={i + 1}
                    signName={RASHI_NAMES_SHORT[r]}
                  />
                ))}
              </div>
              {/* Legend */}
              <div className="flex gap-4 text-[10px] text-slate-400 mt-3 justify-center">
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500/40" /> ≥30 Benefic</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-500/30" /> 25-29 Neutral</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500/30" /> &lt;25 Difficult</span>
              </div>
            </div>

            {/* SAV rule reminder */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-900/10 p-3 text-xs text-amber-200/80 leading-relaxed">
              <span className="font-bold text-amber-400">Varahamihira's Golden Rule: </span>
              Any planet transiting a house scoring ≥30 delivers benefic results regardless of its nature.
              Scoring &lt;25 brings difficulties even for Jupiter or Venus.
              This is why Sade Sati feels different for every person.
            </div>
          </div>
        )}

        {/* ══ BAV (Planet-wise) ══ */}
        {tab === 'bav' && (
          <div className="space-y-4">
            {/* Planet picker */}
            <div className="flex flex-wrap gap-2">
              {SEVEN_PLANETS.map(p => (
                <button
                  key={p}
                  onClick={() => setActivePlanet(p)}
                  className={`px-3 py-1.5 text-xs rounded-full border font-semibold transition-all ${
                    activePlanet === p
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {PLANET_SYMBOLS[p]} {p}
                </button>
              ))}
            </div>

            {/* BAV chart for selected planet */}
            {(() => {
              const pb = bav[activePlanet];
              return (
                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 space-y-4">
                  <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
                    {PLANET_SYMBOLS[activePlanet]} {activePlanet} — Bhinnashtakavarga (0–8 per house)
                  </p>

                  {/* Score grid */}
                  <div className="flex gap-1.5 flex-wrap">
                    {houseRashis.map((r, i) => (
                      <div key={i} className="flex flex-col items-center gap-0.5">
                        <span className="text-[8px] text-slate-500">H{i+1}</span>
                        <BAVCell score={pb.reduced[r]} />
                        <span className="text-[8px] text-slate-500">{RASHI_NAMES_SHORT[r].substring(0,3)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Peak and zero analysis */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                      <p className="font-bold text-emerald-400 mb-1">Peak Signs (≥5)</p>
                      {pb.reduced
                        .map((s, i) => ({ s, r: i }))
                        .filter(x => x.s >= 5)
                        .length === 0
                        ? <p className="text-slate-400 italic">No peak signs — planet is moderate throughout.</p>
                        : pb.reduced
                            .map((s, r) => ({ s, r }))
                            .filter(x => x.s >= 5)
                            .map(({ s, r }) => (
                              <p key={r} className="text-emerald-300">
                                {RASHI_NAMES_SHORT[r]}: {s}/8
                              </p>
                            ))
                      }
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="font-bold text-red-400 mb-1">Zero-Score Signs ⚠</p>
                      {pb.reduced
                        .map((s, r) => ({ s, r }))
                        .filter(x => x.s === 0)
                        .length === 0
                        ? <p className="text-slate-400 italic">No zero-score signs.</p>
                        : pb.reduced
                            .map((s, r) => ({ s, r }))
                            .filter(x => x.s === 0)
                            .map(({ r }) => (
                              <p key={r} className="text-red-300">{RASHI_NAMES_SHORT[r]}: 0/8</p>
                            ))
                      }
                    </div>
                  </div>

                  {/* Classical insight for this planet */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-xs text-slate-400 italic">
                    <span className="font-semibold text-slate-300 not-italic">Classical Rule: </span>
                    {pb.insight}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ══ WEALTH FORMULA ══ */}
        {tab === 'wealth' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 space-y-4">
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
                Varahamihira's Wealth Formula — SAV
              </p>

              {/* Three conditions */}
              <div className="space-y-2">
                {[
                  {
                    condition: `11th house (${wealthFormula.eleventhScore}) > 10th house (${wealthFormula.tenthScore})`,
                    met: wealthFormula.gainExceedsEffort,
                    rule: 'Gain exceeds effort. Wealth comes more easily than the work put in.',
                  },
                  {
                    condition: `12th house (${wealthFormula.twelfthScore}) < 11th house (${wealthFormula.eleventhScore})`,
                    met: wealthFormula.lossesSmaller,
                    rule: 'Losses are smaller than gains. Outflow does not outpace inflow.',
                  },
                  {
                    condition: `Lagna (${wealthFormula.lagnaScore}) > 12th house (${wealthFormula.twelfthScore})`,
                    met: wealthFormula.wealthProtected,
                    rule: 'Wealth is protected. The native\'s own strength guards against dissipation.',
                  },
                ].map(({ condition, met, rule }, i) => (
                  <div key={i} className={`rounded-lg border p-3 ${met ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/20'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-base ${met ? 'text-green-400' : 'text-red-400'}`}>{met ? '✓' : '✗'}</span>
                      <span className={`text-xs font-bold ${met ? 'text-green-300' : 'text-red-300'}`}>{condition}</span>
                    </div>
                    <p className="text-[11px] mt-1 text-slate-400 leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>

              {/* Final verdict */}
              <div className={`rounded-xl border p-4 ${wealthFormula.allThreeMet ? 'bg-emerald-500/15 border-emerald-500/40' : 'bg-slate-800/40 border-white/10'}`}>
                <p className={`text-sm font-bold mb-1 ${wealthFormula.allThreeMet ? 'text-emerald-300' : 'text-slate-300'}`}>
                  {wealthFormula.allThreeMet ? '🏆 All Three Conditions Met' : `${[wealthFormula.gainExceedsEffort, wealthFormula.lossesSmaller, wealthFormula.wealthProtected].filter(Boolean).length}/3 Conditions Met`}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">{wealthFormula.verdict}</p>
              </div>
            </div>

            {/* SAV scores for wealth houses */}
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-3">
                Wealth-House SAV Scores
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Lagna (H1)', score: wealthFormula.lagnaScore },
                  { label: '10th (H10)', score: wealthFormula.tenthScore },
                  { label: '11th (H11)', score: wealthFormula.eleventhScore },
                  { label: '12th (H12)', score: wealthFormula.twelfthScore },
                ].map(({ label, score }) => {
                  const cls = classifySAVScore(score);
                  return (
                    <div key={label} className={`rounded-lg border p-3 text-center ${
                      cls.color === 'green' ? 'bg-emerald-500/15 border-emerald-500/30' :
                      cls.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/20' :
                      'bg-red-500/10 border-red-500/20'
                    }`}>
                      <p className="text-[9px] text-slate-400">{label}</p>
                      <p className={`text-2xl font-bold ${
                        cls.color === 'green' ? 'text-emerald-300' :
                        cls.color === 'yellow' ? 'text-yellow-300' : 'text-red-300'
                      }`}>{score}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ LIFE THIRDS ══ */}
        {tab === 'thirds' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-500/20 bg-amber-900/10 p-3 text-xs text-amber-200/80 leading-relaxed">
              <span className="font-bold text-amber-400">Varahamihira's Rule: </span>
              The section of life (early / middle / final) with the highest SAV sign total is the happiest phase.
              Three or more malefic planets in one section bring real suffering in that third of life.
            </div>

            {[
              { data: lifeThirds.firstThird,  emoji: '🌱' },
              { data: lifeThirds.middleThird, emoji: '🌿' },
              { data: lifeThirds.finalThird,  emoji: '🍂' },
            ].map(({ data, emoji }) => {
              const isHappiest = lifeThirds.happiestPhase.startsWith(data.label);
              return (
                <div
                  key={data.label}
                  className={`rounded-xl border p-4 ${isHappiest ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/[0.02] border-white/10'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm font-bold ${isHappiest ? 'text-emerald-300' : 'text-white'}`}>
                      {emoji} {data.label}
                      {isHappiest && <span className="ml-2 text-[10px] bg-emerald-500/30 px-2 py-0.5 rounded-full">Happiest Phase</span>}
                    </p>
                    <span className={`text-xl font-bold ${isHappiest ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {data.total}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{data.signs.join(' · ')}</p>
                  {/* Mini score bar */}
                  <div className="flex gap-1">
                    {data.rashis.map(r => {
                      const s = sav.reduced[r];
                      const cls = classifySAVScore(s);
                      return (
                        <div key={r} className="flex-1">
                          <div className={`h-8 rounded flex items-center justify-center text-xs font-bold ${
                            cls.color === 'green' ? 'bg-emerald-500/30 text-emerald-300' :
                            cls.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>{s}</div>
                          <p className="text-[8px] text-slate-500 text-center mt-0.5">{RASHI_NAMES_SHORT[r].substring(0,3)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ TRANSITS ══ */}
        {tab === 'transits' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Transit verdicts for each planet at its <em>natal</em> position. Run against current transits
              by passing live rashi positions to <code className="text-amber-400">predictTransit()</code>.
            </p>

            <div className="space-y-2">
              {transitForToday.map(t => (
                <div key={t.planet} className={`rounded-lg border p-3 ${VERDICT_STYLE[t.verdict] ?? ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold">
                      {PLANET_SYMBOLS[t.planet as PlanetName]} {t.planet}
                      <span className="text-xs font-normal ml-2 opacity-80">in {t.sign}</span>
                      {t.isUpachaya && <span className="ml-2 text-[9px] border rounded px-1 py-0.5 opacity-60">Upachaya</span>}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]">BAV {t.bavScore}/8</span>
                      <span className="text-[10px]">SAV {t.savScore}</span>
                      <span className="text-xs font-bold">{t.verdict}</span>
                    </div>
                  </div>
                  <p className="text-xs opacity-80 leading-relaxed">{t.detail}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-blue-500/20 bg-blue-900/10 p-3 text-xs text-blue-300 leading-relaxed">
              <span className="font-bold">Sade Sati note: </span>
              {planetInsights.sadeSatiSeverity}
            </div>
          </div>
        )}

        {/* == BAV FORECAST == */}
        {tab === 'forecast' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-500/20 bg-amber-900/10 p-4">
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-2">
                Ashtakavarga BAV Forecast Map
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                This is the chart's prose forecast layer. A planet gets priority when its own BAV score is 5/8 or higher and the receiving sign's SAV is 30 or higher. BAV 0-2 or SAV below 25 becomes a caution zone, especially during that planet's dasha or important transit contact.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="text-sm font-bold text-emerald-300 mb-2">Strong Forecast Zones</p>
                {transitForToday.filter(t => t.bavScore >= 5 || t.savScore >= 30).length === 0 ? (
                  <p className="text-xs text-slate-400">No dominant green zone in this pass. Use mixed results with caution and confirm by dasha.</p>
                ) : transitForToday
                    .filter(t => t.bavScore >= 5 || t.savScore >= 30)
                    .map(t => (
                      <p key={t.planet} className="text-xs text-emerald-100 leading-relaxed mb-2">
                        <span className="font-semibold">{t.planet} in {t.sign}:</span> BAV {t.bavScore}/8 and SAV {t.savScore}. This supports cleaner delivery of the planet's agenda and gives better timing for initiatives ruled by {t.planet}.
                      </p>
                    ))}
              </div>

              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm font-bold text-red-300 mb-2">Caution Forecast Zones</p>
                {transitForToday.filter(t => t.bavScore <= 2 || t.savScore < 25).length === 0 ? (
                  <p className="text-xs text-slate-400">No severe red zone in this pass. The chart still needs dasha and house lord confirmation.</p>
                ) : transitForToday
                    .filter(t => t.bavScore <= 2 || t.savScore < 25)
                    .map(t => (
                      <p key={t.planet} className="text-xs text-red-100 leading-relaxed mb-2">
                        <span className="font-semibold">{t.planet} in {t.sign}:</span> BAV {t.bavScore}/8 and SAV {t.savScore}. This is a pressure window: reduce haste, check health/finance/legal commitments, and rely on remedial or conservative action.
                      </p>
                    ))}
              </div>
            </div>

            <div className="space-y-2">
              {transitForToday.map(t => (
                <div key={t.planet} className={`rounded-lg border p-3 ${VERDICT_STYLE[t.verdict] ?? ''}`}>
                  <p className="text-sm font-bold mb-1">
                    {PLANET_SYMBOLS[t.planet as PlanetName]} {t.planet} forecast in {t.sign}
                  </p>
                  <p className="text-xs leading-relaxed opacity-90">
                    The BAV score is {t.bavScore}/8 and the SAV support is {t.savScore}. In prose terms, this reads as <span className="font-semibold">{t.verdict.toLowerCase()}</span>: {t.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ INSIGHTS ══ */}
        {tab === 'insights' && (
          <div className="space-y-4">
            {[
              {
                icon: '👶', title: 'Children & Progeny (Jupiter BAV)',
                text: planetInsights.childrenExpected,
                source: 'Brihat Jataka, Ch.IX — Jupiter BAV score in 5th from Jupiter',
                border: 'border-blue-500/20 bg-blue-900/10',
                heading: 'text-blue-400',
              },
              {
                icon: '💍', title: 'Marriage & Wealth (Venus BAV)',
                text: planetInsights.marriageWealth,
                source: 'Varahamihira: Venus peak transit = marriage, wealth, land',
                border: 'border-pink-500/20 bg-pink-900/10',
                heading: 'text-pink-400',
              },
              {
                icon: '🏥', title: 'Disease Windows (Saturn BAV)',
                text: planetInsights.diseasePeriods,
                source: 'Brihat Jataka: Saturn BAV zero-score signs = disease/danger period',
                border: 'border-red-500/20 bg-red-900/10',
                heading: 'text-red-400',
              },
              {
                icon: '🪐', title: 'Sade Sati Severity (Saturn BAV)',
                text: planetInsights.sadeSatiSeverity,
                source: 'Saturn\'s transit through 12th/1st/2nd from Moon — BAV determines personal impact',
                border: 'border-purple-500/20 bg-purple-900/10',
                heading: 'text-purple-400',
              },
            ].map(({ icon, title, text, source, border, heading }) => (
              <div key={title} className={`rounded-xl border p-4 ${border}`}>
                <p className={`text-sm font-bold mb-1 ${heading}`}>{icon} {title}</p>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">{text}</p>
                <p className="text-[10px] text-slate-500 italic">{source}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
