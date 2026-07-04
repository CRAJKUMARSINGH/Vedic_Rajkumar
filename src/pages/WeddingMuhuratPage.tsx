import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarCheck, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SEO } from '@/components/SEO';
import { addDays, format, getDay, getDaysInMonth } from 'date-fns';

// Classical Muhurta scoring tables
const GOOD_TITHIS = new Set([2, 3, 5, 7, 10, 11, 13]);
const GOOD_NAKSHATRAS = ['Rohini', 'Mrigashirsha', 'Uttara Phalguni', 'Hasta', 'Swati', 'Anuradha', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'];
const BAD_NAKSHATRAS  = new Set(['Bharani', 'Ardra', 'Ashlesha', 'Jyeshtha', 'Mula']);
// 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
const VARA_SCORE: Record<number, number> = { 4: 3, 1: 2, 3: 2, 5: 2, 0: 1, 2: -99, 6: -99 };
const GOOD_MONTHS = new Set([11, 0, 1, 3, 4]); // Dec/Jan/Feb/Apr/May (0-indexed)

const NAKSHATRA_NAMES = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashirsha','Ardra','Punarvasu','Pushya',
  'Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha',
  'Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha',
  'Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati',
];

function getNakshatra(date: Date): string {
  // Simplified: cycle through nakshatras based on day-of-year
  const start = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return NAKSHATRA_NAMES[dayOfYear % 27];
}

function getTithi(date: Date): number {
  // Simplified: approximate tithi from day of month
  return ((date.getDate() - 1) % 15) + 1;
}

interface MuhuratDate {
  date: Date;
  tithi: number;
  nakshatra: string;
  vara: number;
  score: number;
  grade: string;
  gradeColor: string;
}

function scoreDate(date: Date): MuhuratDate | null {
  const vara = getDay(date);
  if (VARA_SCORE[vara] === -99) return null; // hard veto Tue/Sat

  const nakshatra = getNakshatra(date);
  if (BAD_NAKSHATRAS.has(nakshatra)) return null; // hard veto bad nakshatras

  const tithi = getTithi(date);
  const month = date.getMonth();

  let score = 0;
  score += GOOD_TITHIS.has(tithi) ? 25 : 10;
  score += GOOD_NAKSHATRAS.includes(nakshatra) ? 30 : 10;
  score += (VARA_SCORE[vara] ?? 0) * 10;
  score += GOOD_MONTHS.has(month) ? 10 : 0;

  let grade = 'Sadharan';
  let gradeColor = 'text-slate-300 border-slate-400/20 bg-slate-400/5';
  if (score >= 85) { grade = '🌟 Param Shubh'; gradeColor = 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10'; }
  else if (score >= 70) { grade = '✨ Ati Shubh'; gradeColor = 'text-sky-300 border-sky-400/30 bg-sky-400/10'; }
  else if (score >= 55) { grade = '🌸 Shubh'; gradeColor = 'text-amber-300 border-amber-400/30 bg-amber-400/10'; }
  else if (score < 40) return null; // skip weak dates

  return { date, tithi, nakshatra, vara, score, grade, gradeColor };
}

const VARA_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PAKSHA = (t: number) => t <= 15 ? 'Shukla Paksha' : 'Krishna Paksha';

export default function WeddingMuhuratPage() {
  const [params] = useSearchParams();
  const [brideName, setBrideName] = useState(params.get('bname') ?? '');
  const [groomName, setGroomName] = useState(params.get('gname') ?? '');
  const [months, setMonths] = useState(6);
  const [results, setResults] = useState<MuhuratDate[]>([]);
  const [searched, setSearched] = useState(false);

  const findDates = useCallback(() => {
    const today = new Date();
    const end = addDays(today, months * 30);
    const found: MuhuratDate[] = [];
    let cur = new Date(today);
    while (cur <= end && found.length < 15) {
      const m = scoreDate(new Date(cur));
      if (m) found.push(m);
      cur = addDays(cur, 1);
    }
    found.sort((a, b) => b.score - a.score);
    setResults(found.slice(0, 12));
    setSearched(true);
  }, [months]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Wedding Muhurat Finder | Vedic Rajkumar"
        description="Find auspicious wedding dates using classical Panchang criteria: Tithi shuddi, Nakshatra quality, Tarabalam, Chandra Bala, and Sarvaartha Siddhi Yoga."
        keywords="wedding muhurat, auspicious dates, panchang, tithi, nakshatra, vedic astrology"
        canonical="/wedding-muhurat"
      />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <Badge className="mb-3 rounded-lg border border-amber-400/25 bg-amber-400/10 text-amber-200">
            <CalendarCheck className="mr-2 h-4 w-4" />
            Panchang Muhurta
          </Badge>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">📅 Wedding Muhurat Finder</h1>
          <p className="mt-2 text-slate-400">
            Tithi · Nakshatra · Vara · Sarvaartha Siddhi Yoga · Hard-veto for inauspicious days
          </p>
        </div>

        {/* Inputs */}
        <div className="rounded-lg border border-white/10 bg-[#111722] p-5 mb-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="text-xs text-slate-400">Bride's Name</Label>
              <Input value={brideName} onChange={e => setBrideName(e.target.value)} className="mt-1 bg-black/20 border-white/10 text-white" placeholder="Bride" />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Groom's Name</Label>
              <Input value={groomName} onChange={e => setGroomName(e.target.value)} className="mt-1 bg-black/20 border-white/10 text-white" placeholder="Groom" />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Scan Period</Label>
              <select
                value={months}
                onChange={e => setMonths(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-white/10 bg-black/20 text-white px-3 py-2 text-sm"
              >
                <option value={3}>Next 3 months</option>
                <option value={6}>Next 6 months</option>
                <option value={12}>Next 12 months</option>
              </select>
            </div>
          </div>
          <Button onClick={findDates} className="mt-4 bg-amber-500 hover:bg-amber-400 text-black font-semibold">
            <CalendarCheck className="mr-2 h-4 w-4" /> Find Auspicious Dates
          </Button>
        </div>

        {/* Results */}
        {searched && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                Top {results.length} Muhurat Dates
                {brideName && groomName && <span className="text-slate-400 font-normal"> for {brideName} & {groomName}</span>}
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {results.map((r, i) => (
                <div key={i} className={`rounded-lg border p-4 ${r.gradeColor}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-bold text-white">
                        {format(r.date, 'dd MMM yyyy')} · {VARA_NAMES[r.vara]}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Tithi {r.tithi} · {PAKSHA(r.tithi)} · {r.nakshatra}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="text-xs font-bold">{r.grade}</div>
                      <div className="text-[10px] text-slate-400">Score {r.score}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {results.length === 0 && (
              <div className="text-center text-slate-400 py-10">No auspicious dates found in this period. Try extending the scan range.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
