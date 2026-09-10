import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { computeMilan, type MilanResult } from "../lib/mtss/kundliMilan";
import { RASHI_NAMES_EN } from "../lib/mtss/vedicEngine";
import { searchCities, type City } from "../lib/mtss/indianCities";
import type { JatakInput } from "../lib/mtss/mtssEngine";
import { computeMuhurta, type MuhurtaResult } from "../lib/mtss/muhurta";
import { exportMatchReport } from "@/services/matchmakingPdfService";
import { calculateEnhancedAshtakuta } from "@/services/ashtakutaServiceEnhanced";
import FamilyProfileSelector from "@/components/FamilyProfileSelector";
import { getProfileById } from "@/lib/familyProfiles";
import type { FamilyProfile } from "@/lib/familyProfiles";
import EnhancedLanguageToggle from "@/components/EnhancedLanguageToggle";
import { type SupportedLanguage } from "@/services/multiLanguageService";
import { Badge } from "@/components/ui/badge";
import { Users, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const LABELS = {
  en: {
    pageTitle: "Kundli Milan",
    pageSubtitle: "Classical Ashtakuta 36-point compatibility analysis · Mangal Dosha cross-check · Navamsa D9 compatibility",
    searchCity: "Search city…",
    fullName: "Full Name",
    namePlaceholder: "Name…",
    day: "Day",
    month: "Month",
    year: "Year",
    hour: "Hour",
    minute: "Minute",
    placeOfBirth: "Place of Birth",
    dayPlaceholder: "DD",
    yearPlaceholder: "YYYY",
    hourPlaceholder: "H",
    minutePlaceholder: "MM",
    coord: "📍 {lat}°N, {lon}°E",
    malePartner: "Male Partner (Groom)",
    femalePartner: "Female Partner (Bride)",
    groomPerson: "Groom (Var)",
    bridePerson: "Bride (Vadhu)",
    errorCompleteGroom: "Please complete all Groom fields and select a city.",
    errorCompleteBride: "Please complete all Bride fields and select a city.",
    errorComputation: "Computation error. Please check the birth details.",
    btnCompute: "Compute Kundli Milan",
    btnComputing: "Computing…",
    scoreTitle: "Kundli Milan Score",
    of36: "/36",
    expandHint: "Click any row to see detailed interpretation",
    ashtakutaTitle: "Ashtakuta — 8 Kutas",
    totalLabel: "Total",
    mangalTitle: "Mangal Dosha Analysis",
    groomLabel: "Groom",
    brideLabel: "Bride",
    mangalPresent: "⚠ Mangal Dosha",
    mangalNone: "✓ No Dosha",
    mangalMarsPosition: "Mars in house 1/2/4/7/8/12",
    navamsaTitle: "Navamsa (D9) Compatibility",
    warningsTitle: "Warnings",
    recommendationsTitle: "Recommendations",
    classicalRefTitle: "Classical Scoring Reference",
    refPerfect: "Perfect", refVeryGood: "Very Good", refGood: "Good",
    refAverage: "Average", refBelowAvg: "Below Avg", refAvoid: "Avoid",
    refNotRec: "Not Recommended",
    downloadPdf: "Download Match Report PDF",
    generatingPdf: "Generating PDF…",
    muhurtaTitle: "Recommended Wedding Dates",
    openFullMuhurta: "Open Full Muhurta Finder",
    muhurtaSubtitle: "Top 3 dates in the current year that align with auspicious combinations (Grade A/A+).",
    muhurtaScore: "Score: {s}/100",
    nakshatraSuffix: "Nakshatra",
    baseline0: "0 — Not Recommended",
    baseline18: "18 — Average",
    baseline28: "28 — Very Good",
    baseline36: "36 — Perfect",
  },
  hi: {
    pageTitle: "कुंडली मिलान",
    pageSubtitle: "शास्त्रीय अष्टकूट 36-अंक संगति विश्लेषण · मंगल दोष जाँच · नवांश D9 अनुकूलता",
    searchCity: "शहर खोजें…",
    fullName: "पूरा नाम",
    namePlaceholder: "नाम…",
    day: "दिन",
    month: "महीना",
    year: "वर्ष",
    hour: "घंटा",
    minute: "मिनट",
    placeOfBirth: "जन्म स्थान",
    dayPlaceholder: "दि",
    yearPlaceholder: "वर्ष",
    hourPlaceholder: "घं",
    minutePlaceholder: "मि",
    coord: "📍 {lat}°उ, {lon}°पू",
    malePartner: "पुरुष साथी (वर)",
    femalePartner: "महिला साथी (वधू)",
    groomPerson: "वर",
    bridePerson: "वधू",
    errorCompleteGroom: "कृपया वर के सभी फ़ील्ड पूर्ण करें और एक शहर चुनें।",
    errorCompleteBride: "कृपया वधू के सभी फ़ील्ड पूर्ण करें और एक शहर चुनें।",
    errorComputation: "गणना त्रुटि। कृपया जन्म विवरण जाँचें।",
    btnCompute: "कुंडली मिलान गणना करें",
    btnComputing: "गणना हो रही है…",
    scoreTitle: "कुंडली मिलान स्कोर",
    of36: "/36",
    expandHint: "विस्तृत व्याख्या देखने के लिए किसी भी पंक्ति पर क्लिक करें",
    ashtakutaTitle: "अष्टकूट — 8 कूट",
    totalLabel: "कुल",
    mangalTitle: "मंगल दोष विश्लेषण",
    groomLabel: "वर",
    brideLabel: "वधू",
    mangalPresent: "⚠ मंगल दोष",
    mangalNone: "✓ कोई दोष नहीं",
    mangalMarsPosition: "मंगल ग्रह 1/2/4/7/8/12 भाव में",
    navamsaTitle: "नवांश (D9) अनुकूलता",
    warningsTitle: "चेतावनियाँ",
    recommendationsTitle: "सुझाव",
    classicalRefTitle: "शास्त्रीय स्कोरिंग संदर्भ",
    refPerfect: "उत्तम", refVeryGood: "बहुत अच्छा", refGood: "अच्छा",
    refAverage: "औसत", refBelowAvg: "औसत से कम", refAvoid: "त्यजें",
    refNotRec: "अनुशंसित नहीं",
    downloadPdf: "मिलान रिपोर्ट PDF डाउनलोड करें",
    generatingPdf: "PDF बनाया जा रहा है…",
    muhurtaTitle: "अनुशंसित शादी की तारीखें",
    openFullMuhurta: "पूर्ण मुहूर्त खोजें खोलें",
    muhurtaSubtitle: "चालू वर्ष की शीर्ष 3 तारीखें जो शुभ योगों (ग्रेड A/A+) के साथ संरेखित हैं।",
    muhurtaScore: "स्कोर: {s}/100",
    nakshatraSuffix: "नक्षत्र",
    baseline0: "0 — अनुशंसित नहीं",
    baseline18: "18 — औसत",
    baseline28: "28 — बहुत अच्छा",
    baseline36: "36 — परिपूर्ण",
  },
};

const MONTHS_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_HI = ["जन","फ़र","मार्च","अप्रैल","मई","जून","जुलाई","अग","सित","अक्टू","नव","दिस"];

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

function profileToPersonForm(profile: FamilyProfile): PersonForm {
  const [y, m, d] = profile.birthDate.split("-");
  let hour24 = 0;
  let minuteStr = "0";
  if (profile.birthTime) {
    const [h, mi] = profile.birthTime.split(":");
    hour24 = parseInt(h || "0", 10);
    minuteStr = mi || "0";
  }
  let hour12: number;
  let ampm: "AM" | "PM";
  if (hour24 === 0) { hour12 = 12; ampm = "AM"; }
  else if (hour24 === 12) { hour12 = 12; ampm = "PM"; }
  else if (hour24 > 12) { hour12 = hour24 - 12; ampm = "PM"; }
  else { hour12 = hour24; ampm = "AM"; }
  return {
    name: profile.name,
    day: d || "",
    month: m ? String(parseInt(m, 10)) : "1",
    year: y || "",
    hour: String(hour12),
    minute: String(parseInt(minuteStr, 10) || 0),
    ampm,
    city: profile.birthPlace || "",
    lat: profile.birthLat ? String(profile.birthLat) : "",
    lon: profile.birthLon ? String(profile.birthLon) : "",
  };
}

function CitySearch({ value, onChange, onSelect, t }: {
  value: string; onChange: (v: string) => void; onSelect: (c: City) => void;
  t: typeof LABELS.en;
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
        placeholder={t.searchCity}
        className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all" />
      {open && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl overflow-hidden">
          {sugg.map(c => (
            <li key={c.name + c.state}>
              <button type="button" onClick={() => { onSelect(c); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between transition-colors">
                <span className="font-medium">{c.name}</span>
                <span className="text-muted-foreground text-xs">{c.state}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
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

function ScoreBar({ scored, max }: { scored: number; max: number }) {
  const pct = max > 0 ? (scored / max) * 100 : 0;
  const color = pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-blue-500" : pct >= 30 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-foreground tabular-nums w-10 text-right">{scored}/{max}</span>
    </div>
  );
}

function verdictColor(v: string): string {
  return v==="Excellent"?"text-emerald-600":v==="Good"?"text-blue-600":v==="Average"?"text-amber-600":"text-red-600";
}

function PersonCard({
  label, gender, color, form, setForm, t, isHi
}: {
  label: string; gender: "♂"|"♀"; color: string;
  form: PersonForm; setForm: (f: PersonForm) => void;
  t: typeof LABELS.en; isHi: boolean;
}) {
  const inp = (k: keyof PersonForm) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });
  const cls = "w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all";
  const lbl = cn("block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1", isHi && "font-hindi tracking-normal normal-case");
  const MONTHS = isHi ? MONTHS_HI : MONTHS_EN;

  const coordText = t.coord.replace("{lat}", form.lat).replace("{lon}", form.lon);

  return (
    <div className={cn("rounded-2xl border p-4 space-y-3", color)}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{gender}</span>
        <h3 className={cn("text-sm font-bold text-foreground", isHi && "font-hindi")}>{label}</h3>
      </div>

      <div>
        <label className={lbl}>{t.fullName}</label>
        <input type="text" value={form.name} onChange={inp("name")}
          placeholder={t.namePlaceholder} className={cls} />
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <div>
          <label className={lbl}>{t.day}</label>
          <input type="number" min="1" max="31" value={form.day} onChange={inp("day")}
            placeholder={t.dayPlaceholder} className={cls} />
        </div>
        <div>
          <label className={lbl}>{t.month}</label>
          <select value={form.month} onChange={inp("month")} className={cls + " cursor-pointer"}>
            {MONTHS.map((m,i)=>(
              <option key={m} value={i+1} className="bg-background">{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>{t.year}</label>
          <input type="number" min="1900" max="2100" value={form.year} onChange={inp("year")}
            placeholder={t.yearPlaceholder} className={cls} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <div>
          <label className={lbl}>{t.hour}</label>
          <input type="number" min="1" max="12" value={form.hour} onChange={inp("hour")}
            placeholder={t.hourPlaceholder} className={cls} />
        </div>
        <div>
          <label className={lbl}>{t.minute}</label>
          <input type="number" min="0" max="59" value={form.minute} onChange={inp("minute")}
            placeholder={t.minutePlaceholder} className={cls} />
        </div>
        <div>
          <label className={lbl}>AM/PM</label>
          <div className="flex rounded-lg border border-border overflow-hidden h-[38px] bg-background">
            {(["AM","PM"] as const).map(ap => (
              <button key={ap} type="button" onClick={() => setForm({ ...form, ampm: ap })}
                className={cn("flex-1 text-sm font-bold transition-colors",
                  form.ampm===ap ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60")}>
                {ap}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className={lbl}>{t.placeOfBirth}</label>
        <CitySearch value={form.city}
          onChange={v => setForm({ ...form, city: v, lat: "", lon: "" })}
          onSelect={c => setForm({ ...form, city: c.name, lat: String(c.lat), lon: String(c.lon) })}
          t={t} />
        {form.lat && (
          <p className={cn("text-[10px] text-muted-foreground mt-1", isHi && "font-hindi")}>{coordText}</p>
        )}
      </div>
    </div>
  );
}

export default function EnhancedKundliMilan() {
  const [uiLang, setUiLang] = useState<SupportedLanguage>("en");
  const isHi = uiLang === "hi";
  const t = isHi ? LABELS.hi : LABELS.en;

  const [groomForm, setGroomForm] = useState<PersonForm>(DEFAULT_GROOM);
  const [brideForm, setBrideForm] = useState<PersonForm>(DEFAULT_BRIDE);
  const [result, setResult] = useState<MilanResult | null>(null);
  const [muhurtaResult, setMuhurtaResult] = useState<MuhurtaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedKuta, setExpandedKuta] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [groomProfileId, setGroomProfileId] = useState<string | undefined>();
  const [brideProfileId, setBrideProfileId] = useState<string | undefined>();
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleGroomProfileSelect = (profile: FamilyProfile) => {
    const validated = getProfileById(profile.id);
    if (!validated) return;
    setGroomProfileId(profile.id);
    setGroomForm(profileToPersonForm(validated));
  };

  const handleBrideProfileSelect = (profile: FamilyProfile) => {
    const validated = getProfileById(profile.id);
    if (!validated) return;
    setBrideProfileId(profile.id);
    setBrideForm(profileToPersonForm(validated));
  };

  function handleCompute(e: React.FormEvent) {
    e.preventDefault();
    const groom = toJatak(groomForm, "milan_groom");
    const bride  = toJatak(brideForm,  "milan_bride");
    if (!groom) { setError(t.errorCompleteGroom); return; }
    if (!bride)  { setError(t.errorCompleteBride); return; }
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
      } catch(_e) {
        setError(t.errorComputation);
      } finally { setLoading(false); }
    }, 30);
  }

  const verdictConfig: Record<string, { bg: string; text: string; border: string }> = {
    "Excellent":       { bg:"bg-emerald-50",       text:"text-emerald-700",       border:"border-emerald-200" },
    "Very Good":       { bg:"bg-teal-50",          text:"text-teal-700",          border:"border-teal-200" },
    "Good":            { bg:"bg-blue-50",          text:"text-blue-700",          border:"border-blue-200" },
    "Average":         { bg:"bg-amber-50",         text:"text-amber-700",         border:"border-amber-200" },
    "Below Average":   { bg:"bg-orange-50",        text:"text-orange-700",        border:"border-orange-200" },
    "Not Recommended": { bg:"bg-red-50",           text:"text-red-700",           border:"border-red-200" },
  };

  async function handleDownloadPdf() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const groomDob = `${groomForm.year}-${String(groomForm.month).padStart(2,'0')}-${String(groomForm.day).padStart(2,'0')}`;
      const brideDob  = `${brideForm.year}-${String(brideForm.month).padStart(2,'0')}-${String(brideForm.day).padStart(2,'0')}`;
      const groomHr = groomForm.ampm === "PM" && groomForm.hour !== "12"
        ? String(Number(groomForm.hour) + 12) : groomForm.ampm === "AM" && groomForm.hour === "12" ? "00" : groomForm.hour;
      const brideHr  = brideForm.ampm === "PM" && brideForm.hour !== "12"
        ? String(Number(brideForm.hour) + 12) : brideForm.ampm === "AM" && brideForm.hour === "12" ? "00" : brideForm.hour;
      const groomTime = `${String(groomHr).padStart(2,'0')}:${String(groomForm.minute).padStart(2,'0')}`;
      const brideTime  = `${String(brideHr).padStart(2,'0')}:${String(brideForm.minute).padStart(2,'0')}`;

      const enhanced = await calculateEnhancedAshtakuta(
        { name: groomForm.name, dateOfBirth: groomDob, timeOfBirth: groomTime, placeOfBirth: groomForm.city },
        { name: brideForm.name,  dateOfBirth: brideDob,  timeOfBirth: brideTime,  placeOfBirth: brideForm.city  },
      );
      await exportMatchReport(enhanced, {
        person1DisplayName: groomForm.name || "Groom",
        person2DisplayName: brideForm.name  || "Bride",
        language: "en",
      });
    } catch (_err) {
      // silent
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className={cn("text-base font-bold text-foreground flex items-center gap-2 mb-1", isHi && "font-hindi text-lg")}>
            <span>💑</span> {t.pageTitle}
          </h2>
          <p className={cn("text-xs text-muted-foreground", isHi && "font-hindi text-[11px]")}>
            {t.pageSubtitle}
          </p>
        </div>
        <EnhancedLanguageToggle currentLang={uiLang} onChange={setUiLang} showRegion={false} autoDetect={false} />
      </div>

      <form onSubmit={handleCompute} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2 px-1">
              <Badge variant="secondary" className={cn("text-xs", isHi && "font-hindi")}>
                <Users className="h-3 w-3 inline mr-1" />
                {t.malePartner}
              </Badge>
              <FamilyProfileSelector
                onSelect={handleGroomProfileSelect}
                selectedId={groomProfileId}
                triggerLabel={isHi ? "परिवार प्रोफ़ाइल" : "Family Profile"}
                lang={uiLang}
                className="!py-1 !px-2.5 text-xs"
              />
            </div>
            <PersonCard label={t.groomPerson} gender="♂"
              color="border-blue-200 bg-blue-50/60"
              form={groomForm} setForm={setGroomForm} t={t} isHi={isHi} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2 px-1">
              <Badge variant="secondary" className={cn("text-xs", isHi && "font-hindi")}>
                <Heart className="h-3 w-3 inline mr-1" />
                {t.femalePartner}
              </Badge>
              <FamilyProfileSelector
                onSelect={handleBrideProfileSelect}
                selectedId={brideProfileId}
                triggerLabel={isHi ? "परिवार प्रोफ़ाइल" : "Family Profile"}
                lang={uiLang}
                className="!py-1 !px-2.5 text-xs"
              />
            </div>
            <PersonCard label={t.bridePerson} gender="♀"
              color="border-pink-200 bg-pink-50/60"
              form={brideForm} setForm={setBrideForm} t={t} isHi={isHi} />
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">{error}</div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
          {loading
            ? <><span className="animate-spin">⚙</span> {t.btnComputing}</>
            : <><span>💑</span> {t.btnCompute}</>}
        </button>
      </form>

      {result && (
        <div ref={resultsRef} className="space-y-5">
          <div className={cn("rounded-2xl border p-6",
            verdictConfig[result.verdict]?.border ?? "border-border",
            verdictConfig[result.verdict]?.bg ?? "bg-card/60")}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className={cn("text-xs text-muted-foreground mb-1", isHi && "font-hindi")}>{t.scoreTitle}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-foreground">{result.totalPoints}</span>
                  <span className="text-xl text-muted-foreground">{t.of36}</span>
                  <span className="text-lg text-muted-foreground">({result.percentage}%)</span>
                </div>
                <p className={cn("text-lg font-bold mt-1", verdictConfig[result.verdict]?.text ?? "text-foreground", isHi && "font-hindi")}>
                  {result.verdict}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm text-foreground font-semibold">{result.male.name}</p>
                <p className="text-xs text-muted-foreground">
                  {RASHI_NAMES_EN[result.maleMoonRashi]} Moon ·{" "}
                  {result.maleChart && result.maleChart.planets.find(p=>p.name==="Moon")?.nakshatra}
                </p>
                <p className="text-xs text-muted-foreground my-1">♥</p>
                <p className="text-sm text-foreground font-semibold">{result.female.name}</p>
                <p className="text-xs text-muted-foreground">
                  {RASHI_NAMES_EN[result.femaleMoonRashi]} Moon ·{" "}
                  {result.femaleChart && result.femaleChart.planets.find(p=>p.name==="Moon")?.nakshatra}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className={cn("flex items-center justify-between text-[10px] text-muted-foreground mb-1", isHi && "font-hindi text-[11px]")}>
                <span>{t.baseline0}</span>
                <span>{t.baseline18}</span>
                <span>{t.baseline28}</span>
                <span>{t.baseline36}</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden relative">
                <div className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 opacity-30 absolute inset-0" />
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all relative"
                  style={{ width: `${(result.totalPoints/36)*100}%` }}
                />
                <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-card shadow-md border-2 border-amber-400 transition-all"
                  style={{ left: `calc(${(result.totalPoints/36)*100}% - 5px)` }} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className={cn("text-sm font-bold text-foreground", isHi && "font-hindi")}>{t.ashtakutaTitle}</h3>
              <p className={cn("text-[10px] text-muted-foreground mt-0.5", isHi && "font-hindi text-[11px]")}>{t.expandHint}</p>
            </div>
            <div className="divide-y divide-border/50">
              {result.kutas.map((k, i) => {
                const isOpen = expandedKuta === k.name;
                return (
                  <div key={k.name}>
                    <button
                      onClick={() => setExpandedKuta(isOpen ? null : k.name)}
                      className="w-full text-left px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground w-4 tabular-nums">{i+1}</span>
                        <div className="w-28 flex-shrink-0">
                          <p className="text-sm font-semibold text-foreground">{k.name}</p>
                          <p className="text-[10px] text-muted-foreground">{k.description}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <ScoreBar scored={k.scored} max={k.maxPoints} />
                        </div>
                        <span className={cn("text-[10px] font-bold w-16 text-right flex-shrink-0", verdictColor(k.verdict))}>
                          {k.verdict}
                        </span>
                        <span className="text-muted-foreground text-xs w-4 flex-shrink-0">{isOpen ? "▲":"▼"}</span>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 bg-muted/20 border-t border-border/40">
                        <p className={cn("text-xs text-foreground/80 leading-relaxed", isHi && "font-hindi")}>{k.detail}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
              <span className={cn("text-sm font-bold text-foreground", isHi && "font-hindi")}>{t.totalLabel}</span>
              <div className="flex items-center gap-3">
                <div className="w-40"><ScoreBar scored={result.totalPoints} max={result.maxPoints} /></div>
                <span className={cn("text-sm font-bold", verdictConfig[result.verdict]?.text ?? "text-foreground")}>
                  {result.verdict}
                </span>
              </div>
            </div>
          </div>

          <div className={cn("rounded-2xl border p-4",
            result.mangalDoshaCancelled ? "border-emerald-200 bg-emerald-50" :
            (result.mangalDoshaMale || result.mangalDoshaFemale) ? "border-red-200 bg-red-50/70" :
            "border-emerald-200 bg-emerald-50")}>
            <h3 className={cn("text-sm font-bold text-foreground mb-2 flex items-center gap-2", isHi && "font-hindi")}>
              <span>♂</span> {t.mangalTitle}
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className={cn("rounded-lg border p-3",
                result.mangalDoshaMale ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50")}>
                <p className={cn("text-xs font-bold text-foreground/70 mb-1", isHi && "font-hindi")}>{t.groomLabel}</p>
                <p className={cn("text-sm font-bold", result.mangalDoshaMale?"text-red-600":"text-emerald-600", isHi && "font-hindi")}>
                  {result.mangalDoshaMale ? t.mangalPresent : t.mangalNone}
                </p>
                {result.mangalDoshaMale && (
                  <p className={cn("text-[10px] text-muted-foreground mt-1", isHi && "font-hindi")}>{t.mangalMarsPosition}</p>
                )}
              </div>
              <div className={cn("rounded-lg border p-3",
                result.mangalDoshaFemale ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50")}>
                <p className={cn("text-xs font-bold text-foreground/70 mb-1", isHi && "font-hindi")}>{t.brideLabel}</p>
                <p className={cn("text-sm font-bold", result.mangalDoshaFemale?"text-red-600":"text-emerald-600", isHi && "font-hindi")}>
                  {result.mangalDoshaFemale ? t.mangalPresent : t.mangalNone}
                </p>
                {result.mangalDoshaFemale && (
                  <p className={cn("text-[10px] text-muted-foreground mt-1", isHi && "font-hindi")}>{t.mangalMarsPosition}</p>
                )}
              </div>
            </div>
            <div className={cn("rounded-lg border p-3",
              result.mangalDoshaCancelled ? "border-emerald-200 bg-emerald-50/60" :
              (result.mangalDoshaMale||result.mangalDoshaFemale) ? "border-amber-200 bg-amber-50/60" : "border-border bg-background/50")}>
              <p className={cn("text-xs text-foreground/80 leading-relaxed", isHi && "font-hindi")}>{result.mangalDoshaNote}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className={cn("text-sm font-bold text-foreground", isHi && "font-hindi")}>{t.navamsaTitle}</h3>
              <span className={cn("text-xs px-3 py-1 rounded-full font-bold border",
                result.d9Compatibility.score>=70 ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                result.d9Compatibility.score>=50 ? "bg-blue-100 text-blue-700 border-blue-200" :
                "bg-amber-100 text-amber-700 border-amber-200")}>
                {result.d9Compatibility.verdict} · {result.d9Compatibility.score}/100
              </span>
            </div>
            <div className="space-y-2">
              {result.d9Compatibility.details.map((d,i) => (
                <p key={i} className={cn("text-xs flex gap-2 leading-relaxed",
                  d.startsWith("✓")?"text-emerald-700":d.startsWith("⚠")?"text-amber-700":"text-muted-foreground", isHi && "font-hindi")}>
                  <span className="flex-shrink-0 mt-0.5">
                    {d.startsWith("✓")?"✓":d.startsWith("⚠")?"⚠":"→"}
                  </span>
                  <span>{d.replace(/^[✓⚠→]\s*/,"")}</span>
                </p>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {result.warnings.length > 0 && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <h3 className={cn("text-sm font-bold text-red-700 mb-3 flex items-center gap-1.5", isHi && "font-hindi")}>
                  <span>⚠</span> {t.warningsTitle}
                </h3>
                <ul className="space-y-2">
                  {result.warnings.map((w,i) => (
                    <li key={i} className={cn("text-xs text-red-700/90 flex gap-2 leading-relaxed", isHi && "font-hindi")}>
                      <span className="flex-shrink-0 mt-0.5">•</span><span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <h3 className={cn("text-sm font-bold text-emerald-700 mb-3 flex items-center gap-1.5", isHi && "font-hindi")}>
                <span>✓</span> {t.recommendationsTitle}
              </h3>
              <ul className="space-y-2">
                {result.recommendations.map((r,i) => (
                  <li key={i} className={cn("text-xs text-emerald-700/90 flex gap-2 leading-relaxed", isHi && "font-hindi")}>
                    <span className="flex-shrink-0 mt-0.5">•</span><span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <p className={cn("text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2", isHi && "font-hindi tracking-normal normal-case text-[11px]")}>
              {t.classicalRefTitle}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[10px] text-center">
              {[
                ["36",t.refPerfect],["28+",t.refVeryGood],["24+",t.refGood],
                ["18+",t.refAverage],["12+",t.refBelowAvg],["<12",t.refAvoid]
              ].map(([pts,lbl]) => (
                <div key={pts} className="rounded-lg bg-background border-border border p-2">
                  <p className="font-bold text-amber-600">{pts}</p>
                  <p className={cn("text-muted-foreground mt-0.5", isHi && "font-hindi")}>{lbl}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            aria-label={t.downloadPdf}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50
                       text-primary-foreground text-sm font-semibold transition-colors flex items-center justify-center gap-2
                       border border-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-sm">
            {pdfLoading
              ? <><span className="animate-spin inline-block">⚙</span> {t.generatingPdf}</>
              : <><span>📄</span> {t.downloadPdf}</>}
          </button>

          {muhurtaResult && muhurtaResult.auspiciousDates.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 mt-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <h3 className={cn("text-base font-bold text-amber-700 flex items-center gap-2", isHi && "font-hindi")}>
                  <span>📅</span> {t.muhurtaTitle}
                </h3>
                <Link to="/enhanced-muhurat" className={cn("text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-sm", isHi && "font-hindi")}>
                  {t.openFullMuhurta}
                </Link>
              </div>
              <p className={cn("text-xs text-muted-foreground mb-4", isHi && "font-hindi")}>
                {t.muhurtaSubtitle}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {muhurtaResult.auspiciousDates.slice(0, 3).map((day, idx) => (
                  <div key={idx} className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex flex-col items-center text-center shadow-sm">
                    <p className={cn("text-sm font-bold text-foreground mb-1", isHi && "font-hindi")}>{day.dateStr}</p>
                    <p className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold mb-2 border border-amber-200">
                      {t.muhurtaScore.replace("{s}", String(day.totalScore))}
                    </p>
                    <div className={cn("text-[10px] text-muted-foreground space-y-1", isHi && "font-hindi")}>
                      <p>{day.tithiName}</p>
                      <p>{day.nakshatraName} {t.nakshatraSuffix}</p>
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
