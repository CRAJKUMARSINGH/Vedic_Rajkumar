/**
 * Horoscope Card Component - Advanced Prediction Display
 * Week 11: AstroSage Feature Integration - Part 1
 * 
 * Displays comprehensive horoscope predictions with multiple categories
 * Supports daily, weekly, monthly, yearly predictions
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  generateComprehensiveHoroscope, 
  generateHoroscope,
  type HoroscopePeriod, 
  type HoroscopeCategory,
  type ComprehensiveHoroscope 
} from '@/services/horoscopeService';
import { Calendar, Heart, Briefcase, Activity, DollarSign, Star, Palette, Hash } from 'lucide-react';

interface HoroscopeCardProps {
  birthDate: string;
  lang: 'en' | 'hi';
  className?: string;
}

// Category icons and colors
const CATEGORY_CONFIG = {
  general: { icon: Star, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  love: { icon: Heart, color: 'text-red-600', bgColor: 'bg-red-50' },
  career: { icon: Briefcase, color: 'text-green-600', bgColor: 'bg-green-50' },
  health: { icon: Activity, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  finance: { icon: DollarSign, color: 'text-purple-600', bgColor: 'bg-purple-50' }
};

const HoroscopeCard: React.FC<HoroscopeCardProps> = ({
  birthDate,
  lang,
  className = ''
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<HoroscopePeriod>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expandedCategory, setExpandedCategory] = useState<HoroscopeCategory | null>(null);

  const isHi = lang === 'hi';

  // Generate comprehensive horoscope
  const horoscope = useMemo(() => {
    try {
      return generateComprehensiveHoroscope(birthDate, selectedPeriod, selectedDate);
    } catch (error) {
      console.error('Error generating horoscope:', error);
      return null;
    }
  }, [birthDate, selectedPeriod, selectedDate]);

  if (!horoscope) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            {isHi ? 'राशिफल गणना में त्रुटि' : 'Error generating horoscope'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 7) return 'bg-green-100';
    if (score >= 4) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const formatPeriodLabel = (period: HoroscopePeriod) => {
    const labels = {
      daily: { en: 'Daily', hi: 'दैनिक' },
      weekly: { en: 'Weekly', hi: 'साप्ताहिक' },
      monthly: { en: 'Monthly', hi: 'मासिक' },
      yearly: { en: 'Yearly', hi: 'वार्षिक' }
    };
    return isHi ? labels[period].hi : labels[period].en;
  };

  const formatCategoryLabel = (category: HoroscopeCategory) => {
    const labels = {
      general: { en: 'General', hi: 'सामान्य' },
      love: { en: 'Love', hi: 'प्रेम' },
      career: { en: 'Career', hi: 'करियर' },
      health: { en: 'Health', hi: 'स्वास्थ्य' },
      finance: { en: 'Finance', hi: 'वित्त' }
    };
    return isHi ? labels[category].hi : labels[category].en;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg font-semibold ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'आज का राशिफल' : 'Today\'s Horoscope'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            />
          </div>
        </div>
        
        {/* Period Selection */}
        <div className="flex gap-2 mt-2">
          {(['daily', 'weekly', 'monthly', 'yearly'] as HoroscopePeriod[]).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={isHi ? 'font-hindi' : ''}
            >
              {formatPeriodLabel(period)}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Overall Summary */}
        <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'समग्र स्कोर' : 'Overall Score'}
            </h3>
            <Badge 
              className={`${getScoreColor(horoscope.overall.score)} ${getScoreBgColor(horoscope.overall.score)}`}
            >
              {horoscope.overall.score}/9
            </Badge>
          </div>
          <Progress value={(horoscope.overall.score / 9) * 100} className="mb-2" />
          <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? horoscope.overall.summaryHi : horoscope.overall.summary}
          </p>
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {Object.keys(CATEGORY_CONFIG).map((category) => {
              const config = CATEGORY_CONFIG[category as HoroscopeCategory];
              const Icon = config.icon;
              return (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="flex items-center gap-1"
                >
                  <Icon className="h-3 w-3" />
                  <span className={`text-xs ${isHi ? 'font-hindi' : ''}`}>
                    {formatCategoryLabel(category as HoroscopeCategory)}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(horoscope).map(([category, prediction]) => {
            if (category === 'overall') return null;
            
            const config = CATEGORY_CONFIG[category as HoroscopeCategory];
            const Icon = config.icon;
            
            return (
              <TabsContent key={category} value={category} className="mt-4">
                <Card>
                  <CardHeader className={`${config.bgColor} border-b`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${config.color}`} />
                        <CardTitle className={`text-base ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? prediction.titleHi : prediction.title}
                        </CardTitle>
                      </div>
                      <Badge className={`${getScoreColor(prediction.score)} ${getScoreBgColor(prediction.score)}`}>
                        {prediction.score}/9
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 space-y-4">
                    {/* Moon Sign Info */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={isHi ? 'font-hindi' : ''}>
                        {isHi ? 'चंद्र राशि:' : 'Moon Sign:'}
                      </span>
                      <Badge variant="outline">
                        {isHi ? prediction.moonSignNameHi : prediction.moonSignName}
                      </Badge>
                    </div>
                    
                    {/* Prediction Text */}
                    <div>
                      <p className={`text-sm leading-relaxed ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? prediction.predictionHi : prediction.prediction}
                      </p>
                    </div>
                    
                    {/* Lucky Numbers and Colors */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className={`text-sm font-medium ${isHi ? 'font-hindi' : ''}`}>
                            {isHi ? 'भाग्यशाली संख्या' : 'Lucky Numbers'}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {prediction.luckyNumbers.map((num) => (
                            <Badge key={num} variant="secondary" className="text-xs">
                              {num}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Palette className="h-4 w-4 text-muted-foreground" />
                          <span className={`text-sm font-medium ${isHi ? 'font-hindi' : ''}`}>
                            {isHi ? 'भाग्यशाली रंग' : 'Lucky Colors'}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {(isHi ? prediction.luckyColorsHi : prediction.luckyColors).map((color) => (
                            <Badge key={color} variant="outline" className="text-xs">
                              {color}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Advice */}
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <h4 className={`text-sm font-semibold mb-1 ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? 'सलाह:' : 'Advice:'}
                      </h4>
                      <p className={`text-sm text-blue-800 ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? prediction.adviceHi : prediction.advice}
                      </p>
                    </div>
                    
                    {/* Warnings (if any) */}
                    {prediction.warnings && (
                      <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                        <h4 className={`text-sm font-semibold mb-1 ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? 'सावधानी:' : 'Caution:'}
                        </h4>
                        <p className={`text-sm text-red-800 ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? prediction.warningsHi : prediction.warnings}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t text-center">
          <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi 
              ? '⚠️ यह सामान्य राशिफल है। व्यक्तिगत परामर्श के लिए पूर्ण कुंडली विश्लेषण आवश्यक है।'
              : '⚠️ This is a general horoscope. For personalized consultation, complete birth chart analysis is required.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HoroscopeCard;