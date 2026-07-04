import { useState, useMemo } from "react";
import { PRIYVRIT_SINGH, RASHI_NAMES } from "../lib/mtss/seedData";
import { calcVimshottariDashas, getMarriageWindows } from "../lib/mtss/dasha";
import { buildNavamsaChart } from "../lib/mtss/navamsa";
import {
  buildChart,
  getCurrentTransits,
  checkDoubleTransit,
  RASHI_LORDS,
  getNakshatraFromLong,
} from "../lib/mtss/vedicEngine";
import { COHORT_RESULTS } from "../lib/mtss/cohortData";

export interface MTSSPanelProps {
  /** Day of month (1-31) */
  day?: number;
  /** Month (1-12) */
  month?: number;
  /** Full year (e.g. 1999) */
  year?: number;
  /** Hour (0-23) */
  hour?: number;
  /** Minute (0-59) */
  minute?: number;
  /** Latitude in decimal degrees */
  lat?: number;
  /** Longitude in decimal degrees */
  lon?: number;
  /** Timezone offset from UTC (default 5.5 for IST) */
  tz?: number;
  /** Display name for the header */
  name?: string;
}

const STRENGTH_COLOR: Record<string, string> = {
  "Very Strong": "text-green-700 bg-green-50 border-green-200",
  "Strong":      "text-blue-700 bg-blue-50 border-blue-200",
  "Moderate":    "text-yellow-700 bg-yellow-50 border-yellow-200",
};

export function MTSSPanel(props: MTSSPanelProps) {
  const {
    day = 8,
    month = 10,
    year = 1999,
    hour = 7,
    minute = 43,
    lat = 24.58,
    lon = 73.68,
    tz = 5.5,
    name = "Priyvrit Singh",
  } = props;

  const data = useMemo(() => {
    // Build the full D1 chart dynamically
    const chart = buildChart(day, month, year, hour, minute, lat, lon, tz);

    // Extract Moon sidereal longitude for Dasha calculation
    const moonPlanet = chart.planets.find(p => p.name === "Moon");
    const moonSid = moonPlanet?.longitude ?? PRIYVRIT_SINGH.moonSidereal;
    const moonNak = moonPlanet
      ? getNakshatraFromLong(moonSid)
      : { name: "Uttara Phalguni", lord: "Sun", pada: 1 };
    const moonRashi = moonPlanet?.rashiName ?? "Leo";

    // Mahadasha lord (current)
    const birthDate = new Date(year, month - 1, day, hour, minute);
    const dashas = calcVimshottariDashas(birthDate, moonNak.name, moonSid);
    const windows = getMarriageWindows(dashas);

    // Build D9 chart from dynamically calculated positions
    const navamsaInput = [
      {
        planet: "Ascendant (Lagna)",
        siderealLong: chart.lagnaLong,
        significance: "Self, personality, physical appearance",
      },
      ...chart.planets.map(p => ({
        planet: p.name,
        siderealLong: p.longitude,
        significance: "",
      })),
    ];
    const navamsa = buildNavamsaChart(navamsaInput);

    // Transits
    const currentTransits = getCurrentTransits(tz);

    // 7th house rashi and 7th lord rashi for double transit check
    const seventhHouseRashi = (chart.lagna + 6) % 12;
    const seventhLord = RASHI_LORDS[seventhHouseRashi];
    const seventhLordRashiIndex = chart.planets.find(p => p.name === seventhLord)?.rashi ?? seventhHouseRashi;

    const doubleTransit = checkDoubleTransit(
      chart.lagna,
      seventhLordRashiIndex,
      currentTransits.jupiter.rashi,
      currentTransits.saturn.rashi,
    );

    // Current dasha
    const currentMD = dashas.find(d => d.isCurrent);
    const currentAD = currentMD?.antardashas.find(a => a.isCurrent);

    return {
      dashas,
      windows,
      navamsa,
      currentTransits,
      doubleTransit,
      currentMD,
      currentAD,
      moonNak,
      moonRashi,
    };
  }, [day, month, year, hour, minute, lat, lon, tz]);

  const [tab, setTab] = useState<"timing" | "spouse" | "navamsa" | "spiritual" | "cohort">("timing");
  const { dashas, windows, navamsa, currentTransits, doubleTransit, currentMD, currentAD, moonNak, moonRashi } = data;
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });

  return (
    <div className="glow-card overflow-hidden shadow-lg border border-white/10 bg-[#090b0f] text-left">
      <div className="px-5 pt-5 pb-0 border-b border-white/10 bg-[#111722]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🔮</span>
          <h2 className="text-base font-bold text-white">MTSS & Navamsa Panel</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          For {name} · {moonNak.name} Nakshatra · {moonRashi} Moon{currentMD ? ` · ${currentMD.lord} Mahadasha` : ''}
        </p>
        <div className="flex gap-1 overflow-x-auto pb-px scrollbar-hide">
          {[
            { id: "timing",    icon: "⏳", label: "Marriage Timing" },
            { id: "spouse",    icon: "💑", label: "Spouse (D1)"  },
            { id: "navamsa",   icon: "✡️", label: "Navamsa (D9)"  },
            { id: "spiritual", icon: "🕉", label: "Remedies" },
            { id: "cohort",    icon: "📊", label: "11-User Cohort QA" },
          ].map(({ id, icon, label }) => (
            <button key={id} onClick={() => setTab(id as typeof tab)}
              className={`px-3 py-2 text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                tab === id ? "border-b-2 border-amber-500 text-amber-500" : "text-slate-400 hover:text-white"}`}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4 max-h-[600px] overflow-y-auto bg-[#0d1118]">
        {/* ── TIMING ── */}
        {tab === "timing" && (
          <div className="space-y-4">
            {currentAD?.isMarriageFavorable && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-900/20 p-4 flex gap-3 shadow-sm">
              <span className="text-xl flex-shrink-0 mt-0.5">⚡</span>
              <div>
                <p className="text-sm font-bold text-amber-300">Active Window — {currentMD?.lord}–{currentAD.lord}</p>
                <p className="text-xs text-amber-100/70 mt-1 leading-relaxed">
                  <span className="font-semibold text-amber-200">{currentMD?.lord}–{currentAD.lord} Antardasha</span> ({fmt(currentAD.startDate)} → {fmt(currentAD.endDate)}) is active now. {currentAD.note}
                </p>
              </div>
            </div>
            )}

            {currentMD && (
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 shadow-sm">
                <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-1">Current Vimshottari Period</p>
                <p className="text-lg font-bold text-white">
                  {currentMD.lord} Mahadasha
                  {currentAD && <span className="text-sm font-semibold text-slate-400"> → {currentAD.lord} Antardasha</span>}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  MD: {fmt(currentMD.startDate)} → {fmt(currentMD.endDate)}
                  {currentAD && <span> · AD: {fmt(currentAD.startDate)} → {fmt(currentAD.endDate)}</span>}
                </p>
                {currentAD?.isMarriageFavorable && (
                  <div className="mt-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 p-3">
                    <p className="text-xs font-bold">✓ Marriage-Favorable Antardasha Active</p>
                    <p className="text-xs mt-0.5 opacity-90">{currentAD.note}</p>
                  </div>
                )}
              </div>
            )}

            <div className={`rounded-xl border p-4 shadow-sm ${doubleTransit.isDoubleTransitActive ? "bg-purple-900/20 border-purple-500/30" : "bg-white/[0.02] border-white/10"}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🪐</span>
                <p className="text-sm font-bold text-white">Live Gochar (Transit) Overlay</p>
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Current positions: <span className="font-semibold text-purple-300">Jupiter in {currentTransits.jupiter.rashiName}</span> and <span className="font-semibold text-purple-300">Saturn in {currentTransits.saturn.rashiName}</span>.
              </p>
              <div className={`rounded-lg p-3 text-xs ${doubleTransit.isDoubleTransitActive ? "bg-purple-500/20 text-purple-200" : "bg-slate-800/50 text-slate-400"}`}>
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  {doubleTransit.isDoubleTransitActive ? "✨ Double Transit Activated" : "No Double Transit Activation"}
                </p>
                <p>{doubleTransit.message}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Auspicious Marriage Windows</p>
              <div className="space-y-2">
                {windows.map((w, i) => (
                  <div key={i} className={`rounded-lg border p-3 shadow-sm ${
                    w.strength === 'Very Strong' ? 'bg-green-500/10 border-green-500/30' : 
                    w.strength === 'Strong' ? 'bg-blue-500/10 border-blue-500/30' : 
                    'bg-yellow-500/10 border-yellow-500/30'}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white">{w.from} → {w.to}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
                        w.strength === 'Very Strong' ? 'bg-green-500/20 border-green-500/40 text-green-300' : 
                        w.strength === 'Strong' ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 
                        'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'}`}>{w.strength}</span>
                    </div>
                    <p className="text-xs mt-1 text-slate-300 opacity-90">{w.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── NAVAMSA D9 ── */}
        {tab === "navamsa" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">Navamsa (D9) Chart Analysis</p>
                <span className={`text-xs px-2 py-1 rounded-full font-bold text-white ${navamsa.marriageAnalysis.overallScore >= 65 ? 'bg-green-600' : 'bg-yellow-600'}`}>
                  Score: {navamsa.marriageAnalysis.overallScore}/100
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="grid grid-cols-4 grid-rows-4 gap-1 mb-3">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const rashiIndex = i;
                      const planetsHere = navamsa.positions.filter(p => p.navamsaRashi === rashiIndex);
                      const isLagna = navamsa.lagnaNavamsa === RASHI_NAMES[rashiIndex];
                      const isSeventh = navamsa.seventhSignD9 === RASHI_NAMES[rashiIndex];
                      
                      return (
                        <div key={i} className={`flex flex-col items-center justify-center border p-1 h-16 rounded ${isLagna ? 'border-amber-400 bg-amber-400/20' : isSeventh ? 'border-pink-400 bg-pink-400/20' : 'border-white/10'}`}>
                          <span className="text-[9px] text-slate-400 opacity-70 mb-1">{RASHI_NAMES[rashiIndex].split(' ')[0]}</span>
                          {isLagna && <span className="text-[10px] font-bold text-amber-500">ASC</span>}
                          {planetsHere.map(p => (
                            <span key={p.planet} className={`text-[10px] ${p.planet === 'Venus' ? 'text-pink-400 font-bold' : 'text-slate-200'}`}>
                              {p.planet.substring(0, 2).toUpperCase()}
                            </span>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-3 text-[10px] justify-center text-slate-400 font-medium">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-[#fde68a] border border-[#f2a93a]"></div> D9 Lagna</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-[#fbcfe8] border border-[#ab2249]"></div> D9 7th House</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="bg-amber-900/20 p-3 rounded border border-amber-500/30">
                    <p className="font-bold text-amber-300 mb-1">Key Placements</p>
                    <ul className="text-xs space-y-1 text-amber-100/80">
                      <li>• Lagna: <span className="font-semibold">{navamsa.lagnaNavamsa}</span></li>
                      <li>• 7th House: <span className="font-semibold">{navamsa.seventhSignD9}</span> ({navamsa.seventhLordD9} ruled)</li>
                      <li>• Venus (Kalatrakaraka): <span className="font-semibold">{navamsa.venusNavamsa}</span></li>
                      <li>• Jupiter (Vivaha Karaka): <span className="font-semibold">{navamsa.jupiterNavamsa}</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white/[0.035] border border-white/10 p-4 rounded-xl shadow-sm">
                <p className="font-bold text-sm mb-2 text-white flex items-center gap-2">
                  <span className="text-pink-400">❤️</span> Spouse Qualities (from D9)
                </p>
                <ul className="space-y-2">
                  {navamsa.marriageAnalysis.spouseQualities.map((q, i) => (
                    <li key={i} className="text-xs text-slate-300 leading-relaxed flex gap-2">
                      <span className="text-pink-400/50">•</span> <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {navamsa.marriageAnalysis.yogas.length > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl shadow-sm">
                  <p className="font-bold text-sm mb-2 text-green-400 flex items-center gap-2">
                    <span>🌟</span> Auspicious Yogas in D9
                  </p>
                  <ul className="space-y-1">
                    {navamsa.marriageAnalysis.yogas.map((y, i) => (
                      <li key={i} className="text-xs text-green-300/90 flex gap-2">
                        <span>•</span> <span>{y}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {navamsa.marriageAnalysis.doshaInD9.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl shadow-sm">
                  <p className="font-bold text-sm mb-2 text-red-400 flex items-center gap-2">
                    <span>⚠️</span> Challenges / Doshas in D9
                  </p>
                  <ul className="space-y-1">
                    {navamsa.marriageAnalysis.doshaInD9.map((d, i) => (
                      <li key={i} className="text-xs text-red-300/90 flex gap-2">
                        <span>•</span> <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl shadow-sm">
                  <p className="font-bold text-sm mb-2 text-blue-400 flex items-center gap-2">
                    <span>⏱️</span> Timing Insights from D9
                  </p>
                  <ul className="space-y-1">
                    {navamsa.marriageAnalysis.timingInsights.map((t, i) => (
                      <li key={i} className="text-xs text-blue-300/90 flex gap-2">
                        <span>•</span> <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
            </div>
          </div>
        )}

        {/* ── SPOUSE D1 ── */}
        {tab === "spouse" && (
           <div className="space-y-4">
             <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 space-y-4 shadow-sm">
               <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-white/10 pb-2">
                 Derived from D1 7th House (Aquarius) · Moon in Leo
               </p>
 
               {[
                 {
                   icon: "✨", title: "Physical Appearance",
                   desc: "7th house from Leo is Aquarius (Saturn). Saturn bestows a dignified, structured appearance — likely tall or above average height, wheatish to fair complexion, prominent features. Sun's influence adds a radiant glow.",
                 },
                 {
                   icon: "🧠", title: "Nature & Personality",
                   desc: "7th lord Saturn → disciplined, responsible, patient. Leo Moon → warm-hearted, generous. Uttara Phalguni (Aryaman) → deeply partnership-oriented, values commitment.",
                 },
                 {
                   icon: "💼", title: "Career & Background",
                   desc: "Educated and career-oriented. Fields indicated: medicine, law, education, administration. Family background is likely respectable and traditional.",
                 },
                 {
                   icon: "🌟", title: "Spiritual & Values",
                   desc: "Uttara Phalguni is associated with Aryaman — the Vedic deity of noble unions. Spouse holds marriage sacred, honours traditions, and is spiritually inclined.",
                 },
                 {
                   icon: "❤️", title: "Relationship Style",
                   desc: "Loyal, steady, deeply committed. Saturn influence means she may be initially reserved but unwavering once bonded. Leo Moon makes her thrive on appreciation.",
                 },
               ].map(({ icon, title, desc }) => (
                 <div key={title} className="flex gap-3">
                   <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
                   <div>
                     <p className="text-sm font-bold text-white">{title}</p>
                     <p className="text-xs text-slate-300 mt-1 leading-relaxed">{desc}</p>
                   </div>
                 </div>
               ))}
             </div>
 
             <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 shadow-sm">
               <p className="text-sm font-bold mb-1 text-green-400">Best Moon Sign Matches (D1 Leo Moon)</p>
               <p className="text-xs mt-1 leading-relaxed text-green-100/80">
                 <span className="font-bold">Ideal:</span> Aries, Sagittarius (fire — same element, natural harmony) <br/>
                 <span className="font-bold">Good:</span> Gemini, Libra (air — complementary) <br/>
                 <span className="font-bold">Caution:</span> Scorpio, Aquarius (Rahu/Saturn influenced). Always verify full Ashtakuta score.
               </p>
             </div>
           </div>
        )}

        {/* ── SPIRITUAL ── */}
        {tab === "spiritual" && (
           <div className="space-y-4">
             <p className="text-xs text-slate-400 italic">
               Remedies prescribed for Uttara Phalguni, Leo Moon, Rahu MD, and D9 Navamsa doshas.
             </p>
 
             {[
               {
                 category: "🔥 Homam / Puja", color: "bg-red-500/10 border-red-500/20", hdr: "text-red-400",
                 items: [
                   { title: "Swayamvara Parvathi Homam", desc: "Supreme puja for life partner. Perform at Shiva temple on a Friday with 108 white lotus flowers. Highly recommended before Oct 2026." },
                   { title: "Surya (Sun) Graha Puja", desc: "Uttara Phalguni's lord is Sun. Surya Graha Shanti on a Sunday strengthens the nakshatra lord." },
                 ],
               },
               {
                 category: "🎵 Mantras (Daily)", color: "bg-amber-500/10 border-amber-500/20", hdr: "text-amber-400",
                 items: [
                   { title: "Katyayani Mantra — 41 Days", desc: '"Om Katyayanyai Cha Vidmahe..." — chant 108 times daily for 41 days. Prescribed for those seeking a virtuous spouse.' },
                   { title: "Rahu Beej Mantra", desc: '"Om Bhram Bhreem Bhraum Sah Rahave Namah" — 18 times Saturday evening to pacify current Mahadasha lord.' },
                 ],
               },
               {
                 category: "💚 Daan (Sacred Donations)", color: "bg-green-500/10 border-green-500/20", hdr: "text-green-400",
                 items: [
                   { title: "Every Sunday", desc: "Donate wheat, copper, or red flowers to strengthen Sun (nakshatra lord)." },
                   { title: "Every Saturday", desc: "Feed black sesame or mustard oil to the poor. Pacifies Saturn (7th lord) and Rahu." },
                 ],
               },
               {
                 category: "✡️ Specific D9 Navamsa Remedies", color: "bg-purple-500/10 border-purple-500/20", hdr: "text-purple-400",
                 items: navamsa.marriageAnalysis.remedies.map(r => ({ title: "Navamsa Remedy", desc: r }))
               }
             ].map(({ category, color, hdr, items }) => (
               <div key={category} className={`rounded-xl border p-4 shadow-sm ${color}`}>
                 <p className={`text-xs font-bold uppercase tracking-wide mb-3 ${hdr}`}>{category}</p>
                 <div className="space-y-3">
                   {items.map(({ title, desc }, i) => (
                     <div key={i} className="flex gap-2">
                       <span className="font-bold text-xs mt-0.5 flex-shrink-0 text-white opacity-50">•</span>
                       <div>
                         <p className="text-xs font-bold text-white">{title}</p>
                         <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{desc}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
           </div>
        )}

         {/* ── COHORT QA TAB ── */}
         {tab === "cohort" && (
           <div className="space-y-4">
             <div className="rounded-xl border border-blue-500/30 bg-blue-900/10 p-4 mb-4">
               <h3 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                 <span>🔬</span> 11-User Engine Test Cohort
               </h3>
               <p className="text-xs text-slate-300 leading-relaxed">
                 Automated testing against diverse chart patterns (Manglik, Saturn delay, Spiritual/Ketu, etc.) to verify engine accuracy.
                 Total Tests: 11 | Passed: 10 | Warn (Human Review): 1
               </p>
             </div>
             
             <div className="space-y-3">
               {COHORT_RESULTS.map((res) => (
                 <div key={res.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                   <div className="flex-1">
                     <p className="text-sm font-bold text-white mb-1">
                       <span className="text-slate-500 mr-2">#{res.id}</span>
                       {res.description}
                     </p>
                     <p className="text-xs text-slate-400 mb-2">
                       <span className="font-semibold">Expected:</span> {res.expectedPattern}
                     </p>
                     <p className="text-xs text-slate-500 italic border-l-2 border-slate-700 pl-2">
                       {res.notes}
                     </p>
                   </div>
                   <div className="flex-shrink-0">
                     <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                       res.status === 'PASS' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                       res.status === 'WARN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                       'bg-red-500/20 text-red-400 border border-red-500/30'
                     }`}>
                       {res.status}
                     </span>
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

// Default export enables React.lazy() routing while named export
// keeps backward compatibility with LandingPage / Index imports.
export default MTSSPanel;
