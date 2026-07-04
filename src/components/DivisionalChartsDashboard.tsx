/**
 * Divisional Charts Dashboard Component
 * Phase 2 Week 32: Advanced Features
 * Provides comprehensive divisional charts analysis and visualization
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  PieChart,
  BarChart3,
  LineChart,
  TrendingUp,
  TrendingDown,
  Star,
  Sun,
  Moon,
  Flame,
  Zap,
  Circle,
  Heart,
  Eye,
  Sparkles,
  User,
  Activity,
  Target,
  Briefcase,
  DollarSign,
  GraduationCap,
  Users,
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
  Settings,
  Shield,
  Gem,
  BookOpen,
  Music,
  Utensils,
  HandHeart,
  Calculator,
  FileText,
  Grid,
  Compass,
  Navigation,
  Map,
  Globe,
  Home,
  Car,
  HeartHandshake,
  Baby,
  Stethoscope,
  Award,
  TreePine,
  Mountain,
  Waves,
  Cloud,
  Sunrise,
  Sunset,
  MoonStar,
} from 'lucide-react';
import { 
  divisionalChartsService, 
  type DivisionalChart, 
  type DivisionalChartParams
} from '@/services/divisionalChartsService';

const DivisionalChartsDashboard = () => {
  const [charts, setCharts] = useState<DivisionalChart[]>([]);
  const [selectedChart, setSelectedChart] = useState<DivisionalChart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDivisionalCharts();
  }, []);

  const loadDivisionalCharts = async () => {
    setIsLoading(true);
    try {
      // Mock birth data
      const mockParams: DivisionalChartParams = {
        birthDate: new Date('1990-01-15'),
        birthTime: '10:30',
        birthLocation: {
          latitude: 28.6139,
          longitude: 77.2090,
          timezone: 'Asia/Kolkata'
        },
        ayanamsa: 23.5,
        divisionalChart: 9,
        system: 'parashara'
      };

      // Calculate D9 and D10 charts
      const [d9Chart, d10Chart] = await Promise.all([
        divisionalChartsService.calculateNavamshaChart(mockParams),
        divisionalChartsService.calculateDashamshaChart(mockParams)
      ]);

      setCharts([d9Chart, d10Chart]);
      setSelectedChart(d9Chart);
    } catch (error) {
      console.error('Failed to load divisional charts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanetIcon = (planet: string) => {
    const p = planet.toLowerCase();
    const icons: Record<string, React.ReactNode> = {
      sun: <Sun className="w-4 h-4" />,
      moon: <Moon className="w-4 h-4" />,
      mars: <Flame className="w-4 h-4" />,
      mercury: <Zap className="w-4 h-4" />,
      jupiter: <Star className="w-4 h-4" />,
      venus: <Heart className="w-4 h-4" />,
      saturn: <Circle className="w-4 h-4" />,
      rahu: <Eye className="w-4 h-4" />,
      ketu: <Sparkles className="w-4 h-4" />,
    };
    return icons[p] || <Star className="w-4 h-4" />;
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
      ketu: 'bg-indigo-100 text-indigo-800'
    };
    return colors[planet as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getChartIcon = (chartNumber: number) => {
    const icons: Record<number, React.ReactNode> = {
      1: <User className="w-5 h-5" />,
      2: <DollarSign className="w-5 h-5" />,
      3: <Users className="w-5 h-5" />,
      4: <Home className="w-5 h-5" />,
      5: <Baby className="w-5 h-5" />,
      6: <Stethoscope className="w-5 h-5" />,
      7: <HeartHandshake className="w-5 h-5" />,
      8: <AlertTriangle className="w-5 h-5" />,
      9: <Gem className="w-5 h-5" />,
      10: <Briefcase className="w-5 h-5" />,
      11: <TrendingUp className="w-5 h-5" />,
      12: <TreePine className="w-5 h-5" />,
      16: <Car className="w-5 h-5" />,
      20: <Sparkles className="w-5 h-5" />,
      24: <GraduationCap className="w-5 h-5" />,
      27: <Flame className="w-5 h-5" />,
      30: <AlertTriangle className="w-5 h-5" />,
      40: <CheckCircle className="w-5 h-5" />,
      45: <Compass className="w-5 h-5" />,
      60: <MoonStar className="w-5 h-5" />
    };
    return icons[chartNumber] || <Grid className="w-5 h-5" />;
  };

  const getDignityColor = (dignity: string) => {
    const colors = {
      exalted: 'bg-yellow-100 text-yellow-800',
      moolatrikona: 'bg-orange-100 text-orange-800',
      own: 'bg-green-100 text-green-800',
      friendly: 'bg-blue-100 text-blue-800',
      neutral: 'bg-gray-100 text-gray-800',
      enemy: 'bg-red-100 text-red-800',
      debilitated: 'bg-purple-100 text-purple-800'
    };
    return colors[dignity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDegree = (degree: number) => {
    const degrees = Math.floor(degree);
    const minutes = Math.floor((degree - degrees) * 60);
    const seconds = Math.floor(((degree - degrees) * 60 - minutes) * 60);
    return `${degrees}°${minutes}'${seconds}"`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Calculating divisional charts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Grid className="w-8 h-8" />
            Divisional Charts Analysis
          </h1>
          <p className="text-muted-foreground">
            Comprehensive divisional charts (D9, D10) for detailed life analysis
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

      {/* Chart Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {charts.map((chart) => (
          <Card 
            key={chart.id}
            className={`cursor-pointer transition-all ${
              selectedChart?.id === chart.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedChart(chart)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                  {getChartIcon(chart.number)}
                </div>
                <div>
                  <div className="font-medium">{chart.name}</div>
                  <div className="text-sm text-muted-foreground">{chart.purpose}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedChart && (
        <>
          {/* Chart Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getChartIcon(selectedChart.number)}
                  {selectedChart.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium">Purpose</div>
                    <div className="text-sm text-muted-foreground">{selectedChart.purpose}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Overall Strength</div>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedChart.strength.overall} className="flex-1" />
                      <span className="text-sm font-medium">{selectedChart.strength.overall.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Special Points</div>
                    <div className="text-lg font-bold text-primary">{selectedChart.strength.specialPoints}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Planetary Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedChart.planets.slice(0, 6).map((planet) => (
                    <div key={planet.planet} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPlanetIcon(planet.planet)}
                        <span className="text-sm font-medium capitalize">{planet.planet}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={planet.shadbala.total / 6} className="w-20 h-2" />
                        <span className="text-sm">{planet.shadbala.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Special Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Vargottama</span>
                    <Badge variant="outline">{selectedChart.strength.vargottamaCount}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Exalted</span>
                    <Badge variant="outline">{selectedChart.strength.exaltedCount}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Own House</span>
                    <Badge variant="outline">{selectedChart.strength.ownHouseCount}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="planets">Planets</TabsTrigger>
              <TabsTrigger value="houses">Houses</TabsTrigger>
              <TabsTrigger value="aspects">Aspects</TabsTrigger>
              <TabsTrigger value="interpretations">Interpretations</TabsTrigger>
              <TabsTrigger value="remedies">Remedies</TabsTrigger>
            </TabsList>

            <TabsContent value="planets" className="space-y-6">
              {/* Planetary Positions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="w-5 h-5" />
                    Planetary Positions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedChart.planets.map((planet) => (
                      <div key={planet.planet} className="flex items-center justify-between p-4 border rounded">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                            {getPlanetIcon(planet.planet)}
                          </div>
                          <div>
                            <div className="font-medium capitalize">{planet.planet}</div>
                            <div className="text-sm text-muted-foreground">
                              {planet.sign} {formatDegree(planet.degree)}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getDignityColor(planet.dignity.type)}>
                                {planet.dignity.type}
                              </Badge>
                              {planet.vargottama && (
                                <Badge variant="outline">Vargottama</Badge>
                              )}
                              {planet.exaltation && (
                                <Badge variant="default">Exalted</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">Shadbala</div>
                          <div className="text-lg font-bold">{planet.shadbala.total}</div>
                          <div className="text-xs text-muted-foreground">
                            Ratio: {planet.shadbala.ratio.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="houses" className="space-y-6">
              {/* House Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    House Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedChart.houses.map((house) => (
                      <Card key={house.number}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">House {house.number}</span>
                            <Badge variant="outline">{house.sign}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Lord: {house.lord}
                          </div>
                          <div className="space-y-1">
                            {house.planets.length > 0 && (
                              <div className="text-sm">
                                <span className="font-medium">Planets:</span> {house.planets.join(', ')}
                              </div>
                            )}
                            {house.isKendra && (
                              <Badge variant="secondary" className="text-xs">Kendra</Badge>
                            )}
                            {house.isTrikona && (
                              <Badge variant="secondary" className="text-xs">Trikona</Badge>
                            )}
                            {house.isUpachaya && (
                              <Badge variant="secondary" className="text-xs">Upachaya</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="aspects" className="space-y-6">
              {/* Planetary Aspects */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Planetary Aspects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedChart.aspects.map((aspect, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getPlanetIcon(aspect.fromPlanet)}
                            <span className="text-sm">→</span>
                            {getPlanetIcon(aspect.toPlanet)}
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              {aspect.fromPlanet} → {aspect.toPlanet}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {aspect.type} aspect ({aspect.orb.toFixed(1)}°)
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={aspect.nature === 'benefic' ? 'default' : aspect.nature === 'malefic' ? 'destructive' : 'secondary'}>
                            {aspect.nature}
                          </Badge>
                          <div className="text-sm font-medium">{aspect.strength.toFixed(0)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interpretations" className="space-y-6">
              {/* Chart Interpretations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Overall Interpretation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {selectedChart.interpretations.overall}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedChart.interpretations.strengths.map((strength, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5" />
                      Weaknesses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedChart.interpretations.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3 text-orange-500" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedChart.interpretations.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Info className="w-3 h-3 text-blue-500" />
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="remedies" className="space-y-6">
              {/* Remedies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Remedies & Solutions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">General Remedies</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {selectedChart.interpretations.remedies.map((remedy, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {remedy}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default DivisionalChartsDashboard;
