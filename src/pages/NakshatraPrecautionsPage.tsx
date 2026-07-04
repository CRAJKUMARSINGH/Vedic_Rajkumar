import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, AlertTriangle, Moon, Info, ArrowRight } from 'lucide-react';
import { getNakshatraInfo } from '@/services/nakshatraService';
import { getTaraBala, getNakshatraPrecautions } from '@/services/nakshatraPrecautionsService';

export default function NakshatraPrecautionsPage() {
  const [date, setDate] = useState('2004-09-08');
  const [time, setTime] = useState('01:05');
  const [lang, setLang] = useState<'en' | 'hi'>('hi');

  const isHi = lang === 'hi';

  const birthNakshatra = useMemo(() => {
    return getNakshatraInfo(date, time);
  }, [date, time]);

  // Current transit nakshatra (mock for May 2026)
  const currentNakshatraNum = 22; // Shravana
  
  const taraBala = useMemo(() => {
    return getTaraBala(birthNakshatra.number, currentNakshatraNum);
  }, [birthNakshatra, currentNakshatraNum]);

  const precautions = useMemo(() => {
    return getNakshatraPrecautions(birthNakshatra.number);
  }, [birthNakshatra]);

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-6 rounded-2xl border border-indigo-200">
        <div>
          <h1 className="text-3xl font-bold text-indigo-900 flex items-center gap-2">
            <Moon className="w-8 h-8 text-indigo-600" />
            {isHi ? 'नक्षत्र आधारित सावधानियां' : 'Nakshatra Precautions'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isHi ? 'आपके जन्म नक्षत्र के अनुसार क्या करें और क्या न करें' : 'Do\'s and Don\'ts based on your birth star and current transit'}
          </p>
        </div>
        <Button variant="outline" onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}>
          {isHi ? 'English' : 'हिंदी'}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">{isHi ? 'जन्म विवरण' : 'Birth Info'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">{isHi ? 'जन्म तिथि' : 'Date'}</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">{isHi ? 'जन्म समय' : 'Time'}</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="pt-4 border-t">
              <div className="text-xs text-muted-foreground mb-1">{isHi ? 'आपका जन्म नक्षत्र' : 'Your Birth Nakshatra'}</div>
              <div className="text-lg font-bold text-indigo-700">{isHi ? birthNakshatra.nameHi : birthNakshatra.nameEn}</div>
              <div className="text-xs text-muted-foreground">Lord: {birthNakshatra.lord} • Pada: {birthNakshatra.pada}</div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card className={taraBala.significance === 'Inauspicious' ? 'border-amber-200 bg-amber-50/30' : 'border-green-200 bg-green-50/30'}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {taraBala.significance === 'Inauspicious' ? <AlertTriangle className="text-amber-600" /> : <ShieldCheck className="text-green-600" />}
                    {isHi ? `आज की तारा: ${taraBala.taraHi}` : `Today's Tara: ${taraBala.tara}`}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {isHi ? taraBala.descriptionHi : taraBala.description}
                  </CardDescription>
                </div>
                <Badge className={taraBala.significance === 'Inauspicious' ? 'bg-amber-600' : 'bg-green-600'}>
                  {isHi ? (taraBala.significance === 'Inauspicious' ? 'अशुभ' : 'शुभ') : taraBala.significance}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                {isHi ? 'महत्वपूर्ण सावधानियां' : 'Key Precautions'}
              </h4>
              <div className="grid gap-3">
                {(isHi ? taraBala.precautionsHi : taraBala.precautions).map((p, i) => (
                  <div key={i} className="flex gap-3 items-start bg-background/50 p-3 rounded-lg border">
                    <ArrowRight className="w-4 h-4 mt-1 text-indigo-500 shrink-0" />
                    <span className="text-sm">{p}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{isHi ? 'नक्षत्र विशिष्ट सलाह' : 'Nakshatra Specific Advice'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {precautions.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed p-4 bg-muted rounded-xl border-l-4 border-indigo-500">
                    {p}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
