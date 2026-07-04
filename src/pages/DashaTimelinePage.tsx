import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SEO } from '@/components/SEO';
import { format, addYears } from 'date-fns';

// Vimshottari Dasha sequence and years
const DASHA_SEQUENCE = [
  { planet: 'Ketu',    years: 7  },
  { planet: 'Venus',   years: 20 },
  { planet: 'Sun',     years: 6  },
  { planet: 'Moon',    years: 10 },
  { planet: 'Mars',    years: 7  },
  { planet: 'Rahu',    years: 18 },
  { planet: 'Jupiter', years: 16 },
  { planet: 'Saturn',  years: 19 },
  { planet: 'Mercury', years: 17 },
];

const MARRIAGE_PLANETS = new Set(['Venus', 'Jupiter']);

interface DashaPeriod {
  planet: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  isMarriage: boolean;
}

function calcDashas(birthDate: Date, startPlanet: string): DashaPeriod[] {
  const today = new Date();
  const startIdx = DASHA_SEQUENCE.findIndex(d => d.planet === startPlanet);
  const periods: DashaPeriod[] = [];
  let cur = new Date(birthDate);

  for (let i = 0; i < DASHA_SEQUENCE.length * 2; i++) {
    const { planet, years } = DASHA_SEQUENCE[(startIdx + i) % DASHA_SEQUENCE.length];
    const end = addYears(cur, years);
    periods.push({
      planet,
      startDate: new Date(cur),
      endDate: new Date(end),
      isCurrent: cur <= today && today < end,
      isMarriage: MARRIAGE_PLANETS.has(planet),
    });
    cur = end;
    if (cur > addYears(today, 15)) break;
  }
  return periods;
}

interface PersonForm { name: string; dob: string; startPlanet: string; }
const EMPTY: PersonForm = { name: '', dob: '', startPlanet: 'Rahu' };
const SAMPLE_GROOM: PersonForm = { name: 'Priyvrit Singh', dob: '1999-10-08', startPlanet: 'Rahu' };
const SAMPLE_BRIDE: PersonForm = { name: 'Kanchi Jain', dob: '2001-03-15', startPlanet: 'Moon' };

interface Window { from: Date; to: Date; score: number; brideState: string; groomState: string; }

function findWindows(bride: DashaPeriod[], groom: DashaPeriod[]): Window[] {
  const windows: Window[] = [];
  const today = new Date();
  const horizon = addYears(today, 10);

  for (const b of bride) {
    for (const g of groom) {
      const start = new Date(Math.max(b.startDate.getTime(), g.startDate.getTime(), today.getTime()));
      const end   = new Date(Math.min(b.endDate.getTime(), g.endDate.getTime(), horizon.getTime()));
      if (start >= end) continue;
      const score = (b.isMarriage ? 2 : 0) + (g.isMarriage ? 2 : 0);
      if (score === 0) continue;
      windows.push({
        from: start, to: end, score,
        brideState: `${b.planet} MD`,
        groomState: `${g.planet} MD`,
      });
    }
  }
  return windows.sort((a, b) => b.score - a.score || a.from.getTime() - b.from.getTime()).slice(0, 8);
}

const PLANET_COLOR: Record<string, string> = {
  Venus: 'bg-pink-500', Jupiter: 'bg-yellow-500', Sun: 'bg-orange-500',
  Moon: 'bg-slate-300', Mars: 'bg-red-500', Rahu: 'bg-purple-500',
  Saturn: 'bg-blue-500', Mercury: 'bg-green-500', Ketu: 'bg-gray-500',
};

export default function DashaTimelinePage() {
  const [bride, setBride] = useState<PersonForm>(EMPTY);
  const [groom, setGroom] = useState<PersonForm>(EMPTY);
  const [result, setResult] = useState<{ bride: DashaPeriod[]; groom: DashaPeriod[]; windows: Window[] } | null>(null);

  const canCalc = bride.name && bride.dob && groom.name && groom.dob;

  function loadSample() { setBride(SAMPLE_BRIDE); setGroom(SAMPLE_GROOM); }

  function calculate() {
    if (!canCalc) return;
    const bd = calcDashas(new Date(bride.dob), bride.startPlanet);
    const gd = calcDashas(new Date(groom.dob), groom.startPlanet);
    setResult({ bride: bd, groom: gd, windows: findWindows(bd, gd) });
  }

  const fmt = (d: Date) => format(d, 'MMM yyyy');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Dasha Timeline — Marriage Windows | Vedic Rajkumar"
        description="Visual 10-year Vimshottari Dasha timeline showing Venus/Jupiter marriage windows for bride and groom with overlap scoring."
        keywords="dasha timeline, vimshottari, marriage timing, venus jupiter, vedic astrology"
        canonical="/dasha-timeline"
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <Badge className="mb-3 rounded-lg border border-sky-400/25 bg-sky-400/10 text-sky-200">
            <TrendingUp className="mr-2 h-4 w-4" />
            Marriage Window Finder
          </Badge>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">🪐 Dasha Timeline</h1>
          <p className="mt-2 text-slate-400">
            Venus / Jupiter overlap scoring · 10-year Gantt · Current Mahadasha & Antardasha
          </p>
        </div>

        {/* Inputs */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {[
            { label: '🌹 Bride', form: bride, setForm: setBride },
            { label: '💙 Groom', form: groom, setForm: setGroom },
          ].map(({ label, form, setForm }) => (
            <div key={label} className="rounded-lg border border-white/10 bg-[#111722] p-5">
              <h2 className="font-bold text-white mb-4">{label}</h2>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-slate-400">Name</Label>
                  <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1 bg-black/20 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Date of Birth</Label>
                  <Input type="date" value={form.dob} onChange={e => setForm(p => ({ ...p, dob: e.target.value }))} className="mt-1 bg-black/20 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Current Mahadasha Lord</Label>
                  <select value={form.startPlanet} onChange={e => setForm(p => ({ ...p, startPlanet: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-white/10 bg-black/20 text-white px-3 py-2 text-sm">
                    {DASHA_SEQUENCE.map(d => <option key={d.planet} value={d.planet}>{d.planet}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-8">
          <Button onClick={calculate} disabled={!canCalc} className="bg-sky-500 hover:bg-sky-400 text-white font-semibold">
            <TrendingUp className="mr-2 h-4 w-4" /> Find Marriage Windows
          </Button>
          <Button variant="outline" onClick={loadSample} className="border-white/15 text-white hover:bg-white/10">
            💍 Try Sample (Priyvrit + Kanchi)
          </Button>
        </div>

        {result && (
          <div className="space-y-6">
            {/* Current Dasha cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { label: bride.name || 'Bride', dashas: result.bride },
                { label: groom.name || 'Groom', dashas: result.groom },
              ].map(({ label, dashas }) => {
                const cur = dashas.find(d => d.isCurrent);
                return (
                  <div key={label} className="rounded-lg border border-white/10 bg-[#111722] p-4">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{label} — Current Period</div>
                    {cur ? (
                      <>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${PLANET_COLOR[cur.planet] ?? 'bg-slate-500'}`} />
                          <span className="text-lg font-bold text-white">{cur.planet} Mahadasha</span>
                          {cur.isMarriage && <Badge className="text-[10px] bg-pink-500/20 text-pink-300 border-pink-400/30">💍 Marriage Favorable</Badge>}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{fmt(cur.startDate)} → {fmt(cur.endDate)}</div>
                      </>
                    ) : <div className="text-slate-400 text-sm">No current period found</div>}
                  </div>
                );
              })}
            </div>

            {/* Marriage windows */}
            <div className="rounded-lg border border-white/10 bg-[#111722] p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Marriage Windows (Next 10 Years)</h3>
              {result.windows.length === 0 ? (
                <div className="text-slate-400 text-sm">No overlapping Venus/Jupiter periods found in the next 10 years.</div>
              ) : (
                <div className="space-y-3">
                  {result.windows.map((w, i) => {
                    const scoreColor = w.score >= 6 ? 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10'
                      : w.score >= 4 ? 'text-sky-300 border-sky-400/30 bg-sky-400/10'
                      : 'text-amber-300 border-amber-400/30 bg-amber-400/10';
                    return (
                      <div key={i} className={`rounded-lg border p-4 ${scoreColor}`}>
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="text-sm font-bold text-white">{fmt(w.from)} → {fmt(w.to)}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {bride.name || 'Bride'}: {w.brideState} · {groom.name || 'Groom'}: {w.groomState}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-extrabold">{'⭐'.repeat(w.score)}</div>
                            <div className="text-[10px] text-slate-400">Score {w.score}/6</div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Button asChild size="sm" variant="outline" className="text-xs border-white/15 text-white hover:bg-white/10">
                            <Link to={`/wedding-muhurat?bname=${encodeURIComponent(bride.name)}&gname=${encodeURIComponent(groom.name)}`}>
                              📅 Find Muhurat in this window <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dasha list */}
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { label: bride.name || 'Bride', dashas: result.bride },
                { label: groom.name || 'Groom', dashas: result.groom },
              ].map(({ label, dashas }) => (
                <div key={label} className="rounded-lg border border-white/10 bg-[#111722] p-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">{label} — Upcoming Dashas</div>
                  <div className="space-y-2">
                    {dashas.slice(0, 8).map((d, i) => (
                      <div key={i} className={`flex items-center gap-2 rounded p-2 text-xs ${d.isCurrent ? 'bg-white/10 border border-white/20' : ''}`}>
                        <div className={`w-2 h-2 rounded-full shrink-0 ${PLANET_COLOR[d.planet] ?? 'bg-slate-500'}`} />
                        <span className={`font-semibold ${d.isMarriage ? 'text-pink-300' : 'text-white'}`}>{d.planet}</span>
                        {d.isCurrent && <Badge className="text-[9px] bg-white/10 text-white border-white/20 px-1">Now</Badge>}
                        {d.isMarriage && <Badge className="text-[9px] bg-pink-500/20 text-pink-300 border-pink-400/30 px-1">💍</Badge>}
                        <span className="text-slate-400 ml-auto">{fmt(d.startDate)} → {fmt(d.endDate)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
