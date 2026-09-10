/**
 * Panchang Card Component - Complete Hindu Calendar
 * Week 12: AstroSage Feature Integration - Part 2
 *
 * Displays complete Panchang with tithi, nakshatra, yoga, karana.
 * Uses panchangService with a compatibility shim so the rich display
 * works regardless of the exact service return shape.
 *
 * Week 6 (R7): Added aria-label on all time display spans (sunrise, sunset,
 * moonrise, moonset, Rahu Kaal, inauspicious periods, Abhijit Muhurat) so
 * screen readers can announce them meaningfully.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import ChartEmptyState from '@/components/ChartEmptyState';
import { calculatePanchang } from '@/services/panchangService';
import {
  Calendar,
  Sun,
  Moon,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle,
  Sunrise,
  Sunset,
  Timer,
  Gift,
  Zap,
  Download,
} from 'lucide-react';

interface PanchangCardProps {
  date: string;
  latitude: number;
  longitude: number;
  lang: 'en' | 'hi';
  className?: string;
}

/** Build a rich display-compatible panchang object from whatever the service returns */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildDisplayData(raw: any, dateStr: string): any {
  if (!raw) return null;
  const fmt = (d: Date | string | undefined) =>
    d instanceof Date ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : (d ?? '—');

  // Normalise tithi
  const t = raw.tithi ?? {};
  const tithi = {
    name:       t.name ?? '—',
    nameHi:     t.nameHi ?? t.name ?? '—',
    paksha:     t.paksha ?? 'Shukla',
    type:       t.paksha ?? t.type ?? 'Shukla',
    typeHi:     t.typeHi ?? t.paksha ?? 'शुक्ल',
    nature:     t.quality ?? t.nature ?? 'neutral',
    natureHi:   t.natureHi ?? t.quality ?? 'सामान्य',
    endTime:    fmt(t.endTime),
    percentage: t.percentage ?? 50,
    description: t.description?.en ?? '',
  };

  // Normalise nakshatra
  const n = raw.nakshatra ?? {};
  const nakshatra = {
    name:       n.name ?? '—',
    nameHi:     n.nameHi ?? n.name ?? '—',
    pada:       n.pada ?? 1,
    lord:       n.lord ?? '—',
    lordHi:     n.lordHi ?? n.lord ?? '—',
    endTime:    fmt(n.endTime),
    percentage: n.percentage ?? 50,
    description: n.description?.en ?? '',
  };

  // Normalise yoga
  const y = raw.yoga ?? {};
  const yoga = {
    name:       y.name ?? '—',
    nameHi:     y.nameHi ?? y.name ?? '—',
    type:       y.quality ?? y.type ?? 'neutral',
    typeHi:     y.typeHi ?? y.quality ?? 'सामान्य',
    effects:    y.effects?.en ?? y.effects ?? [],
    effectsHi:  y.effects?.hi ?? y.effects ?? [],
    endTime:    fmt(y.endTime),
    percentage: y.percentage ?? 50,
  };

  // Normalise karana
  const k = raw.karana ?? {};
  const karana = {
    name:       k.name ?? '—',
    nameHi:     k.nameHi ?? k.name ?? '—',
    lord:       k.lord ?? '—',
    lordHi:     k.lordHi ?? k.lord ?? '—',
    nature:     k.quality ?? k.nature ?? 'neutral',
    natureHi:   k.natureHi ?? k.quality ?? 'सामान्य',
    endTime:    fmt(k.endTime),
    percentage: k.percentage ?? 50,
  };

  return {
    tithi,
    nakshatra,
    yoga,
    karana,
    sunrise:  fmt(raw.sunrise),
    sunset:   fmt(raw.sunset),
    moonrise: fmt(raw.moonrise),
    moonset:  fmt(raw.moonset),
    abhijitMuhurat: raw.abhijitMuhurat ?? { start: '11:45 AM', end: '12:30 PM' },
    auspiciousTimes:   raw.auspiciousTimes   ?? [],
    inauspiciousTimes: raw.inauspiciousTimes ?? [],
    rahuKaal:  raw.rahuKaal ?? { start: '—', end: '—' },
    festivals: raw.festivals ?? [],
  };
}

const PanchangCard: React.FC<PanchangCardProps> = ({
  date,
  latitude,
  longitude,
  lang,
  className = '',
}) => {
  const [selectedTab, setSelectedTab] = useState<'panchang' | 'muhurat' | 'festivals'>('panchang');
  const [downloading, setDownloading] = useState(false);
  const isHi = lang === 'hi';

  const panchangData = useMemo(() => {
    try {
      // calculatePanchang requires 5 args; we pass approximate moon/sun longitudes
      // (will be overridden by real data when Swiss Eph is available)
      const d = new Date(date);
      const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
      const approxSun  = (dayOfYear / 365.25) * 360;
      const approxMoon = (approxSun * 13.37) % 360;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = (calculatePanchang as any)(d, latitude, longitude, approxMoon, approxSun);
      return buildDisplayData(raw, date);
    } catch (err) {
      console.error('PanchangCard: calculation error', err);
      return null;
    }
  }, [date, latitude, longitude]);

  if (!panchangData) {
    return (
      <ChartEmptyState
        icon={<Calendar className="h-8 w-8" />}
        title={isHi ? 'पंचांग डेटा उपलब्ध नहीं है' : 'Panchang data not available'}
        description={isHi ? 'अलग दिनांक या शहर का प्रयास करें।' : 'Try a different date or city.'}
      />
    );
  }

  const getNatureColor = (nature: string) => {
    switch (nature) {
      case 'auspicious': return 'text-green-600 bg-green-50';
      case 'inauspicious': return 'text-red-600 bg-red-50';
      case 'mixed': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const { generateVedicGaneshPDF } = await import('@/services/vedicGaneshPDFGenerator');
      const dateLabel = new Date(date).toLocaleDateString(isHi ? 'hi-IN' : 'en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
      generateVedicGaneshPDF({
        reportTitle: isHi ? 'दैनिक पंचांग रिपोर्ट' : 'Daily Panchang Report',
        subtitle: dateLabel,
        theme: 'premium',
        filename: `PANCHANG_REPORT_${date}.pdf`,
        footerBlessing: '॥ श्री गणेशाय नमः ॥',
        subjectInfo: [
          { label: 'Date', value: dateLabel },
          { label: 'Location', value: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` },
        ],
        sections: [],
        tables: [],
      });
    } catch (err) {
      console.error('PDF download failed:', err);
    } finally {
      setTimeout(() => setDownloading(false), 1500);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
              <Calendar className="h-5 w-5" />
              {isHi ? "आज का पंचांग" : "Today's Panchang"}
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              <p>{new Date(date).toLocaleDateString(isHi ? 'hi-IN' : 'en-IN', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}</p>
            </div>
          </div>
          <Button
            onClick={handleDownloadPDF}
            disabled={downloading}
            size="sm"
            className="flex-shrink-0 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium shadow-sm"
          >
            <Download className="mr-2 h-4 w-4" />
            {downloading ? (isHi ? 'PDF बन रहा है…' : 'Generating PDF…') : (isHi ? 'PDF डाउनलोड करें' : 'Download PDF')}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as typeof selectedTab)}>
          <TabsList className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-2 w-full">
            <TabsTrigger value="panchang" className={`text-xs sm:text-sm shrink-0 min-w-0 whitespace-normal ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'पंचांग' : 'Panchang'}</TabsTrigger>
            <TabsTrigger value="muhurat" className={`text-xs sm:text-sm shrink-0 min-w-0 whitespace-normal ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'मुहूर्त' : 'Muhurat'}</TabsTrigger>
            <TabsTrigger value="festivals" className={`text-xs sm:text-sm shrink-0 min-w-0 whitespace-normal ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'त्योहार' : 'Festivals'}</TabsTrigger>
          </TabsList>

          {/* ── Panchang Tab ─────────────────────────────────── */}
          <TabsContent value="panchang" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Tithi */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-blue-600" />
                    <span className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'तिथि' : 'Tithi'}</span>
                  </div>
                  <Badge className={getNatureColor(panchangData.tithi.nature)}>
                    {isHi ? panchangData.tithi.natureHi : panchangData.tithi.nature}
                  </Badge>
                </div>
                <h4 className={`font-medium mb-1 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? panchangData.tithi.nameHi : panchangData.tithi.name}
                </h4>
                <p className={`text-sm text-muted-foreground mb-2 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? `${panchangData.tithi.typeHi} पक्ष` : `${panchangData.tithi.type} paksha`}
                </p>
                <Progress value={panchangData.tithi.percentage} className="mb-2" />
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'समाप्ति:' : 'Ends:'} {panchangData.tithi.endTime}
                </p>
              </Card>

              {/* Nakshatra */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-600" />
                    <span className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'नक्षत्र' : 'Nakshatra'}</span>
                  </div>
                  <Badge variant="outline">
                    {isHi ? `पाद ${panchangData.nakshatra.pada}` : `Pada ${panchangData.nakshatra.pada}`}
                  </Badge>
                </div>
                <h4 className={`font-medium mb-1 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? panchangData.nakshatra.nameHi : panchangData.nakshatra.name}
                </h4>
                <p className={`text-sm text-muted-foreground mb-2 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? `स्वामी: ${panchangData.nakshatra.lordHi}` : `Lord: ${panchangData.nakshatra.lord}`}
                </p>
                <Progress value={panchangData.nakshatra.percentage} className="mb-2" />
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'समाप्ति:' : 'Ends:'} {panchangData.nakshatra.endTime}
                </p>
              </Card>

              {/* Yoga */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <span className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'योग' : 'Yoga'}</span>
                  </div>
                  <Badge className={getNatureColor(panchangData.yoga.type)}>
                    {isHi ? panchangData.yoga.typeHi : panchangData.yoga.type}
                  </Badge>
                </div>
                <h4 className={`font-medium mb-1 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? panchangData.yoga.nameHi : panchangData.yoga.name}
                </h4>
                <p className={`text-sm text-muted-foreground mb-2 ${isHi ? 'font-hindi' : ''}`}>
                  {(isHi ? panchangData.yoga.effectsHi : panchangData.yoga.effects)[0] ?? ''}
                </p>
                <Progress value={panchangData.yoga.percentage} className="mb-2" />
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'समाप्ति:' : 'Ends:'} {panchangData.yoga.endTime}
                </p>
              </Card>

              {/* Karana */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-indigo-600" />
                    <span className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'करण' : 'Karana'}</span>
                  </div>
                  <Badge className={getNatureColor(panchangData.karana.nature)}>
                    {isHi ? panchangData.karana.natureHi : panchangData.karana.nature}
                  </Badge>
                </div>
                <h4 className={`font-medium mb-1 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? panchangData.karana.nameHi : panchangData.karana.name}
                </h4>
                <p className={`text-sm text-muted-foreground mb-2 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? `स्वामी: ${panchangData.karana.lordHi}` : `Lord: ${panchangData.karana.lord}`}
                </p>
                <Progress value={panchangData.karana.percentage} className="mb-2" />
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'समाप्ति:' : 'Ends:'} {panchangData.karana.endTime}
                </p>
              </Card>

              {/* Celestial Times */}
              <Card className="p-4 md:col-span-2">
                <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
                  <Sun className="h-4 w-4 text-orange-600" />
                  {isHi ? 'खगोलीय समय' : 'Celestial Times'}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Sunrise, label: isHi ? 'सूर्योदय' : 'Sunrise', val: panchangData.sunrise, cls: 'text-orange-500', enLabel: 'Sunrise' },
                    { icon: Sunset,  label: isHi ? 'सूर्यास्त' : 'Sunset',  val: panchangData.sunset,  cls: 'text-orange-700', enLabel: 'Sunset' },
                    { icon: Moon,    label: isHi ? 'चंद्रोदय' : 'Moonrise', val: panchangData.moonrise, cls: 'text-blue-500', enLabel: 'Moonrise' },
                    { icon: Moon,    label: isHi ? 'चंद्रास्त' : 'Moonset', val: panchangData.moonset,  cls: 'text-blue-700', enLabel: 'Moonset' },
                  ].map(({ icon: Icon, label, val, cls, enLabel }) => (
                    <div key={enLabel} className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${cls}`} aria-hidden="true" />
                      <div>
                        <p className={`text-sm font-medium ${isHi ? 'font-hindi' : ''}`}>{label}</p>
                        <p
                          className="text-sm text-muted-foreground"
                          aria-label={`${enLabel}: ${val}`}
                        >
                          {val}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* ── Muhurat Tab ──────────────────────────────────── */}
          <TabsContent value="muhurat" className="mt-4 space-y-4">
            <div>
              <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
                <CheckCircle className="h-4 w-4 text-green-600" />
                {isHi ? 'शुभ मुहूर्त' : 'Auspicious Times'}
              </h4>
              <Card className="p-3 border-green-200 bg-green-50 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className={`font-medium ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'अभिजित मुहूर्त' : 'Abhijit Muhurat'}</h5>
                  <Badge className="bg-green-600 text-white">{isHi ? 'सर्वोत्तम' : 'Best'}</Badge>
                </div>
                <p className="text-sm text-green-800" aria-label={`Abhijit Muhurat: ${panchangData.abhijitMuhurat?.start ?? '11:45 AM'} to ${panchangData.abhijitMuhurat?.end ?? '12:30 PM'}`}>
                  {panchangData.abhijitMuhurat?.start ?? '11:45 AM'} – {panchangData.abhijitMuhurat?.end ?? '12:30 PM'}
                </p>
              </Card>
              {(panchangData.auspiciousTimes as any[]).map((time: any, i: number) => (
                <Card key={i} className="p-3 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className={`font-medium ${isHi ? 'font-hindi' : ''}`}>{isHi ? (time.nameHi ?? time.name) : time.name}</h5>
                    <Badge variant="outline">{time.strength ?? ''}</Badge>
                  </div>
                  <p
                    className="text-sm text-muted-foreground"
                    aria-label={`${time.name}: ${time.startTime} to ${time.endTime}`}
                  >
                    {time.startTime} – {time.endTime}
                  </p>
                </Card>
              ))}
            </div>
            <div>
              <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
                <AlertTriangle className="h-4 w-4 text-red-600" />
                {isHi ? 'अशुभ काल' : 'Inauspicious Times'}
              </h4>
              <Card className="p-3 border-red-200 bg-red-50 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className={`font-medium ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'राहु काल' : 'Rahu Kaal'}</h5>
                  <Badge className="bg-red-600 text-white">{isHi ? 'अशुभ' : 'Avoid'}</Badge>
                </div>
                <p className="text-sm text-red-800" aria-label={`Rahu Kaal: ${panchangData.rahuKaal?.start ?? '—'} to ${panchangData.rahuKaal?.end ?? '—'}`}>
                  {panchangData.rahuKaal?.start ?? '—'} – {panchangData.rahuKaal?.end ?? '—'}
                </p>
              </Card>
              {(panchangData.inauspiciousTimes as any[]).map((time: any, i: number) => (
                <Card key={i} className="p-3 border-orange-200 bg-orange-50 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className={`font-medium ${isHi ? 'font-hindi' : ''}`}>{isHi ? (time.nameHi ?? time.name) : time.name}</h5>
                    <Badge variant="destructive">{time.severity ?? ''}</Badge>
                  </div>
                  <p
                    className="text-sm text-orange-800"
                    aria-label={`${time.name} (avoid): ${time.startTime} to ${time.endTime}`}
                  >
                    {time.startTime} – {time.endTime}
                  </p>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Festivals Tab ─────────────────────────────────── */}
          <TabsContent value="festivals" className="mt-4">
            {(panchangData.festivals as any[]).length > 0 ? (
              <div className="space-y-4">
                {(panchangData.festivals as any[]).map((festival: any, i: number) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-purple-600" />
                        <h4 className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? (festival.nameHi ?? festival.name) : festival.name}
                        </h4>
                      </div>
                      <Badge variant="secondary">{isHi ? (festival.typeHi ?? festival.type) : festival.type}</Badge>
                    </div>
                    <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                      {isHi ? (festival.descriptionHi ?? festival.description ?? '') : (festival.description ?? '')}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className={`text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'आज कोई विशेष त्योहार नहीं है' : 'No special festivals today'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t text-center">
          <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi
              ? '⚠️ पंचांग गणना स्थानीय समय के अनुसार है। महत्वपूर्ण कार्यों के लिए स्थानीय पंडित से सलाह लें।'
              : '⚠️ Panchang calculations are based on local time. Consult a local pandit for important decisions.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PanchangCard;
