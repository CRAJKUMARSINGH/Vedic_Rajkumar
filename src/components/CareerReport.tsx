/**
 * Career Report Component
 * Displays comprehensive career astrology analysis
 */

import { Briefcase, TrendingUp, Star, Target, Clock, AlertCircle, CheckCircle, Plane, Coins, HeartPulse, Sparkles, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CareerAnalysis } from '@/services/careerAstrologyService';
import YogaCard from './YogaCard';
import DivisionalChartsCard from './DivisionalChartsCard';
import ComprehensiveRemediesCard from './ComprehensiveRemediesCard';

interface CareerReportProps {
  analysis: CareerAnalysis;
  userInfo: { name: string; dateOfBirth: string };
  lang?: 'en' | 'hi';
  className?: string;
}

export const CareerReportComponent = ({
  analysis,
  userInfo,
  lang = 'en',
  className
}: CareerReportProps) => {
  const isHi = lang === 'hi';

  const labels = {
    en: {
      title: 'Career Astrology Report',
      subtitle: 'Professional Guidance & Analysis',
      tenthHouse: '10th House Analysis',
      careerIndicators: 'Career Indicators',
      recommendedFields: 'Recommended Career Fields',
      careerStrength: 'Career Strength Analysis',
      timing: 'Career Timing',
      auspiciousPeriods: 'Raj_Auspicious Times (Career, Marriage, Wealth, Travel)',
      auspiciousPeriodsDesc: 'Detailed calculations for auspicious vs. inauspicious periods based on Lagna & Navamsha lords.',
      d1Analysis: 'D-1 (Lagna) 10th Lord',
      d9Analysis: 'D-9 (Navamsha) 10th Lord',
      auspiciousSigns: 'Auspicious Signs for Career',
      positiveTransits: 'Positive Changes: When radical Jupiter transits these signs, career establishment or promotion is highly likely.',
      negativeTransits: 'Negative Changes: When radical Saturn transits these signs, expect career challenges or struggles.',
      recommendations: 'Professional Recommendations',
      primary: 'Primary Fields',
      secondary: 'Secondary Options',
      avoid: 'Fields to Avoid',
      overall: 'Overall',
      government: 'Government',
      business: 'Business',
      service: 'Service',
      creative: 'Creative',
      excellent: 'Excellent',
      good: 'Good',
      average: 'Average',
      weak: 'Weak',
      house: 'House',
      rashi: 'Rashi',
      lord: 'Lord',
      strength: 'Strength',
      planetsIn10th: 'Planets in 10th House',
      currentPeriod: 'Current Period',
      favorablePeriods: 'Favorable Periods',
      challengingPeriods: 'Challenging Periods',
      advancedYogaTitle: 'Advanced Yoga Analysis',
      advancedYogaDesc: 'Detection of 100+ Yogas including Moon-based, Sun-based, Raj, and Dhana Yogas.',
      vargaDignityTitle: 'Varga Dignity & Strength',
      vargaDignityDesc: 'Planetary strength and special titles based on Shodashvarga (16 Divisional Charts).',
      remediesTitle: 'Comprehensive Remedies',
      remediesDesc: 'Personalized gemstone, yantra, rudraksha, mantra, and ritual recommendations.'
    },
    hi: {
      title: 'करियर ज्योतिष रिपोर्ट',
      subtitle: 'व्यावसायिक मार्गदर्शन और विश्लेषण',
      tenthHouse: '10वां भाव विश्लेषण',
      careerIndicators: 'करियर संकेतक',
      recommendedFields: 'सुझाए गए करियर क्षेत्र',
      careerStrength: 'करियर शक्ति विश्लेषण',
      timing: 'करियर समय',
      auspiciousPeriods: 'राज_शुभ समय (Raj_Auspicious Times - करियर, धन, विवाह, यात्रा)',
      auspiciousPeriodsDesc: 'लग्न और नवमांश के स्वामियों के आधार पर शुभ और अशुभ समय की गणना।',
      d1Analysis: 'D-1 (लग्न) 10वें भाव का स्वामी',
      d9Analysis: 'D-9 (नवमांश) 10वें भाव का स्वामी',
      auspiciousSigns: 'करियर के लिए शुभ राशियाँ',
      positiveTransits: 'सकारात्मक परिवर्तन: जब देवगुरु बृहस्पति इन राशियों में गोचर करेंगे, तो आपको नौकरी/पदोन्नति मिलने की संभावना होगी।',
      negativeTransits: 'नकारात्मक परिवर्तन: जब शनि इन राशियों में गोचर करेंगे, तो आपको करियर में चुनौतियों का सामना करना पड़ सकता है।',
      recommendations: 'व्यावसायिक सिफारिशें',
      primary: 'प्राथमिक क्षेत्र',
      secondary: 'द्वितीयक विकल्प',
      avoid: 'बचने योग्य क्षेत्र',
      overall: 'समग्र',
      government: 'सरकारी',
      business: 'व्यापार',
      service: 'सेवा',
      creative: 'रचनात्मक',
      excellent: 'उत्कृष्ट',
      good: 'अच्छा',
      average: 'औसत',
      weak: 'कमजोर',
      house: 'भाव',
      rashi: 'राशि',
      lord: 'स्वामी',
      strength: 'शक्ति',
      planetsIn10th: '10वें भाव में ग्रह',
      currentPeriod: 'वर्तमान काल',
      favorablePeriods: 'अनुकूल काल',
      challengingPeriods: 'चुनौतीपूर्ण काल',
      advancedYogaTitle: 'उन्नत योग विश्लेषण',
      advancedYogaDesc: 'चंद्र-आधारित, सूर्य-आधारित, राज और धन योगों सहित 100+ योगों की पहचान।',
      vargaDignityTitle: 'वर्ग गरिमा और शक्ति',
      vargaDignityDesc: 'षोडशवर्ग (16 विभागीय चार्ट) के आधार पर ग्रहों की शक्ति और विशेष उपाधियाँ।',
      remediesTitle: 'व्यापक उपाय',
      remediesDesc: 'व्यक्तिगत रत्न, यंत्र, रुद्राक्ष, मंत्र और अनुष्ठान सिफारिशें।'
    }
  };

  const t = labels[lang];

  // Get strength color
  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Excellent': return 'text-green-700 bg-green-50 border-green-200';
      case 'Good': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Average': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'Weak': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  // Get strength icon
  const getStrengthIcon = (strength: string) => {
    switch (strength) {
      case 'Excellent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Good': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'Average': return <Star className="h-4 w-4 text-yellow-600" />;
      case 'Weak': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Star className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get progress bar color
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-600';
    if (percentage >= 60) return 'bg-blue-600';
    if (percentage >= 40) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('career')) return <Briefcase className="h-4 w-4 text-blue-500" />;
    if (cat.includes('marriage')) return <HeartPulse className="h-4 w-4 text-pink-500" />;
    if (cat.includes('property')) return <Target className="h-4 w-4 text-orange-500" />;
    if (cat.includes('travel')) return <Plane className="h-4 w-4 text-indigo-500" />;
    if (cat.includes('wealth')) return <Coins className="h-4 w-4 text-yellow-500" />;
    if (cat.includes('health')) return <HeartPulse className="h-4 w-4 text-green-500" />;
    return <Star className="h-4 w-4 text-indigo-500" />;
  };

  const getAuspiciousSignsLabel = (category: string) => {
    if (isHi) {
      return `${category} के लिए शुभ राशियाँ`;
    }
    return `Auspicious Signs for ${category}`;
  };

  const getPositiveDesc = (category: string) => {
    if (isHi) {
      return `जब गुरू इन राशियों में गोचर करेंगे, तो ${category} में सकारात्मक बदलाव आने की प्रबल संभावना है।`;
    }
    return `When radical Jupiter transits these signs, positive changes regarding ${category} are highly likely.`;
  };

  const getNegativeDesc = (category: string) => {
    if (isHi) {
      return `जब शनि इन राशियों में गोचर करेंगे, तो ${category} में चुनौतियों या संघर्ष की अपेक्षा करें।`;
    }
    return `When radical Saturn transits these signs, expect challenges or struggles regarding ${category}.`;
  };

  const RASHI_NAMES_EN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const RASHI_NAMES_HI = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];
  const rNames = isHi ? RASHI_NAMES_HI : RASHI_NAMES_EN;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(isHi ? 'hi-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={cn('bg-card border border-border rounded-xl p-6 shadow-sm space-y-6', className)}>
      {/* Header */}
      <div className="text-center border-b border-border pb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Briefcase className="h-6 w-6 text-blue-500" />
          <h2 className={cn('text-2xl font-bold text-primary', isHi && 'font-hindi')}>
            {t.title}
          </h2>
          <Briefcase className="h-6 w-6 text-blue-500" />
        </div>
        <p className={cn('text-muted-foreground', isHi && 'font-hindi')}>
          {t.subtitle}
        </p>
        <div className="mt-2 text-sm text-muted-foreground">
          {userInfo.name} • {userInfo.dateOfBirth}
        </div>
      </div>
      {/* 10th House Analysis */}
      <div className="space-y-4">
        <h3 className={cn('text-lg font-bold flex items-center gap-2', isHi && 'font-hindi')}>
          <Target className="h-5 w-5 text-blue-600" />
          {t.tenthHouse}
        </h3>
        
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={cn('text-sm font-medium', isHi && 'font-hindi')}>
                  {t.rashi}:
                </span>
                <span className="font-semibold">{analysis.tenthHouse.rashiName}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className={cn('text-sm font-medium', isHi && 'font-hindi')}>
                  {t.lord}:
                </span>
                <span className="font-semibold">{analysis.tenthHouse.lord}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn('text-sm font-medium', isHi && 'font-hindi')}>
                  {t.strength}:
                </span>
                <div className={cn('flex items-center gap-1 px-2 py-1 rounded border text-xs', 
                  getStrengthColor(analysis.tenthHouse.strength))}>
                  {getStrengthIcon(analysis.tenthHouse.strength)}
                  <span>{isHi ? (
                    analysis.tenthHouse.strength === 'Excellent' ? t.excellent :
                    analysis.tenthHouse.strength === 'Good' ? t.good :
                    analysis.tenthHouse.strength === 'Average' ? t.average : t.weak
                  ) : analysis.tenthHouse.strength}</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="mb-2">
                <span className={cn('text-sm font-medium', isHi && 'font-hindi')}>
                  {t.planetsIn10th}:
                </span>
                <div className="mt-1">
                  {analysis.tenthHouse.planetsIn10th.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {analysis.tenthHouse.planetsIn10th.map((planet, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {planet}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {isHi ? 'कोई ग्रह नहीं' : 'No planets'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Career Strength Analysis */}
      <div className="space-y-4">
        <h3 className={cn('text-lg font-bold flex items-center gap-2', isHi && 'font-hindi')}>
          <TrendingUp className="h-5 w-5 text-green-600" />
          {t.careerStrength}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'overall', label: t.overall, value: analysis.careerStrength.overall },
            { key: 'government', label: t.government, value: analysis.careerStrength.government },
            { key: 'business', label: t.business, value: analysis.careerStrength.business },
            { key: 'service', label: t.service, value: analysis.careerStrength.service },
            { key: 'creative', label: t.creative, value: analysis.careerStrength.creative }
          ].map((item) => (
            <div key={item.key} className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className={cn('text-sm font-medium', isHi && 'font-hindi')}>
                  {item.label}
                </span>
                <span className="text-sm font-bold">{item.value}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={cn('h-2 rounded-full transition-all', getProgressColor(item.value))}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Career Indicators */}
      <div className="space-y-4">
        <h3 className={cn('text-lg font-bold flex items-center gap-2', isHi && 'font-hindi')}>
          <Star className="h-5 w-5 text-yellow-600" />
          {t.careerIndicators}
        </h3>
        
        <div className="space-y-3">
          {analysis.careerIndicators.map((indicator, index) => (
            <div key={index} className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{indicator.planet}</span>
                  <div className={cn('flex items-center gap-1 px-2 py-1 rounded border text-xs',
                    getStrengthColor(indicator.strength))}>
                    {getStrengthIcon(indicator.strength)}
                    <span>{isHi ? (
                      indicator.strength === 'Excellent' ? t.excellent :
                      indicator.strength === 'Good' ? t.good :
                      indicator.strength === 'Average' ? t.average : t.weak
                    ) : indicator.strength}</span>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div>{t.house} {indicator.position.house}</div>
                  <div className="text-muted-foreground">{indicator.position.degrees.toFixed(1)}°</div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {indicator.significance}
              </p>
              
              <div className="flex flex-wrap gap-1">
                {indicator.careerFields.slice(0, 4).map((field, fieldIndex) => (
                  <span key={fieldIndex} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Career Fields */}
      <div className="space-y-4">
        <h3 className={cn('text-lg font-bold flex items-center gap-2', isHi && 'font-hindi')}>
          <Target className="h-5 w-5 text-purple-600" />
          {t.recommendedFields}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200">
            <h4 className={cn('font-semibold text-green-900 dark:text-green-100 mb-2', isHi && 'font-hindi')}>
              {t.primary}
            </h4>
            <div className="space-y-1">
              {analysis.recommendedFields.primary.map((field, index) => (
                <div key={index} className="text-sm text-green-800 dark:text-green-200">
                  • {field}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200">
            <h4 className={cn('font-semibold text-blue-900 dark:text-blue-100 mb-2', isHi && 'font-hindi')}>
              {t.secondary}
            </h4>
            <div className="space-y-1">
              {analysis.recommendedFields.secondary.map((field, index) => (
                <div key={index} className="text-sm text-blue-800 dark:text-blue-200">
                  • {field}
                </div>
              ))}
            </div>
          </div>
          
          {analysis.recommendedFields.avoid.length > 0 && (
            <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200">
              <h4 className={cn('font-semibold text-red-900 dark:text-red-100 mb-2', isHi && 'font-hindi')}>
                {t.avoid}
              </h4>
              <div className="space-y-1">
                {analysis.recommendedFields.avoid.map((field, index) => (
                  <div key={index} className="text-sm text-red-800 dark:text-red-200">
                    • {field}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Career Timing */}
      <div className="space-y-4">
        <h3 className={cn('text-lg font-bold flex items-center gap-2', isHi && 'font-hindi')}>
          <Clock className="h-5 w-5 text-orange-600" />
          {t.timing}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className={cn('font-semibold mb-2', isHi && 'font-hindi')}>
              {t.currentPeriod}
            </h4>
            <p className="text-sm text-muted-foreground">
              {analysis.timing.currentPeriod}
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200">
            <h4 className={cn('font-semibold text-green-900 dark:text-green-100 mb-2', isHi && 'font-hindi')}>
              {t.favorablePeriods}
            </h4>
            <div className="space-y-1">
              {analysis.timing.favorablePeriods.map((period, index) => (
                <div key={index} className="text-sm text-green-800 dark:text-green-200">
                  • {period}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 border border-yellow-200">
            <h4 className={cn('font-semibold text-yellow-900 dark:text-yellow-100 mb-2', isHi && 'font-hindi')}>
              {t.challengingPeriods}
            </h4>
            <div className="space-y-1">
              {analysis.timing.challengingPeriods.map((period, index) => (
                <div key={index} className="text-sm text-yellow-800 dark:text-yellow-200">
                  • {period}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Auspicious Timings Analysis (Multiple categories) */}
      <div className="space-y-6">
        <div className="mb-2">
          <h3 className={cn('text-lg font-bold flex items-center gap-2', isHi && 'font-hindi')}>
            <Star className="h-5 w-5 text-indigo-600" />
            {t.auspiciousPeriods}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t.auspiciousPeriodsDesc}
          </p>
        </div>
        
        {Object.values(analysis.auspiciousTimings || {}).map((timing, tIndex) => (
          <div key={tIndex} className="bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-5 border border-indigo-200">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-4 border-b border-indigo-200 pb-2 flex items-center gap-2">
              {getCategoryIcon(timing.category)}
              {timing.category} Timing
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-card rounded shadow-sm p-4 border border-indigo-100 dark:border-indigo-800">
                <h5 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">D-1 (Lagna) {isHi ? 'भाव स्वामी' : 'House Lord'}</h5>
                <p className="text-sm text-muted-foreground mb-2">
                  {t.lord}: {timing.d1Lord} in {rNames[timing.d1LordRashiD1]}
                </p>
                <div className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
                  Trikonas: {timing.d1Trikonas.map((r: number) => rNames[r]).join(', ')}
                </div>
              </div>

              <div className="bg-white dark:bg-card rounded shadow-sm p-4 border border-indigo-100 dark:border-indigo-800">
                <h5 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">{timing.vargaName} {isHi ? 'भाव स्वामी' : 'House Lord'}</h5>
                <p className="text-sm text-muted-foreground mb-2">
                  {t.lord}: {timing.vargaLord} in {rNames[timing.vargaLordRashiDV]}
                </p>
                <div className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
                  Trikonas: {timing.vargaTrikonas.map((r: number) => rNames[r]).join(', ')}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-card rounded shadow-sm p-4 border border-indigo-100 dark:border-indigo-800">
               <h5 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-3">{getAuspiciousSignsLabel(timing.category)}</h5>
               <div className="flex flex-wrap gap-2 mb-4">
                 {timing.auspiciousSigns.map((rashiIndex: number) => (
                   <span key={rashiIndex} className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-100 rounded-full text-sm font-medium">
                     {rNames[rashiIndex]}
                   </span>
                 ))}
               </div>
               
               <div className="space-y-3 mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-800/50">
                 <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                   <CheckCircle className="inline-block h-4 w-4 mr-1 pb-0.5" />
                   {getPositiveDesc(timing.category)}
                 </p>
                 {timing.upcomingTransits?.filter((t: any) => t.type === 'Positive').length > 0 && (
                   <ul className="pl-6 space-y-1 mt-1 mb-3">
                     {timing.upcomingTransits.filter((t: any) => t.type === 'Positive').map((tr: any, idx: number) => (
                       <li key={idx} className="text-xs text-green-800 dark:text-green-300">
                         • {tr.planet} in {rNames[tr.rashi]}: <span className="font-semibold">{formatDate(tr.startDate)} - {formatDate(tr.endDate)}</span>
                       </li>
                     ))}
                   </ul>
                 )}

                 <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                   <AlertCircle className="inline-block h-4 w-4 mr-1 pb-0.5" />
                   {getNegativeDesc(timing.category)}
                 </p>
                 {timing.upcomingTransits?.filter((t: any) => t.type === 'Negative').length > 0 && (
                   <ul className="pl-6 space-y-1 mt-1">
                     {timing.upcomingTransits.filter((t: any) => t.type === 'Negative').map((tr: any, idx: number) => (
                       <li key={idx} className="text-xs text-red-800 dark:text-red-300">
                         • {tr.planet} in {rNames[tr.rashi]}: <span className="font-semibold">{formatDate(tr.startDate)} - {formatDate(tr.endDate)}</span>
                       </li>
                     ))}
                   </ul>
                 )}
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Yoga Analysis Section */}
      <div className="pt-6 border-t border-border space-y-4">
        <div className="mb-2">
          <h3 className={cn('text-xl font-bold flex items-center gap-2', isHi && 'font-hindi')}>
            <Sparkles className="h-6 w-6 text-yellow-500" />
            {t.advancedYogaTitle}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t.advancedYogaDesc}
          </p>
        </div>
        
        <YogaCard 
          planets={analysis.planetaryPositions.map((p: any) => ({
            name: p.name,
            rashiIndex: p.rashiIndex,
            house: p.house,
            degrees: p.degrees,
            isRetrograde: p.retrograde || false
          }))}
          ascendantRashi={analysis.ascendantRashi}
          lang={lang}
        />
      </div>

      {/* Varga Dignity Section */}
      <div className="pt-6 border-t border-border space-y-4">
        <div className="mb-2">
          <h3 className={cn('text-xl font-bold flex items-center gap-2', isHi && 'font-hindi')}>
            <LayoutGrid className="h-6 w-6 text-blue-500" />
            {t.vargaDignityTitle}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t.vargaDignityDesc}
          </p>
        </div>
        
        <DivisionalChartsCard 
          planetLongitudes={Object.fromEntries(analysis.planetaryPositions.map((p: any) => [p.name, p.rashiIndex * 30 + p.degrees]))}
          ascendantLongitude={analysis.ascendantRashi * 30} // Rough approximation for D-charts if not precise
          lang={lang}
        />
      </div>

      {/* Comprehensive Remedies Section */}
      <div className="pt-6 border-t border-border space-y-4">
        <div className="mb-2">
          <h3 className={cn('text-xl font-bold flex items-center gap-2', isHi && 'font-hindi')}>
            <Sparkles className="h-6 w-6 text-pink-500" />
            {t.remediesTitle}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t.remediesDesc}
          </p>
        </div>
        
        <ComprehensiveRemediesCard 
          ascendantRashi={analysis.ascendantRashi}
          planetaryPositions={analysis.planetaryPositions}
          birthDate={userInfo.dateOfBirth}
          doshas={analysis.doshas || []}
          lang={lang}
        />
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        <h3 className={cn('text-lg font-bold flex items-center gap-2', isHi && 'font-hindi')}>
          <CheckCircle className="h-5 w-5 text-green-600" />
          {t.recommendations}
        </h3>
        
        <div className="bg-muted/30 rounded-lg p-4">
          <ul className="space-y-2">
            {(isHi ? analysis.recommendations.hi : analysis.recommendations.en).map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CareerReportComponent;