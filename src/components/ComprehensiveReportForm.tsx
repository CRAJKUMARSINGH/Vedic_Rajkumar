/**
 * ComprehensiveReportForm.tsx
 *
 * Week 7: Feature UI Scaffolding — Comprehensive Report Shell.
 *
 * Generates Manglik / Sade Sati / Kaal Sarp / Career reports
 * using a standardized ReportShell compound component for a
 * consistent, polished report experience across the app.
 *
 * Integrated:
 *   - ReportShell.Header    (report ID, generated timestamp, icon)
 *   - ReportShell.Metadata  (subject birth-details card)
 *   - ReportShell.Actions   (Export PDF / Print / Share / Copy)
 *   - ReportShell.Section   (overview, remedies, timing, relationships, career)
 *   - ReportShell.Footer    (engine line, disclaimer, validation notice, links)
 *   - Inline form validation (no more window.alert)
 *   - ChartLoadingState + ChartErrorState for accessible async flows
 *   - Family Profile quick-loader
 *
 * Route: rendered inside ComprehensiveReportPage (/comprehensive)
 */

import React, { useState, useMemo, useCallback } from 'react';
import { generateManglikReport } from '../data/manglikData';
import { generateSadeSatiReport } from '../data/sadeSatiData';
import { generateKaalSarpReport } from '../data/kaalSarpData';
import { generateCareerReport } from '../data/careerData';
import type { ManglikReport } from '../data/comprehensiveAstrologyData';
import type { SadeSatiReport } from '../data/comprehensiveAstrologyData';
import type { KaalSarpReport } from '../data/kaalSarpData';
import type { CareerReport } from '../data/careerData';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import ReportShell from './ReportShell';
import type { ReportSubject } from './ReportShell';
import FamilyProfileSelector from './FamilyProfileSelector';
import { getProfileById } from '@/lib/familyProfiles';
import type { FamilyProfile } from '@/lib/familyProfiles';
import ChartLoadingState from './ChartLoadingState';
import ChartErrorState from './ChartErrorState';
import ChartEmptyState from './ChartEmptyState';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Heart,
  Shield,
  Target,
  Clock,
  Users,
  TrendingUp,
  Sparkles,
  FileText,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

interface ComprehensiveReportProps {
  isHindi: boolean;
}

type ReportType = 'manglik' | 'sadesati' | 'kaalsarp' | 'career' | 'all';

const ENGINE_LINE =
  'Lahiri Ayanamsa · Meeus precision series · Whole-sign houses · Vimshottari 120-year cycle';
const ENGINE_LINE_HI =
  'लाहिरी अयनांश · मीयस परिशुद्धता श्रृंखला · संपूर्ण-चिह्न भाव · विम्शोत्तरी 120-वर्ष चक्र';

const RASHI_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const QUICK_LINKS = [
  { href: '/horoscope', label: 'Kundli Page', labelHi: 'कुंडली पेज' },
  { href: '/ashtakavarga', label: 'Ashtakavarga', labelHi: 'अष्टकवर्ग' },
  { href: '/matchmaking', label: 'Kundli Milan', labelHi: 'कुंडली मिलान' },
  { href: '/dasha-transit', label: 'Dasha + Transit', labelHi: 'दशा + गोचर' },
  { href: '/report-preview', label: 'Report Shell Demo', labelHi: 'रिपोर्ट शेल डेमो' },
];

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

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-600 dark:text-green-400';
  if (score >= 5) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function getStatusBadge(active: boolean, hi: boolean) {
  if (active) {
    return (
      <Badge variant="destructive" className="text-xs">
        {hi ? 'सक्रिय' : 'Active'}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-xs">
      {hi ? 'निष्क्रिय' : 'Clear'}
    </Badge>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const ComprehensiveReportForm: React.FC<ComprehensiveReportProps> = ({ isHindi }) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [moonSign, setMoonSign] = useState('');
  const [ascendant, setAscendant] = useState('');
  const [marsHouse, setMarsHouse] = useState('');
  const [saturnPosition, setSaturnPosition] = useState('');
  const [rahuHouse, setRahuHouse] = useState('');
  const [ketuHouse, setKetuHouse] = useState('');
  const [reportType, setReportType] = useState<ReportType>('all');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [reports, setReports] = useState<{
    manglik?: ManglikReport;
    sadesati?: SadeSatiReport;
    kaalsarp?: KaalSarpReport;
    career?: CareerReport;
  }>({});
  const [profileLoadedFeedback, setProfileLoadedFeedback] = useState(false);

  const t = useMemo(() => {
    const hi = isHindi;
    return {
      title: hi ? 'व्यापक ज्योतिष रिपोर्ट' : 'Comprehensive Astrology Report',
      subtitle: hi ? 'सभी प्रमुख ज्योतिष विश्लेषण एक ही स्थान पर' : 'All Major Astrology Analyses in One Place',
      formTitle: hi ? 'ज्योतिष रिपोर्ट जेनरेटर' : 'Astrology Report Generator',
      formDesc: hi ? 'अपनी जानकारी भरें और व्यापक विश्लेषण प्राप्त करें' : 'Fill your information and get comprehensive analysis',
      basicInfo: hi ? 'बुनियादी जानकारी' : 'Basic Information',
      name: hi ? 'नाम' : 'Name',
      namePh: hi ? 'अपना नाम दर्ज करें' : 'Enter your name',
      dob: hi ? 'जन्म तिथि' : 'Birth Date',
      moonSign: hi ? 'चंद्र राशि' : 'Moon Sign',
      moonSignPh: hi ? 'चंद्र राशि चुनें' : 'Select Moon Sign',
      ascendant: hi ? 'लग्न' : 'Ascendant',
      ascendantPh: hi ? 'लग्न चुनें' : 'Select Ascendant',
      reportType: hi ? 'रिपोर्ट प्रकार' : 'Report Type',
      reportTypePh: hi ? 'रिपोर्ट प्रकार चुनें' : 'Select Report Type',
      all: hi ? 'सभी रिपोर्ट (व्यापक)' : 'All Reports (comprehensive)',
      marsHouse: hi ? 'मंगल का भाव' : 'Mars House',
      marsPh: hi ? 'मंगल भाव चुनें' : 'Select Mars House',
      saturnPos: hi ? 'शनि की स्थिति' : 'Saturn Position',
      saturnPh: hi ? 'शनि स्थिति चुनें' : 'Select Saturn Position',
      rahuHouse: hi ? 'राहु का भाव' : 'Rahu House',
      rahuPh: hi ? 'राहु भाव चुनें' : 'Select Rahu House',
      ketuHouse: hi ? 'केतु का भाव' : 'Ketu House',
      ketuPh: hi ? 'केतु भाव चुनें' : 'Select Ketu House',
      house: (n: number) => hi ? `${n}वां भाव` : `House ${n}`,
      generate: hi ? 'व्यापक रिपोर्ट जेनरेट करें' : 'Generate Comprehensive Report',
      generating: hi ? 'जेनरेट हो रहा है…' : 'Generating…',
      calcMsg: hi ? 'आपकी व्यापक ज्योतिष रिपोर्ट की गणना हो रही है…' : 'Calculating your comprehensive astrology report…',
      newReport: hi ? 'नई रिपोर्ट जेनरेट करें' : 'Generate New Report',
      downloadPdf: hi ? '📥 PDF डाउनलोड करें' : '📥 Download PDF',
      preparingPdf: hi ? 'PDF बन रहा है…' : 'Generating PDF…',
      familyProfile: hi ? 'परिवार प्रोफ़ाइल' : 'Family Profile',
      familyHint: hi ? 'परिवार प्रोफ़ाइल से जन्म विवरण स्वयं भरें' : 'Auto-fill birth details from a family profile',
      loadProfile: hi ? 'परिवार प्रोफ़ाइल' : 'Family Profile',
      personalInfo: hi ? 'व्यक्तिगत जानकारी' : 'Personal Information',
      summary: hi ? 'रिपोर्ट सारांश' : 'Report Summary',
      overview: hi ? 'सारांश' : 'Overview',
      overviewDesc: hi ? 'सभी दोषों और विश्लेषणों का संक्षिप्त अवलोकन' : 'Quick snapshot of all doshas and analyses',
      remedies: hi ? 'उपाय' : 'Remedies',
      remediesDesc: hi ? 'प्रत्येक दोष के लिए सुझाए गए उपाय' : 'Suggested remedies per dosha and life area',
      timing: hi ? 'समय' : 'Timing',
      timingDesc: hi ? 'शिखर अवधि और अनुकूल समय' : 'Peak periods and favorable windows',
      relationships: hi ? 'रिश्ते' : 'Relationships',
      relationshipsDesc: hi ? 'विवाह संगतता और संबंध विश्लेषण' : 'Marriage compatibility and relationship factors',
      career: hi ? 'करियर' : 'Career',
      careerDesc: hi ? 'करियर क्षमता, उपयुक्त क्षेत्र और चुनौतियां' : 'Career potential, suitable fields, and challenges',
      status: hi ? 'स्थिति' : 'Status',
      intensity: hi ? 'तीव्रता' : 'Intensity',
      impact: hi ? 'प्रभाव' : 'Impact',
      potential: hi ? 'क्षमता' : 'Potential',
      compatibility: hi ? 'विवाह संगतता' : 'Marriage Compatibility',
      suitableFields: hi ? 'उपयुक्त क्षेत्र' : 'Suitable Fields',
      strengths: hi ? 'शक्तियां' : 'Strengths',
      challenges: hi ? 'चुनौतियां' : 'Challenges',
      peakPeriods: hi ? 'शिखर अवधि' : 'Peak Periods',
      favorablePeriods: hi ? 'अनुकूल अवधि' : 'Favorable Periods',
      emptyTitle: hi ? 'अपनी रिपोर्ट कॉन्फ़िगर करें' : 'Configure your report',
      emptyDesc: hi ? 'ऊपर जन्म विवरण भरें और व्यापक रिपोर्ट जेनरेट करें पर क्लिक करें।' : 'Enter birth details above and click Generate Comprehensive Report.',
      validationRequired: hi ? 'कृपया आवश्यक फ़ील्ड भरें: नाम, जन्म तिथि, चंद्र राशि, लग्न' : 'Please fill required fields: Name, Birth Date, Moon Sign, Ascendant',
      manglikOnly: hi ? 'मांगलिक दोष केवल' : 'Manglik Dosha Only',
      sadeOnly: hi ? 'साढ़े साती केवल' : 'Sade Sati Only',
      kaalOnly: hi ? 'काल सर्प दोष केवल' : 'Kaal Sarp Dosha Only',
      careerOnly: hi ? 'करियर विश्लेषण केवल' : 'Career Analysis Only',
      analysisComplete: hi ? 'विश्लेषण पूर्ण' : 'Analysis Complete',
      optional: hi ? 'वैकल्पिक' : 'optional',
      profileLoadedMsg: hi ? '✓ नाम और जन्म तिथि लोड हो गई। उन्नत फ़ील्ड (चंद्र राशि, लग्न) के लिए कुंडली गणना आवश्यक।' : '✓ Name & Birth Date loaded. Advanced fields (Moon Sign, Ascendant) need a Kundli calculation to auto-fill.',
    };
  }, [isHindi]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleProfileSelect = (profile: FamilyProfile) => {
    const validated = getProfileById(profile.id);
    if (!validated) return;
    setSelectedProfileId(profile.id);
    setName(validated.name);
    setBirthDate(validated.birthDate);
    setFormError(null);
    setProfileLoadedFeedback(true);
    window.setTimeout(() => setProfileLoadedFeedback(false), 8000);
  };

  const validateForm = useCallback((): boolean => {
    if (!name.trim() || !birthDate || !moonSign || !ascendant) {
      setFormError(t.validationRequired);
      return false;
    }
    setFormError(null);
    return true;
  }, [name, birthDate, moonSign, ascendant, t.validationRequired]);

  const handleGenerateReports = async () => {
    setGenerateError(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      const moonSignIndex = RASHI_EN.indexOf(moonSign);
      const ascendantIndex = RASHI_EN.indexOf(ascendant);
      const date = new Date(birthDate);

      const newReports: typeof reports = {};

      if (reportType === 'all' || reportType === 'manglik') {
        if (marsHouse) {
          newReports.manglik = generateManglikReport(
            name, date, moonSign, ascendant, parseInt(marsHouse, 10),
          );
        }
      }
      if (reportType === 'all' || reportType === 'sadesati') {
        if (saturnPosition) {
          newReports.sadesati = generateSadeSatiReport(
            name, date, moonSign, parseInt(saturnPosition, 10),
          );
        }
      }
      if (reportType === 'all' || reportType === 'kaalsarp') {
        if (rahuHouse && ketuHouse) {
          newReports.kaalsarp = generateKaalSarpReport(
            name, date, moonSignIndex, parseInt(rahuHouse, 10), parseInt(ketuHouse, 10),
          );
        }
      }
      if (reportType === 'all' || reportType === 'career') {
        newReports.career = generateCareerReport(
          name, date, moonSignIndex, ascendantIndex,
        );
      }

      setReports(newReports);
    } catch (error) {
      console.error('Error generating reports:', error);
      setGenerateError(isHindi ? 'रिपोर्ट जेनरेट करने में त्रुटि' : 'Error generating reports');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = useCallback(() => {
    setReports({});
    setGenerateError(null);
    setCopied(false);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.title,
          text: `${t.title} — ${name}`,
          url: window.location.href,
        });
      } catch {
        /* user cancelled */
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }, [t.title, name]);

  const handleCopy = useCallback(async () => {
    const parts: string[] = [];
    parts.push(`${t.title} — ${name}`);
    parts.push(`DOB: ${birthDate} | Moon: ${moonSign} | Lagna: ${ascendant}`);
    parts.push('');
    if (reports.manglik) {
      parts.push(`🔥 Manglik: ${reports.manglik.manglikType} (${reports.manglik.intensity}/10)`);
      parts.push(`   Marriage: ${reports.manglik.marriageCompatibility}/10`);
    }
    if (reports.sadesati) {
      parts.push(`🪐 SadeSati: ${reports.sadesati.sadeSatiPhase} (${reports.sadesati.overallImpact}/10)`);
    }
    if (reports.kaalsarp) {
      parts.push(`🐍 KaalSarp: ${reports.kaalsarp.yogaType} (${reports.kaalsarp.overallImpact}/10)`);
    }
    if (reports.career) {
      parts.push(`💼 Career: ${reports.career.careerPotential}/10 · Job ${reports.career.jobPotential}/10 · Biz ${reports.career.businessPotential}/10`);
    }
    try {
      await navigator.clipboard.writeText(parts.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }, [t, name, birthDate, moonSign, ascendant, reports]);

  const buildGaneshPDFConfig = (): import('@/services/vedicGaneshPDFGenerator').GaneshPDFConfig => {
    const subjectInfo: { label: string; value: string }[] = [
      { label: 'Name / नाम', value: name },
      { label: 'DOB / जन्म तिथि', value: birthDate ? new Date(birthDate).toLocaleDateString() : '' },
      { label: 'Moon Sign / चंद्र राशि', value: moonSign },
      { label: 'Ascendant / लग्न', value: ascendant },
      { label: 'Report Type / रिपोर्ट प्रकार', value: reportType === 'all' ? 'All Reports' : reportType },
      { label: 'Generated On / जेनरेट किया गया', value: new Date().toLocaleDateString() },
    ];

    const sections: import('@/services/vedicGaneshPDFGenerator').PDFSection[] = [];
    const tables: import('@/services/vedicGaneshPDFGenerator').PDFTable[] = [];

    const overviewBody: (string | string[])[] = [];
    if (reports.manglik) {
      overviewBody.push(`🔥 MANGLIK YOGA: ${reports.manglik.manglikType} (${reports.manglik.manglikTypeHi})`);
      overviewBody.push([
        `Intensity / तीव्रता: ${reports.manglik.intensity}/10`,
        `Marriage Compatibility / विवाह संगतता: ${reports.manglik.marriageCompatibility}/10`,
        `Affected Houses / प्रभावित भाव: ${reports.manglik.affectedHouses.join(', ') || 'None'}`,
        `Advice / सलाह: ${isHindi ? reports.manglik.overallAdviceHi : reports.manglik.overallAdvice}`,
      ]);
    }
    if (reports.sadesati) {
      overviewBody.push(`🪐 SADE SATI: ${reports.sadesati.sadeSatiPhase} (${reports.sadesati.sadeSatiPhaseHi})`);
      overviewBody.push([
        `Currently Active / वर्तमान में सक्रिय: ${reports.sadesati.isCurrentlyInSadeSati ? 'Yes' : 'No'}`,
        `Overall Impact / कुल प्रभाव: ${reports.sadesati.overallImpact}/10`,
        `Saturn Position / शनि स्थिति: ${reports.sadesati.saturnPosition}`,
        `Success Timeline / सफलता समयरेखा: ${isHindi ? reports.sadesati.successTimelineHi : reports.sadesati.successTimeline}`,
      ]);
    }
    if (reports.kaalsarp) {
      overviewBody.push(`🐍 KAAL SARP YOGA: ${reports.kaalsarp.yogaType} (${reports.kaalsarp.yogaTypeHi})`);
      overviewBody.push([
        `Intensity / तीव्रता: ${reports.kaalsarp.intensity} (${reports.kaalsarp.intensityHi})`,
        `Overall Impact / कुल प्रभाव: ${reports.kaalsarp.overallImpact}/10`,
        `Rahu Position / राहु स्थिति: ${reports.kaalsarp.rahuPosition}`,
        `Ketu Position / केतु स्थिति: ${reports.kaalsarp.ketuPosition}`,
      ]);
    }
    if (reports.career) {
      overviewBody.push(`💼 CAREER ANALYSIS / करियर विश्लेषण`);
      overviewBody.push([
        `Career Potential / करियर क्षमता: ${reports.career.careerPotential}/10`,
        `Business Potential / व्यवसाय क्षमता: ${reports.career.businessPotential}/10`,
        `Job Potential / नौकरी क्षमता: ${reports.career.jobPotential}/10`,
        `Success Age / सफलता आयु: ${isHindi ? reports.career.successAgeHi : reports.career.successAge}`,
      ]);
    }
    if (overviewBody.length > 0) {
      sections.push({
        icon: '🎯',
        title: 'OVERVIEW / सारांश',
        titleHi: 'व्यापक विश्लेषण सारांश',
        accentColor: [120, 53, 15],
        body: overviewBody,
      });
    }

    const remediesBody: (string | string[])[] = [];
    if (reports.manglik && reports.manglik.remedies && reports.manglik.remedies[0]) {
      remediesBody.push('✨ Manglik Remedies / मांगलिक उपाय');
      remediesBody.push((isHindi ? reports.manglik.remediesHi : reports.manglik.remedies[0]) || []);
    }
    if (reports.sadesati && reports.sadesati.remedies) {
      remediesBody.push('🪐 Sade Sati Remedies / साढ़े साती उपाय');
      remediesBody.push(isHindi ? reports.sadesati.remediesHi : reports.sadesati.remedies);
    }
    if (reports.kaalsarp && reports.kaalsarp.generalRemedies) {
      remediesBody.push('🐍 Kaal Sarp Remedies / काल सर्प उपाय');
      remediesBody.push(isHindi ? reports.kaalsarp.generalRemediesHi : reports.kaalsarp.generalRemedies);
    }
    if (reports.career && reports.career.remedies) {
      remediesBody.push('💼 Career Remedies / करियर उपाय');
      remediesBody.push(isHindi ? reports.career.remediesHi : reports.career.remedies);
    }
    if (remediesBody.length > 0) {
      sections.push({
        icon: '🛡️',
        title: 'REMEDIES / उपाय',
        titleHi: 'दोष निवारण उपाय',
        accentColor: [22, 101, 52],
        body: remediesBody,
      });
    }

    const timingBody: (string | string[])[] = [];
    if (reports.sadesati && reports.sadesati.peakPeriods) {
      timingBody.push('🪐 Sade Sati Peak Periods / साढ़े साती शिखर अवधि');
      timingBody.push(isHindi ? reports.sadesati.peakPeriodsHi : reports.sadesati.peakPeriods);
    }
    if (reports.career && reports.career.favorablePeriods) {
      timingBody.push('💼 Career Favorable Periods / करियर अनुकूल अवधि');
      timingBody.push(isHindi ? reports.career.favorablePeriodsHi : reports.career.favorablePeriods);
    }
    if (timingBody.length > 0) {
      sections.push({
        icon: '⏰',
        title: 'TIMING / समय',
        titleHi: 'शुभ समय और अवधियां',
        accentColor: [30, 64, 175],
        body: timingBody,
      });
    }

    const relationshipsBody: (string | string[])[] = [];
    if (reports.manglik) {
      const compScore = reports.manglik.marriageCompatibility;
      const rating = compScore >= 8 ? '⭐⭐⭐⭐⭐ Excellent / उत्कृष्ट' : compScore >= 6 ? '⭐⭐⭐⭐ Good / अच्छा' : '⭐⭐⭐ Caution / सावधानी';
      relationshipsBody.push(`💖 Marriage Compatibility / विवाह संगतता: ${compScore}/10 — ${rating}`);
      if (reports.manglik.cancellationConditions && reports.manglik.cancellationConditions.length > 0) {
        relationshipsBody.push('Cancellation Conditions / रद्दीकरण शर्तें:');
        relationshipsBody.push(isHindi ? reports.manglik.cancellationConditionsHi : reports.manglik.cancellationConditions);
      }
      if (reports.manglik.effects) {
        const eff = reports.manglik.effects as any;
        if (eff.positive) relationshipsBody.push('Positive Effects / सकारात्मक प्रभाव:', eff.positive);
        if (eff.negative) relationshipsBody.push('Negative Effects / नकारात्मक प्रभाव:', eff.negative);
      }
    }
    if (relationshipsBody.length > 0) {
      sections.push({
        icon: '❤️',
        title: 'RELATIONSHIPS / रिश्ते',
        titleHi: 'विवाह और संबंध विश्लेषण',
        accentColor: [157, 23, 77],
        body: relationshipsBody,
      });
    }

    const careerBody: (string | string[])[] = [];
    if (reports.career) {
      careerBody.push(`📊 Career Potential / करियर क्षमता: ${reports.career.careerPotential}/10`);
      careerBody.push(`📈 Business vs Job / व्यवसाय बनाम नौकरी: ${isHindi ? reports.career.businessVsJobAdviceHi : reports.career.businessVsJobAdvice}`);
      careerBody.push(`💰 Financial Growth / वित्तीय विकास: ${isHindi ? reports.career.financialGrowthHi : reports.career.financialGrowth}`);
      careerBody.push(`🏆 Overall Outlook / कुल दृष्टिकोण: ${isHindi ? reports.career.overallOutlookHi : reports.career.overallOutlook}`);
      if (reports.career.suitableFields && reports.career.suitableFields.length > 0) {
        careerBody.push('🎯 Suitable Fields / उपयुक्त क्षेत्र:');
        careerBody.push(isHindi ? reports.career.suitableFieldsHi : reports.career.suitableFields);
      }
      if (reports.career.strengths && reports.career.strengths.length > 0) {
        careerBody.push('💪 Strengths / शक्तियां:');
        careerBody.push(isHindi ? reports.career.strengthsHi : reports.career.strengths);
      }
      if (reports.career.challenges && reports.career.challenges.length > 0) {
        careerBody.push('⚠️ Challenges / चुनौतियां:');
        careerBody.push(isHindi ? reports.career.challengesHi : reports.career.challenges);
      }
    }
    if (careerBody.length > 0) {
      sections.push({
        icon: '💼',
        title: 'CAREER / करियर',
        titleHi: 'विस्तृत करियर विश्लेषण',
        accentColor: [8, 47, 73],
        body: careerBody,
      });
    }

    if (reports.career) {
      tables.push({
        title: '📊 CAREER POTENTIAL SCORECARD',
        titleHi: 'करियर स्कोरकार्ड',
        accentColor: [120, 53, 15],
        headers: ['Parameter / मापदंड', 'Score / स्कोर', 'Rating / रेटिंग'],
        rows: [
          ['Career Potential / करियर क्षमता', `${reports.career.careerPotential}/10`, reports.career.careerPotential >= 8 ? '⭐ Excellent' : reports.career.careerPotential >= 6 ? '✅ Good' : '⚠️ Moderate'],
          ['Business Potential / व्यवसाय क्षमता', `${reports.career.businessPotential}/10`, reports.career.businessPotential >= 8 ? '⭐ Excellent' : reports.career.businessPotential >= 6 ? '✅ Good' : '⚠️ Moderate'],
          ['Job Potential / नौकरी क्षमता', `${reports.career.jobPotential}/10`, reports.career.jobPotential >= 8 ? '⭐ Excellent' : reports.career.jobPotential >= 6 ? '✅ Good' : '⚠️ Moderate'],
          ['Mitigation (if KaalSarp)', reports.kaalsarp ? `${reports.kaalsarp.mitigationPotential}/10` : 'N/A', reports.kaalsarp && reports.kaalsarp.mitigationPotential >= 8 ? '⭐ High' : '✅ Manageable'],
        ],
      });
    }

    if (reports.manglik || reports.sadesati || reports.kaalsarp) {
      const summaryRows: (string | number)[][] = [];
      if (reports.manglik) summaryRows.push(['Manglik Yoga / मांगलिक योग', reports.manglik.manglikType, `${reports.manglik.intensity}/10`, reports.manglik.hasManglikYoga ? '🔴 Active' : '✅ None']);
      if (reports.sadesati) summaryRows.push(['Sade Sati / साढ़े साती', reports.sadesati.sadeSatiPhase, `${reports.sadesati.overallImpact}/10`, reports.sadesati.isCurrentlyInSadeSati ? '🟠 Active' : '✅ Clear']);
      if (reports.kaalsarp) summaryRows.push(['Kaal Sarp / काल सर्प', reports.kaalsarp.intensity, `${reports.kaalsarp.overallImpact}/10`, reports.kaalsarp.hasKaalSarpYoga ? '🟣 Active' : '✅ None']);
      if (summaryRows.length > 0) {
        tables.push({
          title: '📋 DOSHA SUMMARY TABLE',
          titleHi: 'दोष सारांश तालिका',
          accentColor: [153, 27, 27],
          headers: ['Dosha / दोष', 'Type / प्रकार', 'Impact / प्रभाव', 'Status / स्थिति'],
          rows: summaryRows,
        });
      }
    }

    if (reports.career && reports.career.gemstones && reports.career.gemstones.length > 0) {
      const gemstoneRows = reports.career.gemstones.map((g, i) => [
        (i + 1).toString(),
        g,
        (isHindi ? reports.career!.gemstonesHi : reports.career!.gemstones)[i] || g,
        'Wear as per counsel / परामर्श से धारण करें',
      ]);
      tables.push({
        title: '💎 GEMSTONE GUIDANCE',
        titleHi: 'रत्न मार्गदर्शन',
        accentColor: [8, 47, 73],
        headers: ['#', 'Gemstone / रत्न (EN)', 'रत्न (HI)', 'Advice / सलाह'],
        rows: gemstoneRows,
      });
    }

    return {
      reportTitle: 'COMPREHENSIVE VEDIC ASTROLOGY REPORT',
      reportTitleHi: 'व्यापक वैदिक ज्योतिष रिपोर्ट',
      subtitle: `Generated for ${name} | Vedic Rajkumar Analysis Engine`,
      subtitleHi: `${name} के लिए जेनरेट किया गया | वैदिक राजकुमार विश्लेषण इंजन`,
      theme: 'premium',
      filename: `COMPREHENSIVE_REPORT_${name.replace(/\s+/g, '_').toUpperCase()}_${new Date().toISOString().slice(0, 10)}.pdf`,
      footerBlessing: '॥ श्री गणेशाय नमः ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभः। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
      subjectInfo,
      sections,
      tables,
    };
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const { generateVedicGaneshPDF } = await import('@/services/vedicGaneshPDFGenerator');
      generateVedicGaneshPDF(buildGaneshPDFConfig());
    } catch (err) {
      console.error('PDF download failed:', err);
      setGenerateError(isHindi ? 'PDF डाउनलोड विफल। कंसोल में विवरण देखें।' : 'PDF download failed. Check console for details.');
    } finally {
      setTimeout(() => setDownloading(false), 1500);
    }
  };

  // ─── Derived data ─────────────────────────────────────────────────────────

  const subject: ReportSubject = useMemo(() => ({
    name: name || t.name,
    birthDate: birthDate || '—',
    birthPlace: '',
    relationship: 'Self',
  }), [name, birthDate, t.name]);

  const generatedAt = useMemo(() => nowISO(), [reports]);
  const reportId = useMemo(() => buildReportId('C'), [reports]);

  const hasReports = Object.keys(reports).length > 0;

  // ─── Render: Loading ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <ChartLoadingState message={t.calcMsg} />
      </div>
    );
  }

  // ─── Render: Report results (ReportShell scaffold) ────────────────────────

  if (hasReports) {
    const hi = isHindi;

    return (
      <div className="max-w-7xl mx-auto">
        <ReportShell maxWidth="7xl">
          {/* ── Header ─────────────────────────────────────────────── */}
          <ReportShell.Header
            reportId={reportId}
            generatedAt={generatedAt}
            title="Comprehensive Astrology Report"
            titleHi="व्यापक ज्योतिष रिपोर्ट"
            subtitle={t.subtitle}
            subtitleHi={t.subtitle}
            icon="🌟"
            lang={hi ? 'hi' : 'en'}
            accentColor="amber"
          />

          {/* ── Metadata ───────────────────────────────────────────── */}
          <ReportShell.Metadata
            subject={subject}
            lang={hi ? 'hi' : 'en'}
          />

          {/* ── Actions ────────────────────────────────────────────── */}
          <ReportShell.Actions
            onPrint={handlePrint}
            onShare={handleShare}
            onExportPdf={handleDownloadPDF}
            onCopy={handleCopy}
            isExportingPdf={downloading}
            isCopied={copied}
            lang={hi ? 'hi' : 'en'}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2 ml-auto"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t.newReport}
            </Button>
          </ReportShell.Actions>

          {/* ── Summary cards ──────────────────────────────────────── */}
          <ReportShell.Section
            heading={t.summary}
            headingHi={t.summary}
            icon={<FileText className="h-4 w-4 text-amber-500" />}
            description="Birds-eye view of all computed analyses"
            descriptionHi="सभी गणना किए गए विश्लेषणों का संक्षिप्त अवलोकन"
            className="!bg-transparent !shadow-none !border-0 !p-0"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {reports.manglik && (
                <div className={cn(
                  'rounded-xl border p-4',
                  reports.manglik.hasManglikYoga
                    ? 'border-red-200 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900/40'
                    : 'border-green-200 bg-green-50/50 dark:bg-green-950/10 dark:border-green-900/40',
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={cn(
                      'h-4 w-4',
                      reports.manglik.hasManglikYoga ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400',
                    )} />
                    <span className={cn('font-semibold text-sm', hi && 'font-hindi')}>
                      {hi ? 'मांगलिक योग' : 'Manglik Yoga'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={cn(
                      'text-xs',
                      reports.manglik.hasManglikYoga
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
                    )}>
                      {hi ? reports.manglik.manglikTypeHi : reports.manglik.manglikType}
                    </Badge>
                    <span className={cn('text-lg font-black', getScoreColor(reports.manglik.marriageCompatibility))}>
                      {reports.manglik.marriageCompatibility}
                      <span className="text-xs font-medium opacity-70">/10</span>
                    </span>
                  </div>
                  <p className={cn('text-xs mt-2 text-muted-foreground', hi && 'font-hindi')}>
                    {t.compatibility}
                  </p>
                </div>
              )}

              {reports.sadesati && (
                <div className={cn(
                  'rounded-xl border p-4',
                  reports.sadesati.isCurrentlyInSadeSati
                    ? 'border-orange-200 bg-orange-50/50 dark:bg-orange-950/10 dark:border-orange-900/40'
                    : 'border-green-200 bg-green-50/50 dark:bg-green-950/10 dark:border-green-900/40',
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className={cn(
                      'h-4 w-4',
                      reports.sadesati.isCurrentlyInSadeSati ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400',
                    )} />
                    <span className={cn('font-semibold text-sm', hi && 'font-hindi')}>
                      {hi ? 'साढ़े साती' : 'Sade Sati'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={cn(
                      'text-xs',
                      reports.sadesati.isCurrentlyInSadeSati
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
                    )}>
                      {hi ? reports.sadesati.sadeSatiPhaseHi : reports.sadesati.sadeSatiPhase}
                    </Badge>
                    <span className={cn('text-lg font-black', getScoreColor(reports.sadesati.overallImpact))}>
                      {reports.sadesati.overallImpact}
                      <span className="text-xs font-medium opacity-70">/10</span>
                    </span>
                  </div>
                  <p className={cn('text-xs mt-2 text-muted-foreground', hi && 'font-hindi')}>
                    {t.impact}
                  </p>
                </div>
              )}

              {reports.kaalsarp && (
                <div className={cn(
                  'rounded-xl border p-4',
                  reports.kaalsarp.hasKaalSarpYoga
                    ? 'border-violet-200 bg-violet-50/50 dark:bg-violet-950/10 dark:border-violet-900/40'
                    : 'border-green-200 bg-green-50/50 dark:bg-green-950/10 dark:border-green-900/40',
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className={cn(
                      'h-4 w-4',
                      reports.kaalsarp.hasKaalSarpYoga ? 'text-violet-600 dark:text-violet-400' : 'text-green-600 dark:text-green-400',
                    )} />
                    <span className={cn('font-semibold text-sm', hi && 'font-hindi')}>
                      {hi ? 'काल सर्प योग' : 'Kaal Sarp Yoga'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={cn(
                      'text-xs',
                      reports.kaalsarp.hasKaalSarpYoga
                        ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
                    )}>
                      {hi ? reports.kaalsarp.yogaTypeHi : reports.kaalsarp.yogaType}
                    </Badge>
                    <span className={cn('text-lg font-black', getScoreColor(reports.kaalsarp.overallImpact))}>
                      {reports.kaalsarp.overallImpact}
                      <span className="text-xs font-medium opacity-70">/10</span>
                    </span>
                  </div>
                  <p className={cn('text-xs mt-2 text-muted-foreground', hi && 'font-hindi')}>
                    {t.impact}
                  </p>
                </div>
              )}

              {reports.career && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/10 dark:border-blue-900/40 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className={cn('font-semibold text-sm', hi && 'font-hindi')}>
                      {hi ? 'करियर' : 'Career'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 text-xs">
                      {t.analysisComplete}
                    </Badge>
                    <span className={cn('text-lg font-black', getScoreColor(reports.career.careerPotential))}>
                      {reports.career.careerPotential}
                      <span className="text-xs font-medium opacity-70">/10</span>
                    </span>
                  </div>
                  <p className={cn('text-xs mt-2 text-muted-foreground', hi && 'font-hindi')}>
                    {t.potential}
                  </p>
                </div>
              )}
            </div>
          </ReportShell.Section>

          {/* ── Overview section ───────────────────────────────────── */}
          <ReportShell.Section
            heading={t.overview}
            headingHi={t.overview}
            icon={<Target className="h-4 w-4 text-amber-500" />}
            description={t.overviewDesc}
            descriptionHi={t.overviewDesc}
            collapsible
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.manglik && (
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <h4 className={cn('font-semibold mb-3 flex items-center gap-2', hi && 'font-hindi')}>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    {hi ? 'मांगलिक योग विश्लेषण' : 'Manglik Yoga Analysis'}
                    {getStatusBadge(reports.manglik.hasManglikYoga, hi)}
                  </h4>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex gap-2"><dt className={cn('text-muted-foreground shrink-0 w-28', hi && 'font-hindi')}>{t.status}:</dt><dd className={cn(hi && 'font-hindi')}>{hi ? reports.manglik.manglikTypeHi : reports.manglik.manglikType}</dd></div>
                    <div className="flex gap-2"><dt className={cn('text-muted-foreground shrink-0 w-28', hi && 'font-hindi')}>{t.intensity}:</dt><dd className="font-semibold">{reports.manglik.intensity}/10</dd></div>
                    <div className="flex gap-2"><dt className={cn('text-muted-foreground shrink-0 w-28', hi && 'font-hindi')}>{t.compatibility}:</dt><dd className={cn('font-semibold', getScoreColor(reports.manglik.marriageCompatibility))}>{reports.manglik.marriageCompatibility}/10</dd></div>
                    <div className="flex gap-2"><dt className={cn('text-muted-foreground shrink-0 w-28', hi && 'font-hindi')}>Houses:</dt><dd>{reports.manglik.affectedHouses.join(', ') || '—'}</dd></div>
                    <div className="flex gap-2"><dt className={cn('text-muted-foreground shrink-0 w-28', hi && 'font-hindi')}>Advice:</dt><dd className={cn(hi && 'font-hindi')}>{hi ? reports.manglik.overallAdviceHi : reports.manglik.overallAdvice}</dd></div>
                  </dl>
                </div>
              )}

              {reports.sadesati && (
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <h4 className={cn('font-semibold mb-3 flex items-center gap-2', hi && 'font-hindi')}>
                    <Clock className="h-4 w-4 text-orange-500" />
                    {hi ? 'साढ़े साती विश्लेषण' : 'Sade Sati Analysis'}
                    {getStatusBadge(reports.sadesati.isCurrentlyInSadeSati, hi)}
                  </h4>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex gap-2"><dt className={cn('text-muted-foreground shrink-0 w-28', hi && 'font-hindi')}>{t.status}:</dt><dd className={cn(hi && 'font-hindi')}>{hi ? reports.sadesati.sadeSatiPhaseHi : reports.sadesati.sadeSatiPhase}</dd></div>
                    <div className="flex gap-2"><dt className={cn('text-muted-foreground shrink-0 w-28', hi && 'font-hindi')}>{t.impact}:</dt><dd className={cn('font-semibold', getScoreColor(reports.sadesati.overallImpact))}>{reports.sadesati.overallImpact}/10</dd></div>
                    <div className="flex gap-2"><dt className={cn('text-muted-foreground shrink-0 w-28', hi && 'font-hindi')}>Saturn:</dt><dd>{reports.sadesati.saturnPosition}</dd></div>
                    <div className="flex gap-2"><dt className={cn('text-muted-foreground shrink-0 w-28', hi && 'font-hindi')}>Timeline:</dt><dd className={cn(hi && 'font-hindi')}>{hi ? reports.sadesati.successTimelineHi : reports.sadesati.successTimeline}</dd></div>
                  </dl>
                </div>
              )}

              {reports.kaalsarp && (
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <h4 className={cn('font-semibold mb-3 flex items-center gap-2', hi && 'font-hindi')}>
                    <AlertCircle className="h-4 w-4 text-violet-500" />
                    {hi ? 'काल सर्प योग विश्लेषण' : 'Kaal Sarp Yoga Analysis'}
                    {getStatusBadge(reports.kaalsarp.hasKaalSarpYoga, hi)}
                  </h4>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex gap-2"><dt className={cn('text-muted-foreground shrink-0 w-28', hi && 'font-hindi')}>{t.status}:</dt><dd className={cn(hi && 'font-hindi')}>{hi ? reports.kaalsarp.yogaTypeHi : reports.kaalsarp.yogaType}</dd></div>
                    <div className="flex gap-2"><dt className={cn('text-muted-foreground shrink-0 w-28', hi && 'font-hindi')}>{t.intensity}:</dt><dd className={cn(hi && 'font-hindi')}>{hi ? reports.kaalsarp.intensityHi : reports.kaalsarp.intensity}</dd></div>
                    <div className="flex gap-2"><dt className={cn('text-muted-foreground shrink-0 w-28', hi && 'font-hindi')}>{t.impact}:</dt><dd className={cn('font-semibold', getScoreColor(reports.kaalsarp.overallImpact))}>{reports.kaalsarp.overallImpact}/10</dd></div>
                    <div className="flex gap-2"><dt className={cn('text-muted-foreground shrink-0 w-28', hi && 'font-hindi')}>Rahu:</dt><dd>{reports.kaalsarp.rahuPosition}</dd></div>
                    <div className="flex gap-2"><dt className={cn('text-muted-foreground shrink-0 w-28', hi && 'font-hindi')}>Ketu:</dt><dd>{reports.kaalsarp.ketuPosition}</dd></div>
                  </dl>
                </div>
              )}

              {reports.career && (
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <h4 className={cn('font-semibold mb-3 flex items-center gap-2', hi && 'font-hindi')}>
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    {hi ? 'करियर विश्लेषण' : 'Career Analysis'}
                  </h4>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex gap-2"><dt className={cn('text-muted-foreground shrink-0 w-28', hi && 'font-hindi')}>Career:</dt><dd className={cn('font-semibold', getScoreColor(reports.career.careerPotential))}>{reports.career.careerPotential}/10</dd></div>
                    <div className="flex gap-2"><dt className={cn('text-muted-foreground shrink-0 w-28', hi && 'font-hindi')}>Business:</dt><dd className={cn('font-semibold', getScoreColor(reports.career.businessPotential))}>{reports.career.businessPotential}/10</dd></div>
                    <div className="flex gap-2"><dt className={cn('text-muted-foreground shrink-0 w-28', hi && 'font-hindi')}>Job:</dt><dd className={cn('font-semibold', getScoreColor(reports.career.jobPotential))}>{reports.career.jobPotential}/10</dd></div>
                    <div className="flex gap-2"><dt className={cn('text-muted-foreground shrink-0 w-28', hi && 'font-hindi')}>Success Age:</dt><dd className={cn(hi && 'font-hindi')}>{hi ? reports.career.successAgeHi : reports.career.successAge}</dd></div>
                  </dl>
                </div>
              )}
            </div>
          </ReportShell.Section>

          {/* ── Remedies section ───────────────────────────────────── */}
          {(reports.manglik?.remedies || reports.sadesati?.remedies || reports.kaalsarp?.generalRemedies || reports.career?.remedies) && (
            <ReportShell.Section
              heading={t.remedies}
              headingHi={t.remedies}
              icon={<Shield className="h-4 w-4 text-green-600" />}
              description={t.remediesDesc}
              descriptionHi={t.remediesDesc}
              collapsible
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.manglik?.remedies && reports.manglik.remedies[0] && (
                  <div className="rounded-xl border border-border bg-red-50/40 dark:bg-red-950/10 p-4">
                    <h5 className={cn('font-semibold text-sm mb-3 flex items-center gap-2', hi && 'font-hindi')}>
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      {hi ? 'मांगलिक उपाय' : 'Manglik Remedies'}
                    </h5>
                    <ul className="space-y-1.5">
                      {(hi ? reports.manglik.remediesHi : reports.manglik.remedies).map((remedy, idx) => (
                        <li key={idx} className={cn('text-sm flex items-start gap-2', hi && 'font-hindi')}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" aria-hidden />
                          <span>{remedy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {reports.sadesati?.remedies && (
                  <div className="rounded-xl border border-border bg-orange-50/40 dark:bg-orange-950/10 p-4">
                    <h5 className={cn('font-semibold text-sm mb-3 flex items-center gap-2', hi && 'font-hindi')}>
                      <Clock className="h-4 w-4 text-orange-500" />
                      {hi ? 'साढ़े साती उपाय' : 'Sade Sati Remedies'}
                    </h5>
                    <ul className="space-y-1.5">
                      {(hi ? reports.sadesati.remediesHi : reports.sadesati.remedies).map((remedy, idx) => (
                        <li key={idx} className={cn('text-sm flex items-start gap-2', hi && 'font-hindi')}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" aria-hidden />
                          <span>{remedy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {reports.kaalsarp?.generalRemedies && (
                  <div className="rounded-xl border border-border bg-violet-50/40 dark:bg-violet-950/10 p-4">
                    <h5 className={cn('font-semibold text-sm mb-3 flex items-center gap-2', hi && 'font-hindi')}>
                      <AlertCircle className="h-4 w-4 text-violet-500" />
                      {hi ? 'काल सर्प उपाय' : 'Kaal Sarp Remedies'}
                    </h5>
                    <ul className="space-y-1.5">
                      {(hi ? reports.kaalsarp.generalRemediesHi : reports.kaalsarp.generalRemedies).map((remedy, idx) => (
                        <li key={idx} className={cn('text-sm flex items-start gap-2', hi && 'font-hindi')}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" aria-hidden />
                          <span>{remedy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {reports.career?.remedies && (
                  <div className="rounded-xl border border-border bg-blue-50/40 dark:bg-blue-950/10 p-4">
                    <h5 className={cn('font-semibold text-sm mb-3 flex items-center gap-2', hi && 'font-hindi')}>
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      {hi ? 'करियर उपाय' : 'Career Remedies'}
                    </h5>
                    <ul className="space-y-1.5">
                      {(hi ? reports.career.remediesHi : reports.career.remedies).map((remedy, idx) => (
                        <li key={idx} className={cn('text-sm flex items-start gap-2', hi && 'font-hindi')}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" aria-hidden />
                          <span>{remedy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ReportShell.Section>
          )}

          {/* ── Timing section ─────────────────────────────────────── */}
          {(reports.sadesati?.peakPeriods || reports.career?.favorablePeriods) && (
            <ReportShell.Section
              heading={t.timing}
              headingHi={t.timing}
              icon={<Clock className="h-4 w-4 text-indigo-500" />}
              description={t.timingDesc}
              descriptionHi={t.timingDesc}
              collapsible
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.sadesati?.peakPeriods && (
                  <div className="rounded-xl border border-border p-4">
                    <h5 className={cn('font-semibold text-sm mb-3 flex items-center gap-2', hi && 'font-hindi')}>
                      <Clock className="h-4 w-4 text-orange-500" />
                      {t.peakPeriods}
                    </h5>
                    <ul className="space-y-1.5">
                      {(hi ? reports.sadesati.peakPeriodsHi : reports.sadesati.peakPeriods).map((period, idx) => (
                        <li key={idx} className={cn('text-sm flex items-start gap-2', hi && 'font-hindi')}>
                          <Check className="h-3.5 w-3.5 mt-0.5 text-orange-500 shrink-0" />
                          <span>{period}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {reports.career?.favorablePeriods && (
                  <div className="rounded-xl border border-border p-4">
                    <h5 className={cn('font-semibold text-sm mb-3 flex items-center gap-2', hi && 'font-hindi')}>
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      {t.favorablePeriods}
                    </h5>
                    <ul className="space-y-1.5">
                      {(hi ? reports.career.favorablePeriodsHi : reports.career.favorablePeriods).map((period, idx) => (
                        <li key={idx} className={cn('text-sm flex items-start gap-2', hi && 'font-hindi')}>
                          <Check className="h-3.5 w-3.5 mt-0.5 text-blue-500 shrink-0" />
                          <span>{period}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ReportShell.Section>
          )}

          {/* ── Relationships section ──────────────────────────────── */}
          {reports.manglik && (
            <ReportShell.Section
              heading={t.relationships}
              headingHi={t.relationships}
              icon={<Heart className="h-4 w-4 text-rose-500" />}
              description={t.relationshipsDesc}
              descriptionHi={t.relationshipsDesc}
              collapsible
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-border bg-rose-50/40 dark:bg-rose-950/10 p-6 text-center">
                  <Heart className="h-8 w-8 text-rose-500 mx-auto mb-2" aria-hidden />
                  <div className={cn('text-4xl font-black mb-1', getScoreColor(reports.manglik.marriageCompatibility))}>
                    {reports.manglik.marriageCompatibility}<span className="text-xl font-medium opacity-70">/10</span>
                  </div>
                  <p className={cn('text-sm', hi && 'font-hindi')}>
                    {reports.manglik.marriageCompatibility >= 8 ? (hi ? 'उत्कृष्ट' : 'Excellent') :
                     reports.manglik.marriageCompatibility >= 6 ? (hi ? 'अच्छा' : 'Good') :
                     (hi ? 'सावधानी आवश्यक' : 'Caution Required')}
                  </p>
                  <p className={cn('text-xs text-muted-foreground mt-1', hi && 'font-hindi')}>{t.compatibility}</p>
                </div>
                {reports.manglik.cancellationConditions && reports.manglik.cancellationConditions.length > 0 && (
                  <div className="rounded-xl border border-border p-4">
                    <h5 className={cn('font-semibold text-sm mb-3', hi && 'font-hindi')}>
                      {hi ? 'रद्दीकरण शर्तें' : 'Cancellation Conditions'}
                    </h5>
                    <ul className="space-y-1.5">
                      {(hi ? reports.manglik.cancellationConditionsHi : reports.manglik.cancellationConditions).map((c, idx) => (
                        <li key={idx} className={cn('text-sm flex items-start gap-2', hi && 'font-hindi')}>
                          <CheckCircle className="h-3.5 w-3.5 mt-0.5 text-green-500 shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ReportShell.Section>
          )}

          {/* ── Career section ─────────────────────────────────────── */}
          {reports.career && (
            <ReportShell.Section
              heading={t.career}
              headingHi={t.career}
              icon={<TrendingUp className="h-4 w-4 text-blue-500" />}
              description={t.careerDesc}
              descriptionHi={t.careerDesc}
              collapsible
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.career.suitableFields && reports.career.suitableFields.length > 0 && (
                  <div>
                    <h5 className={cn('font-semibold text-sm mb-2 flex items-center gap-2', hi && 'font-hindi')}>
                      <Target className="h-4 w-4 text-amber-500" />
                      {t.suitableFields}
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {(hi ? reports.career.suitableFieldsHi : reports.career.suitableFields).map((field, idx) => (
                        <Badge key={idx} variant="outline" className={cn('text-xs', hi && 'font-hindi')}>
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {reports.career.strengths && reports.career.strengths.length > 0 && (
                  <div>
                    <h5 className={cn('font-semibold text-sm mb-2 flex items-center gap-2', hi && 'font-hindi')}>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {t.strengths}
                    </h5>
                    <ul className="space-y-1">
                      {(hi ? reports.career.strengthsHi : reports.career.strengths).map((s, idx) => (
                        <li key={idx} className={cn('text-sm flex items-start gap-2', hi && 'font-hindi')}>
                          <Check className="h-3.5 w-3.5 mt-0.5 text-green-500 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {reports.career.challenges && reports.career.challenges.length > 0 && (
                  <div className="md:col-span-2">
                    <h5 className={cn('font-semibold text-sm mb-2 flex items-center gap-2', hi && 'font-hindi')}>
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      {t.challenges}
                    </h5>
                    <ul className="space-y-1">
                      {(hi ? reports.career.challengesHi : reports.career.challenges).map((c, idx) => (
                        <li key={idx} className={cn('text-sm flex items-start gap-2', hi && 'font-hindi')}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" aria-hidden />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ReportShell.Section>
          )}

          {/* ── Footer ─────────────────────────────────────────────── */}
          <ReportShell.Footer
            engine={ENGINE_LINE}
            engineHi={ENGINE_LINE_HI}
            lang={hi ? 'hi' : 'en'}
            links={QUICK_LINKS}
            showValidationNotice
          />
        </ReportShell>
      </div>
    );
  }

  // ─── Render: Empty form ───────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-2">
        <h1 className={cn('text-3xl font-bold mb-2', isHindi && 'font-hindi')}>{t.title}</h1>
        <p className={cn('text-muted-foreground', isHindi && 'font-hindi')}>{t.subtitle}</p>
      </div>

      {generateError && (
        <ChartErrorState message={generateError} onRetry={() => setGenerateError(null)} />
      )}

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="px-6 pt-6 pb-3 border-b border-border/60 bg-muted/20">
          <h2 className={cn('text-lg font-semibold', isHindi && 'font-hindi')}>{t.formTitle}</h2>
          <p className={cn('text-xs text-muted-foreground mt-0.5', isHindi && 'font-hindi')}>{t.formDesc}</p>
        </div>
        <div className="p-6 space-y-5">
          {/* Family Profile Loader */}
          <div className="rounded-lg border border-primary/15 bg-primary/5 p-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <Label className={cn('text-xs font-semibold uppercase tracking-wider text-muted-foreground', isHindi && 'font-hindi')}>
                  {t.familyProfile}
                </Label>
                <p className={cn('text-[10px] text-muted-foreground mt-0.5', isHindi && 'font-hindi')}>
                  {t.familyHint}
                </p>
              </div>
              <FamilyProfileSelector
                onSelect={handleProfileSelect}
                selectedId={selectedProfileId}
                triggerLabel={isHindi ? 'परिवार प्रोफ़ाइल' : 'Family Profile'}
                lang={isHindi ? 'hi' : 'en'}
              />
            </div>
            {profileLoadedFeedback && (
              <div className="mt-2.5">
                <Badge variant="secondary" className={cn('text-[11px] px-2.5 py-1 shadow-sm font-normal', isHindi && 'font-hindi')}>
                  {t.profileLoadedMsg}
                </Badge>
              </div>
            )}
          </div>

          {/* Validation error */}
          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive flex items-start gap-2"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
              <span className={cn(isHindi && 'font-hindi')}>{formError}</span>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className={cn(isHindi && 'font-hindi')}>{t.name}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => { setName(e.target.value); if (formError) setFormError(null); }}
                placeholder={t.namePh}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="birthdate" className={cn(isHindi && 'font-hindi')}>{t.dob}</Label>
              <Input
                id="birthdate"
                type="date"
                value={birthDate}
                onChange={(e) => { setBirthDate(e.target.value); if (formError) setFormError(null); }}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="moonsign" className={cn(isHindi && 'font-hindi')}>{t.moonSign}<span className="ml-1 text-[10px] text-muted-foreground font-normal">({t.optional})</span></Label>
              <Select value={moonSign} onValueChange={(v) => { setMoonSign(v); if (formError) setFormError(null); }}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={t.moonSignPh} />
                </SelectTrigger>
                <SelectContent>
                  {RASHI_EN.map((sign) => (
                    <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ascendant" className={cn(isHindi && 'font-hindi')}>{t.ascendant}<span className="ml-1 text-[10px] text-muted-foreground font-normal">({t.optional})</span></Label>
              <Select value={ascendant} onValueChange={(v) => { setAscendant(v); if (formError) setFormError(null); }}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={t.ascendantPh} />
                </SelectTrigger>
                <SelectContent>
                  {RASHI_EN.map((sign) => (
                    <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Report Type Selection */}
          <div>
            <Label htmlFor="reporttype" className={cn(isHindi && 'font-hindi')}>{t.reportType}</Label>
            <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder={t.reportTypePh} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="manglik">{t.manglikOnly}</SelectItem>
                <SelectItem value="sadesati">{t.sadeOnly}</SelectItem>
                <SelectItem value="kaalsarp">{t.kaalOnly}</SelectItem>
                <SelectItem value="career">{t.careerOnly}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Planetary Positions */}
          {(reportType === 'all' || reportType === 'manglik') && (
            <div>
              <Label htmlFor="marshouse" className={cn(isHindi && 'font-hindi')}>{t.marsHouse}<span className="ml-1 text-[10px] text-muted-foreground font-normal">({t.optional})</span></Label>
              <Select value={marsHouse} onValueChange={setMarsHouse}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={t.marsPh} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>{t.house(i + 1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(reportType === 'all' || reportType === 'sadesati') && (
            <div>
              <Label htmlFor="saturnposition" className={cn(isHindi && 'font-hindi')}>{t.saturnPos}<span className="ml-1 text-[10px] text-muted-foreground font-normal">({t.optional})</span></Label>
              <Select value={saturnPosition} onValueChange={setSaturnPosition}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={t.saturnPh} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>{t.house(i + 1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(reportType === 'all' || reportType === 'kaalsarp') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rahuhouse" className={cn(isHindi && 'font-hindi')}>{t.rahuHouse}<span className="ml-1 text-[10px] text-muted-foreground font-normal">({t.optional})</span></Label>
                <Select value={rahuHouse} onValueChange={setRahuHouse}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={t.rahuPh} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>{t.house(i + 1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ketuhouse" className={cn(isHindi && 'font-hindi')}>{t.ketuHouse}<span className="ml-1 text-[10px] text-muted-foreground font-normal">({t.optional})</span></Label>
                <Select value={ketuHouse} onValueChange={setKetuHouse}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={t.ketuPh} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>{t.house(i + 1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button
            onClick={() => void handleGenerateReports()}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            <Sparkles className="h-4 w-4 mr-2" aria-hidden />
            {loading ? t.generating : t.generate}
          </Button>
        </div>
      </div>

      <ChartEmptyState
        icon={<Sparkles className="h-8 w-8" />}
        title={t.emptyTitle}
        description={t.emptyDesc}
      />
    </div>
  );
};
