/**
 * ReportPreviewPage.tsx
 *
 * Week 7: Feature UI Scaffolding — Report Shell Demo.
 *
 * Demonstrates the standardized ReportShell compound component
 * (ReportShell.tsx) with realistic Kundli + Matchmaking sample content.
 * This is a front-end-first prototype: content is static samples
 * so the shell can be iterated on independently of engine hardening.
 *
 * Route: /report-preview
 *
 * Sections demonstrated:
 *   1. ReportShell.Header   (branded report header with ID + timestamp)
 *   2. ReportShell.Metadata (subject / partner birth info cards)
 *   3. ReportShell.Section  (Kundli overview, planetary table, dosha checks)
 *   4. ReportShell.Actions  (Print / Share / Export PDF / Copy)
 *   5. ReportShell.Footer   (engine, disclaimer, validation notice, links)
 */

import React, { useState, useCallback } from 'react';
import { Star, Users, ShieldCheck, Activity, Heart, Link } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import ReportShell from '@/components/ReportShell';
import type { ReportSubject } from '@/components/ReportShell';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { ValidationInProgressNotice } from '@/components/PrototypeStatusBanner';
import { cn } from '@/lib/utils';

// ─── Sample data ──────────────────────────────────────────────────────────────

const SAMPLE_NATIVE: ReportSubject = {
  name: 'Rajkumar',
  birthDate: '1963-09-15',
  birthTime: '06:00',
  birthPlace: 'Aspur, Rajasthan',
  birthTimezone: 'Asia/Kolkata',
  latitude: 23.5,
  longitude: 74.32,
  relationship: 'Self',
  gender: 'Male',
  referenceId: 'N-0001',
};

const SAMPLE_PARTNER: ReportSubject = {
  name: 'Sample Partner',
  birthDate: '1965-05-20',
  birthTime: '14:30',
  birthPlace: 'Udaipur, Rajasthan',
  birthTimezone: 'Asia/Kolkata',
  latitude: 24.58,
  longitude: 73.68,
  relationship: 'Spouse',
  gender: 'Female',
  referenceId: 'N-0002',
};

const PLANET_ROWS = [
  { planet: 'Sun', sign: 'Leo', house: 12, nakshatra: 'Magha', retro: false },
  { planet: 'Moon', sign: 'Cancer', house: 11, nakshatra: 'Ashlesha', retro: false },
  { planet: 'Mars', sign: 'Aries', house: 5, nakshatra: 'Bharani', retro: false },
  { planet: 'Mercury', sign: 'Virgo', house: 2, nakshatra: 'Hasta', retro: true },
  { planet: 'Jupiter', sign: 'Pisces', house: 8, nakshatra: 'Uttara Bhadrapada', retro: false },
  { planet: 'Venus', sign: 'Libra', house: 3, nakshatra: 'Swati', retro: false },
  { planet: 'Saturn', sign: 'Aquarius', house: 7, nakshatra: 'Dhanishta', retro: true },
  { planet: 'Rahu', sign: 'Gemini', house: 10, nakshatra: 'Ardra', retro: false },
  { planet: 'Ketu', sign: 'Sagittarius', house: 4, nakshatra: 'Mula', retro: false },
];

const DOSHA_CHECKS = [
  { name: 'Manglik Dosha', present: false, severity: 'None', note: 'Mars not in 1/2/4/7/8/12 from Lagna or Moon' },
  { name: 'Kaal Sarp', present: true, severity: 'Mild', note: 'All planets between Rahu–Ketu axis; Ketu ahead' },
  { name: 'Nadi Dosha', present: false, severity: 'None', note: 'Different nakshatra nadis for couple' },
  { name: 'Grahan MahaPuncham', present: false, severity: 'None', note: 'No five-planet conjunction' },
];

const ASHTAKUTA_ROWS = [
  { factor: 'Varna', score: 1, outOf: 1 },
  { factor: 'Vasya', score: 2, outOf: 2 },
  { factor: 'Tara', score: 2, outOf: 3 },
  { factor: 'Yoni', score: 3, outOf: 4 },
  { factor: 'Graha Maitri', score: 4, outOf: 5 },
  { factor: 'Gana', score: 6, outOf: 6 },
  { factor: 'Bhakoot', score: 6, outOf: 7 },
  { factor: 'Nadi', score: 8, outOf: 8 },
];

const ENGINE_LINE =
  'Lahiri Ayanamsa · Meeus precision series · Whole-sign houses · Vimshottari 120-year cycle';
const ENGINE_LINE_HI =
  'लाहिरी अयनांश · मीयस परिशुद्धता श्रृंखला · संपूर्ण-चिह्न भाव · विम्शोत्तरी 120-वर्ष चक्र';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nowISO(): string {
  return new Date().toISOString();
}

function buildReportId(prefix: string): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${prefix}-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
    Math.floor(Math.random() * 1000),
  ).padStart(3, '0')}`;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ReportPreviewPage() {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [demo, setDemo] = useState<'kundli' | 'matchmaking'>('kundli');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const isHi = lang === 'hi';

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: isHi ? 'वैदिक रिपोर्ट' : 'Vedic Report',
      text: isHi ? 'शेयर की गई वैदिक ज्योतिष रिपोर्ट' : 'Shared Vedic astrology report',
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled — no-op
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [isHi]);

  const handleCopy = useCallback(async () => {
    const summary =
      `Vedic Astrology Report\n` +
      `Subject: ${SAMPLE_NATIVE.name}\n` +
      `DOB: ${SAMPLE_NATIVE.birthDate} ${SAMPLE_NATIVE.birthTime || ''}\n` +
      `Lagna: Leo · Moon: Cancer · Sun: Leo\n` +
      `Ashtakuta Total: 32/36\n` +
      `Generated by Vedic Rajkumar.`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable — no-op
    }
  }, []);

  const handleExportPdf = useCallback(async () => {
    setIsExporting(true);
    // Placeholder — real PDF export wired in later phases
    await new Promise((r) => setTimeout(r, 900));
    setIsExporting(false);
  }, []);

  // Localised text
  const T = {
    pageTitle: isHi ? 'रिपोर्ट शेल पूर्वावलोकन' : 'Report Shell Preview',
    pageDesc: isHi
      ? 'कुंडली और मैचमेकिंग रिपोर्ट के लिए मानकीकृत रिपोर्ट यूआई शेल का डेमो'
      : 'Demonstration of the standardized report UI shell for Kundli and Matchmaking reports.',
    kundliTab: isHi ? 'कुंडली रिपोर्ट' : 'Kundli Report',
    matchTab: isHi ? 'मैचमेकिंग रिपोर्ट' : 'Matchmaking Report',
    kundliTitle: 'Vedic Birth Chart Report',
    kundliTitleHi: 'वैदिक जन्म कुंडली रिपोर्ट',
    kundliSub: 'Comprehensive planetary positions, strengths & classical analysis',
    kundliSubHi: 'व्यापक ग्रह स्थिति, शक्तियाँ और शास्त्रीय विश्लेषण',
    matchTitle: 'Kundli Milan Report',
    matchTitleHi: 'कुंडली मिलान रिपोर्ट',
    matchSub: 'Ashtakuta compatibility analysis with 8-factor weighting (36 points)',
    matchSubHi: '8-कारक भार के साथ अष्टकूट अनुकूलता विश्लेषण (36 अंक)',
    planetsHeading: 'Planetary Positions',
    planetsHeadingHi: 'ग्रह स्थिति',
    planetsDesc: 'Natal positions in Rashi chart (D1) with nakshatra pada',
    planetsDescHi: 'नक्षत्र पद के साथ राशि चार्ट (D1) में जन्म स्थिति',
    doshaHeading: 'Dosha Analysis',
    doshaHeadingHi: 'दोष विश्लेषण',
    doshaDesc: 'Classical dosha checks with severity and classical notes',
    doshaDescHi: 'गंभीरता और शास्त्रीय टिप्पणियों के साथ शास्त्रीय दोष जाँच',
    ashtaHeading: 'Ashtakuta Compatibility Breakdown',
    ashtaHeadingHi: 'अष्टकूट अनुकूलता विवरण',
    ashtaDesc: '8 Vedic koota factors with traditional weightings',
    ashtaDescHi: 'पारंपरिक भार के साथ 8 वैदिक कूट कारक',
    severityLow: isHi ? 'कम' : 'Low',
    severityMild: isHi ? 'हल्का' : 'Mild',
    severityMod: isHi ? 'मध्यम' : 'Moderate',
    severityHigh: isHi ? 'उच्च' : 'High',
    severityNone: isHi ? 'कोई नहीं' : 'None',
    present: isHi ? 'मौजूद' : 'Present',
    absent: isHi ? 'अनुपस्थित' : 'Absent',
    colPlanet: isHi ? 'ग्रह' : 'Planet',
    colSign: isHi ? 'राशि' : 'Sign',
    colHouse: isHi ? 'भाव' : 'House',
    colNakshatra: isHi ? 'नक्षत्र' : 'Nakshatra',
    colRetro: isHi ? 'वक्री' : 'Retro',
    colDosha: isHi ? 'दोष' : 'Dosha',
    colPresent: isHi ? 'स्थिति' : 'Status',
    colSeverity: isHi ? 'गंभीरता' : 'Severity',
    colNote: isHi ? 'टिप्पणी' : 'Note',
    colFactor: isHi ? 'कारक' : 'Factor',
    colScore: isHi ? 'अंक' : 'Score',
    total: isHi ? 'कुल' : 'Total',
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Report Shell Preview — Vedic Rajkumar"
        description={T.pageDesc}
        canonical="/report-preview"
      />

      {/* Sticky page chrome (not printed) */}
      <header className="border-b border-border bg-card/90 backdrop-blur sticky top-0 z-20 print:hidden">
        <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">📄</span>
            <div>
              <h1 className={cn('text-lg font-bold', isHi && 'font-hindi')}>
                {T.pageTitle}
              </h1>
              <p className={cn('text-xs text-muted-foreground', isHi && 'font-hindi')}>
                Week 7 · Scaffold Demo
              </p>
            </div>
          </div>
          <EnhancedLanguageToggle
            currentLang={lang}
            onChange={setLang}
            showRegion={false}
            autoDetect={false}
          />
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6 print:px-0 print:py-0">
        <div className="print:hidden">
          <ValidationInProgressNotice />
        </div>

        {/* Demo picker (not printed) */}
        <div className="print:hidden">
          <Tabs defaultValue="kundli" value={demo} onValueChange={(v) => setDemo(v as any)}>
            <TabsList>
              <TabsTrigger value="kundli" className="gap-2">
                <Star className="h-4 w-4 text-amber-500" aria-hidden="true" />
                {T.kundliTab}
              </TabsTrigger>
              <TabsTrigger value="matchmaking" className="gap-2">
                <Heart className="h-4 w-4 text-rose-500" aria-hidden="true" />
                {T.matchTab}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs value={demo} defaultValue="kundli" className="w-full">
          {/* ─────────── Kundli demo ─────────── */}
          <TabsContent value="kundli" className="mt-0">
            <ReportShell maxWidth="5xl">
              <ReportShell.Header
                reportId={buildReportId('K')}
                generatedAt={nowISO()}
                title={T.kundliTitle}
                titleHi={T.kundliTitleHi}
                subtitle={T.kundliSub}
                subtitleHi={T.kundliSubHi}
                icon="🌟"
                lang={isHi ? 'hi' : 'en'}
                accentColor="amber"
              />

              <ReportShell.Metadata
                subject={SAMPLE_NATIVE}
                lang={isHi ? 'hi' : 'en'}
              />

              <ReportShell.Actions
                onPrint={handlePrint}
                onShare={handleShare}
                onExportPdf={handleExportPdf}
                onCopy={handleCopy}
                isExportingPdf={isExporting}
                isCopied={copied}
                lang={isHi ? 'hi' : 'en'}
              />

              <ReportShell.Section
                heading={T.planetsHeading}
                headingHi={T.planetsHeadingHi}
                description={T.planetsDesc}
                descriptionHi={T.planetsDescHi}
                icon={<Activity className="h-4 w-4" />}
                badge="D1 Rashi"
              >
                <div className="overflow-x-auto -mx-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 text-left">
                        <th className="px-5 py-2.5 font-semibold">{T.colPlanet}</th>
                        <th className="px-5 py-2.5 font-semibold">{T.colSign}</th>
                        <th className="px-5 py-2.5 font-semibold text-center">{T.colHouse}</th>
                        <th className="px-5 py-2.5 font-semibold hidden sm:table-cell">
                          {T.colNakshatra}
                        </th>
                        <th className="px-5 py-2.5 font-semibold text-center">{T.colRetro}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PLANET_ROWS.map((p) => (
                        <tr
                          key={p.planet}
                          className="border-t border-border/60 hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-5 py-2.5 font-medium text-amber-700 dark:text-amber-400">
                            {p.planet}
                          </td>
                          <td className="px-5 py-2.5">{p.sign}</td>
                          <td className="px-5 py-2.5 text-center">
                            <Badge variant="outline" className="font-mono text-[11px]">
                              H{p.house}
                            </Badge>
                          </td>
                          <td className="px-5 py-2.5 text-muted-foreground hidden sm:table-cell">
                            {p.nakshatra}
                          </td>
                          <td className="px-5 py-2.5 text-center">
                            {p.retro ? (
                              <Badge variant="destructive" className="text-[10px]">
                                Rx
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground/40">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ReportShell.Section>

              <ReportShell.Section
                heading={T.doshaHeading}
                headingHi={T.doshaHeadingHi}
                description={T.doshaDesc}
                descriptionHi={T.doshaDescHi}
                icon={<ShieldCheck className="h-4 w-4" />}
                badge="Classical"
              >
                <div className="overflow-x-auto -mx-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 text-left">
                        <th className="px-5 py-2.5 font-semibold">{T.colDosha}</th>
                        <th className="px-5 py-2.5 font-semibold text-center">{T.colPresent}</th>
                        <th className="px-5 py-2.5 font-semibold text-center">{T.colSeverity}</th>
                        <th className="px-5 py-2.5 font-semibold">{T.colNote}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DOSHA_CHECKS.map((d) => (
                        <tr
                          key={d.name}
                          className="border-t border-border/60 hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-5 py-2.5 font-medium">{d.name}</td>
                          <td className="px-5 py-2.5 text-center">
                            {d.present ? (
                              <Badge variant="destructive" className="text-[10px]">
                                {T.present}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px]">
                                {T.absent}
                              </Badge>
                            )}
                          </td>
                          <td className="px-5 py-2.5 text-center">
                            <Badge
                              variant={
                                d.severity === 'None'
                                  ? 'outline'
                                  : d.severity === 'Mild'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                              className="text-[10px]"
                            >
                              {d.severity === 'None'
                                ? T.severityNone
                                : d.severity === 'Mild'
                                ? T.severityMild
                                : d.severity === 'Moderate'
                                ? T.severityMod
                                : T.severityHigh}
                            </Badge>
                          </td>
                          <td
                            className={cn(
                              'px-5 py-2.5 text-muted-foreground text-xs',
                              isHi && 'font-hindi',
                            )}
                          >
                            {d.note}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ReportShell.Section>

              <ReportShell.Footer
                engine={ENGINE_LINE}
                engineHi={ENGINE_LINE_HI}
                lang={isHi ? 'hi' : 'en'}
                links={[
                  { href: '/horoscope', label: 'Kundli Page', labelHi: 'कुंडली पेज' },
                  { href: '/ashtakavarga', label: 'Ashtakavarga', labelHi: 'अष्टकवर्ग' },
                  { href: '/comprehensive', label: 'Comprehensive Report', labelHi: 'व्यापक रिपोर्ट' },
                  { href: '/matchmaking', label: 'Kundli Milan', labelHi: 'कुंडली मिलान' },
                  { href: '/dasha-transit', label: 'Dasha + Transit', labelHi: 'दशा + गोचर' },
                  { href: '/accuracy', label: 'Validation Dashboard', labelHi: 'वैलिडेशन डैशबोर्ड' },
                ]}
              />
            </ReportShell>
          </TabsContent>

          {/* ─────────── Matchmaking demo ─────────── */}
          <TabsContent value="matchmaking" className="mt-0">
            <ReportShell maxWidth="5xl">
              <ReportShell.Header
                reportId={buildReportId('M')}
                generatedAt={nowISO()}
                title={T.matchTitle}
                titleHi={T.matchTitleHi}
                subtitle={T.matchSub}
                subtitleHi={T.matchSubHi}
                icon="💞"
                lang={isHi ? 'hi' : 'en'}
                accentColor="rose"
              />

              <ReportShell.Metadata
                subject={SAMPLE_NATIVE}
                secondarySubject={SAMPLE_PARTNER}
                secondaryLabel="Male"
                secondaryLabelHi="पुरुष"
                lang={isHi ? 'hi' : 'en'}
              />

              <ReportShell.Actions
                onPrint={handlePrint}
                onShare={handleShare}
                onExportPdf={handleExportPdf}
                onCopy={handleCopy}
                isExportingPdf={isExporting}
                isCopied={copied}
                lang={isHi ? 'hi' : 'en'}
              >
                <Badge variant="secondary" className="ml-auto gap-1.5 text-[11px]">
                  <Link className="h-3 w-3" aria-hidden="true" />
                  Shareable
                </Badge>
              </ReportShell.Actions>

              {/* Overall score banner */}
              <div
                className={cn(
                  'rounded-2xl border-2 p-6 flex flex-wrap items-center justify-between gap-4',
                  'border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800',
                )}
              >
                <div className="flex items-center gap-4">
                  <Users className="h-10 w-10 text-green-600 dark:text-green-400" aria-hidden="true" />
                  <div>
                    <p className={cn('text-sm text-green-700 dark:text-green-300', isHi && 'font-hindi')}>
                      {isHi ? 'कुल अष्टकूट स्कोर' : 'Overall Ashtakuta Score'}
                    </p>
                    <p className="text-3xl font-black text-green-800 dark:text-green-200">
                      32 <span className="text-xl font-medium text-green-600">/ 36</span>
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-700 dark:bg-green-600 text-white text-sm px-3 py-1">
                  {isHi ? 'उत्तम अनुकूलता' : 'Excellent Compatibility'}
                </Badge>
              </div>

              <ReportShell.Section
                heading={T.ashtaHeading}
                headingHi={T.ashtaHeadingHi}
                description={T.ashtaDesc}
                descriptionHi={T.ashtaDescHi}
                icon={<Heart className="h-4 w-4" />}
                badge="8-Factor"
              >
                <div className="overflow-x-auto -mx-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 text-left">
                        <th className="px-5 py-2.5 font-semibold">{T.colFactor}</th>
                        <th className="px-5 py-2.5 font-semibold text-right">{T.colScore}</th>
                        <th className="px-5 py-2.5 font-semibold">Bar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ...ASHTAKUTA_ROWS,
                        {
                          factor: T.total,
                          score: ASHTAKUTA_ROWS.reduce((a, r) => a + r.score, 0),
                          outOf: 36,
                        },
                      ].map((r, i) => {
                        const isTotal = i === ASHTAKUTA_ROWS.length;
                        const pct = Math.round((r.score / r.outOf) * 100);
                        return (
                          <tr
                            key={r.factor}
                            className={cn(
                              'border-t border-border/60 hover:bg-muted/20 transition-colors',
                              isTotal && 'bg-muted/30 font-bold',
                            )}
                          >
                            <td className={cn('px-5 py-2.5', isHi && 'font-hindi')}>{r.factor}</td>
                            <td className="px-5 py-2.5 text-right font-mono">
                              {r.score}
                              <span className="text-muted-foreground/60"> / {r.outOf}</span>
                            </td>
                            <td className="px-5 py-2.5 w-48">
                              <div
                                className="w-full bg-muted rounded-full h-2"
                                role="progressbar"
                                aria-valuenow={pct}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              >
                                <div
                                  className={cn(
                                    'h-2 rounded-full transition-all',
                                    pct >= 85
                                      ? 'bg-green-500'
                                      : pct >= 65
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500',
                                  )}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </ReportShell.Section>

              <ReportShell.Footer
                engine={ENGINE_LINE}
                engineHi={ENGINE_LINE_HI}
                lang={isHi ? 'hi' : 'en'}
                links={[
                  { href: '/matchmaking', label: 'Matchmaking Page', labelHi: 'मिलान पेज' },
                  {
                    href: '/prospect-comparison',
                    label: 'Compare Prospects',
                    labelHi: 'प्रस्पेक्ट तुलना',
                  },
                  {
                    href: '/vedic-marriage',
                    label: 'Marriage Analysis',
                    labelHi: 'विवाह विश्लेषण',
                  },
                  { href: '/comprehensive', label: 'Comprehensive Report', labelHi: 'व्यापक रिपोर्ट' },
                  { href: '/enhanced-matchmaking', label: 'Enhanced Milan', labelHi: 'उन्नत मिलान' },
                  { href: '/dasha-transit', label: 'Dasha + Transit', labelHi: 'दशा + गोचर' },
                ]}
              />
            </ReportShell>
          </TabsContent>
        </Tabs>

        <p className={cn('text-center text-xs text-muted-foreground pb-4 print:hidden', isHi && 'font-hindi')}>
          {isHi
            ? '📌 यह पृष्ठ शास्त्रीय रिपोर्टों के लिए स्कैफ़ोल्ड शेल को प्रदर्शित करता है। रीयल-टाइम इंजन डेटा बाद के चरण में जोड़ा जाएगा।'
            : '📌 This page demonstrates the scaffold shell for classical reports. Real-time engine data will be connected in a later phase.'}
        </p>
      </main>
    </div>
  );
}
