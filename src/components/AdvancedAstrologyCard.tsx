/**
 * Advanced Astrology Card Component
 * Week 12: AstroSage Feature Integration - Part 2
 * 
 * Integrates Lal Kitab, KP System, and Nadi Astrology
 * Provides comprehensive advanced astrology analysis
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  calculateLalKitabChart, 
  type LalKitabChart 
} from '@/services/lalKitabService';
import { 
  calculateKPChart, 
  type KPChart 
} from '@/services/kpSystemService';
import { 
  generateNadiReading, 
  searchNadiRecords,
  getNadiConsultationRecommendations,
  type NadiRecord 
} from '@/services/nadiAstrologyService';
import { 
  Book, 
  Star, 
  Scroll, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  Lightbulb,
  Heart,
  Briefcase,
  Activity
} from 'lucide-react';

interface AdvancedAstrologyCardProps {
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  planetaryPositions: any[];
  lang: 'en' | 'hi';
  className?: string;
}

const AdvancedAstrologyCard: React.FC<AdvancedAstrologyCardProps> = ({
  birthDate,
  birthTime,
  latitude,
  longitude,
  planetaryPositions,
  lang,
  className = ''
}) => {
  const [selectedSystem, setSelectedSystem] = useState<'lalkitab' | 'kp' | 'nadi'>('lalkitab');
  const [showDetails, setShowDetails] = useState(false);

  const isHi = lang === 'hi';

  // Calculate all advanced systems
  const lalKitabData = useMemo(() => {
    try {
      return calculateLalKitabChart(birthDate, birthTime, latitude, longitude);
    } catch (error) {
      console.error('Error calculating Lal Kitab chart:', error);
      return null;
    }
  }, [birthDate, birthTime, latitude, longitude]);

  const kpData = useMemo(() => {
    try {
      return calculateKPChart(birthDate, birthTime, latitude, longitude);
    } catch (error) {
      console.error('Error calculating KP chart:', error);
      return null;
    }
  }, [birthDate, birthTime, latitude, longitude]);

  const nadiData = useMemo(() => {
    try {
      return generateNadiReading(birthDate, birthTime, planetaryPositions);
    } catch (error) {
      console.error('Error generating Nadi reading:', error);
      return null;
    }
  }, [birthDate, birthTime, planetaryPositions]);

  const getSystemIcon = (system: string) => {
    switch (system) {
      case 'lalkitab': return Book;
      case 'kp': return Star;
      case 'nadi': return Scroll;
      default: return Book;
    }
  };

  const getSystemName = (system: string) => {
    const names = {
      lalkitab: { en: 'Lal Kitab', hi: 'लाल किताब' },
      kp: { en: 'KP System', hi: 'के.पी. सिस्टम' },
      nadi: { en: 'Nadi Astrology', hi: 'नाड़ी ज्योतिष' }
    };
    return isHi ? names[system as keyof typeof names].hi : names[system as keyof typeof names].en;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'marriage':
      case 'love': return Heart;
      case 'career': return Briefcase;
      case 'health': return Activity;
      default: return Target;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className={`text-lg font-semibold ${isHi ? 'font-hindi' : ''}`}>
          {isHi ? 'उन्नत ज्योतिष प्रणालियां' : 'Advanced Astrology Systems'}
        </CardTitle>
        
        {/* System Selection */}
        <div className="flex gap-2 mt-2">
          {(['lalkitab', 'kp', 'nadi'] as const).map((system) => {
            const Icon = getSystemIcon(system);
            return (
              <Button
                key={system}
                variant={selectedSystem === system ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSystem(system)}
                className={`flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}
              >
                <Icon className="h-4 w-4" />
                {getSystemName(system)}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs value={selectedSystem} onValueChange={(value) => setSelectedSystem(value as any)}>
          {/* Lal Kitab System */}
          <TabsContent value="lalkitab">
            {lalKitabData ? (
              <div className="space-y-6">
                {/* Overall Analysis */}
                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-semibold flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
                      <Book className="h-5 w-5 text-red-600" />
                      {isHi ? 'लाल किताब विश्लेषण' : 'Lal Kitab Analysis'}
                    </h3>
                    <Badge variant="secondary">
                      {lalKitabData.overallAnalysis.overallScore}/100
                    </Badge>
                  </div>
                  <Progress value={lalKitabData.overallAnalysis.overallScore} className="mb-3" />
                  <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                    {isHi 
                      ? `${lalKitabData.debtPlanets.length} ऋणी ग्रह पाए गए। ${lalKitabData.totkeRemedies.length} टोटके उपाय सुझाए गए।`
                      : `${lalKitabData.debtPlanets.length} debt planets found. ${lalKitabData.totkeRemedies.length} totke remedies suggested.`
                    }
                  </p>
                </div>

                {/* Debt Planets */}
                {lalKitabData.debtPlanets.length > 0 && (
                  <div>
                    <h4 className={`font-semibold mb-3 ${isHi ? 'font-hindi' : ''}`}>
                      {isHi ? 'ऋणी ग्रह (रिणानु बंधन)' : 'Debt Planets (Rinanu Bandhan)'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {lalKitabData.debtPlanets.map((debtPlanet, index) => (
                        <Card key={index} className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-medium ${isHi ? 'font-hindi' : ''}`}>
                              {isHi ? debtPlanet.planetHi : debtPlanet.planet}
                            </span>
                            <Badge 
                              variant={debtPlanet.severity === 'severe' ? 'destructive' : 'secondary'}
                            >
                              {debtPlanet.severity}
                            </Badge>
                          </div>
                          <p className={`text-xs text-muted-foreground mb-2 ${isHi ? 'font-hindi' : ''}`}>
                            {isHi ? debtPlanet.descriptionHi : debtPlanet.description}
                          </p>
                          <p className={`text-xs font-medium ${isHi ? 'font-hindi' : ''}`}>
                            {isHi ? 'प्रकार:' : 'Type:'} {isHi ? debtPlanet.debtTypeHi : debtPlanet.debtType}
                          </p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Totke Remedies */}
                <div>
                  <h4 className={`font-semibold mb-3 ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? 'टोटके उपाय' : 'Totke Remedies'}
                  </h4>
                  <div className="space-y-3">
                    {lalKitabData.totkeRemedies.slice(0, 3).map((remedy, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className={`font-medium ${isHi ? 'font-hindi' : ''}`}>
                            {isHi ? remedy.titleHi : remedy.title}
                          </h5>
                          <Badge variant="outline">
                            {remedy.difficulty}
                          </Badge>
                        </div>
                        <p className={`text-sm text-muted-foreground mb-2 ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? remedy.descriptionHi : remedy.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className={isHi ? 'font-hindi' : ''}>
                            {isHi ? 'अवधि:' : 'Duration:'} {isHi ? remedy.durationHi : remedy.duration}
                          </span>
                          <span className={isHi ? 'font-hindi' : ''}>
                            {isHi ? 'श्रेणी:' : 'Category:'} {remedy.category}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                {isHi ? 'लाल किताब डेटा लोड नहीं हो सका' : 'Unable to load Lal Kitab data'}
              </div>
            )}
          </TabsContent>

          {/* KP System */}
          <TabsContent value="kp">
            {kpData ? (
              <div className="space-y-6">
                {/* KP Overview */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                  <h3 className={`font-semibold flex items-center gap-2 mb-3 ${isHi ? 'font-hindi' : ''}`}>
                    <Star className="h-5 w-5 text-blue-600" />
                    {isHi ? 'के.पी. सिस्टम विश्लेषण' : 'KP System Analysis'}
                  </h3>
                  <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                    {isHi 
                      ? `${kpData.predictions.length} भविष्यवाणियां और ${kpData.timing.length} समय गणना उपलब्ध।`
                      : `${kpData.predictions.length} predictions and ${kpData.timing.length} timing calculations available.`
                    }
                  </p>
                </div>

                {/* KP Predictions */}
                <div>
                  <h4 className={`font-semibold mb-3 ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? 'के.पी. भविष्यवाणियां' : 'KP Predictions'}
                  </h4>
                  <div className="space-y-3">
                    {kpData.predictions.map((prediction, index) => {
                      const Icon = getCategoryIcon(prediction.category);
                      return (
                        <Card key={index} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-blue-600" />
                              <span className={`font-medium ${isHi ? 'font-hindi' : ''}`}>
                                {isHi ? prediction.categoryHi : prediction.category}
                              </span>
                            </div>
                            <Badge variant="secondary">
                              {prediction.probability}%
                            </Badge>
                          </div>
                          <p className={`text-sm mb-2 ${isHi ? 'font-hindi' : ''}`}>
                            {isHi ? prediction.predictionHi : prediction.prediction}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className={isHi ? 'font-hindi' : ''}>
                              {isHi ? 'समय:' : 'Timing:'} {isHi ? prediction.timingHi : prediction.timing}
                            </span>
                            <span className={isHi ? 'font-hindi' : ''}>
                              {isHi ? 'सिग्निफिकेटर:' : 'Significators:'} {prediction.significators.join(', ')}
                            </span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-Lords */}
                <div>
                  <h4 className={`font-semibold mb-3 ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? 'सब-लॉर्ड विश्लेषण' : 'Sub-Lord Analysis'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {kpData.subLords.slice(0, 6).map((subLord, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium ${isHi ? 'font-hindi' : ''}`}>
                            {isHi ? subLord.planetHi : subLord.planet}
                          </span>
                          <Badge variant={subLord.favorable ? 'default' : 'secondary'}>
                            {subLord.strength}%
                          </Badge>
                        </div>
                        <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? 'भाव:' : 'Houses:'} {subLord.houses.join(', ')}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                {isHi ? 'के.पी. सिस्टम डेटा लोड नहीं हो सका' : 'Unable to load KP System data'}
              </div>
            )}
          </TabsContent>

          {/* Nadi Astrology */}
          <TabsContent value="nadi">
            {nadiData ? (
              <div className="space-y-6">
                {/* Nadi Overview */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
                  <h3 className={`font-semibold flex items-center gap-2 mb-3 ${isHi ? 'font-hindi' : ''}`}>
                    <Scroll className="h-5 w-5 text-purple-600" />
                    {isHi ? 'नाड़ी ज्योतिष पठन' : 'Nadi Astrology Reading'}
                  </h3>
                  <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                    {isHi 
                      ? `प्रमुख ग्रह: ${nadiData.planetarySignature.dominantPlanetHi}, ${nadiData.lifeEvents.length} जीवन घटनाएं`
                      : `Dominant Planet: ${nadiData.planetarySignature.dominantPlanet}, ${nadiData.lifeEvents.length} life events`
                    }
                  </p>
                </div>

                {/* Past Life Karma */}
                <div>
                  <h4 className={`font-semibold mb-3 ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? 'पूर्व जन्म कर्म' : 'Past Life Karma'}
                  </h4>
                  <Card className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className={`text-sm font-medium mb-1 ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? 'व्यवसाय:' : 'Profession:'}
                        </p>
                        <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? nadiData.pastLifeKarma.professionHi : nadiData.pastLifeKarma.profession}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm font-medium mb-1 ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? 'स्थान:' : 'Location:'}
                        </p>
                        <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? nadiData.pastLifeKarma.locationHi : nadiData.pastLifeKarma.location}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className={`text-sm font-medium mb-1 ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? 'वर्तमान जीवन प्रभाव:' : 'Current Life Impact:'}
                      </p>
                      <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? nadiData.pastLifeKarma.currentLifeImpactHi : nadiData.pastLifeKarma.currentLifeImpact}
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Life Events */}
                <div>
                  <h4 className={`font-semibold mb-3 ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? 'जीवन घटनाएं' : 'Life Events'}
                  </h4>
                  <div className="space-y-3">
                    {nadiData.lifeEvents.map((event, index) => {
                      const Icon = getCategoryIcon(event.category);
                      return (
                        <Card key={index} className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-purple-600" />
                              <span className={`font-medium ${isHi ? 'font-hindi' : ''}`}>
                                {isHi ? event.eventHi : event.event}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {isHi ? `${event.age} वर्ष` : `Age ${event.age}`}
                              </Badge>
                              <Badge variant="secondary">
                                {event.probability}%
                              </Badge>
                            </div>
                          </div>
                          <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                            {isHi ? event.descriptionHi : event.description}
                          </p>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Nadi Remedies */}
                <div>
                  <h4 className={`font-semibold mb-3 ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? 'नाड़ी उपाय' : 'Nadi Remedies'}
                  </h4>
                  <div className="space-y-3">
                    {nadiData.remedies.map((remedy, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className={`font-medium ${isHi ? 'font-hindi' : ''}`}>
                            {isHi ? remedy.titleHi : remedy.title}
                          </h5>
                          <Badge variant="outline">
                            {remedy.category}
                          </Badge>
                        </div>
                        <p className={`text-sm text-muted-foreground mb-2 ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? remedy.descriptionHi : remedy.description}
                        </p>
                        <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? 'अवधि:' : 'Duration:'} {isHi ? remedy.durationHi : remedy.duration}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                {isHi ? 'नाड़ी ज्योतिष डेटा लोड नहीं हो सका' : 'Unable to load Nadi Astrology data'}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t text-center">
          <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi 
              ? '⚠️ ये उन्नत ज्योतिष प्रणालियां हैं। व्यक्तिगत परामर्श के लिए विशेषज्ञ से संपर्क करें।'
              : '⚠️ These are advanced astrology systems. Consult an expert for personalized guidance.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedAstrologyCard;