/**
 * Vimshottari Dasha Card Component
 * Displays Mahadasha / Antardasha / Pratyantardasha timeline
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  calculateVimshottariDasha,
  formatDashaDate,
  getDashaInterpretation,
  getPlanetSymbol,
  type DashaPeriod,
  type AntarDasha,
} from '@/services/dashaService';
import type { SupportedLanguage } from '@/services/multiLanguageService';

interface DashaCardProps {
  birthDate: string;
  birthTime: string;
  lang: SupportedLanguage;
}

const PLANET_COLORS: Record<string, string> = {
  Sun:     'bg-amber-100 border-amber-400 dark:bg-amber-950/30',
  Moon:    'bg-blue-100 border-blue-400 dark:bg-blue-950/30',
  Mars:    'bg-red-100 border-red-400 dark:bg-red-950/30',
  Mercury: 'bg-green-100 border-green-400 dark:bg-green-950/30',
  Jupiter: 'bg-yellow-100 border-yellow-400 dark:bg-yellow-950/30',
  Venus:   'bg-pink-100 border-pink-400 dark:bg-pink-950/30',
  Saturn:  'bg-slate-100 border-slate-400 dark:bg-slate-950/30',
  Rahu:    'bg-purple-100 border-purple-400 dark:bg-purple-950/30',
  Ketu:    'bg-orange-100 border-orange-400 dark:bg-orange-950/30',
};

const PLANET_BADGE: Record<string, string> = {
  Sun:     'bg-amber-500',
  Moon:    'bg-blue-500',
  Mars:    'bg-red-600',
  Mercury: 'bg-green-600',
  Jupiter: 'bg-yellow-500',
  Venus:   'bg-pink-500',
  Saturn:  'bg-slate-600',
  Rahu:    'bg-purple-600',
  Ketu:    'bg-orange-500',
};

const PLANET_HI: Record<string, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध',
  Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};

function planetName(planet: string, isHi: boolean) {
  return isHi ? (PLANET_HI[planet] || planet) : planet;
}

function AntarDashaRow({ antar, isHi, mahaActive }: { antar: AntarDasha; isHi: boolean; mahaActive: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`border rounded-md overflow-hidden ${antar.isActive ? 'border-primary' : 'border-border'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/40 transition-colors ${antar.isActive ? 'bg-primary/5' : ''}`}
      >
        <div className="flex items-center gap-2">
          <span>{getPlanetSymbol(antar.planet)}</span>
          <span className={isHi ? 'font-hindi' : ''}>
            {planetName(antar.planet, isHi)} {isHi ? 'अंतर्दशा' : 'Antardasha'}
          </span>
          {antar.isActive && (
            <Badge className="bg-primary text-primary-foreground text-xs px-1 py-0">
              {isHi ? 'सक्रिय' : 'Active'}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDashaDate(antar.startDate)} – {formatDashaDate(antar.endDate)}</span>
          {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 space-y-2 bg-muted/20">
          {/* Pratyantardashas */}
          {antar.pratyantardashas && antar.pratyantardashas.length > 0 ? (
            <div className="space-y-1">
              <p className={`text-xs font-semibold text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'प्रत्यंतर्दशा:' : 'Pratyantardashas:'}
              </p>
              {antar.pratyantardashas.map((p, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between text-xs px-2 py-1 rounded ${p.isActive ? 'bg-primary/10 font-semibold' : 'bg-muted/30'}`}
                >
                  <span className={isHi ? 'font-hindi' : ''}>
                    {getPlanetSymbol(p.planet)} {planetName(p.planet, isHi)}
                    {p.isActive && <span className="ml-1 text-primary">◀</span>}
                  </span>
                  <span className="text-muted-foreground">
                    {formatDashaDate(p.startDate)} – {formatDashaDate(p.endDate)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-xs text-muted-foreground italic ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'प्रत्यंतर्दशा केवल सक्रिय अंतर्दशा के लिए उपलब्ध है।' : 'Pratyantardashas available for active antardasha only.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function MahadashaRow({ maha, isHi }: { maha: DashaPeriod; isHi: boolean }) {
  const [open, setOpen] = useState(maha.isActive);
  const colorClass = PLANET_COLORS[maha.planet] || 'bg-muted border-border';
  const badgeClass = PLANET_BADGE[maha.planet] || 'bg-muted-foreground';
  const interp = getDashaInterpretation(maha.planet);

  return (
    <div className={`border-2 rounded-lg overflow-hidden ${colorClass} ${maha.isActive ? 'ring-2 ring-primary ring-offset-1' : ''}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{getPlanetSymbol(maha.planet)}</span>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>
                {planetName(maha.planet, isHi)} {isHi ? 'महादशा' : 'Mahadasha'}
              </span>
              {maha.isActive && (
                <Badge className={`${badgeClass} text-white text-xs`}>
                  {isHi ? 'वर्तमान' : 'Current'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDashaDate(maha.startDate)} – {formatDashaDate(maha.endDate)}
              {' '}({maha.durationYears.toFixed(1)} {isHi ? 'वर्ष' : 'yrs'})
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {/* Interpretation */}
          <p className={`text-sm leading-relaxed ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? interp.hi : interp.en}
          </p>

          {/* Antardashas */}
          <div className="space-y-1">
            <p className={`text-xs font-semibold text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'अंतर्दशाएं:' : 'Antardashas:'}
            </p>
            {maha.antardashas.map((antar, i) => (
              <AntarDashaRow key={i} antar={antar} isHi={isHi} mahaActive={maha.isActive} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const DashaCard = ({ birthDate, birthTime, lang }: DashaCardProps) => {
  const isHi = lang === 'hi';
  const [showAll, setShowAll] = useState(false);

  let dashaResult;
  try {
    dashaResult = calculateVimshottariDasha(birthDate, birthTime);
  } catch {
    return null;
  }

  const { mahadashas, currentMahadasha, currentAntardasha, currentPratyantardasha,
          moonNakshatraName, moonNakshatraLord, balanceYears } = dashaResult;

  // Show only past 1 + current + future 3 unless expanded
  const currentIdx = mahadashas.findIndex(m => m.isActive);
  const visibleStart = showAll ? 0 : Math.max(0, currentIdx - 1);
  const visibleEnd = showAll ? mahadashas.length : Math.min(mahadashas.length, currentIdx + 4);
  const visible = mahadashas.slice(visibleStart, visibleEnd);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
        <CardTitle className={`flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
          <span className="text-2xl">🪐</span>
          {isHi ? 'विंशोत्तरी दशा' : 'Vimshottari Dasha'}
        </CardTitle>
        <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
          {isHi
            ? 'वैदिक ज्योतिष की प्रमुख भविष्यवाणी प्रणाली • 120 वर्ष चक्र'
            : 'Primary predictive system in Vedic astrology • 120-year cycle'}
        </p>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {/* Birth Nakshatra Summary */}
        <div className="bg-muted/40 rounded-lg p-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'जन्म नक्षत्र' : 'Birth Nakshatra'}
            </p>
            <p className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>{moonNakshatraName}</p>
          </div>
          <div>
            <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'दशा स्वामी' : 'Dasha Lord'}
            </p>
            <p className="font-semibold">
              {getPlanetSymbol(moonNakshatraLord)} {planetName(moonNakshatraLord, isHi)}
            </p>
          </div>
          <div>
            <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'जन्म पर शेष दशा' : 'Balance at Birth'}
            </p>
            <p className="font-semibold">{balanceYears.toFixed(2)} {isHi ? 'वर्ष' : 'yrs'}</p>
          </div>
          {currentMahadasha && (
            <div>
              <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'वर्तमान महादशा' : 'Current Mahadasha'}
              </p>
              <p className="font-semibold">
                {getPlanetSymbol(currentMahadasha.planet)} {planetName(currentMahadasha.planet, isHi)}
              </p>
            </div>
          )}
        </div>

        {/* Current Period Summary */}
        {currentMahadasha && (
          <div className="border border-primary/30 rounded-lg p-3 bg-primary/5 space-y-1">
            <p className={`text-xs font-semibold text-primary ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? '▶ वर्तमान दशा काल' : '▶ Current Dasha Period'}
            </p>
            <p className={`text-sm ${isHi ? 'font-hindi' : ''}`}>
              <span className="font-semibold">{planetName(currentMahadasha.planet, isHi)} {isHi ? 'महादशा' : 'Mahadasha'}</span>
              {currentAntardasha && (
                <> / <span className="font-semibold">{planetName(currentAntardasha.planet, isHi)} {isHi ? 'अंतर्दशा' : 'Antardasha'}</span></>
              )}
              {currentPratyantardasha && (
                <> / <span className="font-semibold">{planetName(currentPratyantardasha.planet, isHi)} {isHi ? 'प्रत्यंतर्दशा' : 'Pratyantardasha'}</span></>
              )}
            </p>
            {currentAntardasha && (
              <p className="text-xs text-muted-foreground">
                {isHi ? 'अंतर्दशा समाप्ति:' : 'Antardasha ends:'} {formatDashaDate(currentAntardasha.endDate)}
              </p>
            )}
          </div>
        )}

        {/* Mahadasha Timeline */}
        <div className="space-y-2">
          <p className={`text-sm font-semibold ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'महादशा क्रम:' : 'Mahadasha Sequence:'}
          </p>
          {visible.map((maha, i) => (
            <MahadashaRow key={i} maha={maha} isHi={isHi} />
          ))}
        </div>

        {/* Show more / less */}
        {mahadashas.length > 5 && (
          <button
            onClick={() => setShowAll(s => !s)}
            className={`text-sm text-primary underline underline-offset-2 hover:text-primary/80 ${isHi ? 'font-hindi' : ''}`}
          >
            {showAll
              ? (isHi ? 'कम दिखाएं' : 'Show less')
              : (isHi ? `सभी ${mahadashas.length} महादशाएं दिखाएं` : `Show all ${mahadashas.length} mahadashas`)}
          </button>
        )}

        <p className={`text-xs text-muted-foreground italic ${isHi ? 'font-hindi' : ''}`}>
          {isHi
            ? '⚠️ दशा गणना चंद्रमा की नक्षत्र स्थिति पर आधारित है। सटीक परिणाम के लिए सही जन्म समय आवश्यक है।'
            : '⚠️ Dasha calculation is based on Moon\'s nakshatra position. Accurate birth time is essential for precise results.'}
        </p>
      </CardContent>
    </Card>
  );
};

export default DashaCard;
