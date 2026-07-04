/**
 * DashaTimeline.tsx — Vimshottari Dasha Interactive Timeline
 *
 * DROP THIS FILE INTO: src/components/DashaTimeline.tsx
 *
 * Renders the complete Vimshottari Dasha tree:
 *   Mahadasha → Antardasha → Pratyantar Dasha
 *
 * FEATURES:
 *   ● Full 120-year Mahadasha timeline — past periods faded, current amber,
 *     future normal; click any row to expand/collapse.
 *   ● Current Mahadasha + current Antardasha auto-expanded on load.
 *   ● Pratyantar Dasha rows shown inside each Antardasha when available.
 *   ● Planet strength indicator from Shadbala — ratio bar + colour tint
 *     shows how strongly the dasha lord can deliver its results.
 *   ● Birth details header: nakshatra, nakshatra lord, dasha balance at birth.
 *   ● "Today" banner pinned inside the current period at all three levels.
 *
 * DEPENDENCIES (all already in the repo):
 *   - src/services/engineDataAssembler.ts  → assembleEngineData()
 *   - src/services/geocodingService.ts     → searchLocation()
 *   - src/components/EnhancedBirthInputForm.tsx
 *   - (types only) src/services/dashaService.ts, shadabalaService.ts
 *
 * USAGE:
 *   import { DashaTimeline } from '@/components/DashaTimeline';
 *   <DashaTimeline />
 */

import { useState, useMemo } from "react";
import { assembleEngineData }    from "../services/engineDataAssembler";
import { searchLocation }        from "../services/geocodingService";
import EnhancedBirthInputForm   from "./EnhancedBirthInputForm";
import type { DashaResult, DashaPeriod, AntarDasha, PratyantarDasha } from "../services/dashaService";
import type { ShadabalaResult }  from "../services/shadabalaService";

// ─── Constants ─────────────────────────────────────────────────────────────────

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☀', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄',
  Rahu: '☊', Ketu: '☋',
};

const PLANET_COLORS: Record<string, { dot: string; bg: string; border: string; text: string; bar: string }> = {
  Sun:     { dot: 'bg-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/25',  text: 'text-orange-300',  bar: 'bg-orange-500'  },
  Moon:    { dot: 'bg-blue-300',    bg: 'bg-blue-500/10',    border: 'border-blue-500/25',    text: 'text-blue-300',    bar: 'bg-blue-400'    },
  Mars:    { dot: 'bg-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/25',     text: 'text-red-300',     bar: 'bg-red-500'     },
  Mercury: { dot: 'bg-green-400',   bg: 'bg-green-500/10',   border: 'border-green-500/25',   text: 'text-green-300',   bar: 'bg-green-500'   },
  Jupiter: { dot: 'bg-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/25',  text: 'text-yellow-300',  bar: 'bg-yellow-500'  },
  Venus:   { dot: 'bg-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/25',    text: 'text-pink-300',    bar: 'bg-pink-500'    },
  Saturn:  { dot: 'bg-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-500/25',   text: 'text-slate-300',   bar: 'bg-slate-400'   },
  Rahu:    { dot: 'bg-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/25',  text: 'text-violet-300',  bar: 'bg-violet-500'  },
  Ketu:    { dot: 'bg-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/25',    text: 'text-rose-300',    bar: 'bg-rose-500'    },
};

/** Duration in years, formatted cleanly */
function fmtYears(years: number): string {
  if (years >= 1) return `${years.toFixed(years % 1 === 0 ? 0 : 0)} yr`;
  return `${Math.round(years * 12)} mo`;
}

/** Duration in days → years/months/days string */
function fmtDays(days: number): string {
  const y = Math.floor(days / 365.25);
  const m = Math.floor((days % 365.25) / 30.44);
  const d = Math.floor(days % 30.44);
  const parts: string[] = [];
  if (y > 0) parts.push(`${y}y`);
  if (m > 0) parts.push(`${m}m`);
  if (d > 0 && y === 0) parts.push(`${d}d`);
  return parts.join(' ') || '< 1d';
}

/** Format date as "Jan 2026" */
function fmtDate(d: Date): string {
  return new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

/** Format date as "15 Jan 2026" */
function fmtDateLong(d: Date): string {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Whether a period is strictly in the past */
function isPast(end: Date): boolean  { return new Date(end)   < new Date(); }
/** Whether a period is strictly in the future */
function isFuture(start: Date): boolean { return new Date(start) > new Date(); }

// ─── Shadbala ratio → colour ──────────────────────────────────────────────────

function ratioToStrengthLabel(ratio: number | undefined): { label: string; color: string } {
  if (ratio === undefined) return { label: 'N/A', color: 'text-slate-500' };
  if (ratio >= 1.5) return { label: 'Very Strong', color: 'text-emerald-400' };
  if (ratio >= 1.0) return { label: 'Strong',      color: 'text-green-400'  };
  if (ratio >= 0.7) return { label: 'Average',     color: 'text-yellow-400' };
  if (ratio >= 0.5) return { label: 'Weak',        color: 'text-orange-400' };
  return               { label: 'Very Weak',       color: 'text-red-400'    };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Small strength pill shown next to a planet name */
function StrengthPill({
  planet,
  shadabala,
}: {
  planet:   string;
  shadabala: ShadabalaResult[];
}) {
  const sb = shadabala.find(s => s.planet === planet);
  if (!sb) return null;
  const { label, color } = ratioToStrengthLabel(sb.shadabalaRatio);
  return (
    <span className={`text-[9px] ${color} opacity-80`}>
      {sb.shadabalaRatio.toFixed(2)}× {label}
    </span>
  );
}

/** Mini ratio bar (width = ratio / 2, capped at 100%) */
function RatioBand({ planet, shadabala }: { planet: string; shadabala: ShadabalaResult[] }) {
  const sb  = shadabala.find(s => s.planet === planet);
  if (!sb) return null;
  const pct = Math.min(sb.shadabalaRatio / 2, 1) * 100;
  const cl  = PLANET_COLORS[planet];
  return (
    <div className="h-0.5 bg-white/5 rounded-full overflow-hidden mt-1">
      <div className={`h-full rounded-full ${cl?.bar ?? 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Pratyantar Dasha row ─────────────────────────────────────────────────────

function PDRow({ pd, shadabala }: { pd: PratyantarDasha; shadabala: ShadabalaResult[] }) {
  const cl     = PLANET_COLORS[pd.planet] ?? PLANET_COLORS.Ketu;
  const past   = isPast(pd.endDate);
  const future = isFuture(pd.startDate);
  const active = pd.isActive;

  return (
    <div className={`relative flex items-start gap-2 py-1.5 px-2 rounded-lg transition-colors ${
      active ? 'bg-amber-500/10 border border-amber-500/20'
             : past ? 'opacity-40' : ''
    }`}>
      {/* Timeline dot */}
      <div className="mt-1 shrink-0 relative">
        <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-amber-400' : past ? 'bg-white/20' : cl.dot}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className={`text-[11px] font-semibold ${active ? 'text-amber-300' : past ? 'text-slate-500' : cl.text}`}>
            {PLANET_SYMBOLS[pd.planet] ?? ''} {pd.planet}
            {active && <span className="ml-1.5 text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded px-1">NOW</span>}
          </span>
          <div className="text-[10px] text-slate-500 text-right">
            <span>{fmtDateLong(pd.startDate)}</span>
            <span className="mx-1">→</span>
            <span>{fmtDateLong(pd.endDate)}</span>
            <span className="ml-1.5 text-slate-600">({fmtDays(pd.durationDays)})</span>
          </div>
        </div>
        {active && (
          <StrengthPill planet={pd.planet} shadabala={shadabala} />
        )}
      </div>
    </div>
  );
}

// ─── Antardasha row ───────────────────────────────────────────────────────────

function ADRow({
  ad,
  shadabala,
  defaultOpen,
}: {
  ad:          AntarDasha;
  shadabala:   ShadabalaResult[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const cl     = PLANET_COLORS[ad.planet] ?? PLANET_COLORS.Ketu;
  const past   = isPast(ad.endDate);
  const active = ad.isActive;
  const hasPD  = ad.pratyantardashas && ad.pratyantardashas.length > 0;

  return (
    <div className={`rounded-lg border transition-all ${
      active ? 'border-amber-500/30 bg-amber-500/5'
             : past ? 'border-white/5 opacity-50'
                    : `${cl.border} ${cl.bg}`
    }`}>
      <button
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
        onClick={() => hasPD && setOpen(o => !o)}
        disabled={!hasPD}
      >
        {/* Timeline dot */}
        <div className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-amber-400' : past ? 'bg-white/20' : cl.dot}`} />

        {/* Planet + strength */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-xs font-bold ${active ? 'text-amber-300' : past ? 'text-slate-500' : cl.text}`}>
              {PLANET_SYMBOLS[ad.planet] ?? ''} {ad.planet} Antardasha
            </span>
            {active && (
              <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded px-1 font-semibold">NOW</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[10px] text-slate-500">
              {fmtDate(ad.startDate)} → {fmtDate(ad.endDate)}
              <span className="ml-1">({fmtDays(ad.durationDays)})</span>
            </span>
            <StrengthPill planet={ad.planet} shadabala={shadabala} />
          </div>
          <RatioBand planet={ad.planet} shadabala={shadabala} />
        </div>

        {/* Expand toggle */}
        {hasPD && (
          <span className="text-slate-500 text-xs shrink-0">{open ? '▾' : '▸'}</span>
        )}
      </button>

      {/* Pratyantar Dashas */}
      {open && hasPD && (
        <div className="border-t border-white/5 px-3 pb-2 pt-1 space-y-0.5">
          <p className="text-[9px] text-slate-600 uppercase tracking-wide mb-1 pl-4">Pratyantar Dasha</p>
          {ad.pratyantardashas!.map((pd, i) => (
            <PDRow key={i} pd={pd} shadabala={shadabala} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Mahadasha row ────────────────────────────────────────────────────────────

function MDRow({
  md,
  shadabala,
  defaultOpen,
}: {
  md:          DashaPeriod;
  shadabala:   ShadabalaResult[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const cl     = PLANET_COLORS[md.planet] ?? PLANET_COLORS.Ketu;
  const past   = isPast(md.endDate);
  const future = isFuture(md.startDate);
  const active = md.isActive;
  const sb     = shadabala.find(s => s.planet === md.planet);

  // Find currently active antardasha
  const currentAD = md.antardashas.find(a => a.isActive);

  return (
    <div className={`rounded-xl border transition-all ${
      active ? 'border-amber-500/40 bg-amber-500/8 shadow-[0_0_12px_rgba(245,158,11,0.08)]'
             : past ? 'border-white/5 bg-white/[0.008] opacity-50'
                    : `${cl.border} ${cl.bg}`
    }`}>

      {/* Mahadasha header button */}
      <button
        className="w-full flex items-start gap-3 px-4 py-3 text-left"
        onClick={() => setOpen(o => !o)}
      >
        {/* Planet symbol bubble */}
        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-base mt-0.5 ${
          active ? 'bg-amber-500/20 border border-amber-500/40'
                 : past ? 'bg-white/5 border border-white/10'
                        : `${cl.bg} border ${cl.border}`
        }`}>
          <span>{PLANET_SYMBOLS[md.planet] ?? '●'}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className={`text-sm font-bold ${active ? 'text-amber-300' : past ? 'text-slate-500' : cl.text}`}>
              {md.planet} Mahadasha
            </span>
            {active && (
              <span className="text-[10px] bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-full px-2 py-0.5 font-bold">
                CURRENT
              </span>
            )}
            {future && (
              <span className="text-[10px] text-slate-500 border border-white/10 rounded-full px-2 py-0.5">
                Upcoming
              </span>
            )}
            {sb && (
              <span className={`text-[9px] ${ratioToStrengthLabel(sb.shadabalaRatio).color}`}>
                {sb.shadabalaRatio.toFixed(2)}× {ratioToStrengthLabel(sb.shadabalaRatio).label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
            <span>{fmtDate(md.startDate)} → {fmtDate(md.endDate)}</span>
            <span className="text-slate-600">({md.durationYears} years)</span>
            {active && currentAD && (
              <span className={`${(PLANET_COLORS[currentAD.planet] ?? PLANET_COLORS.Ketu).text} font-semibold`}>
                {PLANET_SYMBOLS[currentAD.planet] ?? ''} {currentAD.planet} Antardasha active
              </span>
            )}
          </div>

          {/* Shadbala ratio bar */}
          {sb && (
            <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${cl.bar}`}
                style={{ width: `${Math.min(sb.shadabalaRatio / 2, 1) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Expand chevron */}
        <span className={`text-sm shrink-0 mt-1 ${active ? 'text-amber-500' : 'text-slate-600'}`}>
          {open ? '▾' : '▸'}
        </span>
      </button>

      {/* Antardasha section */}
      {open && (
        <div className="border-t border-white/5 px-4 pb-3 pt-2 space-y-1.5">
          <p className="text-[9px] text-slate-600 uppercase tracking-wide mb-2">Antardasha Periods</p>
          {md.antardashas.map((ad, i) => (
            <ADRow
              key={i}
              ad={ad}
              shadabala={shadabala}
              defaultOpen={ad.isActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function DashaTimeline() {
  const [dashaResult, setDashaResult] = useState<DashaResult | null>(null);
  const [shadabala,   setShadabala]   = useState<ShadabalaResult[]>([]);
  const [subjectLabel,setSubjectLabel]= useState('');
  const [isComputing, setIsComputing] = useState(false);
  const [error,       setError]       = useState<string | null>(null);

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

      setDashaResult(engineData.dasha);
      setShadabala(engineData.shadabala ?? []);
      setSubjectLabel(`${form.location} · ${form.date} ${form.time} IST`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Computation failed');
    } finally {
      setIsComputing(false);
    }
  }

  // ── Birth input gate ─────────────────────────────────────────────────────────

  if (!dashaResult) {
    return (
      <div className="glow-card overflow-hidden shadow-lg border border-white/10 bg-[#090b0f]">
        <div className="px-5 pt-5 pb-4 border-b border-white/10 bg-[#111722]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">⏳</span>
            <h2 className="text-base font-bold text-white">Vimshottari Dasha Timeline</h2>
          </div>
          <p className="text-xs text-slate-400">
            Full 120-year tree: Mahadasha → Antardasha → Pratyantar Dasha.
            Strength-coded from Shadbala. Enter birth details to generate.
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
              <p className="text-sm">Computing Dasha Timeline…</p>
              <p className="text-xs text-slate-500">
                9 Mahadashas · 81 Antardashas · 729 Pratyantars · Shadbala strength overlay
              </p>
            </div>
          ) : (
            <EnhancedBirthInputForm lang="en" onSubmit={handleSubmit} showAutoSave={false} showProgress={true} />
          )}
        </div>
      </div>
    );
  }

  // ── Panel header info ─────────────────────────────────────────────────────────

  const { mahadashas, currentMahadasha, currentAntardasha, currentPratyantardasha,
          moonNakshatraName, moonNakshatraLord, balanceYears } = dashaResult;

  const currentDate = new Date();
  const fmtYearsBalance = (y: number) => {
    const yr = Math.floor(y);
    const mo = Math.round((y - yr) * 12);
    return `${yr}y ${mo}m`;
  };

  // ── Current dasha banner content ──────────────────────────────────────────────

  const currentPlanetSB  = shadabala.find(s => s.planet === currentMahadasha?.planet);
  const currentADPlanetSB = shadabala.find(s => s.planet === currentAntardasha?.planet);

  return (
    <div className="glow-card overflow-hidden shadow-lg border border-white/10 bg-[#090b0f] text-left">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10 bg-[#111722]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">⏳</span>
          <h2 className="text-base font-bold text-white">Vimshottari Dasha Timeline</h2>
          <button
            onClick={() => { setDashaResult(null); setShadabala([]); }}
            className="ml-auto text-[10px] text-slate-500 hover:text-amber-400 border border-white/10 hover:border-amber-500/40 rounded px-2 py-0.5 transition-all"
          >
            ↩ New Chart
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-4">{subjectLabel}</p>

        {/* Birth nakshatra + balance info */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          {[
            { label: 'Birth Nakshatra', value: moonNakshatraName },
            { label: 'Nakshatra Lord',  value: `${PLANET_SYMBOLS[moonNakshatraLord] ?? ''} ${moonNakshatraLord}` },
            { label: 'Balance at Birth', value: fmtYearsBalance(balanceYears) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/[0.03] border border-white/5 rounded-lg px-2 py-2">
              <p className="text-[9px] text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
              <p className="text-xs font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Current period banner */}
        {currentMahadasha && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 p-3 space-y-2">
            <p className="text-[10px] text-amber-500/70 uppercase tracking-wide font-semibold">Active Right Now</p>

            <div className="grid grid-cols-1 gap-1.5">
              {/* Mahadasha */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Mahadasha</span>
                <div className="text-right">
                  <span className={`text-sm font-bold ${(PLANET_COLORS[currentMahadasha.planet] ?? PLANET_COLORS.Ketu).text}`}>
                    {PLANET_SYMBOLS[currentMahadasha.planet] ?? ''} {currentMahadasha.planet}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-2">→ {fmtDate(currentMahadasha.endDate)}</span>
                  {currentPlanetSB && (
                    <span className={`ml-2 text-[9px] ${ratioToStrengthLabel(currentPlanetSB.shadabalaRatio).color}`}>
                      {currentPlanetSB.shadabalaRatio.toFixed(2)}×
                    </span>
                  )}
                </div>
              </div>

              {/* Antardasha */}
              {currentAntardasha && (
                <div className="flex items-center justify-between border-t border-white/5 pt-1.5">
                  <span className="text-xs text-slate-400">Antardasha</span>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${(PLANET_COLORS[currentAntardasha.planet] ?? PLANET_COLORS.Ketu).text}`}>
                      {PLANET_SYMBOLS[currentAntardasha.planet] ?? ''} {currentAntardasha.planet}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-2">→ {fmtDate(currentAntardasha.endDate)}</span>
                    {currentADPlanetSB && (
                      <span className={`ml-2 text-[9px] ${ratioToStrengthLabel(currentADPlanetSB.shadabalaRatio).color}`}>
                        {currentADPlanetSB.shadabalaRatio.toFixed(2)}×
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Pratyantar */}
              {currentPratyantardasha && (
                <div className="flex items-center justify-between border-t border-white/5 pt-1.5">
                  <span className="text-xs text-slate-400">Pratyantar</span>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${(PLANET_COLORS[currentPratyantardasha.planet] ?? PLANET_COLORS.Ketu).text}`}>
                      {PLANET_SYMBOLS[currentPratyantardasha.planet] ?? ''} {currentPratyantardasha.planet}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-2">→ {fmtDateLong(currentPratyantardasha.endDate)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Timeline body ── */}
      <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto bg-[#0d1118]">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">
            Full 120-Year Timeline · {mahadashas.length} Mahadashas
          </p>
          <p className="text-[10px] text-slate-600">
            Bar width = Shadbala ratio (midpoint = 1.0× minimum)
          </p>
        </div>

        {/* Vertical timeline spine + rows */}
        <div className="relative">
          {/* Spine */}
          <div className="absolute left-[27px] top-0 bottom-0 w-px bg-white/5" />

          <div className="space-y-1.5">
            {mahadashas.map((md, i) => (
              <MDRow
                key={i}
                md={md}
                shadabala={shadabala}
                defaultOpen={md.isActive}
              />
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="pt-3 border-t border-white/5">
          <p className="text-[10px] text-slate-600 leading-relaxed">
            Faded rows = past periods · Amber highlight = current · Strength bar width reflects
            Shadbala ratio relative to the classical required minimum for each planet.
            Retrograde planets receive maximum Chesta Bala — their dashas carry heightened intensity.
          </p>
        </div>
      </div>
    </div>
  );
}
