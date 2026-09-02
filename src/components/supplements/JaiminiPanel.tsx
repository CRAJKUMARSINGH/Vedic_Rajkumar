/**
 * JaiminiPanel.tsx — Jaimini Astrology Visualiser
 *
 * DROP THIS FILE INTO: src/components/JaiminiPanel.tsx
 *
 * Visualises the `jaiminiAnalysis` already computed by `assembleEngineData()`
 * — zero recomputation, all data pre-built by jaiminiService.ts.
 *
 * FOUR TABS:
 *   1. Karakas    — All 7 Chara Karakas (Atmakaraka → Darakaraka) with planet,
 *                   degrees, rashi, and classical life-domain meaning.
 *                   Atmakaraka highlighted as the soul's main significator.
 *   2. Padas      — Pada Lagna (AL/Arudha), Upapada Lagna (marriage), A4 (home),
 *                   A10 (career). Rashi, degrees, and what each Pada reveals about
 *                   the native's worldly image vs. inner reality.
 *   3. Chara Dasha — Sign-based Jaimini dasha sequence with years and age ranges.
 *                   Current dasha highlighted; past periods faded. Each sign card
 *                   shows the Atmakaraka's relationship to that sign.
 *   4. Yogas      — Jaimini Rajayogas + other yogas (present only), with strength
 *                   badge + classical description. Narrative synthesis below
 *                   (public vs private self, relationship, career perception).
 *
 * DEPENDENCIES (all already in the repo):
 *   - src/services/engineDataAssembler.ts  → assembleEngineData()
 *   - src/services/geocodingService.ts     → searchLocation()
 *   - src/components/EnhancedBirthInputForm.tsx
 *   - (types only) src/services/jaiminiService.ts
 *
 * USAGE:
 *   import { JaiminiPanel } from '@/components/JaiminiPanel';
 *   <JaiminiPanel />
 */

import { useState, useMemo } from "react";
import { assembleEngineData }  from "@/services/engineDataAssembler";
import { searchLocation }      from "@/services/geocodingService";
import EnhancedBirthInputForm from "@/components/EnhancedBirthInputForm";
import type {
  JaiminiAnalysis,
  Karaka,
  KarakaName,
  PadaLagna,
  CharaDasha,
  JaiminiYoga,
} from "@/services/jaiminiService";

// ─── Constants ──────────────────────────────────────────────────────────────────

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☀', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

const RASHI_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const RASHI_NAMES   = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

// Chara (movable), Sthira (fixed), Dwiswabhava (dual) — for Rashi Drishti notes
const SIGN_TYPE: Record<number, string> = {
  0:'Movable', 3:'Movable', 6:'Movable', 9:'Movable',
  1:'Fixed',   4:'Fixed',   7:'Fixed',   10:'Fixed',
  2:'Dual',    5:'Dual',    8:'Dual',    11:'Dual',
};

const KARAKA_ICON: Record<KarakaName, string> = {
  Atmakaraka:    '🪬',
  Amatyakaraka:  '💼',
  Bhratrukaraka: '👥',
  Matrukaraka:   '🏡',
  Putrakaraka:   '👶',
  Gnatikaraka:   '⚔',
  Darakaraka:    '💍',
};

const KARAKA_COLOR: Record<KarakaName, { text: string; bg: string; border: string }> = {
  Atmakaraka:    { text: 'text-amber-300',  bg: 'bg-amber-500/15',  border: 'border-amber-500/35'  },
  Amatyakaraka:  { text: 'text-blue-300',   bg: 'bg-blue-500/10',   border: 'border-blue-500/25'   },
  Bhratrukaraka: { text: 'text-red-300',    bg: 'bg-red-500/10',    border: 'border-red-500/25'    },
  Matrukaraka:   { text: 'text-cyan-300',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/25'   },
  Putrakaraka:   { text: 'text-green-300',  bg: 'bg-green-500/10',  border: 'border-green-500/25'  },
  Gnatikaraka:   { text: 'text-rose-300',   bg: 'bg-rose-500/10',   border: 'border-rose-500/25'   },
  Darakaraka:    { text: 'text-pink-300',   bg: 'bg-pink-500/10',   border: 'border-pink-500/25'   },
};

const STRENGTH_STYLE: Record<string, { label: string; style: string }> = {
  strong:   { label: 'Strong',   style: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' },
  moderate: { label: 'Moderate', style: 'bg-yellow-500/15  border-yellow-500/30  text-yellow-300'  },
  weak:     { label: 'Weak',     style: 'bg-slate-500/15   border-slate-500/30   text-slate-400'   },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseBirthDate(date: string, time: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min]  = time.split(':').map(Number);
  return new Date(y, m - 1, d, h, min, 0);
}

/** Current age in decimal years */
function currentAge(birthDate: Date): number {
  const now = new Date();
  return (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
}

/** Format decimal age as "32y 4m" */
function fmtAge(age: number): string {
  const y = Math.floor(age);
  const m = Math.round((age - y) * 12);
  return `${y}y ${m}m`;
}

// ─── Karaka card ───────────────────────────────────────────────────────────────

function KarakaCard({ karaka, isAtma = false }: { karaka: Karaka; isAtma?: boolean }) {
  const [expanded, setExpanded] = useState(isAtma);
  const cl = KARAKA_COLOR[karaka.karaka] ?? KARAKA_COLOR.Darakaraka;

  return (
    <div className={`rounded-xl border transition-all ${cl.bg} ${cl.border} ${isAtma ? 'ring-1 ring-amber-500/30' : ''}`}>
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <span className="text-xl shrink-0">{KARAKA_ICON[karaka.karaka]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-bold ${cl.text}`}>{karaka.karaka}</span>
            <span className="text-[10px] text-slate-500">{karaka.karakaHi}</span>
            {isAtma && (
              <span className="text-[9px] bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-full px-2 font-bold">SOUL</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
            <span className="font-bold">{PLANET_SYMBOLS[karaka.planet] ?? ''} {karaka.planet}</span>
            <span>{RASHI_SYMBOLS[karaka.rashiIndex]} {RASHI_NAMES[karaka.rashiIndex]}</span>
            <span>{karaka.degrees.toFixed(2)}°</span>
          </div>
        </div>
        <span className="text-slate-600 text-xs shrink-0">{expanded ? '▾' : '▸'}</span>
      </button>

      {expanded && (
        <div className="border-t border-white/5 px-4 pb-3 pt-2 space-y-2">
          <p className="text-xs text-slate-300 leading-relaxed">{karaka.meaning.en}</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">{karaka.meaning.hi}</p>
          {isAtma && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-900/10 p-3 text-xs text-amber-200/80 leading-relaxed">
              <span className="font-bold text-amber-400">Atmakaraka significance: </span>
              The planet with the highest degree in the natal chart. It represents the soul's primary
              desire and the main theme the native must master in this lifetime.
              The rashi of the Atmakaraka in the Navamsa (D9) reveals the Karakamsha — the deepest
              indicator of spiritual destiny and life path.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Pada card ─────────────────────────────────────────────────────────────────

function PadaCard({
  pada,
  label,
  icon,
  description,
  color,
}: {
  pada: PadaLagna;
  label: string;
  icon: string;
  description: string;
  color: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] transition-all">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <span className="text-xl shrink-0">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-bold ${color}`}>{label}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
            <span className="font-bold">
              {RASHI_SYMBOLS[pada.rashiIndex]} {pada.rashiName}
            </span>
            <span className="text-slate-500">{SIGN_TYPE[pada.rashiIndex]}</span>
            {pada.degrees > 0 && <span>{pada.degrees.toFixed(2)}°</span>}
          </div>
        </div>
        <span className="text-slate-600 text-xs shrink-0">{expanded ? '▾' : '▸'}</span>
      </button>

      {expanded && (
        <div className="border-t border-white/5 px-4 pb-3 pt-2 space-y-2">
          <p className="text-xs text-slate-300 leading-relaxed">{pada.meaning.en}</p>
          {pada.meaning.hi && (
            <p className="text-[11px] text-slate-500 leading-relaxed">{pada.meaning.hi}</p>
          )}
          <p className="text-[11px] text-slate-400 italic leading-relaxed">{description}</p>
        </div>
      )}
    </div>
  );
}

// ─── Chara Dasha row ───────────────────────────────────────────────────────────

function CharaDashaRow({
  cd,
  age,
  atmakaraka,
}: {
  cd:          CharaDasha;
  age:         number;
  atmakaraka:  Karaka | null;
}) {
  const isActive  = age >= cd.startAge && age < cd.endAge;
  const isPast    = age >= cd.endAge;
  const isFuture  = age < cd.startAge;
  const isAKSign  = atmakaraka ? atmakaraka.rashiIndex === cd.rashi : false;
  const signType  = SIGN_TYPE[cd.rashi] ?? '';

  const pct = isActive
    ? Math.min(((age - cd.startAge) / (cd.endAge - cd.startAge)) * 100, 100)
    : isPast ? 100 : 0;

  return (
    <div className={`rounded-xl border p-3 transition-all ${
      isActive
        ? 'border-amber-500/40 bg-amber-500/8 shadow-[0_0_8px_rgba(245,158,11,0.06)]'
        : isPast
        ? 'border-white/5 bg-white/[0.01] opacity-45'
        : 'border-white/10 bg-white/[0.02]'
    }`}>
      <div className="flex items-center gap-3">
        {/* Rashi symbol */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 ${
          isActive ? 'bg-amber-500/20 border border-amber-500/40'
                   : isPast ? 'bg-white/5 border border-white/10'
                            : 'bg-white/[0.04] border border-white/10'
        }`}>
          {RASHI_SYMBOLS[cd.rashi]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-bold ${isActive ? 'text-amber-300' : isPast ? 'text-slate-500' : 'text-white'}`}>
              {cd.rashiName}
            </span>
            <span className="text-[9px] text-slate-500 border border-white/10 rounded px-1">{signType}</span>
            {isActive && (
              <span className="text-[9px] bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-full px-2 font-bold">NOW</span>
            )}
            {isAKSign && (
              <span className="text-[9px] bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full px-2 font-semibold">AK Sign</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-0.5 flex-wrap">
            <span>{cd.years} year{cd.years !== 1 ? 's' : ''}</span>
            <span>Age {cd.startAge}–{cd.endAge}</span>
            {isActive && (
              <span className="text-amber-400/80">Current age: {fmtAge(age)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar for active dasha */}
      {isActive && (
        <div className="mt-2 space-y-0.5">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[9px] text-amber-500/60 text-right">{pct.toFixed(0)}% elapsed</p>
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function JaiminiPanel() {
  type Tab = 'karakas' | 'padas' | 'dasha' | 'yogas';

  const [tab,          setTab]         = useState<Tab>('karakas');
  const [analysis,     setAnalysis]    = useState<JaiminiAnalysis | null>(null);
  const [birthDate,    setBirthDate]   = useState<Date | null>(null);
  const [subjectLabel, setSubjectLabel]= useState('');
  const [isComputing,  setIsComputing] = useState(false);
  const [error,        setError]       = useState<string | null>(null);

  async function handleSubmit(form: { date: string; time: string; location: string }) {
    setIsComputing(true);
    setError(null);
    try {
      let lat = 28.6139, lng = 77.2090;
      const geo = await searchLocation(form.location);
      if (geo.length > 0) { lat = geo[0].lat; lng = geo[0].lon; }
      const bd         = parseBirthDate(form.date, form.time);
      const engineData = assembleEngineData(bd, lat, lng);
      setAnalysis(engineData.jaiminiAnalysis);
      setBirthDate(bd);
      setSubjectLabel(`${form.location} · ${form.date} ${form.time} IST`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Computation failed');
    } finally {
      setIsComputing(false);
    }
  }

  // ── Birth input gate ─────────────────────────────────────────────────────────

  if (!analysis || !birthDate) {
    return (
      <div className="glow-card overflow-hidden shadow-lg border border-white/10 bg-[#090b0f]">
        <div className="px-5 pt-5 pb-4 border-b border-white/10 bg-[#111722]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🪬</span>
            <h2 className="text-base font-bold text-white">Jaimini Astrology</h2>
          </div>
          <p className="text-xs text-slate-400">
            Chara Karakas · Pada Lagna · Upapada · Chara Dasha · Jaimini Rajayogas.
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
              <p className="text-sm">Computing Jaimini Analysis…</p>
              <p className="text-xs text-slate-500">
                7 Karakas · Pada Lagna · Upapada · Chara Dasha · Rashi Drishti · Yogas
              </p>
            </div>
          ) : (
            <EnhancedBirthInputForm lang="en" onSubmit={handleSubmit} showAutoSave={false} showProgress={true} />
          )}
        </div>
      </div>
    );
  }

  // ── Derived data ──────────────────────────────────────────────────────────────

  const {
    karakas, atmakaraka,
    padaLagna, upapadaLagna, a4, a10,
    charaDasha, yogas, narrative, summary,
  } = analysis;

  const age        = currentAge(birthDate);
  const activeCD   = charaDasha.find(cd => age >= cd.startAge && age < cd.endAge);
  const presentYogas = yogas.filter(y => y.isPresent);

  // ─── Header ──────────────────────────────────────────────────────────────────

  return (
    <div className="glow-card overflow-hidden shadow-lg border border-white/10 bg-[#090b0f] text-left">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-0 border-b border-white/10 bg-[#111722]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🪬</span>
          <h2 className="text-base font-bold text-white">Jaimini Astrology</h2>
          <button
            onClick={() => { setAnalysis(null); setBirthDate(null); }}
            className="ml-auto text-[10px] text-slate-500 hover:text-amber-400 border border-white/10 hover:border-amber-500/40 rounded px-2 py-0.5 transition-all"
          >
            ↩ New Chart
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          {subjectLabel} · AK: {atmakaraka ? `${PLANET_SYMBOLS[atmakaraka.planet] ?? ''} ${atmakaraka.planet}` : '—'}
          {activeCD && ` · Chara Dasha: ${activeCD.rashiName}`}
        </p>

        {/* Quick strip: AK + current CD */}
        {(atmakaraka || activeCD) && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {atmakaraka && (
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg px-3 py-2">
                <p className="text-[9px] text-amber-500/70 uppercase tracking-wide">Atmakaraka (Soul)</p>
                <p className="text-sm font-bold text-amber-300 mt-0.5">
                  {PLANET_SYMBOLS[atmakaraka.planet] ?? ''} {atmakaraka.planet}
                </p>
                <p className="text-[10px] text-slate-400">
                  {RASHI_NAMES[atmakaraka.rashiIndex]} · {atmakaraka.degrees.toFixed(2)}°
                </p>
              </div>
            )}
            {activeCD && (
              <div className="bg-purple-500/10 border border-purple-500/25 rounded-lg px-3 py-2">
                <p className="text-[9px] text-purple-400/70 uppercase tracking-wide">Chara Dasha (Now)</p>
                <p className="text-sm font-bold text-purple-300 mt-0.5">
                  {RASHI_SYMBOLS[activeCD.rashi]} {activeCD.rashiName}
                </p>
                <p className="text-[10px] text-slate-400">
                  Age {activeCD.startAge}–{activeCD.endAge} · {activeCD.years}y
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-px scrollbar-hide">
          {([
            { id: 'karakas', icon: '🪬', label: 'Karakas'   },
            { id: 'padas',   icon: '🗺', label: 'Padas'     },
            { id: 'dasha',   icon: '⏳', label: 'Chara Dasha'},
            { id: 'yogas',   icon: '✨', label: 'Yogas'     },
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

        {/* ══ KARAKAS ══ */}
        {tab === 'karakas' && (
          <div className="space-y-3">
            <div className="rounded-lg border border-amber-500/20 bg-amber-900/10 p-3 text-xs text-amber-200/80 leading-relaxed">
              <span className="font-bold text-amber-400">Chara Karakas — </span>
              Jaimini assigns a soul-role to each planet based on the degrees traversed within its sign
              (Rahu counted in reverse). The planet with the most degrees = Atmakaraka (soul's purpose);
              least degrees = Darakaraka (spouse's significator). These roles override the planet's
              natural significations in Jaimini analysis.
            </div>

            <div className="space-y-2">
              {karakas.map((k, i) => (
                <KarakaCard key={i} karaka={k} isAtma={k.karaka === 'Atmakaraka'} />
              ))}
            </div>

            {/* Degrees ranking table */}
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-3">
                Karaka Degree Ranking
              </p>
              <div className="space-y-1.5">
                {[...karakas]
                  .sort((a, b) => b.degrees - a.degrees)
                  .map((k, i) => {
                    const cl  = KARAKA_COLOR[k.karaka] ?? KARAKA_COLOR.Darakaraka;
                    const pct = (k.degrees / 30) * 100;
                    return (
                      <div key={i} className="space-y-0.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-semibold ${cl.text}`}>
                            {PLANET_SYMBOLS[k.planet] ?? ''} {k.planet}
                            <span className="text-slate-500 font-normal ml-1.5">({k.karaka})</span>
                          </span>
                          <span className="tabular-nums text-slate-400">{k.degrees.toFixed(2)}°</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${cl.border.replace('border-', 'bg-').replace('/25', '/60').replace('/35', '/70')}`}
                               style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ══ PADAS ══ */}
        {tab === 'padas' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-500/20 bg-blue-900/10 p-3 text-xs text-blue-200/80 leading-relaxed">
              <span className="font-bold text-blue-400">Pada Lagna (Arudha) — </span>
              The Pada is the reflection of a house lord's actual position — it reveals the world's
              <em> perception</em> of that house's affairs, not the internal reality.
              Pada Lagna (AL) = how the world sees you. Upapada (UL) = the nature of your marriage partner
              and the public image of the relationship.
            </div>

            <div className="space-y-2">
              {padaLagna && (
                <PadaCard
                  pada={padaLagna}
                  label="Pada Lagna (AL) — Arudha Lagna"
                  icon="🪞"
                  color="text-amber-300"
                  description="Your public image and worldly identity. The rashi here shows the mask the world sees — it may differ significantly from your Lagna (true self) and Moon (emotional self)."
                />
              )}
              {upapadaLagna && (
                <PadaCard
                  pada={upapadaLagna}
                  label="Upapada Lagna (UL) — 12th House Pada"
                  icon="💍"
                  color="text-pink-300"
                  description="The nature of the spouse and how the marriage is perceived publicly. Planets in or aspecting the UL describe the partner's personality and the marriage's outer expression."
                />
              )}
              {a4 && (
                <PadaCard
                  pada={a4}
                  label="A4 — 4th House Pada (Home & Property)"
                  icon="🏡"
                  color="text-cyan-300"
                  description="Public image of home, property, and mother. The rashi here reveals the type of home environment and land/property acquisitions visible to the world."
                />
              )}
              {a10 && (
                <PadaCard
                  pada={a10}
                  label="A10 — 10th House Pada (Career & Status)"
                  icon="💼"
                  color="text-blue-300"
                  description="Public reputation in career and status. This is the career image projected to the world — the role or title others associate with the native."
                />
              )}

              {!padaLagna && !upapadaLagna && !a4 && !a10 && (
                <p className="text-slate-500 text-sm text-center py-8">No Pada data available.</p>
              )}

              {/* Contrast: Lagna vs Pada Lagna */}
              {padaLagna && (
                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 text-xs">
                  <p className="font-semibold text-white mb-2">Inner Self vs. Public Image</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
                      <p className="text-[9px] text-slate-500 uppercase tracking-wide mb-1">Lagna (True Self)</p>
                      <p className="text-xs font-bold text-slate-300">Inner reality</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Ascendant rashi</p>
                    </div>
                    <div className="bg-amber-500/10 rounded-lg p-2.5 text-center border border-amber-500/20">
                      <p className="text-[9px] text-amber-500/70 uppercase tracking-wide mb-1">Pada Lagna (World's View)</p>
                      <p className="text-xs font-bold text-amber-300">
                        {RASHI_SYMBOLS[padaLagna.rashiIndex]} {padaLagna.rashiName}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{SIGN_TYPE[padaLagna.rashiIndex]} sign</p>
                    </div>
                  </div>
                  {narrative.publicVsPrivate && (
                    <p className="mt-3 text-slate-400 leading-relaxed">{narrative.publicVsPrivate}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ CHARA DASHA ══ */}
        {tab === 'dasha' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-purple-500/20 bg-purple-900/10 p-3 text-xs text-purple-200/80 leading-relaxed">
              <span className="font-bold text-purple-400">Chara Dasha — </span>
              Jaimini's sign-based dasha system. Each rashi rules a period (1–12 years).
              Events are timed by the Chara Dasha rashi's planets, aspects, and karakas —
              especially when the Atmakaraka sign or the Pada Lagna sign is active.
              "AK Sign" marks the Atmakaraka's natal rashi — its dasha period is especially significant.
            </div>

            <p className="text-[10px] text-slate-500 px-1">
              Current age: {fmtAge(age)} · Faded = past · Amber = active · Bar shows elapsed %
            </p>

            <div className="space-y-2">
              {charaDasha.map((cd, i) => (
                <CharaDashaRow
                  key={i}
                  cd={cd}
                  age={age}
                  atmakaraka={atmakaraka}
                />
              ))}
            </div>
          </div>
        )}

        {/* ══ YOGAS ══ */}
        {tab === 'yogas' && (
          <div className="space-y-4">

            {/* Summary */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-900/10 p-4">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-2">Overall Assessment</p>
              <p className="text-xs text-slate-300 leading-relaxed">{summary.en}</p>
              {summary.hi && (
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{summary.hi}</p>
              )}
            </div>

            {/* Present yogas */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
                Jaimini Yogas Present ({presentYogas.length})
              </p>

              {presentYogas.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center">
                  <p className="text-slate-500 text-sm">No Jaimini yogas detected.</p>
                </div>
              ) : (
                presentYogas.map((y, i) => {
                  const [expanded, setExpanded] = [false, () => {}]; // local state below
                  return <JaiminiYogaCard key={i} yoga={y} />;
                })
              )}
            </div>

            {/* Absent yogas (collapsed toggle) */}
            {yogas.filter(y => !y.isPresent).length > 0 && (
              <AbsentYogasSection yogas={yogas.filter(y => !y.isPresent)} />
            )}

            {/* Narrative synthesis */}
            {(narrative.publicVsPrivate || narrative.relationshipManifestation || narrative.careerPerception) && (
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 space-y-3">
                <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
                  Narrative Synthesis
                </p>
                {narrative.publicVsPrivate && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Public vs. Private Self</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{narrative.publicVsPrivate}</p>
                  </div>
                )}
                {narrative.relationshipManifestation && (
                  <div className="border-t border-white/5 pt-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Relationship Manifestation</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{narrative.relationshipManifestation}</p>
                  </div>
                )}
                {narrative.careerPerception && (
                  <div className="border-t border-white/5 pt-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Career Perception</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{narrative.careerPerception}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Extracted sub-components (below main to keep it clean) ───────────────────

function JaiminiYogaCard({ yoga }: { yoga: JaiminiYoga }) {
  const [expanded, setExpanded] = useState(false);
  const str = STRENGTH_STYLE[yoga.strength] ?? STRENGTH_STYLE.weak;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] transition-all">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <span className="text-lg shrink-0">✨</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-white">{yoga.name}</span>
            {yoga.nameHi && <span className="text-[11px] text-slate-500">{yoga.nameHi}</span>}
            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${str.style}`}>
              {str.label}
            </span>
          </div>
        </div>
        <span className="text-slate-600 text-xs shrink-0">{expanded ? '▾' : '▸'}</span>
      </button>
      {expanded && (
        <div className="border-t border-white/5 px-4 pb-3 pt-2 space-y-1.5">
          <p className="text-xs text-slate-300 leading-relaxed">{yoga.description.en}</p>
          {yoga.description.hi && (
            <p className="text-[11px] text-slate-500 leading-relaxed">{yoga.description.hi}</p>
          )}
        </div>
      )}
    </div>
  );
}

function AbsentYogasSection({ yogas }: { yogas: JaiminiYoga[] }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pt-1 border-t border-white/5">
      <button
        onClick={() => setShow(s => !s)}
        className="text-xs text-slate-500 hover:text-amber-400 transition-colors"
      >
        {show ? '▴ Hide' : `▾ Show ${yogas.length} absent Jaimini yogas`}
      </button>
      {show && (
        <div className="mt-2 space-y-1">
          {yogas.map((y, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.015] border border-white/5 opacity-40">
              <span className="text-xs text-slate-500 line-through">{y.name}</span>
              {y.nameHi && <span className="text-[10px] text-slate-600">{y.nameHi}</span>}
              <span className="ml-auto text-[9px] text-slate-600 uppercase">absent</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
