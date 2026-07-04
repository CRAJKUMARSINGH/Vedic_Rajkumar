/**
 * Varshaphal (Annual Solar Return) Card Component
 * Source: BV Raman Magazine Enhancement Plan
 * Displays annual solar return calculations and predictions
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  calculateVarshaphal,
  VarshaphalChart,
  TajikaYoga,
  MuddaDasha
} from '@/services/varshaphalService';
import { Calendar, TrendingUp, Heart, Briefcase, Award, Users } from 'lucide-react';

interface Props {
  birthDate: Date;
  birthLatitude: number;
  birthLongitude: number;
  targetYear: number;
  lang: 'en' | 'hi';
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋'
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Career: <Briefcase className="w-4 h-4" />,
  Finance: <TrendingUp className="w-4 h-4" />,
  Health: <Heart className="w-4 h-4" />,
  Family: <Users className="w-4 h-4" />,
  Education: <Award className="w-4 h-4" />,
  Spiritual: <Calendar className="w-4 h-4" />
};

export default function VarshaphalCard({ 
  birthDate, 
  birthLatitude, 
  birthLongitude, 
  targetYear, 
  lang 
}: Props) {
  const isHi = lang === 'hi';
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'yogas' | 'dasha' | 'predictions'>('summary');
  
  const varshaphalData = calculateVarshaphal(birthDate, birthLatitude, birthLongitude, targetYear);

  const getCategoryColor = (category: string) => {
    const colors = {
      Career: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      Finance: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      Health: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      Family: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      Education: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      Spiritual: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getDashaColor = (strength: number) => {
    if (strength >= 80) return 'bg-green-600 text-white';
    if (strength >= 60) return 'bg-yellow-600 text-white';
    return 'bg-red-600 text-white';
  };

  return (
    <div className="space-y-6">
      {/* Main Summary Card */}
      <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-amber-800 dark:text-amber-300 ${isHi ? 'font-hindi' : ''}`}>
            <span className="text-2xl">🌅</span>
            {isHi ? `वर्षफल ${targetYear}` : `Varshaphal ${targetYear}`}
          </CardTitle>
          <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'वार्षिक सौर प्रत्यागमन • बी.वी. रमण परंपरा' : 'Annual Solar Return • B.V. Raman Tradition'}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Varshesh (Year Lord) */}
            <div className="text-center p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <div className="text-2xl mb-1">{PLANET_SYMBOLS[varshaphalData.varshesh.planet] || varshaphalData.varshesh.planet}</div>
              <div className="font-medium">{isHi ? 'वर्षेश' : 'Varshesh'}</div>
              <div className="text-sm text-muted-foreground">{varshaphalData.varshesh.planet}</div>
              <Badge className="mt-1 bg-amber-600 text-white">
                {isHi ? 'वर्ष स्वामी' : 'Year Lord'}
              </Badge>
            </div>

            {/* Muntha */}
            <div className="text-center p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl mb-1">🏠</div>
              <div className="font-medium">{isHi ? 'मुंथा' : 'Muntha'}</div>
              <div className="text-sm text-muted-foreground">House {varshaphalData.muntha.house}</div>
              <div className="text-xs text-muted-foreground">{varshaphalData.muntha.sign}</div>
              <Badge className="mt-1 bg-blue-600 text-white">
                {isHi ? 'वार्षिक लग्न' : 'Annual Lagna'}
              </Badge>
            </div>

            {/* Overall Strength */}
            <div className="text-center p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl mb-1">💪</div>
              <div className="font-medium">{isHi ? 'समग्र शक्ति' : 'Overall Strength'}</div>
              <div className="text-sm text-muted-foreground">{varshaphalData.varshesh.strength * 10}%</div>
              <Progress value={varshaphalData.varshesh.strength * 10} className="mt-1" />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 border-b">
            {[
              { id: 'summary', label: isHi ? 'सारांश' : 'Summary' },
              { id: 'yogas', label: isHi ? 'योग' : 'Yogas' },
              { id: 'dasha', label: isHi ? 'दशा' : 'Dasha' },
              { id: 'predictions', label: isHi ? 'भविष्यवाणी' : 'Predictions' }
            ].map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-xs ${isHi ? 'font-hindi' : ''}`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <Card>
          <CardHeader>
            <CardTitle className={`text-lg ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'वर्षफल सारांश' : 'Varshaphal Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className={`font-medium mb-2 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'सौर प्रत्यागमन तिथि' : 'Solar Return Date'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(varshaphalData.solarReturnDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className={`font-medium mb-2 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'जन्म तिथि' : 'Birth Date'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(varshaphalData.birthDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <h4 className={`font-medium mb-2 ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'मुख्य विशेषताएं' : 'Key Features'}
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{isHi ? 'वर्षेश:' : 'Varshesh:'}</span>
                  <Badge variant="outline">{varshaphalData.varshesh.planet}</Badge>
                  <span className="text-xs text-muted-foreground">
                    ({varshaphalData.varshesh.dignity} dignity)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{isHi ? 'मुंथा:' : 'Muntha:'}</span>
                  <Badge variant="outline">House {varshaphalData.muntha.house}</Badge>
                  <span className="text-xs text-muted-foreground">
                    ({varshaphalData.muntha.sign})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{isHi ? 'ताजिका योग:' : 'Tajika Yogas:'}</span>
                  <Badge variant="outline">{varshaphalData.tajikaYogas.length}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'yogas' && (
        <Card>
          <CardHeader>
            <CardTitle className={`text-lg ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'ताजिका योग' : 'Tajika Yogas'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {varshaphalData.tajikaYogas.map((yoga, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{yoga.name}</span>
                      <Badge variant="outline">{yoga.type}</Badge>
                    </div>
                    <Badge className={getDashaColor(yoga.strength)}>
                      {yoga.strength}%
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {isHi ? yoga.effect.hi : yoga.effect.en}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isHi ? yoga.results.hi : yoga.results.en}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {yoga.planets.map(planet => (
                      <span key={planet} className="text-sm">
                        {PLANET_SYMBOLS[planet] || planet}
                      </span>
                    ))}
                    <span className="text-xs text-muted-foreground">
                      in House {yoga.house}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'dasha' && (
        <Card>
          <CardHeader>
            <CardTitle className={`text-lg ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'मुद्दा दशा' : 'Mudda Dasha'}
            </CardTitle>
            <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'वार्षिक दशा प्रणाली' : 'Annual Dasha System'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {varshaphalData.dasha.planets.map((dasha, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{PLANET_SYMBOLS[dasha.planet] || dasha.planet}</span>
                    <div>
                      <div className="font-medium">{dasha.planet}</div>
                      <div className="text-xs text-muted-foreground">
                        {dasha.duration} {isHi ? 'महीने' : 'months'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(dasha.startDate).toLocaleDateString()} - {new Date(dasha.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getDashaColor(dasha.strength)}>
                      {dasha.strength}%
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {isHi ? dasha.predictions.hi : dasha.predictions.en}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'predictions' && (
        <Card>
          <CardHeader>
            <CardTitle className={`text-lg ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'वार्षिक भविष्यवाणी' : 'Annual Predictions'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {varshaphalData.predictions.map((prediction, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {CATEGORY_ICONS[prediction.category]}
                      <Badge className={getCategoryColor(prediction.category)}>
                        {prediction.category}
                      </Badge>
                    </div>
                    <Badge className={getDashaColor(prediction.strength)}>
                      {prediction.strength}%
                    </Badge>
                  </div>
                  <p className={`text-sm mb-2 ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? prediction.prediction.hi : prediction.prediction.en}
                  </p>
                  {prediction.remedies && prediction.remedies.length > 0 && (
                    <div className="mt-2">
                      <div className={`text-xs font-medium mb-1 ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? 'उपाय:' : 'Remedies:'}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {prediction.remedies.map((remedy, rIndex) => (
                          <Badge key={rIndex} variant="outline" className="text-xs">
                            {remedy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-2">
                    {isHi ? 'अवधि:' : 'Period:'} {prediction.period}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
