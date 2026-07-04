/**
 * Vimshottari Dasha Dashboard Component
 * Phase 2 Week 31: Advanced Features
 * Provides comprehensive dasha analysis and visualization
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Star,
  Sun,
  Moon,
  Flame,
  Zap,
  Circle,
  Heart as Venus,
  Layers,
  Eye,
  Orbit,
  Activity,
  Target,
  Heart,
  Briefcase,
  DollarSign,
  GraduationCap,
  Users,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RefreshCw,
  Download,
  Share2,
  Eye,
  Settings,
  Zap,
  Shield,
  Gem,
  BookOpen,
  Music,
  Utensils,
  HandHeart,
} from 'lucide-react';
import {
  vimshottariDashaService,
  type DashaAnalysis,
  type DashaPeriod,
} from '@/services/vimshottariDashaService';
import { calculatePrecisePlanetaryPositions } from '@/services/precisionEphemerisService';
import { getNakshatraInfo } from '@/services/nakshatraService';
import { MARS_ANTARDASHA_GUIDE, type AntardashaGuideItem } from '@/services/dashaService';

const PLANET_BADGE: Record<string, string> = {
  sun: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  moon: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  mars: 'bg-red-500/10 text-red-400 border-red-500/20',
  mercury: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  jupiter: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  venus: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  saturn: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  rahu: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  ketu: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
};

const PLANET_BAR: Record<string, string> = {
  sun: 'bg-orange-500 hover:bg-orange-600',
  moon: 'bg-sky-400 hover:bg-sky-500',
  mars: 'bg-red-500 hover:bg-red-600',
  mercury: 'bg-emerald-500 hover:bg-emerald-600',
  jupiter: 'bg-yellow-400 hover:bg-yellow-500',
  venus: 'bg-pink-400 hover:bg-pink-500',
  saturn: 'bg-blue-500 hover:bg-blue-600',
  rahu: 'bg-purple-500 hover:bg-purple-600',
  ketu: 'bg-indigo-500 hover:bg-indigo-600',
};

interface VimshottariDashaDashboardProps {
  birthDate?: string;
  birthTime?: string;
  latitude?: number;
  longitude?: number;
  accurateMoonLongitude?: number;
}

const VimshottariDashaDashboard = ({
  birthDate,
  birthTime,
  latitude,
  longitude,
  accurateMoonLongitude,
}: VimshottariDashaDashboardProps) => {
  const [dashaAnalysis, setDashaAnalysis] = useState<DashaAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<DashaPeriod | null>(null);
  const [selectedMaha, setSelectedMaha] = useState<DashaPeriod | null>(null);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    loadDashaAnalysis();
  }, [birthDate, birthTime, latitude, longitude, accurateMoonLongitude]);

  const loadDashaAnalysis = async () => {
    setIsLoading(true);
    try {
      let params;
      if (birthDate && birthTime && latitude !== undefined && longitude !== undefined) {
        let moonLon = accurateMoonLongitude;
        let ayanamsa = 24.0;
        const precise = calculatePrecisePlanetaryPositions(birthDate, birthTime);
        ayanamsa = precise.ayanamsa;
        if (moonLon === undefined || isNaN(moonLon)) {
          moonLon = precise.moon.sidereal;
        }

        const nakInfo = getNakshatraInfo(birthDate, birthTime, moonLon);
        const nakName = typeof nakInfo.name === 'string' ? nakInfo.name : (nakInfo.name as any).en;
        const traversed = moonLon % 13.333333;

        params = {
          birthDate: new Date(birthDate),
          birthTime,
          birthLocation: {
            latitude,
            longitude,
            timezone: 'Asia/Kolkata',
          },
          moonNakshatra: {
            name: nakName,
            pada: nakInfo.pada,
            lord: nakInfo.lord.toLowerCase(),
            degree: traversed,
          },
          ayanamsa,
          system: 'vimshottari' as const,
        };
      } else {
        // Mock birth data fallback
        params = {
          birthDate: new Date('1990-01-15'),
          birthTime: '10:30',
          birthLocation: {
            latitude: 28.6139,
            longitude: 77.209,
            timezone: 'Asia/Kolkata',
          },
          moonNakshatra: {
            name: 'Ashwini',
            pada: 1,
            lord: 'ketu',
            degree: 5.5,
          },
          ayanamsa: 23.5,
          system: 'vimshottari' as const,
        };
      }

      const analysis = await vimshottariDashaService.calculateDasha(params);
      setDashaAnalysis(analysis);
      setSelectedPeriod(analysis.currentDasha);

      // Auto-select the current active Maha Dasha period for the timeline
      const now = new Date();
      const current =
        analysis.mahaDashaSequence.find(
          (p: DashaPeriod) => p.startDate <= now && p.endDate >= now
        ) || analysis.mahaDashaSequence[0];
      setSelectedMaha(current);
    } catch (error) {
      console.error('Failed to load dasha analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanetIcon = (planet: string) => {
    const icons = {
      sun: <Sun className="w-4 h-4" />,
      moon: <Moon className="w-4 h-4" />,
      mars: <Flame className="w-4 h-4" />,
      mercury: <Zap className="w-4 h-4" />,
      jupiter: <Circle className="w-4 h-4" />,
      venus: <Venus className="w-4 h-4" />,
      saturn: <Layers className="w-4 h-4" />,
      rahu: <Eye className="w-4 h-4" />,
      ketu: <Orbit className="w-4 h-4" />,
    };
    return icons[planet as keyof typeof icons] || <Star className="w-4 h-4" />;
  };

  const getPlanetColor = (planet: string) => {
    const colors = {
      sun: 'bg-orange-100 text-orange-800',
      moon: 'bg-blue-100 text-blue-800',
      mars: 'bg-red-100 text-red-800',
      mercury: 'bg-green-100 text-green-800',
      jupiter: 'bg-yellow-100 text-yellow-800',
      venus: 'bg-pink-100 text-pink-800',
      saturn: 'bg-gray-100 text-gray-800',
      rahu: 'bg-purple-100 text-purple-800',
      ketu: 'bg-indigo-100 text-indigo-800',
    };
    return colors[planet as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateProgress = (period: DashaPeriod) => {
    const now = new Date();
    const total = period.endDate.getTime() - period.startDate.getTime();
    const elapsed = now.getTime() - period.startDate.getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const getPredictionIcon = (category: string) => {
    const icons = {
      career: <Briefcase className="w-4 h-4" />,
      finance: <DollarSign className="w-4 h-4" />,
      health: <Heart className="w-4 h-4" />,
      relationships: <Users className="w-4 h-4" />,
      education: <GraduationCap className="w-4 h-4" />,
      spiritual: <Sparkles className="w-4 h-4" />,
    };
    return icons[category as keyof typeof icons] || <Info className="w-4 h-4" />;
  };

  const getRemedyIcon = (type: string) => {
    const icons = {
      gemstones: <Gem className="w-4 h-4" />,
      mantras: <Music className="w-4 h-4" />,
      fasting: <Utensils className="w-4 h-4" />,
      charity: <HandHeart className="w-4 h-4" />,
    };
    return icons[type as keyof typeof icons] || <Shield className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Calculating Vimshottari Dasha...</p>
        </div>
      </div>
    );
  }

  if (!dashaAnalysis) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to calculate Dasha</h3>
            <p className="text-muted-foreground mb-4">
              Please check your birth details and try again.
            </p>
            <Button onClick={loadDashaAnalysis}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Clock className="w-8 h-8" />
            Vimshottari Dasha Analysis
          </h1>
          <p className="text-muted-foreground">
            Comprehensive planetary period analysis and predictions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Current Period Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getPlanetIcon(dashaAnalysis.currentDasha.planet)}
              Current Maha Dasha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{dashaAnalysis.currentDasha.name}</span>
                <Badge className={getPlanetColor(dashaAnalysis.currentDasha.planet)}>
                  {dashaAnalysis.currentDasha.duration} years
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDate(dashaAnalysis.currentDasha.startDate)} -{' '}
                {formatDate(dashaAnalysis.currentDasha.endDate)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{calculateProgress(dashaAnalysis.currentDasha).toFixed(1)}%</span>
                </div>
                <Progress value={calculateProgress(dashaAnalysis.currentDasha)} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getPlanetIcon(dashaAnalysis.currentAntardasha.planet)}
              Current Antardasha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{dashaAnalysis.currentAntardasha.name}</span>
                <Badge className={getPlanetColor(dashaAnalysis.currentAntardasha.planet)}>
                  {dashaAnalysis.currentAntardasha.duration.toFixed(1)} years
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDate(dashaAnalysis.currentAntardasha.startDate)} -{' '}
                {formatDate(dashaAnalysis.currentAntardasha.endDate)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{calculateProgress(dashaAnalysis.currentAntardasha).toFixed(1)}%</span>
                </div>
                <Progress
                  value={calculateProgress(dashaAnalysis.currentAntardasha)}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {dashaAnalysis.currentPratyantardasha && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getPlanetIcon(dashaAnalysis.currentPratyantardasha.planet)}
                Current Pratyantardasha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{dashaAnalysis.currentPratyantardasha.name}</span>
                  <Badge className={getPlanetColor(dashaAnalysis.currentPratyantardasha.planet)}>
                    {dashaAnalysis.currentPratyantardasha.duration.toFixed(1)} years
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(dashaAnalysis.currentPratyantardasha.startDate)} -{' '}
                  {formatDate(dashaAnalysis.currentPratyantardasha.endDate)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {calculateProgress(dashaAnalysis.currentPratyantardasha).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(dashaAnalysis.currentPratyantardasha)}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 h-auto bg-muted p-1">
          <TabsTrigger value="current">Current Period</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="remedies">Remedies</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="mars-breakdown">Mars Breakdown</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Period Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Current Period Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Overall Influence</h4>
                  <p className="text-muted-foreground">{dashaAnalysis.predictions.overall}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Key Characteristics</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getPlanetIcon(dashaAnalysis.currentDasha.planet)}
                        <span className="text-sm">
                          {dashaAnalysis.currentDasha.name} provides leadership and authority
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPlanetIcon(dashaAnalysis.currentAntardasha.planet)}
                        <span className="text-sm">
                          {dashaAnalysis.currentAntardasha.name} brings emotional sensitivity
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Period Strength</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Maha Dasha</span>
                        <span>{dashaAnalysis.currentDasha.strength}%</span>
                      </div>
                      <Progress value={dashaAnalysis.currentDasha.strength} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span>Antardasha</span>
                        <span>{dashaAnalysis.currentAntardasha.strength}%</span>
                      </div>
                      <Progress value={dashaAnalysis.currentAntardasha.strength} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Periods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Periods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashaAnalysis.upcomingPeriods.map((period, index) => (
                  <div
                    key={period.id}
                    className="flex items-center justify-between p-4 border rounded"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                        {getPlanetIcon(period.planet)}
                      </div>
                      <div>
                        <div className="font-medium">{period.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(period.startDate)} - {formatDate(period.endDate)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getPlanetColor(period.planet)}>
                        {period.duration} years
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        Starts in{' '}
                        {Math.max(
                          0,
                          Math.ceil(
                            (period.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                          )
                        )}{' '}
                        days
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          {/* Life Area Predictions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(dashaAnalysis.predictions).map(([category, prediction]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getPredictionIcon(category)}
                    <span className="capitalize">{category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{prediction}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Key Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Key Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashaAnalysis.keyDates.criticalDates.map((date, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          date.impact === 'positive'
                            ? 'bg-green-500'
                            : date.impact === 'negative'
                              ? 'bg-red-500'
                              : 'bg-gray-500'
                        }`}
                      ></div>
                      <div>
                        <div className="font-medium">{date.event}</div>
                        <div className="text-sm text-muted-foreground">{date.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatDate(date.date)}</div>
                      <Badge
                        variant={
                          date.impact === 'positive'
                            ? 'default'
                            : date.impact === 'negative'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {date.impact}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remedies" className="space-y-6">
          {/* General Remedies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                General Remedies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashaAnalysis.remedies.general.map((remedy, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{remedy}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Specific Remedies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gem className="w-5 h-5" />
                  Gemstones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(dashaAnalysis.remedies.gemstones).map(([planet, gemstone]) => (
                    <div key={planet} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPlanetIcon(planet)}
                        <span className="capitalize">{planet}</span>
                      </div>
                      <Badge variant="outline">{gemstone}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Mantras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(dashaAnalysis.remedies.mantras).map(([planet, mantra]) => (
                    <div key={planet} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getPlanetIcon(planet)}
                        <span className="capitalize">{planet}</span>
                      </div>
                      <div className="text-sm font-mono bg-muted p-2 rounded">{mantra}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="w-5 h-5" />
                  Fasting Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(dashaAnalysis.remedies.fasting).map(([planet, day]) => (
                    <div key={planet} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPlanetIcon(planet)}
                        <span className="capitalize">{planet}</span>
                      </div>
                      <Badge variant="outline">{day}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HandHeart className="w-5 h-5" />
                  Charity Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(dashaAnalysis.remedies.charity).map(([planet, items]) => (
                    <div key={planet} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getPlanetIcon(planet)}
                        <span className="capitalize">{planet}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{items}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          {/* Interactive Life Dasha Timeline */}
          <Card className="border-primary/20 bg-card/40 overflow-hidden backdrop-blur-md">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold font-serif text-primary">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                    Interactive Life Dasha Timeline
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Visualizing your 120-year Vimshottari life cycle. Click a Mahadasha block to
                    examine its Antardasha breakdown.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Active Dasha
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Today Position
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary 120-year Maha Dasha horizontal bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                  <span>{formatDate(dashaAnalysis.mahaDashaSequence[0].startDate)}</span>
                  <span className="font-semibold text-primary/80">
                    120-Year Vimshottari Life Timeline
                  </span>
                  <span>
                    {formatDate(
                      dashaAnalysis.mahaDashaSequence[dashaAnalysis.mahaDashaSequence.length - 1]
                        .endDate
                    )}
                  </span>
                </div>

                <div className="relative w-full h-12 bg-slate-900/40 rounded-xl overflow-hidden border border-primary/20 flex p-1 gap-1">
                  {dashaAnalysis.mahaDashaSequence.map((period, index) => {
                    const totalStart = dashaAnalysis.mahaDashaSequence[0].startDate.getTime();
                    const totalEnd =
                      dashaAnalysis.mahaDashaSequence[
                        dashaAnalysis.mahaDashaSequence.length - 1
                      ].endDate.getTime();
                    const totalSpan = totalEnd - totalStart;

                    const widthPct =
                      ((period.endDate.getTime() - period.startDate.getTime()) / totalSpan) * 100;
                    const isCurrent =
                      period.startDate <= new Date() && period.endDate >= new Date();
                    const isSelected = selectedMaha?.id === period.id;

                    return (
                      <button
                        key={period.id}
                        onClick={() => setSelectedMaha(period)}
                        style={{ width: `${widthPct}%` }}
                        className={`h-full rounded-lg transition-all duration-300 relative group flex flex-col items-center justify-center font-bold ${
                          PLANET_BAR[period.planet] || 'bg-slate-700'
                        } ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-[0.98] shadow-lg shadow-primary/20 z-10' : 'opacity-85 hover:opacity-100'}`}
                      >
                        {/* Period name centered */}
                        <span className="text-[10px] text-slate-950 tracking-wider">
                          {widthPct > 5 ? period.name.slice(0, 3) : ''}
                        </span>

                        {/* Glow indicator for active current period */}
                        {isCurrent && (
                          <span className="absolute bottom-1 w-2.5 h-1 bg-white rounded-full animate-pulse shadow-md shadow-white" />
                        )}

                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
                          <div className="bg-slate-950/95 border border-primary/30 rounded-lg p-2 text-xs text-white text-center shadow-xl backdrop-blur-md min-w-[140px] space-y-1">
                            <p className="font-bold text-primary">{period.name} Mahadasha</p>
                            <p className="text-[10px] text-muted-foreground">
                              {period.duration} Years
                            </p>
                            <p className="text-[10px] text-amber-300/90">
                              {formatDate(period.startDate)} - {formatDate(period.endDate)}
                            </p>
                            <p className="text-[9px] text-muted-foreground italic mt-0.5">
                              {isCurrent
                                ? '★ Active Now'
                                : isSelected
                                  ? '✓ Selected'
                                  : 'Click to view sub-periods'}
                            </p>
                          </div>
                          <div className="w-2.5 h-2.5 bg-slate-950 border-r border-b border-primary/30 transform rotate-45 -mt-1.5" />
                        </div>
                      </button>
                    );
                  })}

                  {/* Glowing "Today" marker overlay */}
                  {(() => {
                    const totalStart = dashaAnalysis.mahaDashaSequence[0].startDate.getTime();
                    const totalEnd =
                      dashaAnalysis.mahaDashaSequence[
                        dashaAnalysis.mahaDashaSequence.length - 1
                      ].endDate.getTime();
                    const totalSpan = totalEnd - totalStart;
                    const todayPct = ((new Date().getTime() - totalStart) / totalSpan) * 100;

                    if (todayPct >= 0 && todayPct <= 100) {
                      return (
                        <div
                          style={{ left: `${todayPct}%` }}
                          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_#ffffff] pointer-events-none z-20 flex flex-col items-center justify-start"
                        >
                          <div className="bg-white text-slate-950 text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded shadow-lg -mt-4 border border-slate-200">
                            Today
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Selected Mahadasha details and its Antardasha sub-bar */}
              {selectedMaha && (
                <div className="space-y-5 pt-4 border-t border-primary/10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center`}
                      >
                        {getPlanetIcon(selectedMaha.planet)}
                      </div>
                      <div>
                        <h4 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                          {selectedMaha.name} Mahadasha
                          <Badge variant="outline" className={PLANET_BADGE[selectedMaha.planet]}>
                            {selectedMaha.duration} Years
                          </Badge>
                          {selectedMaha.startDate <= new Date() &&
                            selectedMaha.endDate >= new Date() && (
                              <Badge className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border-amber-500/30">
                                Active Now
                              </Badge>
                            )}
                        </h4>
                      </div>
                    </div>
                    <div className="text-sm font-mono text-muted-foreground">
                      {formatDate(selectedMaha.startDate)} — {formatDate(selectedMaha.endDate)}
                    </div>
                  </div>

                  {/* Antardasha horizontal progress sub-bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground font-mono">
                      <span>Start</span>
                      <span className="font-medium text-foreground/80">
                        Antardashas of {selectedMaha.name}
                      </span>
                      <span>End</span>
                    </div>

                    <div className="relative w-full h-8 bg-slate-900/30 rounded-lg overflow-hidden border border-primary/10 flex p-0.5 gap-0.5">
                      {(() => {
                        const antardashas =
                          vimshottariDashaService.calculateAntardashaSequence(selectedMaha);
                        const subStart = selectedMaha.startDate.getTime();
                        const subEnd = selectedMaha.endDate.getTime();
                        const subSpan = subEnd - subStart;
                        const nowTime = new Date().getTime();

                        return (
                          <>
                            {antardashas.map(antar => {
                              const widthPct =
                                ((antar.endDate.getTime() - antar.startDate.getTime()) / subSpan) *
                                100;
                              const isCurrent =
                                antar.startDate <= new Date() && antar.endDate >= new Date();

                              return (
                                <div
                                  key={antar.id}
                                  style={{ width: `${widthPct}%` }}
                                  className={`h-full rounded transition-all duration-300 relative group flex items-center justify-center text-[10px] font-semibold text-slate-950 ${
                                    PLANET_BAR[antar.planet] || 'bg-slate-700'
                                  } ${isCurrent ? 'ring-1 ring-white shadow-md' : 'opacity-80'}`}
                                >
                                  {widthPct > 6 ? antar.name.slice(0, 3) : ''}

                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
                                    <div className="bg-slate-950/95 border border-primary/30 rounded-lg p-2 text-xs text-white text-center shadow-xl backdrop-blur-md min-w-[150px] space-y-1">
                                      <p className="font-bold text-primary">
                                        {selectedMaha.name} - {antar.name}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground">
                                        {antar.duration.toFixed(2)} Years
                                      </p>
                                      <p className="text-[10px] text-amber-300/90">
                                        {formatDate(antar.startDate)} - {formatDate(antar.endDate)}
                                      </p>
                                      {isCurrent && (
                                        <p className="text-[9px] text-emerald-400 font-bold mt-0.5">
                                          ★ Active Now
                                        </p>
                                      )}
                                    </div>
                                    <div className="w-2.5 h-2.5 bg-slate-950 border-r border-b border-primary/30 transform rotate-45 -mt-1.5" />
                                  </div>
                                </div>
                              );
                            })}

                            {/* Today pointer inside Antardasha bar */}
                            {(() => {
                              const subTodayPct = ((nowTime - subStart) / subSpan) * 100;
                              if (subTodayPct >= 0 && subTodayPct <= 100) {
                                return (
                                  <div
                                    style={{ left: `${subTodayPct}%` }}
                                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_6px_#ffffff] pointer-events-none z-20 flex flex-col items-center justify-start"
                                  >
                                    <div className="w-1.5 h-1.5 bg-white rounded-full shadow -mt-0.5" />
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Scrollable grid listing all Antardashas for this Mahadasha */}
                  <div className="max-h-60 overflow-y-auto pr-1 space-y-2">
                    {vimshottariDashaService
                      .calculateAntardashaSequence(selectedMaha)
                      .map((antar, idx) => {
                        const isCurrent =
                          antar.startDate <= new Date() && antar.endDate >= new Date();
                        return (
                          <div
                            key={antar.id}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                              isCurrent
                                ? 'bg-primary/10 border-primary/40 shadow-sm ring-1 ring-inset ring-primary/20'
                                : 'bg-background/25 border-primary/5 hover:bg-background/45'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-900 text-xs ${PLANET_BAR[antar.planet]}`}
                              >
                                {antar.name.slice(0, 2)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm">
                                    {selectedMaha.name} · {antar.name}
                                  </span>
                                  {isCurrent && (
                                    <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30 text-[10px] h-4 py-0 px-1.5">
                                      Current Sub
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(antar.startDate)} - {formatDate(antar.endDate)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-medium font-mono text-primary/95">
                                {antar.duration.toFixed(2)} Yrs
                              </span>
                              <div className="text-[10px] text-muted-foreground">
                                {antar.startDate > new Date()
                                  ? 'Future'
                                  : antar.endDate < new Date()
                                    ? 'Completed'
                                    : 'Active'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Complete List Dasha Timeline */}
          <Card className="border-primary/20 bg-card/45 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Complete Maha Dasha Sequence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashaAnalysis.mahaDashaSequence.map((period, index) => {
                  const isCurrent = period.startDate <= new Date() && period.endDate >= new Date();

                  return (
                    <div
                      key={period.id}
                      onClick={() => setSelectedMaha(period)}
                      className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                        isCurrent
                          ? 'border-amber-500/40 bg-amber-500/5 shadow-sm ring-1 ring-amber-500/10'
                          : 'border-primary/10 hover:border-primary/30 hover:bg-primary/5'
                      }`}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getPlanetIcon(period.planet)}
                          <span className="font-semibold">{period.name}</span>
                          <Badge className={getPlanetColor(period.planet)}>
                            {period.duration} years
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(period.startDate)} - {formatDate(period.endDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold">
                          {isCurrent
                            ? 'Current Period'
                            : period.startDate > new Date()
                              ? 'Upcoming'
                              : 'Completed'}
                        </div>
                        <Badge
                          variant={
                            isCurrent
                              ? 'default'
                              : period.startDate > new Date()
                                ? 'secondary'
                                : 'outline'
                          }
                          className={`text-[10px] mt-1 ${
                            isCurrent ? 'bg-amber-500 text-slate-950 font-bold' : ''
                          }`}
                        >
                          {isCurrent ? 'Active' : period.startDate > new Date() ? 'Future' : 'Past'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mars-breakdown" className="space-y-6">
          <Card className="border-red-500/20 bg-red-50/10 dark:bg-red-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Flame className="w-6 h-6" />
                Mars Mahadasha (2025–2032) Antardasha Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                This specialized guide maps the 7-year Mars Mahadasha for educational and career planning, specifically tailored for crucial academic years, exam attempts, and college admissions.
              </p>
              
              <div className="space-y-6">
                {(() => {
                  const marsMD = dashaAnalysis.mahaDashaSequence.find(md => md.planet === 'mars');
                  if (!marsMD) return <p>Mars Mahadasha data not found in this sequence.</p>;
                  
                  const marsAntardashas = vimshottariDashaService.calculateAntardashaSequence(marsMD);
                  
                  return marsAntardashas.map((antar) => {
                    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
                    const planetKey = capitalize(antar.planet);
                    const guide = MARS_ANTARDASHA_GUIDE[planetKey];
                    
                    const isCurrent = antar.startDate <= new Date() && antar.endDate >= new Date();
                    const isPast = antar.endDate < new Date();
                    
                    return (
                      <div key={antar.id} className={`p-4 border rounded-xl shadow-sm transition-all ${isCurrent ? 'ring-2 ring-red-500 border-red-500/50 bg-red-50/30 dark:bg-red-900/20' : 'bg-card border-border hover:border-red-500/30'}`}>
                        <div className="flex flex-col md:flex-row gap-4 md:items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${PLANET_BAR[antar.planet] || 'bg-slate-700 text-white'}`}>
                              {getPlanetIcon(antar.planet)}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold flex items-center gap-2">
                                Mars - {planetKey}
                                {isCurrent && <Badge className="bg-red-500 hover:bg-red-600 text-white">Active Now</Badge>}
                                {isPast && <Badge variant="outline" className="text-muted-foreground">Completed</Badge>}
                              </h4>
                              <p className="text-sm font-mono text-muted-foreground">
                                {formatDate(antar.startDate)} to {formatDate(antar.endDate)}
                              </p>
                            </div>
                          </div>
                          
                          {guide && (
                            <div className="flex items-center gap-2 md:self-center">
                              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Auspiciousness:</span>
                              <Badge variant={guide.auspiciousness === 'Very High' ? 'default' : guide.auspiciousness === 'High' ? 'secondary' : guide.auspiciousness === 'Moderate' ? 'outline' : 'destructive'}
                                className={guide.auspiciousness === 'Very High' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                              >
                                {guide.auspiciousness}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {guide ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-3">
                              <div>
                                <strong className="text-foreground flex items-center gap-1"><Target className="w-4 h-4 text-primary"/> Core Focus</strong>
                                <p className="text-muted-foreground mt-1 leading-relaxed">{guide.focus}</p>
                              </div>
                              <div>
                                <strong className="text-foreground flex items-center gap-1"><Zap className="w-4 h-4 text-amber-500"/> Energy Dynamic</strong>
                                <p className="text-muted-foreground mt-1 leading-relaxed">{guide.energy}</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                                <strong className="text-primary flex items-center gap-1"><BookOpen className="w-4 h-4"/> Exam Strategy (IIT-JEE/NEET)</strong>
                                <p className="text-foreground/90 mt-1 leading-relaxed">{guide.examsAdvice}</p>
                              </div>
                              <div className="bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
                                <strong className="text-amber-600 dark:text-amber-400 flex items-center gap-1"><GraduationCap className="w-4 h-4"/> Admissions & Decisions</strong>
                                <p className="text-foreground/90 mt-1 leading-relaxed">{guide.admissionsAdvice}</p>
                              </div>
                            </div>
                            <div className="md:col-span-2 mt-2 pt-3 border-t border-border/50">
                                <strong className="text-foreground flex items-center gap-1 text-xs uppercase tracking-wider"><Shield className="w-3 h-3 text-green-500"/> Recommended Remedies</strong>
                                <p className="text-muted-foreground mt-1 text-xs italic">{guide.remedies}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Detailed guide not available for this sub-period.</p>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {/* Detailed Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Detailed Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Comprehensive Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  Detailed dasha analysis with planetary influences and life predictions
                </p>
                <Button>
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VimshottariDashaDashboard;
