import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { computeMilan, type MilanResult, type KutaResult } from "../lib/mtss/kundliMilan";
import { computeMTSS } from "../lib/mtss/mtssEngine";
import { PRIYVRIT_SINGH } from "../lib/mtss/testUsers";
import { RASHI_NAMES_EN } from "../lib/mtss/vedicEngine";
import { searchCities, type City } from "../lib/mtss/indianCities";
import type { JatakInput } from "../lib/mtss/mtssEngine";
import { computeMuhurta, type MuhurtaResult } from "../lib/mtss/muhurta";

// ─── City search ──────────────────────────────────────────────────────────────
function CitySearch({ value, onChange, onSelect }: {
  value: string; onChange: (v: string) => void; onSelect: (c: City) => void;
}) {
  const [sugg, setSugg] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const r = searchCities(value);
    setSugg(r);
    setOpen(r.length > 0 && value.length >= 2);
  }, [value]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input type="text" value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => value.length >= 2 && setOpen(sugg.length > 0)}
        placeholder="Search city…"
        className="w-full rounded-lg bg-white/[0.06] border border-white/15 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 transition-all" />
      {open && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl border border-white/15 bg-[#0f1420] shadow-2xl overflow-hidden">
          {sugg.map(c => (
            <li key={c.name + c.state}>
              <button type="button" onClick={() => { onSelect(c); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-amber-500/10 flex items-center justify-between">
                <span className="text-white font-medium">{c.name}</span>
                <span className="text-slate-500 text-xs">{c.state}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Single person mini-form ──────────────────────────────────────────────────
interface PersonForm {
  name: string; day: string; month: string; year: string;
  hour: string; minute: string; ampm: "AM"|"PM";
  city: string; lat: string; lon: string;
}

const DEFAULT_GROOM: PersonForm = {
  name:"Priyvrit Singh", day:"8", month:"10", year:"1999",
  hour:"7", minute:"43", ampm:"AM", city:"Udaipur", lat:"24.58", lon:"73.68"
};
const DEFAULT_BRIDE: PersonForm = {
  name:"", day:"", month:"1", year:"", hour:"12", minute:"0", ampm:"PM",
  city:"", lat:"", lon:""
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function PersonCard({
  label, gender, color, form, setForm
}: {
  label: string; gender: "♂"|"♀"; color: string;
  form: PersonForm; setForm: (f: PersonForm) => void;
}) {
  const inp = (k: keyof PersonForm) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });
  const cls = "w-full rounded-lg bg-white/[0.06] border border-white/15 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-all";
  const lbl = "block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1";

  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${color}`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{gender}</span>
        <h3 className="text-sm font-bold text-white">{label}</h3>
      </div>

      <div>
        <label className={lbl}>Full Name</label>
        <input type="text" value={form.name} onChange={inp("name")}
          placeholder="Name…" className={cls} />
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <div>
          <label className={lbl}>Day</label>
          <input type="number" min="1" max="31" value={form.day} onChange={inp("day")}
            placeholder="DD" className={cls} />
        </div>
        <div>
          <label className={lbl}>Month</label>
          <select value={form.month} onChange={inp("month")} className={cls + " cursor-pointer"}>
            {MONTHS.map((m,i)=>(
              <option key={m} value={i+1} className="bg-[#0f1420]">{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>Year</label>
          <input type="number" min="1900" max="2025" value={form.year} onChange={inp("year")}
            placeholder="YYYY" className={cls} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <div>
          <label className={lbl}>Hour</label>
          <input type="number" min="1" max="12" value={form.hour} onChange={inp("hour")}
            placeholder="H" className={cls} />
        </div>
        <div>
          <label className={lbl}>Minute</label>
          <input type="number" min="0" max="59" value={form.minute} onChange={inp("minute")}
            placeholder="MM" className={cls} />
        </div>
        <div>
          <label className={lbl}>AM/PM</label>
          <div className="flex rounded-lg border border-white/15 overflow-hidden h-[38px]">
            {(["AM","PM"] as const).map(ap => (
              <button key={ap} type="button" onClick={() => setForm({ ...form, ampm: ap })}
                className={`flex-1 text-sm font-bold transition-colors
                  ${form.ampm===ap ? "bg-amber-500/30 text-amber-300" : "bg-white/[0.03] text-slate-500 hover:text-white"}`}>
                {ap}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className={lbl}>Place of Birth</label>
        <CitySearch value={form.city}
          onChange={v => setForm({ ...form, city: v, lat: "", lon: "" })}
          onSelect={c => setForm({ ...form, city: c.name, lat: String(c.lat), lon: String(c.lon) })} />
        {form.lat && (
          <p className="text-[10px] text-slate-600 mt-1">📍 {form.lat}°N, {form.lon}°E</p>
        )}
      </div>
    </div>
  );
}

function toJatak(f: PersonForm, id: string): JatakInput | null {
  const day = parseInt(f.day), month = parseInt(f.month), year = parseInt(f.year);
  let hour = parseInt(f.hour), minute = parseInt(f.minute);
  const lat = parseFloat(f.lat), lon = parseFloat(f.lon);
  if ([day,month,year,hour,minute].some(isNaN) || isNaN(lat) || isNaN(lon)) return null;
  if (f.ampm==="PM" && hour!==12) hour += 12;
  if (f.ampm==="AM" && hour===12) hour = 0;
  return { id, name: f.name || "Anonymous", day, month, year, hour, minute,
    placeOfBirth: f.city || `${lat}°N ${lon}°E`, lat, lon, tz: 5.5 };
}

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ scored, max }: { scored: number; max: number }) {
  const pct = max > 0 ? (scored / max) * 100 : 0;
  const color = pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-blue-500" : pct >= 30 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-white tabular-nums w-10 text-right">{scored}/{max}</span>
    </div>
  );
}

// ─── Kuta verdict color ───────────────────────────────────────────────────────
function verdictColor(v: string): string {
  return v==="Excellent"?"text-emerald-400":v==="Good"?"text-blue-400":v==="Average"?"text-amber-400":"text-red-400";
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function EnhancedKundliMilan() {
  const [groomForm, setGroomForm] = useState<PersonForm>(DEFAULT_GROOM);
  const [brideForm, setBrideForm] = useState<PersonForm>(DEFAULT_BRIDE);
  const [result, setResult] = useState<MilanResult | null>(null);
  const [muhurtaResult, setMuhurtaResult] = useState<MuhurtaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedKuta, setExpandedKuta] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  function handleCompute(e: React.FormEvent) {
    e.preventDefault();
    const groom = toJatak(groomForm, "milan_groom");
    const bride  = toJatak(brideForm,  "milan_bride");
    if (!groom) { setError("Please complete all Groom fields and select a city."); return; }
    if (!bride)  { setError("Please complete all Bride fields and select a city."); return; }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      try {
        const r = computeMilan(groom, bride);
        setResult(r);
        if (r.totalPoints >= 18) {
          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth() + 1;
          const m = computeMuhurta(currentYear, currentMonth, 12);
          setMuhurtaResult(m);
        } else {
          setMuhurtaResult(null);
        }
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 80);
      } catch(e) {
        console.error(e);
        setError("Computation error. Please check the birth details.");
      } finally { setLoading(false); }
    }, 30);
  }

  const verdictConfig: Record<string, { bg: string; text: string; border: string }> = {
    "Excellent":       { bg:"bg-emerald-500/15", text:"text-emerald-300", border:"border-emerald-500/30" },
    "Very Good":       { bg:"bg-teal-500/15",    text:"text-teal-300",    border:"border-teal-500/30" },
    "Good":            { bg:"bg-blue-500/15",     text:"text-blue-300",    border:"border-blue-500/30" },
    "Average":         { bg:"bg-amber-500/15",    text:"text-amber-300",   border:"border-amber-500/30" },
    "Below Average":   { bg:"bg-orange-500/15",   text:"text-orange-300",  border:"border-orange-500/30" },
    "Not Recommended": { bg:"bg-red-500/15",      text:"text-red-300",     border:"border-red-500/30" },
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
          <span>💑</span> Kundli Milan
        </h2>
        <p className="text-xs text-slate-500">
          Classical Ashtakuta 36-point compatibility analysis · Mangal Dosha cross-check · Navamsa D9 compatibility
        </p>
      </div>

      {/* Input forms */}
      <form onSubmit={handleCompute} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PersonCard label="Groom (Var)" gender="♂"
            color="border-blue-500/20 bg-blue-950/15"
            form={groomForm} setForm={setGroomForm} />
          <PersonCard label="Bride (Vadhu)" gender="♀"
            color="border-pink-500/20 bg-pink-950/15"
            form={brideForm} setForm={setBrideForm} />
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">{error}</div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {loading
            ? <><span className="animate-spin">⚙</span> Computing…</>
            : <><span>💑</span> Compute Kundli Milan</>}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div ref={resultsRef} className="space-y-5">

          {/* Big score card */}
          <div className={`rounded-2xl border p-6 ${verdictConfig[result.verdict]?.border ?? "border-white/15"}
            ${verdictConfig[result.verdict]?.bg ?? "bg-white/5"}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Kundli Milan Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">{result.totalPoints}</span>
                  <span className="text-xl text-slate-400">/36</span>
                  <span className="text-lg text-slate-500">({result.percentage}%)</span>
                </div>
                <p className={`text-lg font-bold mt-1 ${verdictConfig[result.verdict]?.text ?? "text-white"}`}>
                  {result.verdict}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm text-white font-semibold">{result.male.name}</p>
                <p className="text-xs text-slate-500">
                  {RASHI_NAMES_EN[result.maleMoonRashi]} Moon ·{" "}
                  {result.maleChart && result.maleChart.planets.find(p=>p.name==="Moon")?.nakshatra}
                </p>
                <p className="text-xs text-slate-600 my-1">♥</p>
                <p className="text-sm text-white font-semibold">{result.female.name}</p>
                <p className="text-xs text-slate-500">
                  {RASHI_NAMES_EN[result.femaleMoonRashi]} Moon ·{" "}
                  {result.femaleChart && result.femaleChart.planets.find(p=>p.name==="Moon")?.nakshatra}
                </p>
              </div>
            </div>

            {/* Visual bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span>0 — Not Recommended</span>
                <span>18 — Average</span>
                <span>28 — Very Good</span>
                <span>36 — Perfect</span>
              </div>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden relative">
                <div className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 opacity-30 absolute inset-0" />
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all relative"
                  style={{ width: `${(result.totalPoints/36)*100}%` }}
                />
                <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-lg border-2 border-amber-400 transition-all"
                  style={{ left: `calc(${(result.totalPoints/36)*100}% - 5px)` }} />
              </div>
            </div>
          </div>

          {/* Ashtakuta table */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Ashtakuta — 8 Kutas</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Click any row to see detailed interpretation</p>
            </div>
            <div className="divide-y divide-white/5">
              {result.kutas.map((k, i) => {
                const isOpen = expandedKuta === k.name;
                return (
                  <div key={k.name}>
                    <button
                      onClick={() => setExpandedKuta(isOpen ? null : k.name)}
                      className="w-full text-left px-4 py-3 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-600 w-4 tabular-nums">{i+1}</span>
                        <div className="w-28 flex-shrink-0">
                          <p className="text-sm font-semibold text-white">{k.name}</p>
                          <p className="text-[10px] text-slate-500">{k.description}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <ScoreBar scored={k.scored} max={k.maxPoints} />
                        </div>
                        <span className={`text-[10px] font-bold w-16 text-right flex-shrink-0 ${verdictColor(k.verdict)}`}>
                          {k.verdict}
                        </span>
                        <span className="text-slate-600 text-xs w-4 flex-shrink-0">{isOpen ? "▲":"▼"}</span>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 bg-white/[0.015] border-t border-white/5">
                        <p className="text-xs text-slate-300 leading-relaxed">{k.detail}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
              <span className="text-sm font-bold text-white">Total</span>
              <div className="flex items-center gap-3">
                <div className="w-40"><ScoreBar scored={result.totalPoints} max={result.maxPoints} /></div>
                <span className={`text-sm font-bold ${verdictConfig[result.verdict]?.text ?? "text-white"}`}>
                  {result.verdict}
                </span>
              </div>
            </div>
          </div>

          {/* Mangal Dosha */}
          <div className={`rounded-2xl border p-4 ${
            result.mangalDoshaCancelled ? "border-emerald-500/25 bg-emerald-950/15" :
            (result.mangalDoshaMale || result.mangalDoshaFemale) ? "border-red-500/25 bg-red-950/15" :
            "border-emerald-500/25 bg-emerald-950/15"}`}>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <span>♂</span> Mangal Dosha Analysis
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className={`rounded-lg border p-3 ${result.mangalDoshaMale ? "border-red-500/30 bg-red-500/8":"border-emerald-500/30 bg-emerald-500/8"}`}>
                <p className="text-xs font-bold text-slate-300 mb-1">Groom</p>
                <p className={`text-sm font-bold ${result.mangalDoshaMale?"text-red-400":"text-emerald-400"}`}>
                  {result.mangalDoshaMale ? "⚠ Mangal Dosha" : "✓ No Dosha"}
                </p>
                {result.mangalDoshaMale && (
                  <p className="text-[10px] text-slate-400 mt-1">Mars in house 1/2/4/7/8/12</p>
                )}
              </div>
              <div className={`rounded-lg border p-3 ${result.mangalDoshaFemale ? "border-red-500/30 bg-red-500/8":"border-emerald-500/30 bg-emerald-500/8"}`}>
                <p className="text-xs font-bold text-slate-300 mb-1">Bride</p>
                <p className={`text-sm font-bold ${result.mangalDoshaFemale?"text-red-400":"text-emerald-400"}`}>
                  {result.mangalDoshaFemale ? "⚠ Mangal Dosha" : "✓ No Dosha"}
                </p>
                {result.mangalDoshaFemale && (
                  <p className="text-[10px] text-slate-400 mt-1">Mars in house 1/2/4/7/8/12</p>
                )}
              </div>
            </div>
            <div className={`rounded-lg border p-3 ${result.mangalDoshaCancelled?"border-emerald-500/20 bg-emerald-500/5":
              (result.mangalDoshaMale||result.mangalDoshaFemale)?"border-amber-500/20 bg-amber-500/5":"border-white/10"}`}>
              <p className="text-xs text-slate-300 leading-relaxed">{result.mangalDoshaNote}</p>
            </div>
          </div>

          {/* D9 Compatibility */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Navamsa (D9) Compatibility</h3>
              <span className={`text-xs px-3 py-1 rounded-full font-bold text-white
                ${result.d9Compatibility.score>=70?"bg-emerald-600":result.d9Compatibility.score>=50?"bg-blue-600":"bg-amber-600"}`}>
                {result.d9Compatibility.verdict} · {result.d9Compatibility.score}/100
              </span>
            </div>
            <div className="space-y-2">
              {result.d9Compatibility.details.map((d,i) => (
                <p key={i} className={`text-xs flex gap-2 leading-relaxed
                  ${d.startsWith("✓")?"text-emerald-300":d.startsWith("⚠")?"text-amber-300":"text-slate-400"}`}>
                  <span className="flex-shrink-0 mt-0.5">
                    {d.startsWith("✓")?"✓":d.startsWith("⚠")?"⚠":"→"}
                  </span>
                  <span>{d.replace(/^[✓⚠→]\s*/,"")}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Warnings & Recommendations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {result.warnings.length > 0 && (
              <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-4">
                <h3 className="text-sm font-bold text-red-300 mb-3 flex items-center gap-1.5">
                  <span>⚠</span> Warnings
                </h3>
                <ul className="space-y-2">
                  {result.warnings.map((w,i) => (
                    <li key={i} className="text-xs text-red-200/80 flex gap-2 leading-relaxed">
                      <span className="flex-shrink-0 mt-0.5">•</span><span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4">
              <h3 className="text-sm font-bold text-emerald-300 mb-3 flex items-center gap-1.5">
                <span>✓</span> Recommendations
              </h3>
              <ul className="space-y-2">
                {result.recommendations.map((r,i) => (
                  <li key={i} className="text-xs text-emerald-200/80 flex gap-2 leading-relaxed">
                    <span className="flex-shrink-0 mt-0.5">•</span><span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Classical reference */}
          <div className="rounded-xl border border-white/8 bg-white/[0.015] p-4">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Classical Scoring Reference</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[10px] text-center">
              {[["36","Perfect"],["28+","Very Good"],["24+","Good"],["18+","Average"],["12+","Below Avg"],["<12","Avoid"]].map(([pts,lbl]) => (
                <div key={pts} className="rounded-lg bg-white/[0.03] border border-white/8 p-2">
                  <p className="font-bold text-amber-300">{pts}</p>
                  <p className="text-slate-500 mt-0.5">{lbl}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Muhurta Suggestion */}
          {muhurtaResult && muhurtaResult.auspiciousDates.length > 0 && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <span>📅</span> Recommended Wedding Dates
                </h3>
                <Link to="/enhanced-muhurat" className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition-colors">
                  Open Full Muhurta Finder
                </Link>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Top 3 dates in the current year that align with auspicious combinations (Grade A/A+).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {muhurtaResult.auspiciousDates.slice(0, 3).map((day, idx) => (
                  <div key={idx} className="rounded-xl border border-amber-500/20 bg-amber-900/10 p-3 flex flex-col items-center text-center">
                    <p className="text-sm font-bold text-white mb-1">{day.dateStr}</p>
                    <p className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold mb-2">
                      Score: {day.totalScore}/100
                    </p>
                    <div className="text-[10px] text-slate-400 space-y-1">
                      <p>{day.tithiName}</p>
                      <p>{day.nakshatraName} Nakshatra</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
