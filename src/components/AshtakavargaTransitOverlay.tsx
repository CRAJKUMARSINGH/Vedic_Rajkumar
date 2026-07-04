/**
 * Ashtakavarga Transit Strength Overlay Component
 * Source: BV Raman Magazine Enhancement Plan
 * Displays SAV scores and transit strength analysis
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  calculateAshtakavargaTransitAnalysis, 
  getAshtakavargaSummary,
  AshtakavargaTransitResult,
  Sarvashtakavarga
} from '@/services/ashtakavargaTransitService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface Props {
  transitingPlanets: { planet: string; house: number }[];
  savScores?: Sarvashtakavarga;
  lang: 'en' | 'hi';
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋'
};

const STRENGTH_COLORS = {
  Strong: '#10b981',
  Moderate: '#f59e0b',
  Weak: '#ef4444'
};

const CHART_COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#06b6d4'];

export default function AshtakavargaTransitOverlay({ 
  transitingPlanets, 
  savScores, 
  lang 
}: Props) {
  const isHi = lang === 'hi';
  const [showDetails, setShowDetails] = useState(false);
  
  const results = calculateAshtakavargaTransitAnalysis(transitingPlanets, savScores);
  const summary = getAshtakavargaSummary(results);

  // Prepare data for charts
  const barChartData = results.map(r => ({
    planet: r.planet,
    score: r.savScore,
    strength: r.strength,
    symbol: PLANET_SYMBOLS[r.planet] || r.planet
  }));

  const pieChartData = [
    { name: isHi ? 'मजबूत' : 'Strong', value: results.filter(r => r.strength === 'Strong').length, color: STRENGTH_COLORS.Strong },
    { name: isHi ? 'मध्यम' : 'Moderate', value: results.filter(r => r.strength === 'Moderate').length, color: STRENGTH_COLORS.Moderate },
    { name: isHi ? 'कमजोर' : 'Weak', value: results.filter(r => r.strength === 'Weak').length, color: STRENGTH_COLORS.Weak }
  ].filter(item => item.value > 0);

  const getStrengthBadge = (strength: string) => {
    const variants = {
      Strong: 'bg-green-600 text-white',
      Moderate: 'bg-yellow-600 text-white',
      Weak: 'bg-red-600 text-white'
    };
    return variants[strength as keyof typeof variants] || 'bg-gray-600 text-white';
  };

  const getProgressColor = (score: number) => {
    if (score >= 28) return 'bg-green-500';
    if (score >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-indigo-800 dark:text-indigo-300 ${isHi ? 'font-hindi' : ''}`}>
            <span className="text-2xl">📊</span>
            {isHi ? 'अष्टकवर्ग गोचर शक्ति' : 'Ashtakavarga Transit Strength'}
          </CardTitle>
          <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'सार्वाष्टकवर्ग स्कोर विश्लेषण • बी.वी. रमण परंपरा' : 'Sarvashtakavarga Score Analysis • B.V. Raman Tradition'}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Overall Strength */}
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'समग्र शक्ति' : 'Overall Strength'}
            </span>
            <Badge className={getStrengthBadge(summary.overallStrength)}>
              {summary.overallStrength} ({summary.averageScore.toFixed(1)})
            </Badge>
          </div>

          {/* Progress bars for each house */}
          <div className="space-y-2">
            {savScores && Object.entries(savScores).map(([house, score]) => {
              const houseNum = parseInt(house.replace('house', ''));
              return (
                <div key={house} className="flex items-center gap-2">
                  <span className="text-xs w-12">{houseNum}</span>
                  <Progress 
                    value={(score / 56) * 100} 
                    className={`flex-1 h-2 [&>div]:bg-${getProgressColor(score).replace('bg-', '')}`}
                  />
                  <span className="text-xs w-8 text-right">{score}</span>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{summary.favorableTransits}</div>
              <div className="text-xs text-muted-foreground">{isHi ? 'अनुकूल' : 'Favorable'}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{results.length - summary.favorableTransits - summary.unfavorableTransits}</div>
              <div className="text-xs text-muted-foreground">{isHi ? 'मध्यम' : 'Moderate'}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{summary.unfavorableTransits}</div>
              <div className="text-xs text-muted-foreground">{isHi ? 'प्रतिकूल' : 'Unfavorable'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className={`text-lg ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'ग्रहवार SAV स्कोर' : 'Planet-wise SAV Scores'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="symbol" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 56]}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    value,
                    name === 'score' ? (isHi ? 'स्कोर' : 'Score') : name
                  ]}
                />
                <Bar 
                  dataKey="score" 
                  fill="#8b5cf6"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className={`text-lg ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'शक्ति वितरण' : 'Strength Distribution'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={`text-lg ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'विस्तृत विश्लेषण' : 'Detailed Analysis'}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? (isHi ? 'छिपाएं' : 'Hide') : (isHi ? 'दिखाएं' : 'Show')}
            </Button>
          </div>
        </CardHeader>
        {showDetails && (
          <CardContent className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{PLANET_SYMBOLS[result.planet] || result.planet}</span>
                  <div>
                    <div className="font-medium">{result.planet}</div>
                    <div className="text-xs text-muted-foreground">
                      {isHi ? result.effect.hi : result.effect.en}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStrengthBadge(result.strength)}>
                    {result.strength}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    SAV: {result.savScore}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(result.confidence * 100)}% {isHi ? 'विश्वास' : 'confidence'}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Recommendations */}
      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-blue-800 dark:text-blue-300 ${isHi ? 'font-hindi' : ''}`}>
            <span className="text-2xl">💡</span>
            {isHi ? 'सिफारिशें' : 'Recommendations'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {summary.recommendations.map((rec, index) => (
              <div key={index} className={`text-sm p-2 bg-blue-50 dark:bg-blue-950/20 rounded ${isHi ? 'font-hindi' : ''}`}>
                • {rec}
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
            <p className={`text-sm font-medium ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? summary.summary.hi : summary.summary.en}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
