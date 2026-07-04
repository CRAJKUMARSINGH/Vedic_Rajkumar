import { useState, useMemo } from "react";
import { computeMuhurta, type MuhurtaDay, type MuhurtaResult } from "../lib/mtss/muhurta";

const MONTHS_LIST = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const VARA_COLORS: Record<string,string> = {
  Thursday:"bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Friday:  "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Wednesday:"bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Monday:  "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Sunday:  "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Tuesday: "bg-red-500/20 text-red-400 border-red-500/30",
  Saturday:"bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const GRADE_CONFIG: Record<string,{bg:string;text:string;border:string;label:string}> = {
  "A+": {bg:"bg-emerald-500/20",text:"text-emerald-300",border:"border-emerald-500/40",label:"Excellent"},
  "A":  {bg:"bg-teal-500/20",   text:"text-teal-300",   border:"border-teal-500/40",   label:"Very Good"},
  "B+": {bg:"bg-blue-500/20",   text:"text-blue-300",   border:"border-blue-500/40",   label:"Good"},
  "B":  {bg:"bg-amber-500/20",  text:"text-amber-300",  border:"border-amber-500/40",  label:"Moderate"},
  "C":  {bg:"bg-slate-500/15",  text:"text-slate-400",  border:"border-slate-500/30",  label:"Fair"},
  "Avoid":{bg:"bg-red-500/15", text:"text-red-400",    border:"border-red-500/30",    label:"Avoid"},
};

function ScoreRing({ score }: { score: number }) {
  const color = score>=85?"stroke-emerald-500":score>=70?"stroke-teal-500":score>=55?"stroke-blue-500":score>=40?"stroke-amber-500":"stroke-red-500";
  const r = 22, circ = 2*Math.PI*r;
  const fill = circ * (score/100);
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-white/10" />
        <circle cx="28" cy="28" r={r} fill="none" strokeWidth="4"
          className={color} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - fill} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{score}</span>
    </div>
  );
}

function DayCard({ day, expanded, onToggle }: { day:MuhurtaDay; expanded:boolean; onToggle:()=>void }) {
  const gc = GRADE_CONFIG[day.grade] ?? GRADE_CONFIG["C"];
  const vc = VARA_COLORS[day.varaName] ?? "bg-white/10 text-white border-white/20";

  return (
    <div className={`rounded-xl border transition-all ${expanded?"border-amber-500/40 bg-amber-950/15":"border-white/10 bg-white/[0.02] hover:border-white/20"}`}>
      <button className="w-full text-left p-4" onClick={onToggle}>
        <div className="flex items-center gap-3">
          <ScoreRing score={day.totalScore} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-sm font-bold text-white">{day.dateStr}</span>
              {day.sarvarthaSiddhi && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold">⭐ Sarvartha Siddhi</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${vc}`}>{day.varaName}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300">
                {day.paksha} {day.tithiName}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 border border-white/15 text-slate-300">
                {day.nakshatraName}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-500">
                {day.yogaName}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-lg border font-bold ${gc.bg} ${gc.text} ${gc.border}`}>
              {day.grade} · {gc.label}
            </span>
            <span className="text-[10px] text-slate-600">{expanded?"▲":"▼"}</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/8 pt-3 space-y-3">
          {/* Score breakdown */}
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Score Breakdown</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                {label:"Tithi",   score:day.scoreBreakdown.tithi,    max:10},
                {label:"Nakshatra",score:day.scoreBreakdown.nakshatra,max:10},
                {label:"Vara",    score:day.scoreBreakdown.vara,     max:10},
                {label:"Yoga",    score:day.scoreBreakdown.yoga,     max:10},
                {label:"Bonus",   score:day.scoreBreakdown.bonus,    max:8},
              ].map(s=>(
                <div key={s.label} className="rounded-lg bg-white/[0.03] border border-white/8 p-2 text-center">
                  <p className="text-[9px] text-slate-500 uppercase">{s.label}</p>
                  <p className={`text-sm font-bold mt-0.5 ${s.score===0?"text-red-400":s.score>=8?"text-emerald-400":"text-amber-300"}`}>
                    {s.score}/{s.max}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Panchanga detail */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg bg-white/[0.02] border border-white/8 p-2.5">
              <p className="text-[10px] text-slate-500 mb-0.5">Tithi</p>
              <p className="text-white font-semibold">{day.paksha} {day.tithiName}</p>
              <p className="text-slate-600 text-[10px]">#{day.tithiNum}</p>
            </div>
            <div className="rounded-lg bg-white/[0.02] border border-white/8 p-2.5">
              <p className="text-[10px] text-slate-500 mb-0.5">Nakshatra</p>
              <p className="text-white font-semibold">{day.nakshatraName}</p>
              <p className="text-slate-600 text-[10px]">Lord: {day.nakshatraLord}</p>
            </div>
            <div className="rounded-lg bg-white/[0.02] border border-white/8 p-2.5">
              <p className="text-[10px] text-slate-500 mb-0.5">Yoga</p>
              <p className="text-white font-semibold">{day.yogaName}</p>
              <p className={`text-[10px] ${[15,20].includes(day.yogaIdx)?"text-emerald-400":day.scoreBreakdown.yoga===0?"text-red-400":"text-slate-600"}`}>
                {[15,20].includes(day.yogaIdx)?"⭐ Highly auspicious":day.scoreBreakdown.yoga===0?"⚠ Avoid":"Standard"}
              </p>
            </div>
          </div>

          {/* Rahu Kaal */}
          <div className="rounded-lg bg-red-950/20 border border-red-500/20 p-3 flex items-start gap-2">
            <span className="text-red-400 flex-shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-xs font-semibold text-red-300">Rahu Kaal — Avoid for ceremonies</p>
              <p className="text-[11px] text-red-200/60 mt-0.5">{day.rahuKaalHours} IST (approx.)</p>
            </div>
          </div>

          {/* Best times */}
          <div className="rounded-lg bg-emerald-950/15 border border-emerald-500/20 p-3">
            <p className="text-xs font-semibold text-emerald-300 mb-1.5">✓ Auspicious Time Windows</p>
            <div className="space-y-0.5">
              {day.goodTimesIST.map((t,i)=>(
                <p key={i} className="text-[11px] text-emerald-200/70">• {t}</p>
              ))}
            </div>
          </div>

          {/* Notes */}
          {day.notes.length > 0 && (
            <div className="space-y-1">
              {day.notes.map((n,i)=>(
                <p key={i} className={`text-xs flex gap-1.5 leading-relaxed
                  ${n.startsWith("⭐")?"text-amber-300":n.startsWith("✓")?"text-emerald-300":"text-red-300"}`}>
                  <span className="flex-shrink-0 mt-0.5">{n.slice(0,1)}</span>
                  <span>{n.slice(2)}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MuhurtaPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [fromMonth, setFromMonth] = useState(1);
  const [toMonth, setToMonth] = useState(12);
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [varaFilter, setVaraFilter]   = useState<string>("all");
  const [result, setResult] = useState<MuhurtaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  function handleCompute() {
    setLoading(true);
    setExpandedDate(null);
    setTimeout(() => {
      try {
        const r = computeMuhurta(year, fromMonth, toMonth);
        setResult(r);
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 40);
  }

  const displayDates = useMemo(() => {
    if (!result) return [];
    return result.auspiciousDates.filter(d => {
      if (gradeFilter !== "all" && d.grade !== gradeFilter) return false;
      if (varaFilter !== "all" && d.varaName !== varaFilter) return false;
      return true;
    }).slice(0, 60);
  }, [result, gradeFilter, varaFilter]);

  const inputCls = "rounded-lg bg-white/[0.06] border border-white/15 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all cursor-pointer";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
          <span>📅</span> Vivah Muhurta Finder
        </h2>
        <p className="text-xs text-slate-500">
          Panchanga-based auspicious wedding dates · Tithi · Nakshatra · Vara · Yoga · Rahu Kaal
        </p>
      </div>

      {/* Controls */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Year</label>
            <select value={year} onChange={e=>setYear(Number(e.target.value))} className={inputCls + " w-full"}>
              {[currentYear-1, currentYear, currentYear+1, currentYear+2].map(y=>(
                <option key={y} value={y} className="bg-[#0f1420]">{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">From Month</label>
            <select value={fromMonth} onChange={e=>setFromMonth(Number(e.target.value))} className={inputCls + " w-full"}>
              {MONTHS_LIST.map((m,i)=>(
                <option key={m} value={i+1} className="bg-[#0f1420]">{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">To Month</label>
            <select value={toMonth} onChange={e=>setToMonth(Number(e.target.value))} className={inputCls + " w-full"}>
              {MONTHS_LIST.map((m,i)=>(
                <option key={m} value={i+1} className="bg-[#0f1420]">{m}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleCompute} disabled={loading}
              className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><span className="animate-spin">⚙</span> Scanning…</>
                : <><span>🔍</span> Find Muhurtas</>}
            </button>
          </div>
        </div>

        {/* Classical notes */}
        <div className="rounded-lg bg-amber-500/6 border border-amber-500/15 p-3">
          <p className="text-[10px] font-semibold text-amber-400 mb-1.5">Classical Marriage Month Guidelines</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-slate-400">
            <p>✓ <strong className="text-slate-300">Vaishakha (Apr–May)</strong> — excellent for marriages</p>
            <p>✓ <strong className="text-slate-300">Jyeshtha (May–Jun)</strong> — very auspicious</p>
            <p>✓ <strong className="text-slate-300">Magha (Jan–Feb)</strong> — traditional season</p>
            <p>✓ <strong className="text-slate-300">Phalguna (Feb–Mar)</strong> — classic Vivah month</p>
            <p>⚠ <strong className="text-slate-300">Kharmas</strong> — when Sun is in Sagittarius or Pisces (2 months each year) — some families avoid</p>
            <p>⚠ <strong className="text-slate-300">Adhika Masa</strong> (leap month) — avoided in traditional practice</p>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {label:"Days Scanned",  value:result.totalDaysScanned, color:"text-slate-300"},
              {label:"A+ Dates",      value:result.auspiciousDates.filter(d=>d.grade==="A+").length, color:"text-emerald-400"},
              {label:"A Grade Dates", value:result.auspiciousDates.filter(d=>d.grade==="A").length, color:"text-teal-400"},
              {label:"B+ or Better",  value:result.auspiciousDates.filter(d=>["A+","A","B+"].includes(d.grade)).length, color:"text-blue-400"},
            ].map(s=>(
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Best date highlight */}
          {result.bestDate && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-950/25 p-5 glow-amber">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2">⭐ Most Auspicious Date</p>
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-xl font-bold text-white">{result.bestDate.dateStr}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${VARA_COLORS[result.bestDate.varaName]??"bg-white/10 text-white border-white/20"}`}>
                      {result.bestDate.varaName}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300">
                      {result.bestDate.paksha} {result.bestDate.tithiName}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-slate-300">
                      {result.bestDate.nakshatraName}
                    </span>
                    {result.bestDate.sarvarthaSiddhi && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                        Sarvartha Siddhi
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-auto">
                  <ScoreRing score={result.bestDate.totalScore} />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="rounded-lg bg-white/[0.03] border border-white/10 p-2.5">
                  <p className="text-[10px] text-slate-500 mb-1">Good Times</p>
                  {result.bestDate.goodTimesIST.slice(0,2).map((t,i)=>(
                    <p key={i} className="text-xs text-emerald-300">• {t}</p>
                  ))}
                </div>
                <div className="rounded-lg bg-red-950/20 border border-red-500/15 p-2.5">
                  <p className="text-[10px] text-slate-500 mb-1">Avoid (Rahu Kaal)</p>
                  <p className="text-xs text-red-300">⚠ {result.bestDate.rahuKaalHours}</p>
                </div>
              </div>
            </div>
          )}

          {/* Monthly distribution */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Good Dates by Month (Grade B+ and above)</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Object.entries(result.monthlyCount).map(([month,count])=>(
                <div key={month} className="rounded-lg bg-white/[0.03] border border-white/8 p-2 text-center">
                  <p className={`text-xl font-bold ${count>=4?"text-emerald-400":count>=2?"text-amber-400":"text-slate-500"}`}>
                    {count}
                  </p>
                  <p className="text-[9px] text-slate-600 mt-0.5 uppercase">{month.slice(0,3)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Grade:</span>
              {["all","A+","A","B+","B"].map(g=>(
                <button key={g} onClick={()=>setGradeFilter(g)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors
                    ${gradeFilter===g?"bg-amber-500/20 border-amber-500/30 text-amber-300":"bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}>
                  {g==="all"?"All":g}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Day:</span>
              {["all","Thursday","Friday","Wednesday","Monday"].map(v=>(
                <button key={v} onClick={()=>setVaraFilter(v)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors
                    ${varaFilter===v?"bg-amber-500/20 border-amber-500/30 text-amber-300":"bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}>
                  {v==="all"?"All":v.slice(0,3)}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-600 ml-auto">
              Showing {displayDates.length} date{displayDates.length!==1?"s":""}
            </span>
          </div>

          {/* Date list */}
          {displayDates.length === 0 ? (
            <div className="rounded-xl border border-white/10 py-12 text-center">
              <p className="text-slate-500 text-sm">No dates match the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayDates.map(day => (
                <DayCard key={day.dateStr} day={day}
                  expanded={expandedDate === day.dateStr}
                  onToggle={() => setExpandedDate(expandedDate === day.dateStr ? null : day.dateStr)} />
              ))}
            </div>
          )}

          {/* Classical reference */}
          <div className="rounded-xl border border-white/8 bg-white/[0.015] p-4">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Panchanga Elements Explained</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                {name:"Tithi",desc:"Lunar day — 30 per month. Best for marriage: 2nd, 3rd, 5th, 7th, 10th, 11th, 13th. Avoid 4th, 8th, 14th, Amavasya."},
                {name:"Nakshatra",desc:"Moon's asterism — 27 total. Best for marriage: Rohini, Mrigashira, Uttara Phalguni, Hasta, Swati, Anuradha, Uttara Ashadha, Uttara Bhadrapada, Revati."},
                {name:"Vara",desc:"Weekday. Best: Thursday (Guru), Friday (Shukra), Wednesday (Budha). Avoid: Tuesday (Mangal), Saturday (Shani)."},
                {name:"Yoga",desc:"27 yoga combinations of Sun+Moon. Best: Siddhi (16th), Siddha (21st), Priti, Saubhagya. Avoid: Vishkambha, Vyatipata, Parigha, Vaidhriti."},
                {name:"Sarvartha Siddhi",desc:"Special Yoga when Vara+Nakshatra combination ensures all intentions succeed. Highest priority for auspicious ceremonies."},
                {name:"Rahu Kaal",desc:"~1.5 hour inauspicious window each day. No new beginnings during this time. Computed from weekday."},
              ].map(e=>(
                <div key={e.name} className="rounded-lg bg-white/[0.02] border border-white/8 p-3">
                  <p className="font-bold text-amber-300 mb-1">{e.name}</p>
                  <p className="text-slate-400 leading-relaxed">{e.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!result && (
        <div className="rounded-xl border border-white/8 bg-white/[0.015] py-16 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-slate-400 text-sm font-medium">Select a year and month range above</p>
          <p className="text-slate-600 text-xs mt-1">The engine will scan each day and score it using Tithi, Nakshatra, Vara, and Yoga</p>
        </div>
      )}
    </div>
  );
}
