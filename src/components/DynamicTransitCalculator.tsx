/**
 * src/components/DynamicTransitCalculator.tsx
 * Dynamic Transit Calculator with Date Picker
 * 
 * Features:
 * - Real-time ephemeris calculations
 * - Date/time picker
 * - Transit analysis display
 * - Remedies and recommendations
 */

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { calculateDynamicTransits, getTodayTransits, DynamicTransitOutput, evaluateDoubleTransitSupport } from '../services/dynamicTransitService';
import { RASHIS, PLANET_REMEDIES, TransitResult } from '../data/transitData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertCircle, CheckCircle, AlertTriangle, Calendar, Clock } from 'lucide-react';

interface DynamicTransitCalculatorProps {
  moonRashiIndex: number;
  userName?: string;
}

export function DynamicTransitCalculator({
  moonRashiIndex,
  userName = 'User',
}: DynamicTransitCalculatorProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('00:00');
  const [transitData, setTransitData] = useState<DynamicTransitOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize helper functions
  const getStatusIcon = React.useCallback((status: string) => {
    switch (status) {
      case 'favorable':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'unfavorable':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  }, []);

  const getStatusColor = React.useCallback((status: string) => {
    switch (status) {
      case 'favorable':
        return 'bg-green-50 border-green-200';
      case 'unfavorable':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  }, []);

  const getStatusBadgeVariant = React.useCallback((status: string) => {
    switch (status) {
      case 'favorable':
        return 'default';
      case 'unfavorable':
        return 'destructive';
      default:
        return 'secondary';
    }
  }, []);

  // Load today's transits on mount
  useEffect(() => {
    loadTodayTransits();
  }, [moonRashiIndex]);

  const loadTodayTransits = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTodayTransits(moonRashiIndex);
      setTransitData(data);
      setSelectedDate(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transits';
      setError(errorMessage);
      console.error('Transit calculation error:', err);
    } finally {
      setLoading(false);
    }
  }, [moonRashiIndex]);

  const handleDateChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(new Date(e.target.value));
  }, []);

  const handleTimeChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(e.target.value);
  }, []);

  const handleCalculate = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await calculateDynamicTransits({
        moonRashiIndex,
        date: selectedDate,
        time: selectedTime,
      });
      setTransitData(data);
      setError(null); // Clear any previous errors
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate transits';
      setError(errorMessage);
      console.error('Transit calculation error:', err);
      setTransitData(null); // Clear previous results on error
    } finally {
      setLoading(false);
    }
  }, [moonRashiIndex, selectedDate, selectedTime]);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Dynamic Transit Calculator</CardTitle>
          <CardDescription>
            Real-time planetary transits for {userName} (Moon Rashi: {RASHIS[moonRashiIndex]?.hi})
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Date/Time Picker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Date & Time</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="date-input" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <input
                id="date-input"
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select date for transit calculation"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="time-input" className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time (UTC)
              </label>
              <input
                id="time-input"
                type="time"
                value={selectedTime}
                onChange={handleTimeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select time in UTC format"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleCalculate}
                disabled={loading}
                className="w-full"
                aria-busy={loading}
                aria-label={loading ? 'Calculating transits' : 'Calculate transits'}
              >
                {loading ? 'Calculating...' : 'Calculate Transits'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transit Results */}
      {transitData && (
        <>
          {/* Overall Status */}
          <Card className={`border-2 ${getStatusColor(transitData.overallStatus)}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(transitData.overallStatus)}
                    Transit Status
                  </CardTitle>
                  <CardDescription>
                    {format(transitData.date, 'EEEE, MMMM d, yyyy')} at {transitData.time}
                  </CardDescription>
                </div>
                <Badge variant={getStatusBadgeVariant(transitData.overallStatus)}>
                  {transitData.overallStatus.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Overall Score</p>
                  <p className="text-2xl font-bold">{transitData.totalScore}/9</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Favorable Planets</p>
                  <p className="text-2xl font-bold text-green-600">
                    {transitData.transits.filter(t => t.effectiveStatus === 'favorable').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mixed Planets</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {transitData.transits.filter(t => t.effectiveStatus === 'mixed').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unfavorable Planets</p>
                  <p className="text-2xl font-bold text-red-600">
                    {transitData.transits.filter(t => t.effectiveStatus === 'unfavorable').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Planetary Positions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Planetary Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(transitData.planetPositions).map(([planet, rashiIndex]) => (
                  <div key={planet} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-semibold text-sm">{planet}</p>
                    <p className="text-lg font-bold text-blue-600">
                      {RASHIS[rashiIndex]?.hi}
                    </p>
                    <p className="text-xs text-gray-600">{RASHIS[rashiIndex]?.en}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Transit Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Transit Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="favorable" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="favorable">
                    Favorable ({transitData.transits.filter(t => t.effectiveStatus === 'favorable').length})
                  </TabsTrigger>
                  <TabsTrigger value="mixed">
                    Mixed ({transitData.transits.filter(t => t.effectiveStatus === 'mixed').length})
                  </TabsTrigger>
                  <TabsTrigger value="unfavorable">
                    Unfavorable ({transitData.transits.filter(t => t.effectiveStatus === 'unfavorable').length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="favorable" className="space-y-3 mt-4">
                  {transitData.transits
                    .filter(t => t.effectiveStatus === 'favorable')
                    .map((transit) => (
                      <TransitCard key={transit.planet.en} transit={transit} />
                    ))}
                  {transitData.transits.filter(t => t.effectiveStatus === 'favorable').length === 0 && (
                    <p className="text-gray-500 text-sm">No favorable transits today</p>
                  )}
                </TabsContent>

                <TabsContent value="mixed" className="space-y-3 mt-4">
                  {transitData.transits
                    .filter(t => t.effectiveStatus === 'mixed')
                    .map((transit) => (
                      <TransitCard key={transit.planet.en} transit={transit} />
                    ))}
                  {transitData.transits.filter(t => t.effectiveStatus === 'mixed').length === 0 && (
                    <p className="text-gray-500 text-sm">No mixed transits today</p>
                  )}
                </TabsContent>

                <TabsContent value="unfavorable" className="space-y-3 mt-4">
                  {transitData.transits
                    .filter(t => t.effectiveStatus === 'unfavorable')
                    .map((transit) => (
                      <TransitCard key={transit.planet.en} transit={transit} />
                    ))}
                  {transitData.transits.filter(t => t.effectiveStatus === 'unfavorable').length === 0 && (
                    <p className="text-gray-500 text-sm">No unfavorable transits today</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Double Transit Event Activation */}
          <Card className="border-indigo-200">
            <CardHeader className="bg-indigo-50 border-b border-indigo-100">
              <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                <AlertCircle className="w-5 h-5" />
                Event Activation (Double Transit Protocol)
              </CardTitle>
              <CardDescription className="text-indigo-700">
                Checks if Jupiter and Saturn are jointly activating key houses from your Moon sign. This is the ultimate structural gate for major life events.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Career & Status', house: 10, icon: '💼' },
                  { name: 'Marriage & Partnership', house: 7, icon: '💍' },
                  { name: 'Wealth & Family', house: 2, icon: '💰' },
                  { name: 'Property & Comforts', house: 4, icon: '🏠' },
                  { name: 'Progeny & Creativity', house: 5, icon: '👶' },
                  { name: 'Foreign Travel & Losses', house: 12, icon: '✈️' }
                ].map(event => {
                  const dtResult = evaluateDoubleTransitSupport(event.house, moonRashiIndex, transitData);
                  return (
                    <div key={event.name} className={`p-4 rounded-xl border-2 ${dtResult.doubleTransitConfirmed ? 'border-emerald-400 bg-emerald-50' : dtResult.supportLevel === 'partial' ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <span>{event.icon}</span>
                          <span>{event.name}</span>
                        </div>
                        {dtResult.doubleTransitConfirmed ? (
                          <Badge className="bg-emerald-500">Fully Activated</Badge>
                        ) : dtResult.supportLevel === 'partial' ? (
                          <Badge variant="outline" className="text-amber-600 border-amber-600">Partially Supported</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-slate-500">Not Activated</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{dtResult.explanation}</p>
                      <div className="flex gap-2 text-xs font-semibold">
                        <span className={`px-2 py-1 rounded ${dtResult.confirmedByJupiter ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                          Jupiter: {dtResult.confirmedByJupiter ? 'Yes' : 'No'}
                        </span>
                        <span className={`px-2 py-1 rounded ${dtResult.confirmedBySaturn ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                          Saturn: {dtResult.confirmedBySaturn ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Remedies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommended Remedies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transitData.transits
                  .filter(t => t.effectiveStatus !== 'favorable')
                  .map((transit) => {
                    const remedies = PLANET_REMEDIES[transit.planet.en];
                    return (
                      <div key={transit.planet.en} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          {transit.planet.en} ({transit.planet.hi})
                        </h4>
                        <ul className="space-y-1 text-sm text-blue-800">
                          {remedies?.en.map((remedy, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-blue-600">•</span>
                              <span>{remedy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

/**
 * Individual Transit Card Component
 */
const TransitCard = React.memo(function TransitCard({ transit }: { transit: TransitResult }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'favorable':
        return 'bg-green-50 border-green-200';
      case 'unfavorable':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor(transit.effectiveStatus)}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold">
            {transit.planet.en} ({transit.planet.hi}) {transit.planet.symbol}
          </h4>
          <p className="text-sm text-gray-600">
            House: {transit.houseFromMoon} | Rashi: {RASHIS[transit.currentRashi]?.hi}
          </p>
        </div>
        <Badge variant={transit.effectiveStatus === 'favorable' ? 'default' : 'secondary'}>
          Rating: {transit.rating}/10
        </Badge>
      </div>

      <p className="text-sm mb-2">{transit.effectEn}</p>

      {transit.vedhaActive && (
        <p className="text-xs text-orange-700 bg-orange-100 p-2 rounded">
          ⚠️ Vedha Active: {transit.vedhaNote}
        </p>
      )}
    </div>
  );
});
