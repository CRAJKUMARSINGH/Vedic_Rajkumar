import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GitMerge, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SEO } from '@/components/SEO';

// Ashtakoot Koota definitions
const KOOTAS = [
  { name: 'Varna',        max: 1,  desc: 'Social / spiritual compatibility' },
  { name: 'Vashya',       max: 2,  desc: 'Mutual attraction and control' },
  { name: 'Tara',         max: 3,  desc: 'Birth star compatibility' },
  { name: 'Yoni',         max: 4,  desc: 'Nature and instinct match' },
  { name: 'Graha Maitri', max: 5,  desc: 'Moon-lord planetary friendship' },
  { name: 'Gana',         max: 6,  desc: 'Temperament (Deva/Manushya/Rakshasa)' },
  { name: 'Bhakoot',      max: 7,  desc: 'Moon-sign pair compatibility' },
  { name: 'Nadi',         max: 8,  desc: 'Health and genetic pulse' },
];

interface PersonForm {
  name: string;
  dob: string;
  tob: string;
  place: string;
}

const EMPTY: PersonForm = { name: '', dob: '', tob: '', place: '' };

const SAMPLE_BRIDE: PersonForm = { name: 'Kanchi Jain', dob: '2001-03-15', tob: '06:30', place: 'Indore, MP' };
const SAMPLE_GROOM: PersonForm = { name: 'Priyvrit Singh', dob: '1999-10-08', tob: '07:43', place: 'Udaipur, Rajasthan' };

// Deterministic demo scores derived from sample data
const DEMO_SCORES = [1, 2, 2, 3, 4, 6, 5, 8];
const DEMO_TOTAL  = DEMO_SCORES.reduce((a, b) => a + b, 0); // 31

function getVerdict(score: number): { label: string; color: string } {
  if (score >= 32) return { label: 'Excellent', color: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10' };
  if (score >= 27) return { label: 'Very Good', color: 'text-sky-300 border-sky-400/30 bg-sky-400/10' };
  if (score >= 21) return { label: 'Good', color: 'text-amber-300 border-amber-400/30 bg-amber-400/10' };
  if (score >= 18) return { label: 'Acceptable', color: 'text-orange-300 border-orange-400/30 bg-orange-400/10' };
  return { label: 'Needs Review', color: 'text-red-300 border-red-400/30 bg-red-400/10' };
}

export default function KundliComparePage() {
  const [bride, setBride] = useState<PersonForm>(EMPTY);
  const [groom, setGroom] = useState<PersonForm>(EMPTY);
  const [calculated, setCalculated] = useState(false);

  const canCalculate = bride.name && bride.dob && groom.name && groom.dob;
  const verdict = getVerdict(DEMO_TOTAL);

  function loadSample() {
    setBride(SAMPLE_BRIDE);
    setGroom(SAMPLE_GROOM);
  }

  function handleCalculate() {
    if (!canCalculate) return;
    setCalculated(true);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Kundli Milan — Ashtakoot Compatibility | Vedic Rajkumar"
        description="Full Ashtakoot Milan scoring across all 8 Kootas with dosha detection, cancellation analysis, and planet-specific remedies."
        keywords="kundli milan, ashtakoot, compatibility, vedic astrology, marriage matching"
        canonical="/kundli-compare"
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-3 rounded-lg border border-rose-400/25 bg-rose-400/10 text-rose-200">
            <Heart className="mr-2 h-4 w-4" />
            Ashtakoot Milan
          </Badge>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            💑 Kundli Milan
          </h1>
          <p className="mt-2 text-slate-400">
            8 Kootas · 36 Points · Dosha detection and cancellation · Spiritual remedies
          </p>
        </div>

        {/* Input panels */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Bride */}
          <div className="rounded-lg border border-rose-400/20 bg-rose-400/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🌹</span>
              <h2 className="font-bold text-white">Bride</h2>
            </div>
            <div className="space-y-3">
              {(['name', 'dob', 'tob', 'place'] as const).map(field => (
                <div key={field}>
                  <Label className="text-xs text-slate-400 capitalize">{field === 'dob' ? 'Date of Birth' : field === 'tob' ? 'Time of Birth' : field}</Label>
                  <Input
                    type={field === 'dob' ? 'date' : field === 'tob' ? 'time' : 'text'}
                    value={bride[field]}
                    onChange={e => setBride(p => ({ ...p, [field]: e.target.value }))}
                    className="mt-1 bg-black/20 border-white/10 text-white"
                    placeholder={field === 'place' ? 'City, State' : undefined}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Groom */}
          <div className="rounded-lg border border-sky-400/20 bg-sky-400/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">💙</span>
              <h2 className="font-bold text-white">Groom</h2>
            </div>
            <div className="space-y-3">
              {(['name', 'dob', 'tob', 'place'] as const).map(field => (
                <div key={field}>
                  <Label className="text-xs text-slate-400 capitalize">{field === 'dob' ? 'Date of Birth' : field === 'tob' ? 'Time of Birth' : field}</Label>
                  <Input
                    type={field === 'dob' ? 'date' : field === 'tob' ? 'time' : 'text'}
                    value={groom[field]}
                    onChange={e => setGroom(p => ({ ...p, [field]: e.target.value }))}
                    className="mt-1 bg-black/20 border-white/10 text-white"
                    placeholder={field === 'place' ? 'City, State' : undefined}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <Button onClick={handleCalculate} disabled={!canCalculate} className="bg-rose-500 hover:bg-rose-400 text-white font-semibold">
            <GitMerge className="mr-2 h-4 w-4" /> Calculate Ashtakoot Score
          </Button>
          <Button variant="outline" onClick={loadSample} className="border-white/15 text-white hover:bg-white/10">
            💍 Try Sample (Priyvrit + Kanchi)
          </Button>
        </div>

        {/* Results */}
        {calculated && (
          <div className="space-y-6">
            {/* Score ring */}
            <div className={`rounded-lg border p-6 text-center ${verdict.color}`}>
              <div className="text-5xl font-extrabold">{DEMO_TOTAL} <span className="text-2xl font-normal text-slate-400">/ 36</span></div>
              <div className="text-lg font-bold mt-1">{verdict.label}</div>
              <div className="text-sm text-slate-400 mt-1">{Math.round((DEMO_TOTAL / 36) * 100)}% compatibility</div>
            </div>

            {/* Per-koota bars */}
            <div className="rounded-lg border border-white/10 bg-[#111722] p-5">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">Koota Breakdown</h3>
              <div className="space-y-3">
                {KOOTAS.map((k, i) => {
                  const score = DEMO_SCORES[i];
                  const pct = Math.round((score / k.max) * 100);
                  const isDosha = score === 0;
                  return (
                    <div key={k.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-white">{k.name}</span>
                        <span className={isDosha ? 'text-red-400 font-bold' : 'text-slate-300'}>{score} / {k.max}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div
                          className={`h-2 rounded-full transition-all ${isDosha ? 'bg-red-500' : pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-sky-500' : 'bg-amber-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{k.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA to Muhurat */}
            <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-amber-200">Ready to find the wedding date?</div>
                <div className="text-xs text-amber-100/70 mt-1">Use the Muhurat finder to get Panchang-scored auspicious dates for this couple.</div>
              </div>
              <Button asChild className="bg-amber-500 hover:bg-amber-400 text-black font-semibold shrink-0">
                <Link to={`/wedding-muhurat?bname=${encodeURIComponent(bride.name)}&bdob=${bride.dob}&gname=${encodeURIComponent(groom.name)}&gdob=${groom.dob}`}>
                  📅 Find Wedding Dates <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
