/**
 * Panchang Card Component - Complete Hindu Calendar
 * Week 12: AstroSage Feature Integration - Part 2
 * 
 * Displays complete Panchang with tithi, nakshatra, yoga, karana
 * Hindu calendar with festivals and muhurat calculations
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  calculatePanchang, 
  type PanchangData 
} from '@/services/panchangService';
import { 
  Calendar, 
  Sun, 
  Moon, 
  Star, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Sunrise,
  Sunset,
  Timer,
  Gift,
  Zap
} from 'lucide-react';

interface PanchangCardProps {
  date: string;
  latitude: number;
  longitude: number;
  lang: 'en' | 'hi';
  className?: string;
}

const PanchangCard: React.FC<PanchangCardProps> = ({
  date,
  latitude,
  longitude,
  lang,
  className = ''
}) => {
  const [selectedTab, setSelectedTab] = useState<'panchang' | 'muhurat' | 'festivals'>('panchang');

  const isHi = lang === 'hi';

  // Calculate Panchang data
  const panchangData = useMemo(() => {
    try {
      return calculatePanchang(date, latitude, longitude);
    } catch (error) {
      console.error('Error calculating Panchang:', error);
      return null;
    }
  }, [date, latitude, longitude]);

  if (!panchangData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            {isHi ? 'पंचांग डेटा लोड नहीं हो सका' : 'Unable to load Panchang data'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getNatureColor = (nature: string) => {
    switch (nature) {
      case 'auspicious': return 'text-green-600 bg-green-50';
      case 'inauspicious': return 'text-red-600 bg-red-50';
      case 'mixed': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
          <Calendar className="h-5 w-5" />
          {isHi ? 'आज का पंचांग' : 'Today\'s Panchang'}
        </CardTitle>
        
        {/* Date and Location */}
        <div className="text-sm text-muted-foreground">
          <p>{new Date(date).toLocaleDateString(isHi ? 'hi-IN' : 'en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="panchang" className={isHi ? 'font-hindi' : ''}>
              {isHi ? 'पंचांग' : 'Panchang'}
            </TabsTrigger>
            <TabsTrigger value="muhurat" className={isHi ? 'font-hindi' : ''}>
              {isHi ? 'मुहूर्त' : 'Muhurat'}
            </TabsTrigger>
            <TabsTrigger value="festivals" className={isHi ? 'font-hindi' : ''}>
              {isHi ? 'त्योहार' : 'Festivals'}
            </TabsTrigger>
          </TabsList>

          {/* Panchang Tab */}
          <TabsContent value="panchang" className="mt-4 space-y-4">
            {/* Five Elements of Panchang */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tithi */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-blue-600" />
                    <span className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>
                      {isHi ? 'तिथि' : 'Tithi'}
                    </span>
                  </div>
                  <Badge className={getNatureColor(panchangData.tithi.nature)}>
                    {isHi ? panchangData.tithi.natureHi : panchangData.tithi.nature}
                  </Badge>
                </div>
                <h4 className={`font-medium mb-1 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? panchangData.tithi.nameHi : panchangData.tithi.name}
                </h4>
                <p className={`text-sm text-muted-foreground mb-2 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? `${panchangData.tithi.typeHi} पक्ष` : `${panchangData.tithi.type} paksha`}
                </p>
                <Progress value={panchangData.tithi.percentage} className="mb-2" />
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'समाप्ति:' : 'Ends:'} {panchangData.tithi.endTime}
                </p>
              </Card>

              {/* Nakshatra */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-600" />
                    <span className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>
                      {isHi ? 'नक्षत्र' : 'Nakshatra'}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {isHi ? `पाद ${panchangData.nakshatra.pada}` : `Pada ${panchangData.nakshatra.pada}`}
                  </Badge>
                </div>
                <h4 className={`font-medium mb-1 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? panchangData.nakshatra.nameHi : panchangData.nakshatra.name}
                </h4>
                <p className={`text-sm text-muted-foreground mb-2 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? `स्वामी: ${panchangData.nakshatra.lordHi}` : `Lord: ${panchangData.nakshatra.lord}`}
                </p>
                <Progress value={panchangData.nakshatra.percentage} className="mb-2" />
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'समाप्ति:' : 'Ends:'} {panchangData.nakshatra.endTime}
                </p>
              </Card>

              {/* Yoga */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <span className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>
                      {isHi ? 'योग' : 'Yoga'}
                    </span>
                  </div>
                  <Badge className={getNatureColor(panchangData.yoga.type)}>
                    {isHi ? panchangData.yoga.typeHi : panchangData.yoga.type}
                  </Badge>
                </div>
                <h4 className={`font-medium mb-1 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? panchangData.yoga.nameHi : panchangData.yoga.name}
                </h4>
                <p className={`text-sm text-muted-foreground mb-2 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? panchangData.yoga.effectsHi[0] : panchangData.yoga.effects[0]}
                </p>
                <Progress value={panchangData.yoga.percentage} className="mb-2" />
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'समाप्ति:' : 'Ends:'} {panchangData.yoga.endTime}
                </p>
              </Card>

              {/* Karana */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-indigo-600" />
                    <span className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>
                      {isHi ? 'करण' : 'Karana'}
                    </span>
                  </div>
                  <Badge className={getNatureColor(panchangData.karana.nature)}>
                    {isHi ? panchangData.karana.natureHi : panchangData.karana.nature}
                  </Badge>
                </div>
                <h4 className={`font-medium mb-1 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? panchangData.karana.nameHi : panchangData.karana.name}
                </h4>
                <p className={`text-sm text-muted-foreground mb-2 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? `स्वामी: ${panchangData.karana.lordHi}` : `Lord: ${panchangData.karana.lord}`}
                </p>
                <Progress value={panchangData.karana.percentage} className="mb-2" />
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'समाप्ति:' : 'Ends:'} {panchangData.karana.endTime}
                </p>
              </Card>

              {/* Celestial Times */}
              <Card className="p-4 md:col-span-2">
                <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
                  <Sun className="h-4 w-4 text-orange-600" />
                  {isHi ? 'खगोलीय समय' : 'Celestial Times'}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Sunrise className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className={`text-sm font-medium ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? 'सूर्योदय' : 'Sunrise'}
                      </p>
                      <p className="text-sm text-muted-foreground">{panchangData.sunrise}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sunset className="h-4 w-4 text-orange-700" />
                    <div>
                      <p className={`text-sm font-medium ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? 'सूर्यास्त' : 'Sunset'}
                      </p>
                      <p className="text-sm text-muted-foreground">{panchangData.sunset}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className={`text-sm font-medium ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? 'चंद्रोदय' : 'Moonrise'}
                      </p>
                      <p className="text-sm text-muted-foreground">{panchangData.moonrise}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-blue-700" />
                    <div>
                      <p className={`text-sm font-medium ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? 'चंद्रास्त' : 'Moonset'}
                      </p>
                      <p className="text-sm text-muted-foreground">{panchangData.moonset}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Muhurat Tab */}
          <TabsContent value="muhurat" className="mt-4 space-y-4">
            {/* Auspicious Times */}
            <div>
              <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
                <CheckCircle className="h-4 w-4 text-green-600" />
                {isHi ? 'शुभ मुहूर्त' : 'Auspicious Times'}
              </h4>
              <div className="space-y-3">
                {/* Abhijit Muhurat */}
                <Card className="p-3 border-green-200 bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className={`font-medium ${isHi ? 'font-hindi' : ''}`}>
                      {isHi ? 'अभिजित मुहूर्त' : 'Abhijit Muhurat'}
                    </h5>
                    <Badge className="bg-green-600 text-white">
                      {isHi ? 'सर्वोत्तम' : 'Best'}
                    </Badge>
                  </div>
                  <p className="text-sm text-green-800 mb-1">
                    {panchangData.abhijitMuhurat.start} - {panchangData.abhijitMuhurat.end}
                  </p>
                  <p className={`text-xs text-green-700 ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? 'सभी शुभ कार्यों के लिए सर्वोत्तम समय' : 'Best time for all auspicious activities'}
                  </p>
                </Card>

                {/* Other Auspicious Times */}
                {panchangData.auspiciousTimes.map((time, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className={`font-medium ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? time.nameHi : time.name}
                      </h5>
                      <Badge className={getStrengthColor(time.strength)}>
                        {time.strength}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {time.startTime} - {time.endTime} ({time.duration})
                    </p>
                    <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                      {isHi ? 'उपयुक्त:' : 'Suitable for:'} {(isHi ? time.purposeHi : time.purpose).join(', ')}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Inauspicious Times */}
            <div>
              <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
                <AlertTriangle className="h-4 w-4 text-red-600" />
                {isHi ? 'अशुभ काल' : 'Inauspicious Times'}
              </h4>
              <div className="space-y-3">
                {/* Rahu Kaal */}
                <Card className="p-3 border-red-200 bg-red-50">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className={`font-medium ${isHi ? 'font-hindi' : ''}`}>
                      {isHi ? 'राहु काल' : 'Rahu Kaal'}
                    </h5>
                    <Badge className="bg-red-600 text-white">
                      {isHi ? 'अशुभ' : 'Avoid'}
                    </Badge>
                  </div>
                  <p className="text-sm text-red-800 mb-1">
                    {panchangData.rahuKaal.start} - {panchangData.rahuKaal.end}
                  </p>
                  <p className={`text-xs text-red-700 ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? 'नए कार्य और यात्रा से बचें' : 'Avoid new ventures and travel'}
                  </p>
                </Card>

                {/* Other Inauspicious Times */}
                {panchangData.inauspiciousTimes.map((time, index) => (
                  <Card key={index} className="p-3 border-orange-200 bg-orange-50">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className={`font-medium ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? time.nameHi : time.name}
                      </h5>
                      <Badge variant="destructive">
                        {time.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-orange-800 mb-1">
                      {time.startTime} - {time.endTime} ({time.duration})
                    </p>
                    <p className={`text-xs text-orange-700 ${isHi ? 'font-hindi' : ''}`}>
                      {isHi ? 'बचें:' : 'Avoid:'} {(isHi ? time.avoidHi : time.avoid).join(', ')}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Festivals Tab */}
          <TabsContent value="festivals" className="mt-4">
            {panchangData.festivals.length > 0 ? (
              <div className="space-y-4">
                {panchangData.festivals.map((festival, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-purple-600" />
                        <h4 className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? festival.nameHi : festival.name}
                        </h4>
                      </div>
                      <Badge variant="secondary">
                        {isHi ? festival.typeHi : festival.type}
                      </Badge>
                    </div>
                    
                    <p className={`text-sm text-muted-foreground mb-3 ${isHi ? 'font-hindi' : ''}`}>
                      {isHi ? festival.descriptionHi : festival.description}
                    </p>
                    
                    <div className="mb-3">
                      <h5 className={`text-sm font-medium mb-1 ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? 'महत्व:' : 'Significance:'}
                      </h5>
                      <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? festival.significanceHi : festival.significance}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className={`text-sm font-medium mb-1 ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? 'अनुष्ठान:' : 'Rituals:'}
                      </h5>
                      <ul className={`text-sm text-muted-foreground list-disc list-inside ${isHi ? 'font-hindi' : ''}`}>
                        {(isHi ? festival.ritualsHi : festival.rituals).map((ritual, ritualIndex) => (
                          <li key={ritualIndex}>{ritual}</li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className={`text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'आज कोई विशेष त्योहार नहीं है' : 'No special festivals today'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t text-center">
          <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi 
              ? '⚠️ पंचांग गणना स्थानीय समय के अनुसार है। महत्वपूर्ण कार्यों के लिए स्थानीय पंडित से सलाह लें।'
              : '⚠️ Panchang calculations are based on local time. Consult local priest for important activities.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PanchangCard;