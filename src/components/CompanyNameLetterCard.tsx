/**
 * Company Name Letter Suggestion Card
 * Suggests auspicious Hindi first letters for a Pvt Ltd company
 * Supports 1-5 partners, name-only or with birth details
 */

import { useState } from 'react';
import { Plus, Trash2, Sparkles, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { suggestCompanyLetters, type PartnerInput, type CompanyLetterResult } from '@/services/companyNameLetterService';

interface Props {
  lang: 'en' | 'hi';
}

const T = {
  en: {
    title: 'Company Name Letter Suggester',
    subtitle: 'Auspicious Hindi first letters for your Pvt Ltd',
    addPartner: 'Add Partner',
    partner: 'Partner',
    name: 'Full Name',
    namePlaceholder: 'e.g. Hitpal Singh',
    dob: 'Date of Birth (optional)',
    withBirth: 'With birth details',
    withoutBirth: 'Name only',
    calculate: 'Suggest Letters',
    combinedNumber: 'Combined Destiny Number',
    rulingPlanet: 'Ruling Planet',
    suggestedLetters: 'Suggested Hindi First Letters',
    strength: 'Strength',
    analysis: 'Analysis',
    tip: 'Auspicious Tip',
    partnerBreakdown: 'Partner Numbers',
    nameNum: 'Name No.',
    lifePath: 'Life Path',
    effective: 'Effective',
    remove: 'Remove',
    maxPartners: 'Maximum 5 partners allowed',
    minPartners: 'Add at least one partner name',
  },
  hi: {
    title: 'कंपनी नाम अक्षर सुझाव',
    subtitle: 'आपकी प्राइवेट लिमिटेड कंपनी के लिए शुभ हिंदी प्रथम अक्षर',
    addPartner: 'भागीदार जोड़ें',
    partner: 'भागीदार',
    name: 'पूरा नाम',
    namePlaceholder: 'जैसे हितपाल सिंह',
    dob: 'जन्म तिथि (वैकल्पिक)',
    withBirth: 'जन्म विवरण सहित',
    withoutBirth: 'केवल नाम',
    calculate: 'अक्षर सुझाएं',
    combinedNumber: 'संयुक्त भाग्यांक',
    rulingPlanet: 'शासक ग्रह',
    suggestedLetters: 'सुझाए गए हिंदी प्रथम अक्षर',
    strength: 'शक्ति',
    analysis: 'विश्लेषण',
    tip: 'शुभ सुझाव',
    partnerBreakdown: 'भागीदार अंक',
    nameNum: 'नाम अंक',
    lifePath: 'जीवन पथ',
    effective: 'प्रभावी',
    remove: 'हटाएं',
    maxPartners: 'अधिकतम 5 भागीदार',
    minPartners: 'कम से कम एक भागीदार का नाम दर्ज करें',
  },
};

const emptyPartner = (): PartnerInput => ({ name: '', dob: '' });

export default function CompanyNameLetterCard({ lang }: Props) {
  const t = T[lang];
  const isHi = lang === 'hi';

  const [partners, setPartners] = useState<PartnerInput[]>([emptyPartner(), emptyPartner()]);
  const [result, setResult] = useState<CompanyLetterResult | null>(null);
  const [error, setError] = useState('');

  const updatePartner = (i: number, field: keyof PartnerInput, value: string) => {
    setPartners(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
    setResult(null);
    setError('');
  };

  const addPartner = () => {
    if (partners.length >= 5) { setError(t.maxPartners); return; }
    setPartners(prev => [...prev, emptyPartner()]);
  };

  const removePartner = (i: number) => {
    setPartners(prev => prev.filter((_, idx) => idx !== i));
    setResult(null);
  };

  const calculate = () => {
    const valid = partners.filter(p => p.name.trim().length >= 2);
    if (!valid.length) { setError(t.minPartners); return; }
    setError('');
    try {
      setResult(suggestCompanyLetters(valid));
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 text-amber-800 dark:text-amber-300 ${isHi ? 'font-hindi' : ''}`}>
          <Sparkles className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>{t.subtitle}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Partner inputs */}
        {partners.map((p, i) => (
          <div key={i} className="bg-white/60 dark:bg-white/5 rounded-lg p-4 space-y-3 border border-amber-100 dark:border-amber-900">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold flex items-center gap-1 ${isHi ? 'font-hindi' : ''}`}>
                <User className="h-4 w-4" />
                {t.partner} {i + 1}
              </span>
              {partners.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removePartner(i)} className="h-7 text-red-500 hover:text-red-700">
                  <Trash2 className="h-3 w-3 mr-1" />{t.remove}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className={`text-xs ${isHi ? 'font-hindi' : ''}`}>{t.name} *</Label>
                <Input
                  value={p.name}
                  onChange={e => updatePartner(i, 'name', e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className={`text-xs ${isHi ? 'font-hindi' : ''}`}>{t.dob}</Label>
                <Input
                  type="date"
                  value={p.dob ?? ''}
                  onChange={e => updatePartner(i, 'dob', e.target.value)}
                  className="mt-1 h-8 text-sm"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add partner / error */}
        <div className="flex items-center gap-3">
          {partners.length < 5 && (
            <Button variant="outline" size="sm" onClick={addPartner} className="border-amber-300 text-amber-700 hover:bg-amber-50">
              <Plus className="h-4 w-4 mr-1" />{t.addPartner}
            </Button>
          )}
          {error && <p className={`text-xs text-red-500 ${isHi ? 'font-hindi' : ''}`}>{error}</p>}
        </div>

        {/* Calculate button */}
        <Button onClick={calculate} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
          <Sparkles className="h-4 w-4 mr-2" />
          <span className={isHi ? 'font-hindi' : ''}>{t.calculate}</span>
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-2">
            {/* Combined number + planet */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/40 rounded-lg px-4 py-2 text-center">
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>{t.combinedNumber}</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{result.combinedNumber}</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/40 rounded-lg px-4 py-2 text-center">
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>{t.rulingPlanet}</p>
                <p className={`text-lg font-bold text-orange-700 dark:text-orange-300 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? result.rulingPlanet.hi : result.rulingPlanet.en}
                </p>
              </div>
            </div>

            {/* Suggested letters */}
            <div>
              <p className={`text-sm font-semibold mb-2 ${isHi ? 'font-hindi' : ''}`}>{t.suggestedLetters}</p>
              <div className="flex gap-4 flex-wrap">
                {result.suggestedLetters.map((l, i) => (
                  <div key={i} className="bg-white dark:bg-white/10 border-2 border-amber-400 rounded-xl p-4 text-center min-w-[100px]">
                    <p className="text-4xl font-bold text-amber-700 dark:text-amber-300">{l.letter}</p>
                    <p className="text-xs text-muted-foreground mt-1">{l.romanized}</p>
                    <Badge className="mt-2 bg-amber-100 text-amber-800 text-xs">
                      {t.strength}: {l.strength}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis */}
            <div className="bg-white/70 dark:bg-white/5 rounded-lg p-3 border border-amber-100 dark:border-amber-900">
              <p className={`text-xs font-semibold text-amber-700 mb-1 ${isHi ? 'font-hindi' : ''}`}>{t.analysis}</p>
              <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? result.analysis.hi : result.analysis.en}
              </p>
            </div>

            {/* Tip */}
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-900">
              <p className={`text-xs font-semibold text-green-700 mb-1 ${isHi ? 'font-hindi' : ''}`}>💡 {t.tip}</p>
              <p className={`text-sm text-green-800 dark:text-green-300 ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? result.tip.hi : result.tip.en}
              </p>
            </div>

            {/* Partner breakdown */}
            <div>
              <p className={`text-xs font-semibold mb-2 ${isHi ? 'font-hindi' : ''}`}>{t.partnerBreakdown}</p>
              <div className="space-y-1">
                {result.partnerNumbers.map((pn, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-white/50 dark:bg-white/5 rounded px-3 py-1.5">
                    <span className="font-medium">{pn.name}</span>
                    <div className="flex gap-3 text-muted-foreground">
                      <span>{t.nameNum}: <strong>{pn.nameNumber}</strong></span>
                      {pn.lifePathNumber !== undefined && (
                        <span>{t.lifePath}: <strong>{pn.lifePathNumber}</strong></span>
                      )}
                      <span className="text-amber-700 dark:text-amber-400">{t.effective}: <strong>{pn.effectiveNumber}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
