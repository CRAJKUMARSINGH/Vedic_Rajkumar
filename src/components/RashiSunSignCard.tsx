/**
 * Rashi & Sun Sign Card Component
 * Displays Moon rashi, Sun sign (tropical & sidereal), and planetary dignities
 */

import { Sun, Moon, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlanetaryStrength } from '@/services/rashiService';

interface RashiSunSignCardProps {
  moonRashi: {
    rashi: number;
    rashiName: string;
    degrees: number;
    element: string;
    quality: string;
    lord: string;
    characteristics: string;
  };
  sunSign: {
    tropical: { rashi: number; rashiName: string; degrees: number };
    sidereal: { rashi: number; rashiName: string; degrees: number };
  };
  planetaryStrengths?: PlanetaryStrength[];
  lang?: 'en' | 'hi';
  className?: string;
}

export const RashiSunSignCard = ({
  moonRashi,
  sunSign,
  planetaryStrengths = [],
  lang = 'en',
  className
}: RashiSunSignCardProps) => {
  const isHi = lang === 'hi';

  const labels = {
    en: {
      title: 'Rashi & Sun Sign Analysis',
      moonRashi: 'Moon Rashi (Birth Sign)',
      sunSign: 'Sun Sign',
      tropical: 'Tropical (Western)',
      sidereal: 'Sidereal (Vedic)',
      element: 'Element',
      quality: 'Quality',
      lord: 'Lord',
      characteristics: 'Characteristics',
      planetaryStrengths: 'Planetary Dignities & Strengths',
      strength: 'Strength',
      dignity: 'Dignity',
      degrees: 'Degrees',
      comparison: 'Tropical vs Sidereal',
      comparisonNote: 'Western astrology uses Tropical zodiac, Vedic uses Sidereal zodiac',
    },
    hi: {
      title: 'राशि और सूर्य राशि विश्लेषण',
      moonRashi: 'चंद्र राशि (जन्म राशि)',
      sunSign: 'सूर्य राशि',
      tropical: 'उष्णकटिबंधीय (पश्चिमी)',
      sidereal: 'नाक्षत्रिक (वैदिक)',
      element: 'तत्व',
      quality: 'गुण',
      lord: 'स्वामी',
      characteristics: 'विशेषताएं',
      planetaryStrengths: 'ग्रह गरिमा और शक्ति',
      strength: 'शक्ति',
      dignity: 'गरिमा',
      degrees: 'अंश',
      comparison: 'उष्णकटिबंधीय बनाम नाक्षत्रिक',
      comparisonNote: 'पश्चिमी ज्योतिष उष्णकटिबंधीय राशि चक्र का उपयोग करता है, वैदिक नाक्षत्रिक का उपयोग करता है',
    }
  };

  const t = labels[lang];

  // Get dignity icon
  const getDignityIcon = (dignity: string) => {
    switch (dignity) {
      case 'Exalted':
      case 'Moolatrikona':
      case 'Own Sign':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'Debilitated':
      case 'Enemy Sign':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  // Get strength color
  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return 'bg-green-600';
    if (strength >= 60) return 'bg-blue-600';
    if (strength >= 40) return 'bg-yellow-600';
    if (strength >= 20) return 'bg-orange-600';
    return 'bg-red-600';
  };

  // Get dignity color
  const getDignityColor = (dignity: string) => {
    switch (dignity) {
      case 'Exalted':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'Moolatrikona':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Own Sign':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'Friend Sign':
        return 'text-teal-700 bg-teal-50 border-teal-200';
      case 'Neutral':
        return 'text-gray-700 bg-gray-50 border-gray-200';
      case 'Enemy Sign':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'Debilitated':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={cn('bg-card border border-border rounded-xl p-6 shadow-sm space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Star className="h-6 w-6 text-primary" />
        <h3 className={cn('text-xl font-bold', isHi && 'font-hindi')}>
          {t.title}
        </h3>
      </div>

      {/* Moon Rashi Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-blue-600" />
          <h4 className={cn('text-lg font-semibold', isHi && 'font-hindi')}>
            {t.moonRashi}
          </h4>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {moonRashi.rashiName}
            </span>
            <span className="text-sm text-muted-foreground">
              {moonRashi.degrees.toFixed(2)}°
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className={cn('text-muted-foreground', isHi && 'font-hindi')}>
                {t.element}:
              </span>
              <span className="ml-2 font-medium">{moonRashi.element}</span>
            </div>
            <div>
              <span className={cn('text-muted-foreground', isHi && 'font-hindi')}>
                {t.quality}:
              </span>
              <span className="ml-2 font-medium">{moonRashi.quality}</span>
            </div>
            <div className="col-span-2">
              <span className={cn('text-muted-foreground', isHi && 'font-hindi')}>
                {t.lord}:
              </span>
              <span className="ml-2 font-medium">{moonRashi.lord}</span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-border">
            <p className={cn('text-sm text-muted-foreground', isHi && 'font-hindi')}>
              {t.characteristics}:
            </p>
            <p className="text-sm mt-1">{moonRashi.characteristics}</p>
          </div>
        </div>
      </div>

      {/* Sun Sign Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-orange-600" />
          <h4 className={cn('text-lg font-semibold', isHi && 'font-hindi')}>
            {t.sunSign}
          </h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tropical Sun Sign */}
          <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className={cn('text-sm font-medium text-orange-700', isHi && 'font-hindi')}>
                {t.tropical}
              </span>
              <span className="text-xs text-orange-600">Western</span>
            </div>
            <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
              {sunSign.tropical.rashiName}
            </div>
            <div className="text-sm text-orange-700 mt-1">
              {sunSign.tropical.degrees.toFixed(2)}°
            </div>
          </div>

          {/* Sidereal Sun Sign */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className={cn('text-sm font-medium text-blue-700', isHi && 'font-hindi')}>
                {t.sidereal}
              </span>
              <span className="text-xs text-blue-600">Vedic</span>
            </div>
            <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
              {sunSign.sidereal.rashiName}
            </div>
            <div className="text-sm text-blue-700 mt-1">
              {sunSign.sidereal.degrees.toFixed(2)}°
            </div>
          </div>
        </div>

        {/* Comparison Note */}
        <div className="bg-muted/30 rounded-lg p-3">
          <p className={cn('text-xs text-muted-foreground', isHi && 'font-hindi')}>
            ℹ️ {t.comparisonNote}
          </p>
        </div>
      </div>

      {/* Planetary Strengths Section */}
      {planetaryStrengths.length > 0 && (
        <div className="space-y-3">
          <h4 className={cn('text-lg font-semibold', isHi && 'font-hindi')}>
            {t.planetaryStrengths}
          </h4>
          
          <div className="space-y-2">
            {planetaryStrengths.map((ps, index) => (
              <div
                key={index}
                className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getDignityIcon(ps.dignity)}
                    <span className="font-semibold">{ps.planet}</span>
                    <span className="text-sm text-muted-foreground">
                      in {ps.rashiName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {ps.degrees.toFixed(2)}°
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Dignity Badge */}
                  <span className={cn(
                    'text-xs px-2 py-1 rounded border font-medium',
                    getDignityColor(ps.dignity)
                  )}>
                    {ps.dignity}
                  </span>

                  {/* Strength Bar */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={cn('text-muted-foreground', isHi && 'font-hindi')}>
                        {t.strength}
                      </span>
                      <span className="font-medium">{ps.strength}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full transition-all', getStrengthColor(ps.strength))}
                        style={{ width: `${ps.strength}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground mt-2">
                  {isHi ? ps.description.hi : ps.description.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RashiSunSignCard;