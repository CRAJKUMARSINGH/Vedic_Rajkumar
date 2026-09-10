/**
 * ReportShell.tsx
 *
 * Week 7: Feature UI Scaffolding — Standardized Report UI Shell.
 *
 * Reusable compound component for building consistent report pages
 * (Kundli, Matchmaking, Comprehensive, Dasha+Transit, etc.).
 *
 * Structure:
 *   <ReportShell>
 *     <ReportShell.Header
 *       reportId="R-2026-0907-001"
 *       generatedAt="2026-09-07T…"
 *       title="Kundli Report"
 *       titleHi="कुंडली रिपोर्ट"
 *       subtitle="Birth Chart Analysis"
 *       subtitleHi="जन्म कुंडली विश्लेषण"
 *       icon="🌟"
 *       lang="en"
 *     />
 *     <ReportShell.Metadata subject={native} />
 *     <ReportShell.Section heading="Planetary Positions" headingHi="ग्रह स्थिति">
 *       <PlanetTable … />
 *     </ReportShell.Section>
 *     <ReportShell.Actions
 *       onPrint={…}
 *       onShare={…}
 *       onExportPdf={…}
 *       onCopy={…}
 *     />
 *     <ReportShell.Footer engine="Lahiri · Swiss Ephemeris" />
 *   </ReportShell>
 *
 * All parts are individually usable so pages can opt-in as needed.
 */

import React, { useState } from 'react';
import {
  Printer,
  Share2,
  Download,
  Copy,
  Check,
  Info,
  ShieldAlert,
  FileText,
  Calendar,
  Clock,
  MapPin,
  User,
  Hash,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportSubject {
  name: string;
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
  birthTimezone?: string;
  latitude?: number;
  longitude?: number;
  relationship?: string;
  gender?: string;
  referenceId?: string;
}

export interface ReportShellHeaderProps {
  reportId: string;
  generatedAt: string; // ISO
  title: string;
  titleHi?: string;
  subtitle?: string;
  subtitleHi?: string;
  icon?: string;
  lang?: 'en' | 'hi';
  accentColor?: 'amber' | 'violet' | 'teal' | 'rose';
  className?: string;
}

export interface ReportShellMetadataProps {
  subject: ReportSubject;
  secondarySubject?: ReportSubject;
  lang?: 'en' | 'hi';
  className?: string;
  /** Secondary label (e.g. "Partner", "Bride", "Groom") */
  secondaryLabel?: string;
  secondaryLabelHi?: string;
}

export interface ReportShellSectionProps {
  heading: string;
  headingHi?: string;
  icon?: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
  className?: string;
  /** Optional description text under heading */
  description?: string;
  descriptionHi?: string;
  collapsible?: boolean;
}

export interface ReportShellActionsProps {
  onPrint?: () => void;
  onShare?: () => void;
  onExportPdf?: () => void | Promise<void>;
  onCopy?: () => void | Promise<void>;
  isExportingPdf?: boolean;
  isCopied?: boolean;
  lang?: 'en' | 'hi';
  className?: string;
  /** Extra custom actions to render */
  children?: React.ReactNode;
}

export interface ReportShellFooterProps {
  engine?: string;
  engineHi?: string;
  disclaimer?: string;
  disclaimerHi?: string;
  lang?: 'en' | 'hi';
  /** Quick links to related pages */
  links?: { href: string; label: string; labelHi?: string }[];
  className?: string;
  showValidationNotice?: boolean;
}

export interface ReportShellProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT_MAP: Record<NonNullable<ReportShellHeaderProps['accentColor']>, string> = {
  amber: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
  violet: 'text-violet-500 bg-violet-50 dark:bg-violet-950/30',
  teal: 'text-teal-500 bg-teal-50 dark:bg-teal-950/30',
  rose: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30',
};

const LABELS = {
  en: {
    subject: 'Subject',
    print: 'Print',
    share: 'Share',
    exportPdf: 'Export PDF',
    exportingPdf: 'Preparing PDF…',
    copy: 'Copy Summary',
    copied: 'Copied!',
    generated: 'Generated on',
    reference: 'Report ID',
    birthDetails: 'Birth Details',
    dateOfBirth: 'Date of Birth',
    timeOfBirth: 'Time of Birth',
    placeOfBirth: 'Place of Birth',
    timezone: 'Timezone',
    coordinates: 'Coordinates',
    name: 'Name',
    relationship: 'Relationship',
    poweredBy: 'Engine',
    disclaimer:
      'This report is generated for educational and informational purposes only based on classical Vedic astrology principles.',
    validationNote:
      'Calculation engine currently undergoing Swiss Ephemeris benchmarking — see validation dashboard.',
  },
  hi: {
    subject: 'विषय',
    print: 'प्रिंट',
    share: 'शेयर',
    exportPdf: 'PDF निर्यात',
    exportingPdf: 'PDF तैयार हो रहा है…',
    copy: 'सारांश कॉपी करें',
    copied: 'कॉपी हो गया!',
    generated: 'जेनरेट किया गया',
    reference: 'रिपोर्ट ID',
    birthDetails: 'जन्म विवरण',
    dateOfBirth: 'जन्म तिथि',
    timeOfBirth: 'जन्म समय',
    placeOfBirth: 'जन्म स्थान',
    timezone: 'टाइमज़ोन',
    coordinates: 'निर्देशांक',
    name: 'नाम',
    relationship: 'संबंध',
    poweredBy: 'इंजन',
    disclaimer:
      'यह रिपोर्ट शैक्षिक और सूचनात्मक उद्देश्यों के लिए ही पारंपरिक वैदिक ज्योतिष सिद्धांतों के आधार पर बनाई गई है।',
    validationNote:
      'गणना इंजन वर्तमान में स्विस एफ़ेमेरिस बेंचमार्किंग से गुजर रहा है — वैलिडेशन डैशबोर्ड देखें।',
  },
} as const;

// ─── Compound root shell ──────────────────────────────────────────────────────

const ReportShell: React.FC<ReportShellProps> & {
  Header: React.FC<ReportShellHeaderProps>;
  Metadata: React.FC<ReportShellMetadataProps>;
  Section: React.FC<ReportShellSectionProps>;
  Actions: React.FC<ReportShellActionsProps>;
  Footer: React.FC<ReportShellFooterProps>;
  SubjectCard: React.FC<{ subject: ReportSubject; label?: string; labelHi?: string; lang?: 'en' | 'hi' }>;
} = ({ children, className, maxWidth = '5xl' }) => {
  const widthClass: Record<string, string> = {
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  };
  return (
    <article
      className={cn(
        'min-h-screen bg-background text-foreground print:bg-white',
        className,
      )}
    >
      <div className={cn('container mx-auto px-4 py-8 space-y-6', widthClass[maxWidth])}>
        {children}
      </div>
    </article>
  );
};

// ─── Header ───────────────────────────────────────────────────────────────────

ReportShell.Header = function ReportShellHeader({
  reportId,
  generatedAt,
  title,
  titleHi,
  subtitle,
  subtitleHi,
  icon,
  lang = 'en',
  accentColor = 'amber',
  className,
}: ReportShellHeaderProps) {
  const isHi = lang === 'hi';
  const t = LABELS[lang];
  const genDate = new Date(generatedAt);
  const dateStr = isHi
    ? genDate.toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : genDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = genDate.toLocaleTimeString(isHi ? 'hi-IN' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header
      className={cn(
        'rounded-2xl border border-border bg-card p-6 shadow-sm print:shadow-none print:border-none print:p-0',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          {icon && (
            <div
              className={cn(
                'flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl',
                ACCENT_MAP[accentColor],
              )}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1
              className={cn(
                'text-2xl sm:text-3xl font-bold text-foreground tracking-tight',
                isHi && 'font-hindi',
              )}
            >
              {isHi && titleHi ? titleHi : title}
            </h1>
            {((isHi && subtitleHi) || subtitle) && (
              <p className={cn('mt-1 text-sm text-muted-foreground', isHi && 'font-hindi')}>
                {isHi && subtitleHi ? subtitleHi : subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col gap-1 text-right">
          <Badge
            variant="outline"
            className={cn('self-end gap-1.5 font-mono text-[11px] tracking-tight', isHi && 'font-hindi')}
          >
            <Hash className="h-3 w-3" aria-hidden="true" />
            {reportId}
          </Badge>
          <div
            className={cn(
              'flex items-center gap-1.5 text-xs text-muted-foreground justify-end',
              isHi && 'font-hindi',
            )}
          >
            <Calendar className="h-3 w-3" aria-hidden="true" />
            <span>{t.generated}:</span>
            <span className="font-medium text-foreground/80">{dateStr}</span>
          </div>
          <div
            className={cn(
              'flex items-center gap-1.5 text-xs text-muted-foreground justify-end',
              isHi && 'font-hindi',
            )}
          >
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>{timeStr}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// ─── SubjectCard (reusable inside Metadata) ───────────────────────────────────

ReportShell.SubjectCard = function SubjectCard({
  subject,
  label,
  labelHi,
  lang = 'en',
}: {
  subject: ReportSubject;
  label?: string;
  labelHi?: string;
  lang?: 'en' | 'hi';
}) {
  const isHi = lang === 'hi';
  const t = LABELS[lang];

  const items: { icon: React.ReactNode; label: string; value?: string }[] = [];
  if (subject.relationship) {
    items.push({ icon: <User className="h-3.5 w-3.5" />, label: t.relationship, value: subject.relationship });
  }
  items.push({ icon: <Calendar className="h-3.5 w-3.5" />, label: t.dateOfBirth, value: subject.birthDate });
  if (subject.birthTime) {
    items.push({ icon: <Clock className="h-3.5 w-3.5" />, label: t.timeOfBirth, value: subject.birthTime });
  }
  if (subject.birthPlace) {
    items.push({ icon: <MapPin className="h-3.5 w-3.5" />, label: t.placeOfBirth, value: subject.birthPlace });
  }
  if (subject.birthTimezone) {
    items.push({ icon: <Clock className="h-3.5 w-3.5" />, label: t.timezone, value: subject.birthTimezone });
  }
  if (typeof subject.latitude === 'number' && typeof subject.longitude === 'number') {
    items.push({
      icon: <MapPin className="h-3.5 w-3.5" />,
      label: t.coordinates,
      value: `${subject.latitude.toFixed(2)}°, ${subject.longitude.toFixed(2)}°`,
    });
  }

  return (
    <Card>
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className={cn('text-sm font-semibold flex items-center gap-2', isHi && 'font-hindi')}>
          <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {(isHi && labelHi) || label || t.subject}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 px-4">
        <div className={cn('text-base font-bold text-foreground mb-3', isHi && 'font-hindi')}>
          {subject.name}
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-xs text-muted-foreground min-w-0"
            >
              <span className="flex-shrink-0 text-muted-foreground/60" aria-hidden="true">{item.icon}</span>
              <dt className={cn('flex-shrink-0 opacity-80', isHi && 'font-hindi')}>{item.label}:</dt>
              <dd className={cn('truncate font-medium text-foreground/80', isHi && 'font-hindi')}>{item.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

ReportShell.Metadata = function ReportShellMetadata({
  subject,
  secondarySubject,
  lang = 'en',
  className,
  secondaryLabel,
  secondaryLabelHi,
}: ReportShellMetadataProps) {
  const isHi = lang === 'hi';
  const t = LABELS[lang];

  return (
    <section
      className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}
      aria-label={t.birthDetails}
    >
      <ReportShell.SubjectCard
        subject={subject}
        lang={lang}
        label={t.subject}
        labelHi={t.subject}
      />
      {secondarySubject && (
        <ReportShell.SubjectCard
          subject={secondarySubject}
          lang={lang}
          label={secondaryLabel || 'Partner'}
          labelHi={secondaryLabelHi || 'साथी'}
        />
      )}
    </section>
  );
};

// ─── Section ──────────────────────────────────────────────────────────────────

ReportShell.Section = function ReportShellSection({
  heading,
  headingHi,
  icon,
  badge,
  children,
  className,
  description,
  descriptionHi,
  collapsible = false,
}: ReportShellSectionProps) {
  const isHi = !!headingHi && !!descriptionHi;
  const [expanded, setExpanded] = useState(true);
  return (
    <section
      className={cn(
        'rounded-2xl border border-border bg-card shadow-sm overflow-hidden print:shadow-none print:break-inside-avoid',
        className,
      )}
    >
      <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <span className="flex-shrink-0 text-muted-foreground" aria-hidden="true">
                {icon}
              </span>
            )}
            <h2
              className={cn(
                'text-base sm:text-lg font-semibold text-foreground truncate',
                isHi && 'font-hindi',
              )}
            >
              {isHi ? headingHi : heading}
            </h2>
            {badge && (
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                {badge}
              </Badge>
            )}
          </div>
          {collapsible && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
              aria-label={expanded ? 'Collapse section' : 'Expand section'}
              className="h-8 w-8 p-0 rounded-full"
            >
              {expanded
                ? <ChevronUp className="h-4 w-4" aria-hidden="true" />
                : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
            </Button>
          )}
        </div>
        {((isHi && descriptionHi) || description) && (
          <p className={cn('mt-1 text-xs text-muted-foreground', isHi && 'font-hindi')}>
            {isHi ? descriptionHi : description}
          </p>
        )}
      </div>
      {(!collapsible || expanded) && (
        <div className="p-5">{children}</div>
      )}
    </section>
  );
};

// ─── Actions ──────────────────────────────────────────────────────────────────

ReportShell.Actions = function ReportShellActions({
  onPrint,
  onShare,
  onExportPdf,
  onCopy,
  isExportingPdf,
  isCopied,
  lang = 'en',
  className,
  children,
}: ReportShellActionsProps) {
  const t = LABELS[lang];
  const isHi = lang === 'hi';
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-muted/30 p-4 flex flex-wrap items-center gap-2',
        className,
      )}
      role="toolbar"
      aria-label="Report actions"
    >
      {onExportPdf && (
        <Button
          variant="default"
          size="sm"
          onClick={() => void onExportPdf()}
          disabled={isExportingPdf}
          aria-busy={!!isExportingPdf}
          className="gap-2"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span className={cn(isHi && 'font-hindi')}>
            {isExportingPdf ? t.exportingPdf : t.exportPdf}
          </span>
        </Button>
      )}
      {onPrint && (
        <Button variant="outline" size="sm" onClick={onPrint} className="gap-2">
          <Printer className="h-4 w-4" aria-hidden="true" />
          <span className={cn(isHi && 'font-hindi')}>{t.print}</span>
        </Button>
      )}
      {onShare && (
        <Button variant="outline" size="sm" onClick={onShare} className="gap-2">
          <Share2 className="h-4 w-4" aria-hidden="true" />
          <span className={cn(isHi && 'font-hindi')}>{t.share}</span>
        </Button>
      )}
      {onCopy && (
        <Button variant="outline" size="sm" onClick={() => void onCopy()} className="gap-2">
          {isCopied ? (
            <>
              <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
              <span className={cn('text-green-600 dark:text-green-400', isHi && 'font-hindi')}>
                {t.copied}
              </span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden="true" />
              <span className={cn(isHi && 'font-hindi')}>{t.copy}</span>
            </>
          )}
        </Button>
      )}
      {children && <Separator orientation="vertical" className="mx-1 h-6 hidden sm:block" />}
      {children}
    </div>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────────

ReportShell.Footer = function ReportShellFooter({
  engine,
  engineHi,
  disclaimer,
  disclaimerHi,
  lang = 'en',
  links,
  className,
  showValidationNotice = true,
}: ReportShellFooterProps) {
  const isHi = lang === 'hi';
  const t = LABELS[lang];
  return (
    <footer
      className={cn(
        'rounded-2xl border border-border bg-muted/30 p-5 space-y-4 text-sm print:shadow-none print:border-none print:bg-white print:px-0',
        className,
      )}
    >
      {showValidationNotice && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 px-3.5 py-2.5">
          <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className={cn('text-xs text-amber-800 dark:text-amber-300', isHi && 'font-hindi')}>
            {t.validationNote}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {engine && (
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className={cn('text-xs font-semibold text-foreground/80', isHi && 'font-hindi')}>
                {t.poweredBy}
              </p>
              <p className={cn('text-xs text-muted-foreground', isHi && 'font-hindi')}>
                {(isHi && engineHi) || engine}
              </p>
            </div>
          </div>
        )}
        <div className="flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className={cn('text-xs font-semibold text-foreground/80', isHi && 'font-hindi')}>
              <Info className="inline h-3 w-3 mr-1" aria-hidden="true" />
              Disclaimer
            </p>
            <p className={cn('text-xs text-muted-foreground', isHi && 'font-hindi')}>
              {(isHi && disclaimerHi) || disclaimer || t.disclaimer}
            </p>
          </div>
        </div>
      </div>

      {links && links.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={cn(
                  'text-xs text-primary underline underline-offset-2 hover:text-primary/80',
                  isHi && 'font-hindi',
                )}
              >
                {(isHi && l.labelHi) || l.label}
              </a>
            ))}
          </div>
        </>
      )}
    </footer>
  );
};

export default ReportShell;
