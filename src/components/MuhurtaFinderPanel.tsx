import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Clock, Compass, ShieldAlert, Award, AlertCircle, HeartHandshake, CheckCircle2, Moon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface MuhurtaFinderPanelProps {
  isHi?: boolean;
  natalMoonRashi?: number; // 0-11
}

interface PanchangLimb {
  name: string;
  quality: 'auspicious' | 'neutral' | 'inauspicious';
  paksha?: 'Shukla' | 'Krishna';
  number?: number;
  day?: string;
  planet?: string;
}

interface MuhurtaWindow {
  date: string;
  startTime: string;
  endTime: string;
  panchang: {
    tithi: PanchangLimb;
    nakshatra: PanchangLimb;
    yoga: PanchangLimb;
    karana: PanchangLimb;
    vara: PanchangLimb;
  };
  ashtakavargaScore: number;
  suitability: string;
  score: number;
  description: {
    en: string;
    hi: string;
  };
}

export function MuhurtaFinderPanel({ isHi = false, natalMoonRashi = 3 }: MuhurtaFinderPanelProps) {
  const [intention, setIntention] = useState<string>('marriage');
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [windows, setWindows] = useState<MuhurtaWindow[]>([]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Call our API endpoint
      const response = await fetch('/api/vedic/muhurta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intention,
          targetDate,
          natalChart: { moonRashi: natalMoonRashi }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setWindows(data.windows || []);
      } else {
        // Fallback calculation directly in frontend if server is not fully reachable
        const fallbackWindows = calculateLocalMuhurta(intention, targetDate, natalMoonRashi);
        setWindows(fallbackWindows);
      }
    } catch (e) {
      const fallbackWindows = calculateLocalMuhurta(intention, targetDate, natalMoonRashi);
      setWindows(fallbackWindows);
    } finally {
      setLoading(false);
    }
  };

  // Local fallback calculation engine matching the backend logic
  const calculateLocalMuhurta = (intent: string, dateStr: string, natalMoon: number): MuhurtaWindow[] => {
    const baseDate = new Date(dateStr);
    const candidates: (MuhurtaWindow & { score: number })[] = [];
    
    const EPOCH_DATE = new Date('2026-03-09T00:00:00Z');
    const EPOCH_MOON = 240.03;
    const EPOCH_SUN = 324.35;

    const TITHI_NAMES = [
      'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 
      'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 
      'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
      'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 
      'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 
      'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya'
    ];

    const NAKSHATRAS = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 
      'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 
      'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 
      'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 
      'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 
      'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];

    const YOGAS = [
      'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 
      'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 
      'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 
      'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 
      'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 
      'Indra', 'Vaidhriti'
    ];

    const VARA_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const VARA_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    for (let i = 0; i < 30; i++) {
      const scanDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
      
      const diffTime = scanDate.getTime() - EPOCH_DATE.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      let sunLong = (EPOCH_SUN + 0.9856473 * diffDays) % 360;
      if (sunLong < 0) sunLong += 360;

      let moonLong = (EPOCH_MOON + 13.17639 * diffDays) % 360;
      if (moonLong < 0) moonLong += 360;

      const nakIndex = Math.floor(moonLong / 13.333333) % 27;
      const nakName = NAKSHATRAS[nakIndex];

      let diff = moonLong - sunLong;
      if (diff < 0) diff += 360;
      const tithiNum = Math.floor(diff / 12) + 1;
      const tithiName = TITHI_NAMES[(tithiNum - 1) % 30];
      const paksha = tithiNum <= 15 ? 'Shukla' : 'Krishna';

      let sum = (sunLong + moonLong) % 360;
      const yogaIndex = Math.floor(sum / 13.333333) % 27;
      const yogaName = YOGAS[yogaIndex];

      const karanaNum = Math.floor(diff / 6) + 1;
      let karanaName = '';
      if (karanaNum === 1) karanaName = 'Kimstughna';
      else if (karanaNum >= 58) karanaName = 'Naga';
      else if (karanaNum >= 56) karanaName = 'Chatushpada';
      else if (karanaNum >= 54) karanaName = 'Shakuni';
      else {
        const cycle = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti'];
        karanaName = cycle[(karanaNum - 2) % 7];
      }

      const varaNum = scanDate.getDay();
      const varaName = VARA_NAMES[varaNum];
      const varaPlanet = VARA_PLANETS[varaNum];

      const transitMoonRashi = Math.floor(moonLong / 30) % 12;
      let houseFromNatalMoon = (transitMoonRashi - natalMoon + 1);
      if (houseFromNatalMoon <= 0) houseFromNatalMoon += 12;

      const moonAV = [0, 6, 3, 5, 3, 5, 6, 3, 4, 5, 6, 7, 4];
      const ashtakavargaScore = (moonAV[houseFromNatalMoon] || 4) + 24;

      const panchang = {
        tithi: { name: tithiName, paksha, quality: [4, 9, 14, 30].includes(tithiNum) ? 'inauspicious' as const : 'auspicious' as const },
        nakshatra: { name: nakName, quality: [3, 4, 7, 11, 12, 16, 21, 22, 26].includes(nakIndex) ? 'auspicious' as const : 'neutral' as const },
        yoga: { name: yogaName, quality: [6, 9, 10, 13, 15, 17, 19, 27].includes(yogaIndex + 1) ? 'inauspicious' as const : 'auspicious' as const },
        karana: { name: karanaName, quality: karanaName === 'Vishti' ? 'inauspicious' : 'auspicious' },
        vara: { name: varaName, day: varaName, planet: varaPlanet, quality: 'auspicious' }
      };

      let score = 50;
      const favNakshatras: Record<string, number[]> = {
        marriage: [3, 4, 11, 12, 13, 16, 20, 25, 26],
        career: [0, 3, 7, 11, 12, 13, 16, 21, 22, 26],
        business: [0, 3, 7, 11, 12, 13, 16, 21, 22, 26],
        surgery: [0, 7, 5, 23],
        travel: [0, 4, 6, 7, 12, 16, 21, 22, 26]
      };

      if (favNakshatras[intent]?.includes(nakIndex)) score += 15;
      if ([4, 9, 14, 30].includes(tithiNum)) score -= 20;
      else score += 10;

      if (intent === 'marriage') {
        if ([1, 3, 4, 5].includes(varaNum)) score += 10;
        if ([2, 6].includes(varaNum)) score -= 15;
      } else if (['career', 'business'].includes(intent)) {
        if ([1, 3, 4, 5, 0].includes(varaNum)) score += 10;
      }

      const avDiff = ashtakavargaScore - 28;
      score += avDiff * 1.5;

      const finalScore = Math.max(10, Math.min(100, Math.round(score)));

      let descEn = '';
      let descHi = '';

      if (intent === 'marriage') {
        descEn = `Favorable window for marriage. Moon in ${nakName} and ${paksha} ${tithiName} ensures harmony and longevity.`;
        descHi = `विवाह के लिए अनुकूल समय। ${nakName} नक्षत्र और ${paksha} ${tithiName} में चंद्रमा सामंजस्य और दीर्घायु सुनिश्चित करता है।`;
      } else if (intent === 'career' || intent === 'business') {
        descEn = `Excellent for starting business/career. Benefic vara and high Ashtakavarga support (${ashtakavargaScore} bindus) promise success.`;
        descHi = `व्यापार या करियर शुरू करने के लिए उत्कृष्ट। शुभ वार और उच्च अष्टकवर्ग सहयोग (${ashtakavargaScore} बिंदु) सफलता का वादा करते हैं।`;
      } else {
        descEn = `Auspicious electional timing window with ${finalScore}% suitability index.`;
        descHi = `शुभ मुहूर्त समय खिड़की जिसकी उपयुक्तता सूचकांक ${finalScore}% है।`;
      }

      candidates.push({
        date: scanDate.toISOString().split('T')[0],
        startTime: "09:30 AM",
        endTime: "11:30 AM",
        panchang,
        ashtakavargaScore,
        suitability: finalScore >= 80 ? 'Highly Favorable' : finalScore >= 60 ? 'Favorable' : 'Neutral',
        score: finalScore,
        description: { en: descEn, hi: descHi }
      });
    }

    candidates.sort((a, b) => b.score - a.score);
    return candidates.slice(0, 5);
  };

  const getLimbBadgeColor = (quality: string) => {
    if (quality === 'auspicious') return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    if (quality === 'inauspicious') return 'bg-rose-50 text-rose-700 border-rose-300';
    return 'bg-slate-50 text-slate-700 border-slate-300';
  };

  return (
    <Card className="border-amber-300 shadow-xl overflow-hidden bg-gradient-to-b from-amber-50/10 to-orange-50/5">
      <CardHeader className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/20">
        <CardTitle className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-amber-700" />
          {isHi ? 'वैदिक मुहूर्त खोजक' : 'Vedic Muhurta Finder'}
        </CardTitle>
        <CardDescription className="text-slate-600">
          {isHi 
            ? 'अष्टकवर्ग और पंचांग शुद्धि के आधार पर सबसे शुभ समय खिड़कियां खोजें।' 
            : 'Find the most electionally auspicious date windows based on Ashtakavarga transit and Panchang validation.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-3 gap-6 mb-6 items-end">
          <div className="space-y-2">
            <Label className="text-amber-900 font-medium">
              {isHi ? 'प्रयोजन / संकल्प' : 'Intention / Purpose'}
            </Label>
            <Select value={intention} onValueChange={setIntention}>
              <SelectTrigger className="border-amber-300 focus:ring-amber-500 bg-white">
                <SelectValue placeholder={isHi ? 'प्रयोजन चुनें' : 'Select intention'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marriage">{isHi ? 'विवाह संस्कार (Marriage)' : 'Marriage (Sanskar)'}</SelectItem>
                <SelectItem value="career">{isHi ? 'व्यवसाय/करियर प्रारंभ (Career)' : 'Career/New Job'}</SelectItem>
                <SelectItem value="business">{isHi ? 'व्यापार शुभारंभ (Business)' : 'New Business Venture'}</SelectItem>
                <SelectItem value="surgery">{isHi ? 'शल्य चिकित्सा (Surgery)' : 'Surgery / Medical'}</SelectItem>
                <SelectItem value="travel">{isHi ? 'महायात्रा प्रस्थान (Travel)' : 'Long Distance Travel'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-amber-900 font-medium">
              {isHi ? 'प्रारंभ तिथि' : 'Target Start Date'}
            </Label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full flex h-10 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <Button 
            onClick={handleSearch} 
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold shadow-lg gold-glow"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                {isHi ? 'गणना की जा रही है...' : 'Calculating...'}
              </span>
            ) : (
              isHi ? 'शुभ मुहूर्त खोजें' : 'Find Auspicious Muhurtas'
            )}
          </Button>
        </div>

        {windows.length > 0 && (
          <div className="space-y-6 mt-6">
            <h3 className="text-lg font-bold text-amber-950 flex items-center gap-2 border-b pb-2 border-amber-200">
              <Award className="w-5 h-5 text-amber-700" />
              {isHi ? 'शीर्ष ५ शुभ मुहूर्त तिथियां' : 'Top 5 Auspicious Date Windows'}
            </h3>
            
            <div className="grid gap-4">
              {windows.map((win, idx) => (
                <Card key={idx} className="border-amber-200 shadow-sm overflow-hidden bg-white hover:border-amber-400 transition-all duration-300">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-amber-50/50 border-b border-amber-100">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                        {isHi ? `मुहूर्त विकल्प ${idx + 1}` : `Muhurta Option ${idx + 1}`}
                      </span>
                      <h4 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                        {new Date(win.date).toLocaleDateString(isHi ? 'hi-IN' : 'en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h4>
                    </div>

                    <div className="mt-2 md:mt-0 flex items-center gap-3">
                      <div className="text-right hidden md:block">
                        <span className="text-xs text-slate-500">{isHi ? 'अनुकूलता सूचकांक' : 'Suitability Index'}</span>
                        <p className="text-lg font-extrabold text-amber-700">{win.score}%</p>
                      </div>
                      <Badge className={
                        win.score >= 80 
                          ? 'bg-emerald-500 text-white font-bold' 
                          : win.score >= 60 
                            ? 'bg-amber-500 text-white font-bold' 
                            : 'bg-slate-500 text-white font-bold'
                      }>
                        {isHi ? win.suitability === 'Highly Favorable' ? 'अत्यंत शुभ' : 'शुभ' : win.suitability}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="pt-4 space-y-4">
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                      {isHi ? win.description.hi : win.description.en}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                      <div className="p-2 rounded border bg-slate-50/50">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">{isHi ? 'तिथि (Tithi)' : 'Tithi'}</span>
                        <Badge variant="outline" className={`mt-1 text-[11px] font-medium ${getLimbBadgeColor(win.panchang.tithi.quality)}`}>
                          {win.panchang.tithi.name} ({win.panchang.tithi.paksha === 'Shukla' ? (isHi ? 'शुक्ल' : 'Shukla') : (isHi ? 'कृष्ण' : 'Krishna')})
                        </Badge>
                      </div>
                      <div className="p-2 rounded border bg-slate-50/50">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">{isHi ? 'नक्षत्र (Nak)' : 'Nakshatra'}</span>
                        <Badge variant="outline" className={`mt-1 text-[11px] font-medium ${getLimbBadgeColor(win.panchang.nakshatra.quality)}`}>
                          {win.panchang.nakshatra.name}
                        </Badge>
                      </div>
                      <div className="p-2 rounded border bg-slate-50/50">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">{isHi ? 'योग (Yoga)' : 'Yoga'}</span>
                        <Badge variant="outline" className={`mt-1 text-[11px] font-medium ${getLimbBadgeColor(win.panchang.yoga.quality)}`}>
                          {win.panchang.yoga.name}
                        </Badge>
                      </div>
                      <div className="p-2 rounded border bg-slate-50/50">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">{isHi ? 'करण (Karana)' : 'Karana'}</span>
                        <Badge variant="outline" className={`mt-1 text-[11px] font-medium ${getLimbBadgeColor(win.panchang.karana.quality)}`}>
                          {win.panchang.karana.name}
                        </Badge>
                      </div>
                      <div className="p-2 rounded border bg-slate-50/50 col-span-2 md:col-span-1">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">{isHi ? 'वार (Vara)' : 'Vara'}</span>
                        <Badge variant="outline" className="mt-1 text-[11px] font-medium bg-amber-50 border-amber-300 text-amber-800">
                          {win.panchang.vara.day}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600 justify-between items-start md:items-center">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span><strong>{isHi ? 'अभिजीत / शुभ काल:' : 'Auspicious Hours:'}</strong> {win.startTime} - {win.endTime}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Moon className="w-4 h-4 text-indigo-500 animate-pulse" />
                        <span>
                          <strong>{isHi ? 'अष्टकवर्ग चंद्रमा बल:' : 'Ashtakavarga Bindus:'}</strong>{' '}
                          <span className="font-bold text-indigo-700">{win.ashtakavargaScore} points</span>{' '}
                          ({win.ashtakavargaScore >= 28 ? (isHi ? 'मजबूत' : 'Strong Transit Support') : (isHi ? 'मध्यम' : 'Moderate Support')})
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
