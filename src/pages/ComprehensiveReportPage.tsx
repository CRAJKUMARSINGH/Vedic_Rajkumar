/**
 * ComprehensiveReportPage.tsx
 *
 * Week 7: Feature UI Scaffolding — Comprehensive Report page.
 *
 * Wraps ComprehensiveReportForm (the actual UI scaffolding) with
 * a lightweight page-level header (title + language toggle + SEO).
 * All the report layout, sections, actions and the standardised
 * shell footer are delegated to the form's embedded ReportShell.
 *
 * Route: /comprehensive
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { ComprehensiveReportForm } from '@/components/ComprehensiveReportForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { ValidationInProgressNotice } from '@/components/PrototypeStatusBanner';
import { cn } from '@/lib/utils';

export default function ComprehensiveReportPage() {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const isHi = lang === 'hi';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={isHi ? 'व्यापक ज्योतिष रिपोर्ट — वैदिक राजकुमार' : 'Comprehensive Astrology Report — Vedic Rajkumar'}
        description={
          isHi
            ? 'मांगलिक, साढ़े साती, काल सर्प, और करियर विश्लेषण — वैदिक ज्योतिष सिद्धांतों पर आधारित सभी प्रमुख रिपोर्ट एक ही स्थान पर।'
            : 'Manglik, Sade Sati, Kaal Sarp, and Career analysis — all major Vedic astrology reports in one place based on classical principles.'
        }
        canonical="/comprehensive"
      />

      {/* Page header — different from the report-document header inside the shell */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/" aria-label={isHi ? 'होम पर वापस' : 'Back to home'}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2.5 min-w-0">
              <Sparkles className="h-5 w-5 text-amber-500 shrink-0" aria-hidden />
              <div className="min-w-0">
                <h1 className={cn(
                  'text-base sm:text-lg font-bold text-foreground truncate',
                  isHi && 'font-hindi',
                )}>
                  {isHi ? 'व्यापक ज्योतिष रिपोर्ट' : 'Comprehensive Astrology Report'}
                </h1>
                <p className={cn(
                  'text-[11px] text-muted-foreground truncate leading-tight',
                  isHi && 'font-hindi',
                )}>
                  {isHi
                    ? 'मांगलिक · साढ़े साती · काल सर्प · करियर'
                    : 'Manglik · Sade Sati · Kaal Sarp · Career'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <EnhancedLanguageToggle
              currentLang={lang}
              onChange={setLang}
              showRegion={false}
              autoDetect={false}
            />
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-6 space-y-5">
        <ValidationInProgressNotice />
        <ComprehensiveReportForm isHindi={isHi} />
      </main>
    </div>
  );
}
