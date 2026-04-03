/**
 * Compatibility Report Component
 * Displays Ashtakuta compatibility results for marriage matching
 */

import { Heart, Users, Star, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompatibilityReport, AshtakutaResult } from '@/services/ashtakutaService';

interface CompatibilityReportProps {
  report: CompatibilityReport;
  malePartner: { name: string; dateOfBirth: string };
  femalePartner: { name: string; dateOfBirth: string };
  lang?: 'en' | 'hi';
  className?: string;
}

export const CompatibilityReportComponent = ({
  report,
  malePartner,
  femalePartner,
  lang = 'en',
  className
}: CompatibilityReportProps) => {
  const isHi = lang === 'hi';

  const labels = {
    en: {
      title: 'Kundali Milan Report',
      subtitle: 'Marriage Compatibility Analysis',
      partners: 'Partners',
      male: 'Male',
      female: 'Female',
      overallScore: 'Overall Compatibility',
      points: 'Points',
      outOf: 'out of',
      categories: 'Ashtakuta Categories',
      recommendations: 'Recommendations',
      excellent: 'Excellent',
      good: 'Good',
      average: 'Average',
      poor: 'Poor',
      note: 'Note: This is Week 9 implementation covering 5 out of 8 Ashtakuta categories (15/36 points). Complete system will be available in Week 10.',
    },
    hi: {
      title: 'कुंडली मिलान रिपोर्ट',
      subtitle: 'विवाह अनुकूलता विश्लेषण',
      partners: 'जोड़ीदार',
      male: 'पुरुष',
      female: 'स्त्री',
      overallScore: 'समग्र अनुकूलता',
      points: 'अंक',
      outOf: 'में से',
      categories: 'अष्टकूट श्रेणियां',
      recommendations: 'सिफारिशें',
      excellent: 'उत्कृष्ट',
      good: 'अच्छा',
      average: 'औसत',
      poor: 'खराब',
      note: 'नोट: यह सप्ताह 9 का कार्यान्वयन है जो 8 में से 5 अष्टकूट श्रेणियों को कवर करता है (36 में से 15 अंक)। पूर्ण प्रणाली सप्ताह 10 में उपलब्ध होगी।',
    }
  };

  const t = labels[lang];

  // Get compatibility color
  const getCompatibilityColor = (compatibility: string) => {
    switch (compatibility) {
      case 'Excellent': return 'text-green-700 bg-green-50 border-green-200';
      case 'Good': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Average': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'Poor': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  // Get compatibility icon
  const getCompatibilityIcon = (compatibility: string) => {
    switch (compatibility) {
      case 'Excellent': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Good': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'Average': return <Star className="h-5 w-5 text-yellow-600" />;
      case 'Poor': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Star className="h-5 w-5 text-gray-600" />;
    }
  };

  // Get progress bar color
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-600';
    if (percentage >= 60) return 'bg-blue-600';
    if (percentage >= 40) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className={cn('bg-card border border-border rounded-xl p-6 shadow-sm space-y-6', className)}>
      {/* Header */}
      <div className="text-center border-b border-border pb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Heart className="h-6 w-6 text-red-500" />
          <h2 className={cn('text-2xl font-bold text-primary', isHi && 'font-hindi')}>
            {t.title}
          </h2>
          <Heart className="h-6 w-6 text-red-500" />
        </div>
        <p className={cn('text-muted-foreground', isHi && 'font-hindi')}>
          {t.subtitle}
        </p>
      </div>

      {/* Partners Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className={cn('text-sm font-medium text-blue-700', isHi && 'font-hindi')}>
              {t.male}
            </span>
          </div>
          <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            {malePartner.name}
          </div>
          <div className="text-sm text-blue-700">
            {malePartner.dateOfBirth}
          </div>
        </div>

        <div className="bg-pink-50 dark:bg-pink-950/20 rounded-lg p-4 border border-pink-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-pink-600" />
            <span className={cn('text-sm font-medium text-pink-700', isHi && 'font-hindi')}>
              {t.female}
            </span>
          </div>
          <div className="text-lg font-semibold text-pink-900 dark:text-pink-100">
            {femalePartner.name}
          </div>
          <div className="text-sm text-pink-700">
            {femalePartner.dateOfBirth}
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-muted/30 rounded-lg p-6">
        <div className="text-center mb-4">
          <h3 className={cn('text-xl font-bold mb-2', isHi && 'font-hindi')}>
            {t.overallScore}
          </h3>
          <div className="flex items-center justify-center gap-2 mb-3">
            {getCompatibilityIcon(report.overallCompatibility)}
            <span className={cn(
              'text-2xl font-bold px-3 py-1 rounded border',
              getCompatibilityColor(report.overallCompatibility)
            )}>
              {isHi ? (
                report.overallCompatibility === 'Excellent' ? t.excellent :
                report.overallCompatibility === 'Good' ? t.good :
                report.overallCompatibility === 'Average' ? t.average : t.poor
              ) : report.overallCompatibility}
            </span>
          </div>
          <div className="text-3xl font-bold text-primary mb-2">
            {report.totalPoints} {t.outOf} {report.maxPoints} {t.points}
          </div>
          <div className="text-lg text-muted-foreground">
            {report.percentage.toFixed(1)}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-3 mb-4">
          <div
            className={cn('h-3 rounded-full transition-all', getProgressColor(report.percentage))}
            style={{ width: `${report.percentage}%` }}
          />
        </div>
      </div>

      {/* Dosha Information */}
      {report.dosha?.present && (
        <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className={cn('font-semibold text-red-900 dark:text-red-100 mb-2', isHi && 'font-hindi')}>
                {isHi ? 'दोष चेतावनी' : 'Dosha Alert'}
              </h3>
              <p className={cn('text-sm text-red-800 dark:text-red-200 mb-3', isHi && 'font-hindi')}>
                {isHi 
                  ? `${report.dosha.type} का पता चला है। विवाह से पहले उपचारात्मक उपाय आवश्यक हैं।`
                  : `${report.dosha.type} detected. Remedial measures recommended before marriage.`
                }
              </p>
              
              {report.dosha.remedies.length > 0 && (
                <div>
                  <h4 className={cn('font-medium text-red-900 dark:text-red-100 mb-2', isHi && 'font-hindi')}>
                    {isHi ? 'सुझाए गए उपाय:' : 'Recommended Remedies:'}
                  </h4>
                  <ul className="space-y-1">
                    {report.dosha.remedies.slice(0, 3).map((remedy, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-red-800 dark:text-red-200">
                        <span className="text-red-600 mt-1">•</span>
                        <span>{remedy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-4">
        <h3 className={cn('text-lg font-bold', isHi && 'font-hindi')}>
          {t.categories}
        </h3>
        
        <div className="space-y-3">
          {report.categories.map((category, index) => (
            <div
              key={index}
              className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getCompatibilityIcon(category.compatibility)}
                  <span className="font-semibold">{category.category}</span>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded border',
                    getCompatibilityColor(category.compatibility)
                  )}>
                    {isHi ? (
                      category.compatibility === 'Excellent' ? t.excellent :
                      category.compatibility === 'Good' ? t.good :
                      category.compatibility === 'Average' ? t.average : t.poor
                    ) : category.compatibility}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    {category.points}/{category.maxPoints}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {category.percentage.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2 mb-3">
                <div
                  className={cn('h-2 rounded-full transition-all', getProgressColor(category.percentage))}
                  style={{ width: `${category.percentage}%` }}
                />
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground">
                {isHi ? category.description.hi : category.description.en}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        <h3 className={cn('text-lg font-bold', isHi && 'font-hindi')}>
          {t.recommendations}
        </h3>
        
        <div className="bg-muted/30 rounded-lg p-4">
          <ul className="space-y-2">
            {(isHi ? report.recommendations.hi : report.recommendations.en).map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Week 10 Completion Note */}
      <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200">
        <div className="flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
          <p className={cn('text-xs text-green-800 dark:text-green-200', isHi && 'font-hindi')}>
            {isHi 
              ? 'सप्ताह 10 पूर्ण: पूर्ण 36-अंक अष्टकूट कुंडली मिलान प्रणाली सभी 8 श्रेणियों के साथ कार्यान्वित। पारंपरिक वैदिक विवाह अनुकूलता विश्लेषण।'
              : 'Week 10 Complete: Full 36-point Ashtakuta Kundali Milan system implemented with all 8 categories. Traditional Vedic marriage compatibility analysis.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityReportComponent;