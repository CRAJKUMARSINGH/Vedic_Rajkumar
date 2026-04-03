/**
 * Vaastu Assessment Page - Complete Vaastu Analysis Interface
 * Week 18: Vaastu Assessment - Thursday Implementation
 * Comprehensive UI with assessment form, score dashboard, and remedies
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Home, AlertTriangle, CheckCircle, Lightbulb, TrendingUp } from 'lucide-react';
import type { Direction, RoomType, RoomPlacement } from '@/services/vaastuService';
import { analyzeRoomPlacement, calculateOverallVaastuScore, VAASTU_DIRECTIONS } from '@/services/vaastuService';
import { calculateVaastuAssessment, type VaastuDosha } from '@/services/vaastuDoshaService';
import { getRemediesForDoshas, type VaastuRemedy } from '@/services/vaastuRemedyService';

interface RoomInput {
  id: string;
  roomType: RoomType;
  direction: Direction;
}

const ROOM_TYPES: RoomType[] = [
  'Entrance',
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Bathroom',
  'Pooja Room',
  'Study Room',
  'Dining Room',
  'Store Room'
];

const DIRECTIONS: Direction[] = [
  'North',
  'South',
  'East',
  'West',
  'NorthEast',
  'NorthWest',
  'SouthEast',
  'SouthWest'
];

export default function VaastuAssessmentPage() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [rooms, setRooms] = useState<RoomInput[]>([
    { id: '1', roomType: 'Entrance', direction: 'North' }
  ]);
  const [assessment, setAssessment] = useState<ReturnType<typeof calculateVaastuAssessment> | null>(null);
  const [roomPlacements, setRoomPlacements] = useState<RoomPlacement[]>([]);
  const [remedies, setRemedies] = useState<VaastuRemedy[]>([]);

  const addRoom = () => {
    setRooms([...rooms, { id: Date.now().toString(), roomType: 'Bedroom', direction: 'South' }]);
  };

  const removeRoom = (id: string) => {
    setRooms(rooms.filter(r => r.id !== id));
  };

  const updateRoom = (id: string, field: 'roomType' | 'direction', value: string) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const analyzeVaastu = () => {
    // Analyze each room placement
    const placements = rooms.map(room => 
      analyzeRoomPlacement(room.roomType, room.direction)
    );
    setRoomPlacements(placements);

    // Calculate overall assessment
    const vaastuAssessment = calculateVaastuAssessment(placements);
    setAssessment(vaastuAssessment);

    // Get remedies for identified doshas
    const doshaIds = vaastuAssessment.doshas.map(d => d.id);
    const recommendedRemedies = getRemediesForDoshas(doshaIds);
    setRemedies(recommendedRemedies);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">
                {language === 'en' ? 'Vaastu Assessment' : 'वास्तु मूल्यांकन'}
              </CardTitle>
            </div>
            <Button
              variant="outline"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            >
              {language === 'en' ? 'हिंदी' : 'English'}
            </Button>
          </div>
          <CardDescription>
            {language === 'en' 
              ? 'Analyze your home or office layout according to Vaastu Shastra principles'
              : 'वास्तु शास्त्र सिद्धांतों के अनुसार अपने घर या कार्यालय के लेआउट का विश्लेषण करें'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Room Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'en' ? 'Room Layout' : 'कमरे का लेआउट'}
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Add rooms and their directions in your home or office'
              : 'अपने घर या कार्यालय में कमरे और उनकी दिशाएं जोड़ें'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rooms.map((room, index) => (
            <div key={room.id} className="flex gap-4 items-center">
              <span className="text-sm font-medium w-8">{index + 1}.</span>
              
              <Select
                value={room.roomType}
                onValueChange={(value) => updateRoom(room.id, 'roomType', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={room.direction}
                onValueChange={(value) => updateRoom(room.id, 'direction', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTIONS.map(dir => (
                    <SelectItem key={dir} value={dir}>{dir}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {rooms.length > 1 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeRoom(room.id)}
                >
                  {language === 'en' ? 'Remove' : 'हटाएं'}
                </Button>
              )}
            </div>
          ))}

          <div className="flex gap-2">
            <Button onClick={addRoom} variant="outline">
              {language === 'en' ? '+ Add Room' : '+ कमरा जोड़ें'}
            </Button>
            <Button onClick={analyzeVaastu} className="ml-auto">
              {language === 'en' ? 'Analyze Vaastu' : 'वास्तु विश्लेषण करें'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {assessment && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              {language === 'en' ? 'Overview' : 'अवलोकन'}
            </TabsTrigger>
            <TabsTrigger value="rooms">
              {language === 'en' ? 'Rooms' : 'कमरे'}
            </TabsTrigger>
            <TabsTrigger value="doshas">
              {language === 'en' ? 'Doshas' : 'दोष'}
            </TabsTrigger>
            <TabsTrigger value="remedies">
              {language === 'en' ? 'Remedies' : 'उपाय'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {language === 'en' ? 'Overall Vaastu Score' : 'समग्र वास्तु स्कोर'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-3xl font-bold">{assessment.overallScore}/100</span>
                    <Badge variant={
                      assessment.overallScore >= 80 ? 'default' :
                      assessment.overallScore >= 60 ? 'secondary' : 'destructive'
                    }>
                      {assessment.overallScore >= 80 ? (language === 'en' ? 'Excellent' : 'उत्कृष्ट') :
                       assessment.overallScore >= 60 ? (language === 'en' ? 'Good' : 'अच्छा') :
                       (language === 'en' ? 'Needs Improvement' : 'सुधार की आवश्यकता')}
                    </Badge>
                  </div>
                  <Progress value={assessment.overallScore} className="h-3" />
                </div>

                {/* Strengths */}
                {assessment.strengths[language].length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {language === 'en' ? 'Strengths' : 'शक्तियां'}
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {assessment.strengths[language].map((strength, i) => (
                        <li key={i} className="text-sm text-green-700">{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weaknesses */}
                {assessment.weaknesses[language].length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      {language === 'en' ? 'Areas for Improvement' : 'सुधार के क्षेत्र'}
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {assessment.weaknesses[language].map((weakness, i) => (
                        <li key={i} className="text-sm text-orange-700">{weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Critical Doshas Alert */}
                {assessment.criticalDoshas.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>
                      {language === 'en' ? 'Critical Doshas Detected' : 'गंभीर दोष पाए गए'}
                    </AlertTitle>
                    <AlertDescription>
                      {language === 'en' 
                        ? `${assessment.criticalDoshas.length} critical Vaastu doshas require immediate attention. Check the Doshas tab for details.`
                        : `${assessment.criticalDoshas.length} गंभीर वास्तु दोषों पर तुरंत ध्यान देने की आवश्यकता है। विवरण के लिए दोष टैब देखें।`}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rooms Tab */}
          <TabsContent value="rooms" className="space-y-4">
            {roomPlacements.map((placement, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {placement.roomType} - {placement.direction}
                    </CardTitle>
                    <Badge variant={placement.isIdeal ? 'default' : placement.score >= 50 ? 'secondary' : 'destructive'}>
                      {language === 'en' ? 'Score' : 'स्कोर'}: {placement.score}/100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress value={placement.score} className="h-2" />
                    <div className="space-y-1">
                      {placement.recommendations[language].map((rec, i) => (
                        <p key={i} className="text-sm text-muted-foreground">{rec}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Doshas Tab */}
          <TabsContent value="doshas" className="space-y-4">
            {assessment.doshas.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold">
                    {language === 'en' ? 'No Vaastu Doshas Detected!' : 'कोई वास्तु दोष नहीं पाया गया!'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {language === 'en' 
                      ? 'Your space has excellent Vaastu compliance.'
                      : 'आपके स्थान में उत्कृष्ट वास्तु अनुपालन है।'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              assessment.doshas.map((dosha, index) => (
                <Card key={index} className={
                  dosha.severity === 'high' ? 'border-red-500' :
                  dosha.severity === 'medium' ? 'border-orange-500' : 'border-yellow-500'
                }>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{dosha.type}</CardTitle>
                      <Badge variant={
                        dosha.severity === 'high' ? 'destructive' :
                        dosha.severity === 'medium' ? 'secondary' : 'outline'
                      }>
                        {dosha.severity === 'high' ? (language === 'en' ? 'High' : 'उच्च') :
                         dosha.severity === 'medium' ? (language === 'en' ? 'Medium' : 'मध्यम') :
                         (language === 'en' ? 'Low' : 'निम्न')}
                      </Badge>
                    </div>
                    <CardDescription>
                      {dosha.location} - {dosha.direction}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">
                        {language === 'en' ? 'Effects:' : 'प्रभाव:'}
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {dosha.effects[language].map((effect, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{effect}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Remedies Tab */}
          <TabsContent value="remedies" className="space-y-4">
            {remedies.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold">
                    {language === 'en' ? 'No Remedies Needed!' : 'कोई उपाय की आवश्यकता नहीं!'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {language === 'en' 
                      ? 'Your space is in excellent Vaastu harmony.'
                      : 'आपका स्थान उत्कृष्ट वास्तु सामंजस्य में है।'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              remedies.map((remedy, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-600" />
                        {remedy.name[language]}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">{remedy.category}</Badge>
                        <Badge variant="secondary">
                          {language === 'en' ? 'Effectiveness' : 'प्रभावशीलता'}: {remedy.effectiveness}/10
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Instructions */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">
                        {language === 'en' ? 'Instructions:' : 'निर्देश:'}
                      </h4>
                      <ol className="list-decimal list-inside space-y-1">
                        {remedy.instructions[language].map((instruction, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{instruction}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Materials */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">
                        {language === 'en' ? 'Materials Required:' : 'आवश्यक सामग्री:'}
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {remedy.materials[language].map((material, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{material}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Details */}
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="font-semibold">{language === 'en' ? 'Cost:' : 'लागत:'}</span>{' '}
                        <Badge variant="outline">{remedy.cost}</Badge>
                      </div>
                      <div>
                        <span className="font-semibold">{language === 'en' ? 'Difficulty:' : 'कठिनाई:'}</span>{' '}
                        <Badge variant="outline">{remedy.difficulty}</Badge>
                      </div>
                    </div>

                    {/* Timing */}
                    {remedy.timing && (
                      <div className="text-sm">
                        <span className="font-semibold">{language === 'en' ? 'Best Time:' : 'सर्वोत्तम समय:'}</span>{' '}
                        {remedy.timing[language]}
                      </div>
                    )}

                    {/* Duration */}
                    {remedy.duration && (
                      <div className="text-sm">
                        <span className="font-semibold">{language === 'en' ? 'Duration:' : 'अवधि:'}</span>{' '}
                        {remedy.duration[language]}
                      </div>
                    )}

                    {/* Precautions */}
                    {remedy.precautions && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-orange-600">
                          {language === 'en' ? 'Precautions:' : 'सावधानियां:'}
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                          {remedy.precautions[language].map((precaution, i) => (
                            <li key={i} className="text-sm text-orange-700">{precaution}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
