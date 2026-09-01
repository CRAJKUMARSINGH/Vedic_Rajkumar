/**
 * PsychologicalProfilePanel.tsx — Vedic Psychological Profile Visualiser
 *
 * DROP THIS FILE INTO: src/components/PsychologicalProfilePanel.tsx
 *
 * Visualises the `psychologicalProfile` already computed by `assembleEngineData()`
 * — zero recomputation, all data pre-built by psychologicalProfileService.ts (Layer 11).
 *
 * FOUR TABS:
 *   1. Overview         — 3-sentence synthesis narrative, quick-glance panel showing
 *                         the three psychological "wounds" at a glance (nakshatra fear,
 *                         Rahu obsession, Saturn wound). Sets the interpretive frame.
 *   2. Fear Architecture— NakshatraFear: the planet, nakshatra group, core fear,
 *                         behavioural manifestation, and the Vedic reframe for healing.
 *                         Most actionable section — direct psychological coaching material.
 *   3. Rahu / Ketu      — Karmic axis: Rahu house/sign/nakshatra + obsession + foreign element;
 *                         Ketu mastery-claimed + avoidance pattern; axis tension title;
 *                         full karmic paragraph for context-setting.
 *   4. Saturn Wound     — Structural wound: house/sign/nakshatra, where authority first hurt,
 *                         overcompensation pattern, aspected houses (where the wound spreads),
 *                         dasha reactivation timing, and the full clinical paragraph.
 *
 * DEPENDENCIES (all already in the repo):
 *   - src/services/engineDataAssembler.ts         → assembleEngineData()
 *   - src/services/geocodingService.ts            → searchLocation()
 *   - src/components/EnhancedBirthInputForm.tsx
 *   - (types only) src/services/psychologicalProfileService.ts
 *
 * USAGE:
 *   import { PsychologicalProfilePanel } from '@/components/PsychologicalProfilePanel';
 *   <PsychologicalProfilePanel />
 */

import { useState } from "react";
import { assembleEngineData }  from "@/services/engineDataAssembler";
import { searchLocation }      from "@/services/geocodingService";
import EnhancedBirthInputForm from "@/components/EnhancedBirthInputForm";
import type {
  PsychologicalProfile,
  NakshatraFear,
  RahuKetuKarmicStatement,
  SaturnWoundStatement,
} from "@/services/psychologicalProfileService";

// ─── Constants ──────────────────────────────────────────────────────────────────

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☀', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
  Ascendant: '↑',
};

const HOUSE_KEYWORDS: Record<number, string> = {
  1:  'Self & Identity',         2: 'Wealth & Speech',
  3:  'Courage & Siblings',      4: 'Home & Mother',
  5:  'Children & Creativity',   6: 'Service & Enemies',
  7:  'Partnerships & Spouse',   8: 'Transformation & Occult',
  9:  'Dharma & Father',         10: 'Career & Authority',
  11: 'Gains & Networks',        12: 'Liberation & Foreign Lands',
};

const ORDINAL = ['','1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseBirthDate(date: string, time: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min]  = time.split(':').map(Number);
  return new Date(y, m - 1, d, h, min, 0);
}

function HouseTag({ house }: { house: number }) {
  return (
    <span className="text-[9px] bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-slate-400">
      H{house} — {HOUSE_KEYWORDS[house] ?? ''}
    </span>
  );
}

// ─── Section: Fear Architecture ────────────────────────────────────────────────

function FearTab({ data }: { data: NakshatraFear }) {
  const planetSym = PLANET_SYMBOLS[data.planet] ?? '';
  return (
    <div className="space-y-4">
      {/* Framing note */}
      <div className="rounded-lg border border-purple-500/20 bg-purple-900/10 p-3 text-xs text-purple-200/80 leading-relaxed">
        <span className="font-bold text-purple-400">Nakshatra Fear Architecture — </span>
        Layer 11-A of the psychological profile. The Moon's nakshatra (and sometimes Ascendant or
        Atmakaraka nakshatra) reveals the native's deepest, pre-rational fear. In Vedic psychology
        this is not pathology — it is the <em>entry wound</em> through which karma operates.
        The reframe is the therapeutic reversal.
      </div>

      {/* Hero: Core Fear */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-2xl shrink-0">
            😨
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-base font-bold text-purple-300">{data.coreFear}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400">
              <span className="font-bold text-slate-300">{planetSym} {data.planet}</span>
              <span className="text-slate-500">in</span>
              <span className="font-bold text-slate-300">{data.nakshatraName}</span>
              <span className="text-[9px] border border-purple-500/25 text-purple-400 rounded px-1.5 py-0.5">{data.group}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manifestation */}
      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">🔍</span>
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">How the Fear Manifests</p>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{data.manifestation}</p>
        <p className="text-[10px] text-slate-500 mt-3 italic">
          This is the behavioural signature — the unconscious strategy the psyche uses to avoid the core fear.
          In relationships and career, it appears as a repeating pattern.
        </p>
      </div>

      {/* Reframe */}
      <div className="rounded-xl border border-emerald-500/25 bg-emerald-900/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">🔄</span>
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">The Vedic Reframe</p>
        </div>
        <p className="text-sm text-emerald-200/90 leading-relaxed">{data.reframe}</p>
        <p className="text-[10px] text-emerald-500/50 mt-3 italic">
          This is Layer 12.2 of the interpretation engine — the psychological remedy prescribed by the
          Vedic tradition for this specific nakshatra group's fear pattern.
        </p>
      </div>

      {/* Nakshatra group map */}
      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
        <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-3">Nakshatra Group Context</p>
        <div className="flex items-center gap-2 flex-wrap">
          {data.group.split('–').map((n: string, i: number) => (
            <span
              key={i}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                n.trim() === data.nakshatraName
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              {n.trim()}
              {n.trim() === data.nakshatraName && <span className="ml-1 text-purple-400">◀</span>}
            </span>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
          Nakshatras in the same group share the same karmic fear architecture.
          Planets occupying any nakshatra in this group amplify the pattern.
        </p>
      </div>
    </div>
  );
}

// ─── Section: Rahu / Ketu ──────────────────────────────────────────────────────

function RahuKetuTab({ data }: { data: RahuKetuKarmicStatement }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/20 bg-amber-900/10 p-3 text-xs text-amber-200/80 leading-relaxed">
        <span className="font-bold text-amber-400">Rahu/Ketu Karmic Axis — </span>
        Layer 11-B. The lunar nodes represent the soul's karmic trajectory across lifetimes.
        Ketu = mastery already claimed (past-life gifts that now feel stale or avoided);
        Rahu = the foreign, uncomfortable territory the soul incarnated to assimilate.
        The axis tension is the precise curriculum.
      </div>

      {/* Side-by-side Rahu / Ketu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* Rahu */}
        <div className="rounded-xl border border-orange-500/25 bg-orange-900/10 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">☊</span>
            <div>
              <p className="text-sm font-bold text-orange-300">Rahu</p>
              <p className="text-[10px] text-slate-400">
                {ORDINAL[data.rahu.house]} house · {data.rahu.sign} · {data.rahu.nakshatra}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2.5">
              <p className="text-[9px] text-orange-400/70 uppercase tracking-wide mb-1">Obsession</p>
              <p className="text-xs text-slate-300 leading-relaxed">{data.rahu.obsession}</p>
            </div>
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2.5">
              <p className="text-[9px] text-orange-400/70 uppercase tracking-wide mb-1">Foreign Element to Assimilate</p>
              <p className="text-xs text-slate-300 leading-relaxed">{data.rahu.foreignElement}</p>
            </div>
            <HouseTag house={data.rahu.house} />
          </div>
        </div>

        {/* Ketu */}
        <div className="rounded-xl border border-cyan-500/25 bg-cyan-900/10 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">☋</span>
            <div>
              <p className="text-sm font-bold text-cyan-300">Ketu</p>
              <p className="text-[10px] text-slate-400">
                {ORDINAL[data.ketu.house]} house · {data.ketu.sign} · {data.ketu.nakshatra}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2.5">
              <p className="text-[9px] text-cyan-400/70 uppercase tracking-wide mb-1">Mastery Claimed (Past Life)</p>
              <p className="text-xs text-slate-300 leading-relaxed">{data.ketu.masteryClaimed}</p>
            </div>
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2.5">
              <p className="text-[9px] text-cyan-400/70 uppercase tracking-wide mb-1">Avoidance Pattern</p>
              <p className="text-xs text-slate-300 leading-relaxed">{data.ketu.avoidancePattern}</p>
            </div>
            <HouseTag house={data.ketu.house} />
          </div>
        </div>
      </div>

      {/* Axis Tension title */}
      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
        <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Karmic Curriculum (Axis Tension)</p>
        <p className="text-base font-bold text-white leading-snug">{data.axisTension}</p>
      </div>

      {/* Full paragraph */}
      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
        <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Full Karmic Statement</p>
        <p className="text-xs text-slate-300 leading-[1.8]">{data.paragraph}</p>
      </div>

      {/* Visual axis bar */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-3">Axis Visualisation</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 text-right">
            <p className="text-[10px] text-cyan-400 font-semibold">KETU</p>
            <p className="text-[9px] text-slate-500">{data.ketu.sign}</p>
            <p className="text-[9px] text-slate-600">{ORDINAL[data.ketu.house]} house</p>
          </div>
          <div className="flex-none flex items-center gap-1">
            <div className="w-10 h-1 bg-gradient-to-r from-cyan-500/60 to-transparent rounded-full" />
            <div className="w-2 h-2 rounded-full bg-white/20 border border-white/30" />
            <div className="w-10 h-1 bg-gradient-to-l from-orange-500/60 to-transparent rounded-full" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[10px] text-orange-400 font-semibold">RAHU</p>
            <p className="text-[9px] text-slate-500">{data.rahu.sign}</p>
            <p className="text-[9px] text-slate-600">{ORDINAL[data.rahu.house]} house</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Saturn Wound ─────────────────────────────────────────────────────

function SaturnTab({ data }: { data: SaturnWoundStatement }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-500/25 bg-slate-900/30 p-3 text-xs text-slate-300/80 leading-relaxed">
        <span className="font-bold text-slate-300">Saturn Wound — </span>
        Layer 11-C. Saturn's house and sign reveal where the native first experienced a structural
        failure of authority, time, or discipline. The wound does not disappear — it reactivates
        during Saturn dashas and returns. Overcompensation is the defence mechanism built around it.
      </div>

      {/* Hero card */}
      <div className="rounded-2xl border border-slate-500/30 bg-gradient-to-br from-slate-900/40 to-slate-800/20 p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-500/20 border border-slate-500/40 flex items-center justify-center text-2xl shrink-0">
            ♄
          </div>
          <div>
            <p className="text-base font-bold text-slate-200">
              Saturn in {ORDINAL[data.house]} House — {data.sign}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{data.nakshatra}</p>
            <div className="mt-1.5">
              <HouseTag house={data.house} />
            </div>
          </div>
        </div>

        {/* Structural wound */}
        <div className="rounded-xl border border-slate-500/20 bg-white/[0.02] p-3">
          <p className="text-[9px] text-slate-400 uppercase tracking-wide mb-1">Structural Wound</p>
          <p className="text-sm text-slate-200 leading-relaxed">{data.structuralWound}</p>
        </div>
      </div>

      {/* Overcompensation */}
      <div className="rounded-xl border border-red-500/20 bg-red-900/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">🎭</span>
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">Overcompensation Pattern</p>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{data.overcompensation}</p>
        <p className="text-[10px] text-slate-500 mt-2 italic leading-relaxed">
          This is the behavioural armour. The native uses it to avoid re-experiencing the original wound.
          In relationships and career, it appears as control, perfectionism, withdrawal, or authority-avoidance.
        </p>
      </div>

      {/* Aspected houses */}
      {data.aspectedHouses && data.aspectedHouses.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🔭</span>
            <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">Houses Aspected by Saturn</p>
          </div>
          <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
            Saturn's aspect (3rd, 7th, 10th) spreads the wound's theme into these life domains.
            Problems in these areas often trace back to the Saturn wound — not to those houses' significations directly.
          </p>
          <div className="flex flex-wrap gap-2">
            {data.aspectedHouses.map((h: number) => (
              <div key={h} className="rounded-lg border border-slate-500/20 bg-slate-500/10 px-3 py-2">
                <p className="text-xs font-bold text-slate-300">{ORDINAL[h]} House</p>
                <p className="text-[9px] text-slate-500">{HOUSE_KEYWORDS[h] ?? ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dasha reactivation */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-900/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">⏳</span>
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">Dasha Reactivation</p>
        </div>
        <p className="text-sm text-amber-200/90 leading-relaxed">{data.dashaReactivation}</p>
        <p className="text-[10px] text-slate-500 mt-2 italic leading-relaxed">
          These are the windows when Saturn returns the wound for healing. Breakdowns during these
          periods are not punishment — they are the psyche demanding repair of the original structure.
        </p>
      </div>

      {/* Full paragraph */}
      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
        <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Full Clinical Statement</p>
        <p className="text-xs text-slate-300 leading-[1.8]">{data.paragraph}</p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function PsychologicalProfilePanel() {
  type Tab = 'overview' | 'fear' | 'rahu' | 'saturn';

  const [tab,          setTab]         = useState<Tab>('overview');
  const [profile,      setProfile]     = useState<PsychologicalProfile | null>(null);
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
      setProfile(engineData.psychologicalProfile);
      setSubjectLabel(`${form.location} · ${form.date} ${form.time} IST`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Computation failed');
    } finally {
      setIsComputing(false);
    }
  }

  // ── Birth input gate ─────────────────────────────────────────────────────────

  if (!profile) {
    return (
      <div className="glow-card overflow-hidden shadow-lg border border-white/10 bg-[#090b0f]">
        <div className="px-5 pt-5 pb-4 border-b border-white/10 bg-[#111722]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🧠</span>
            <h2 className="text-base font-bold text-white">Psychological Profile</h2>
          </div>
          <p className="text-xs text-slate-400">
            Nakshatra Fear Architecture · Rahu/Ketu Karmic Axis · Saturn Wound ·
            Synthesis Narrative. Enter birth details to compute.
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
              <div className="animate-spin h-10 w-10 border-t-2 border-purple-500 border-solid rounded-full" />
              <p className="text-sm">Building Psychological Profile…</p>
              <p className="text-xs text-slate-500">
                Nakshatra fear · Rahu/Ketu karmic axis · Saturn structural wound
              </p>
            </div>
          ) : (
            <EnhancedBirthInputForm lang="en" onSubmit={handleSubmit} showAutoSave={false} showProgress={true} />
          )}
        </div>
      </div>
    );
  }

  // ── Derived ───────────────────────────────────────────────────────────────────

  const { nakshatra_fear: nf, rahu_ketu_karmic_statement: rk, saturn_wound_statement: sw, synthesis_narrative } = profile;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="glow-card overflow-hidden shadow-lg border border-white/10 bg-[#090b0f] text-left">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-0 border-b border-white/10 bg-[#111722]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🧠</span>
          <h2 className="text-base font-bold text-white">Psychological Profile</h2>
          <button
            onClick={() => setProfile(null)}
            className="ml-auto text-[10px] text-slate-500 hover:text-purple-400 border border-white/10 hover:border-purple-500/40 rounded px-2 py-0.5 transition-all"
          >
            ↩ New Chart
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-3">{subjectLabel}</p>

        {/* 3-cell quick-glance strip */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-purple-500/10 border border-purple-500/25 rounded-lg px-2 py-2 text-center">
            <p className="text-[8px] text-purple-400/70 uppercase tracking-wide">Fear</p>
            <p className="text-[10px] font-bold text-purple-300 mt-0.5 leading-tight">{nf.nakshatraName}</p>
            <p className="text-[9px] text-slate-400">{PLANET_SYMBOLS[nf.planet] ?? ''} {nf.planet}</p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/25 rounded-lg px-2 py-2 text-center">
            <p className="text-[8px] text-orange-400/70 uppercase tracking-wide">Rahu Drive</p>
            <p className="text-[10px] font-bold text-orange-300 mt-0.5 leading-tight">{rk.rahu.sign}</p>
            <p className="text-[9px] text-slate-400">{ORDINAL[rk.rahu.house]} house</p>
          </div>
          <div className="bg-slate-500/10 border border-slate-500/25 rounded-lg px-2 py-2 text-center">
            <p className="text-[8px] text-slate-400/70 uppercase tracking-wide">Saturn ♄</p>
            <p className="text-[10px] font-bold text-slate-300 mt-0.5 leading-tight">{sw.sign}</p>
            <p className="text-[9px] text-slate-400">{ORDINAL[sw.house]} house</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-px scrollbar-hide">
          {([
            { id: 'overview', icon: '🧠', label: 'Overview'  },
            { id: 'fear',     icon: '😨', label: 'Fear'      },
            { id: 'rahu',     icon: '☊',  label: 'Rahu/Ketu' },
            { id: 'saturn',   icon: '♄',  label: 'Saturn'    },
          ] as { id: Tab; icon: string; label: string }[]).map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-3 py-2 text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                tab === id ? 'border-b-2 border-purple-500 text-purple-400' : 'text-slate-400 hover:text-white'
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

            {/* Synthesis narrative */}
            <div className="rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-900/20 to-purple-800/5 p-5">
              <p className="text-[10px] text-purple-400/70 uppercase tracking-wide mb-3 tracking-widest">Synthesis Narrative</p>
              {/* Split into the 3 sentences for visual breathing room */}
              {synthesis_narrative
                .split(/(?<=[.!?])\s+/)
                .filter((s: string) => s.trim().length > 0)
                .map((sentence: string, i: number) => (
                  <p key={i} className="text-sm text-purple-100/85 leading-[1.9] mb-2 last:mb-0">
                    {sentence}
                  </p>
                ))}
            </div>

            {/* Three wound summary cards */}
            <p className="text-[10px] text-slate-500 uppercase tracking-wide px-1">Three Layers of the Profile</p>

            {/* Fear */}
            <button
              onClick={() => setTab('fear')}
              className="w-full text-left rounded-xl border border-purple-500/25 bg-purple-900/10 p-4 hover:border-purple-500/40 transition-all group"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">😨</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-purple-300">Fear Architecture</p>
                    <span className="text-[9px] text-slate-500 border border-white/10 rounded px-1">Layer 11-A</span>
                    <span className="ml-auto text-slate-500 text-xs group-hover:text-purple-400 transition-colors">→</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    <span className="text-slate-300 font-medium">{nf.planet} in {nf.nakshatraName}</span>
                    {' · '}
                    {nf.coreFear}
                  </p>
                </div>
              </div>
            </button>

            {/* Rahu/Ketu */}
            <button
              onClick={() => setTab('rahu')}
              className="w-full text-left rounded-xl border border-orange-500/20 bg-orange-900/10 p-4 hover:border-orange-500/35 transition-all group"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">☊</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-orange-300">Rahu/Ketu Karmic Axis</p>
                    <span className="text-[9px] text-slate-500 border border-white/10 rounded px-1">Layer 11-B</span>
                    <span className="ml-auto text-slate-500 text-xs group-hover:text-orange-400 transition-colors">→</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {rk.axisTension}
                  </p>
                </div>
              </div>
            </button>

            {/* Saturn */}
            <button
              onClick={() => setTab('saturn')}
              className="w-full text-left rounded-xl border border-slate-500/20 bg-slate-900/30 p-4 hover:border-slate-500/35 transition-all group"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">♄</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-300">Saturn Wound</p>
                    <span className="text-[9px] text-slate-500 border border-white/10 rounded px-1">Layer 11-C</span>
                    <span className="ml-auto text-slate-500 text-xs group-hover:text-slate-300 transition-colors">→</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    <span className="text-slate-300 font-medium">♄ {sw.sign} · {ORDINAL[sw.house]} house</span>
                    {' — '}
                    {sw.structuralWound}
                  </p>
                </div>
              </div>
            </button>

            {/* Disclaimer note */}
            <div className="rounded-lg border border-white/5 bg-white/[0.015] p-3 text-[10px] text-slate-600 leading-relaxed">
              This profile is generated by Layer 11 of the Vedic Rajkumar interpretation engine.
              It is intended as a mirror for self-reflection — not a diagnosis. The reframes and
              narratives are grounded in classical Vedic psychology (Jyotisha + Ayurvedic typology),
              not DSM categories. Human interpretation and consultation with a qualified astrologer
              are always recommended.
            </div>
          </div>
        )}

        {/* ══ FEAR ARCHITECTURE ══ */}
        {tab === 'fear'   && <FearTab   data={nf} />}

        {/* ══ RAHU / KETU ══ */}
        {tab === 'rahu'   && <RahuKetuTab data={rk} />}

        {/* ══ SATURN WOUND ══ */}
        {tab === 'saturn' && <SaturnTab   data={sw} />}

      </div>
    </div>
  );
}
