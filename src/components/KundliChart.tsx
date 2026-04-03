/**
 * Kundli Chart Component - Interactive Birth Chart Visualization
 * Week 11: AstroSage Feature Integration - Part 1
 * 
 * Displays complete 12-house kundli with planetary positions
 * Supports both North Indian and South Indian chart styles
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  calculateKundli, 
  getChartLayout, 
  type KundliData, 
  type ChartStyle,
  type ChartHouse 
} from '@/services/kundliService';

interface KundliChartProps {
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  lang: 'en' | 'hi';
  className?: string;
}

// Planet symbols for display
const PLANET_SYMBOLS: Record<string, string> = {
  'Sun': '☉',
  'Moon': '☽',
  'Mars': '♂',
  'Mercury': '☿',
  'Jupiter': '♃',
  'Venus': '♀',
  'Saturn': '♄',
  'Rahu': '☊',
  'Ketu': '☋'
};

// Planet colors for visual distinction
const PLANET_COLORS: Record<string, string> = {
  'Sun': 'text-orange-600',
  'Moon': 'text-blue-400',
  'Mars': 'text-red-600',
  'Mercury': 'text-green-600',
  'Jupiter': 'text-yellow-600',
  'Venus': 'text-pink-600',
  'Saturn': 'text-gray-700',
  'Rahu': 'text-purple-600',
  'Ketu': 'text-indigo-600'
};

const KundliChart: React.FC<KundliChartProps> = ({
  date,
  time,
  latitude,
  longitude,
  lang,
  className = ''
}) => {
  const [chartStyle, setChartStyle] = useState<ChartStyle>('north-indian');
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const isHi = lang === 'hi';

  // Calculate kundli data
  const kundliData = useMemo(() => {
    try {
      return calculateKundli(date, time, latitude, longitude, chartStyle);
    } catch (error) {
      console.error('Error calculating kundli:', error);
      return null;
    }
  }, [date, time, latitude, longitude, chartStyle]);

  // Get chart layout
  const chartLayout = useMemo(() => {
    if (!kundliData) return null;
    return getChartLayout(kundliData);
  }, [kundliData]);

  if (!kundliData || !chartLayout) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            {isHi ? 'कुंडली गणना में त्रुटि' : 'Error calculating kundli'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedHouseData = selectedHouse ? kundliData.houses[selectedHouse - 1] : null;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg font-semibold ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'जन्म कुंडली' : 'Birth Chart (Kundli)'}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={chartStyle === 'north-indian' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartStyle('north-indian')}
              className={isHi ? 'font-hindi' : ''}
            >
              {isHi ? 'उत्तर भारतीय' : 'North Indian'}
            </Button>
            <Button
              variant={chartStyle === 'south-indian' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartStyle('south-indian')}
              className={isHi ? 'font-hindi' : ''}
            >
              {isHi ? 'दक्षिण भारतीय' : 'South Indian'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chart" className={isHi ? 'font-hindi' : ''}>
              {isHi ? 'चार्ट' : 'Chart'}
            </TabsTrigger>
            <TabsTrigger value="houses" className={isHi ? 'font-hindi' : ''}>
              {isHi ? 'भाव' : 'Houses'}
            </TabsTrigger>
            <TabsTrigger value="aspects" className={isHi ? 'font-hindi' : ''}>
              {isHi ? 'दृष्टि' : 'Aspects'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="mt-4">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Chart Visualization */}
              <div className="flex-1">
                <div className="relative mx-auto" style={{ width: '320px', height: '320px' }}>
                  <svg
                    width="320"
                    height="320"
                    viewBox="0 0 320 320"
                    className="border border-border rounded-lg bg-card"
                  >
                    {/* Render houses */}
                    {chartLayout.houses.map((house) => (
                      <g key={house.houseNumber}>
                        {/* House rectangle */}
                        <rect
                          x={house.position.x + 10}
                          y={house.position.y + 10}
                          width={house.position.width - 20}
                          height={house.position.height - 20}
                          fill={house.isAscendant ? '#fef3c7' : '#f8fafc'}
                          stroke={selectedHouse === house.houseNumber ? '#3b82f6' : '#e2e8f0'}
                          strokeWidth={selectedHouse === house.houseNumber ? 2 : 1}
                          className="cursor-pointer hover:fill-blue-50 transition-colors"
                          onClick={() => setSelectedHouse(house.houseNumber)}
                        />
                        
                        {/* House number */}
                        <text
                          x={house.position.x + 15}
                          y={house.position.y + 25}
                          fontSize="10"
                          fontWeight="bold"
                          fill="#374151"
                        >
                          {house.houseNumber}
                        </text>
                        
                        {/* Rashi name */}
                        <text
                          x={house.position.x + 15}
                          y={house.position.y + 38}
                          fontSize="8"
                          fill="#6b7280"
                        >
                          {isHi ? house.rashiHi : house.rashi}
                        </text>
                        
                        {/* Planets in house */}
                        {house.planets.map((planet, index) => (
                          <text
                            key={planet}
                            x={house.position.x + 15 + (index % 2) * 25}
                            y={house.position.y + 55 + Math.floor(index / 2) * 15}
                            fontSize="12"
                            className={PLANET_COLORS[planet] || 'text-gray-600'}
                            fill="currentColor"
                          >
                            {PLANET_SYMBOLS[planet] || planet.charAt(0)}
                          </text>
                        ))}
                        
                        {/* Ascendant marker */}
                        {house.isAscendant && (
                          <text
                            x={house.position.x + house.position.width - 25}
                            y={house.position.y + 25}
                            fontSize="10"
                            fontWeight="bold"
                            fill="#f59e0b"
                          >
                            ASC
                          </text>
                        )}
                      </g>
                    ))}
                    
                    {/* Center content */}
                    <rect
                      x={chartLayout.center.position.x}
                      y={chartLayout.center.position.y}
                      width={chartLayout.center.position.width}
                      height={chartLayout.center.position.height}
                      fill="#f1f5f9"
                      stroke="#cbd5e1"
                      strokeWidth="1"
                    />
                    <text
                      x={chartLayout.center.position.x + chartLayout.center.position.width / 2}
                      y={chartLayout.center.position.y + chartLayout.center.position.height / 2}
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#374151"
                    >
                      {isHi ? chartLayout.center.contentHi : chartLayout.center.content}
                    </text>
                  </svg>
                </div>
                
                {/* Legend */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  {Object.entries(PLANET_SYMBOLS).map(([planet, symbol]) => (
                    <div key={planet} className="flex items-center gap-1">
                      <span className={`${PLANET_COLORS[planet]} font-bold`}>{symbol}</span>
                      <span className={isHi ? 'font-hindi' : ''}>{planet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* House Details Panel */}
              {selectedHouseData && (
                <div className="lg:w-80">
                  <Card>
                    <CardHeader>
                      <CardTitle className={`text-base ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? `${selectedHouseData.houseNumber}वां भाव` : `House ${selectedHouseData.houseNumber}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className={`text-sm font-semibold ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? 'राशि:' : 'Rashi:'}
                        </p>
                        <p className={`text-sm ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? selectedHouseData.rashiNameHi : selectedHouseData.rashiName}
                        </p>
                      </div>
                      
                      <div>
                        <p className={`text-sm font-semibold ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? 'स्वामी:' : 'Lord:'}
                        </p>
                        <p className={`text-sm ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? selectedHouseData.lordHi : selectedHouseData.lord}
                        </p>
                      </div>
                      
                      <div>
                        <p className={`text-sm font-semibold ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? 'महत्व:' : 'Significance:'}
                        </p>
                        <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? selectedHouseData.significanceHi : selectedHouseData.significance}
                        </p>
                      </div>
                      
                      {selectedHouseData.planets.length > 0 && (
                        <div>
                          <p className={`text-sm font-semibold mb-2 ${isHi ? 'font-hindi' : ''}`}>
                            {isHi ? 'ग्रह:' : 'Planets:'}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {selectedHouseData.planets.map((planet) => (
                              <Badge key={planet.name} variant="secondary" className="text-xs">
                                <span className={PLANET_COLORS[planet.name]}>
                                  {PLANET_SYMBOLS[planet.name]}
                                </span>
                                <span className="ml-1">{planet.name}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="houses" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kundliData.houses.map((house) => (
                <Card key={house.houseNumber} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? `${house.houseNumber}वां भाव` : `House ${house.houseNumber}`}
                      </h4>
                      {house.houseNumber === 1 && (
                        <Badge variant="secondary" className="text-xs">
                          {isHi ? 'लग्न' : 'ASC'}
                        </Badge>
                      )}
                    </div>
                    
                    <p className={`text-sm text-muted-foreground mb-2 ${isHi ? 'font-hindi' : ''}`}>
                      {isHi ? house.rashiNameHi : house.rashiName} ({isHi ? house.lordHi : house.lord})
                    </p>
                    
                    <p className={`text-xs text-muted-foreground mb-3 ${isHi ? 'font-hindi' : ''}`}>
                      {isHi ? house.significanceHi : house.significance}
                    </p>
                    
                    {house.planets.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {house.planets.map((planet) => (
                          <Badge key={planet.name} variant="outline" className="text-xs">
                            <span className={PLANET_COLORS[planet.name]}>
                              {PLANET_SYMBOLS[planet.name]}
                            </span>
                            <span className="ml-1">{planet.name}</span>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="aspects" className="mt-4">
            <div className="space-y-4">
              {kundliData.aspectsData.map((aspect) => (
                <Card key={aspect.planet}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-semibold flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
                        <span className={PLANET_COLORS[aspect.planet]}>
                          {PLANET_SYMBOLS[aspect.planet]}
                        </span>
                        {aspect.planet} {isHi ? 'दृष्टि' : 'Aspects'}
                      </h4>
                      <Badge variant="secondary">
                        {isHi ? `शक्ति: ${aspect.strength}%` : `Strength: ${aspect.strength}%`}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className={`font-medium mb-1 ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? 'भावों पर दृष्टि:' : 'Aspecting Houses:'}
                        </p>
                        <p className="text-muted-foreground">
                          {aspect.aspectingHouses.join(', ')}
                        </p>
                      </div>
                      
                      {aspect.aspectingPlanets.length > 0 && (
                        <div>
                          <p className={`font-medium mb-1 ${isHi ? 'font-hindi' : ''}`}>
                            {isHi ? 'ग्रहों पर दृष्टि:' : 'Aspecting Planets:'}
                          </p>
                          <p className="text-muted-foreground">
                            {aspect.aspectingPlanets.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default KundliChart;