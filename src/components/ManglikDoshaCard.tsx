/**
 * Manglik Dosha Card Component
 * Displays Manglik Dosha analysis with severity, cancellations, and remedies
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { ManglikResult } from '@/services/manglikService';

interface ManglikDoshaCardProps {
  result: ManglikResult;
  lang: 'en' | 'hi';
}

const ManglikDoshaCard = ({ result, lang }: ManglikDoshaCardProps) => {
  const [showCancellations, setShowCancellations] = useState(false);
  const [showRemedies, setShowRemedies] = useState(false);
  const isHi = lang === 'hi';

  // Severity color mapping
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Severe': return 'bg-red-600 text-white';
      case 'High': return 'bg-orange-600 text-white';
      case 'Medium': return 'bg-yellow-600 text-white';
      case 'Low': return 'bg-blue-600 text-white';
      default: return 'bg-green-600 text-white';
    }
  };

  const getSeverityLabel = (severity: string) => {
    if (!isHi) return severity;
    switch (severity) {
      case 'Severe': return 'अत्यधिक';
      case 'High': return 'उच्च';
      case 'Medium': return 'मध्यम';
      case 'Low': return 'निम्न';
      default: return 'कोई नहीं';
    }
  };

  const activeCancellations = result.cancellations.filter(c => c.applies);
  const inactiveCancellations = result.cancellations.filter(c => !c.applies);

  return (
    <Card className={`max-w-2xl mx-auto ${result.effectiveManglik ? 'border-orange-500 border-2' : 'border-green-500'}`}>
      <CardHeader className={result.effectiveManglik ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-green-50 dark:bg-green-950/20'}>
        <CardTitle className={`flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
          {result.effectiveManglik ? (
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          )}
          {isHi ? 'मांगलिक दोष विश्लेषण' : 'Manglik Dosha Analysis'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Status Summary */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'स्थिति:' : 'Status:'}
            </span>
            <Badge className={result.effectiveManglik ? 'bg-orange-600' : 'bg-green-600'}>
              {result.effectiveManglik 
                ? (isHi ? 'मांगलिक' : 'Manglik')
                : (isHi ? 'मांगलिक नहीं' : 'Not Manglik')
              }
            </Badge>
          </div>
          
          {result.isManglik && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'तीव्रता:' : 'Severity:'}
              </span>
              <Badge className={getSeverityColor(result.severity)}>
                {getSeverityLabel(result.severity)}
              </Badge>
            </div>
          )}
        </div>

        {/* Mars Position */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-600 font-bold">♂</span>
            <span className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'मंगल स्थिति:' : 'Mars Position:'}
            </span>
            <span className={isHi ? 'font-hindi' : ''}>
              {isHi ? `${result.marsHouse}वां भाव` : `${result.marsHouse}${result.marsHouse === 1 ? 'st' : result.marsHouse === 2 ? 'nd' : result.marsHouse === 3 ? 'rd' : 'th'} House`}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className={isHi ? 'font-hindi' : ''}>{result.marsRashi}</span>
          </div>
        </div>

        {/* Description */}
        <p className={`text-sm leading-relaxed ${isHi ? 'font-hindi' : ''}`}>
          {isHi ? result.description.hi : result.description.en}
        </p>

        {/* Cancellations Section */}
        {result.isManglik && result.cancellations.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setShowCancellations(!showCancellations)}
              className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <span className={`font-semibold text-sm ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? `निवारण स्थितियां (${activeCancellations.length}/${result.cancellations.length} सक्रिय)` : `Cancellation Conditions (${activeCancellations.length}/${result.cancellations.length} Active)`}
              </span>
              {showCancellations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showCancellations && (
              <div className="p-3 space-y-2">
                {/* Active Cancellations */}
                {activeCancellations.length > 0 && (
                  <div className="space-y-2">
                    <p className={`text-xs font-semibold text-green-700 dark:text-green-400 ${isHi ? 'font-hindi' : ''}`}>
                      {isHi ? '✓ सक्रिय निवारण:' : '✓ Active Cancellations:'}
                    </p>
                    {activeCancellations.map((cancellation, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm bg-green-50 dark:bg-green-950/20 p-2 rounded">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-green-900 dark:text-green-100">
                            {cancellation.rule}
                          </p>
                          <p className={`text-xs text-green-800 dark:text-green-200 mt-1 ${isHi ? 'font-hindi' : ''}`}>
                            {isHi ? cancellation.description.hi : cancellation.description.en}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inactive Cancellations */}
                {inactiveCancellations.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className={`text-xs font-semibold text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                      {isHi ? '✗ निष्क्रिय निवारण:' : '✗ Inactive Cancellations:'}
                    </p>
                    {inactiveCancellations.map((cancellation, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm bg-muted/30 p-2 rounded opacity-60">
                        <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-muted-foreground">
                            {cancellation.rule}
                          </p>
                          <p className={`text-xs text-muted-foreground mt-1 ${isHi ? 'font-hindi' : ''}`}>
                            {isHi ? cancellation.description.hi : cancellation.description.en}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Remedies Section */}
        {result.effectiveManglik && result.remedies.en.length > 0 && (
          <div className="border border-orange-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowRemedies(!showRemedies)}
              className="w-full flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors"
            >
              <span className={`font-semibold text-sm text-orange-900 dark:text-orange-100 ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? '🕉️ उपाय देखें' : '🕉️ View Remedies'}
              </span>
              {showRemedies ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showRemedies && (
              <div className="p-3 bg-orange-50/50 dark:bg-orange-950/10">
                <ul className={`space-y-2 text-sm ${isHi ? 'font-hindi' : ''}`}>
                  {(isHi ? result.remedies.hi : result.remedies.en).map((remedy, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-600 mt-0.5">•</span>
                      <span className="flex-1">{remedy}</span>
                    </li>
                  ))}
                </ul>
                <p className={`text-xs text-orange-700 dark:text-orange-300 mt-3 italic ${isHi ? 'font-hindi' : ''}`}>
                  {isHi 
                    ? '⚠️ नोट: उपाय करने से पहले किसी योग्य ज्योतिषी से परामर्श लें।'
                    : '⚠️ Note: Consult a qualified astrologer before performing remedies.'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Success Message for Non-Manglik */}
        {!result.effectiveManglik && result.isManglik && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-300 rounded-lg p-3">
            <p className={`text-sm text-green-800 dark:text-green-200 ${isHi ? 'font-hindi' : ''}`}>
              {isHi 
                ? '✓ मजबूत निवारण स्थितियों के कारण मांगलिक दोष प्रभावी रूप से निष्प्रभावी है। विवाह के लिए कोई विशेष चिंता नहीं।'
                : '✓ Manglik Dosha is effectively nullified due to strong cancellation conditions. No special concerns for marriage.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManglikDoshaCard;
