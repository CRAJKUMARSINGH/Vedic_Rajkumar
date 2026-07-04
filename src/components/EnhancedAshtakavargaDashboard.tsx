/**
 * Enhanced Ashtakavarga Dashboard Component
 * Phase 2 Week 33: Advanced Features
 * Provides comprehensive Ashtakavarga analysis with transit overlay
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Grid,
  BarChart3,
  LineChart,
  TrendingUp,
  TrendingDown,
  Star,
  Sun,
  Moon,
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
  Calculator,
  FileText,
  Compass,
  Navigation,
  Map,
  Home,
  Car,
  HeartHandshake,
  Baby,
  Stethoscope,
  Award,
  TreePine,
  Flame,
  Mountain,
  Waves,
  Cloud,
  Sunrise,
  Sunset,
  MoonStar,
  Clock,
  Calendar,
  Filter,
  Search,
  Radar,
  Gauge,
  PieChart,
  ScatterChart,
  AreaChart,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Battery,
  Thermometer,
  Wind,
  Droplets,
  ZapOff,
} from 'lucide-react';
import {
  enhancedAshtakavargaService,
  type AshtakavargaAnalysis,
  type AshtakavargaParams,
  type AshtakavargaChart,
  type Sarvashtakavarga,
  type TransitAshtakavarga,
} from '@/services/enhancedAshtakavargaService';

const EnhancedAshtakavargaDashboard = () => {
  const [analysis, setAnalysis] = useState<AshtakavargaAnalysis | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<AshtakavargaChart | null>(null);
  const [selectedTransit, setSelectedTransit] = useState<TransitAshtakavarga | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showTransitAnalysis, setShowTransitAnalysis] = useState(false);

  useEffect(() => {
    loadAshtakavargaAnalysis();
  }, []);

  const loadAshtakavargaAnalysis = async () => {
    setIsLoading(true);
    try {
      // Mock birth data
      const mockParams: AshtakavargaParams = {
        birthDate: new Date('1990-01-15'),
        birthTime: '10:30',
        birthLocation: {
          latitude: 28.6139,
          longitude: 77.209,
          timezone: 'Asia/Kolkata',
        },
        ayanamsa: 23.5,
        system: 'parashara',
        includeTransit: true,
        transitDate: new Date(),
      };

      const result = await enhancedAshtakavargaService.calculateAshtakavarga(mockParams);
      setAnalysis(result);
      setSelectedPlanet(result.planetCharts[0]);
      if (result.transitAnalysis.length > 0) {
        setSelectedTransit(result.transitAnalysis[0]);
      }
    } catch (error) {
      console.error('Failed to load Ashtakavarga analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanetIcon = (planet: string) => {
    const icons: Record<string, React.ReactNode> = {
      sun: <Sun className="w-4 h-4 text-orange-400" />,
      moon: <Moon className="w-4 h-4 text-sky-400" />,
      mars: <Flame className="w-4 h-4 text-red-400" />,
      mercury: <Activity className="w-4 h-4 text-emerald-400" />,
      jupiter: <Star className="w-4 h-4 text-yellow-400 animate-pulse" />,
      venus: <Heart className="w-4 h-4 text-pink-400" />,
      saturn: <Target className="w-4 h-4 text-blue-400" />,
    };
    return icons[planet] || <Star className="w-4 h-4" />;
  };

  const getPlanetColor = (planet: string) => {
    const colors = {
      sun: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      moon: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
      mars: 'bg-red-500/10 text-red-400 border border-red-500/20',
      mercury: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      jupiter: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
      venus: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
      saturn: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    };
    return (
      colors[planet as keyof typeof colors] || 'bg-muted text-muted-foreground border border-muted'
    );
  };

  const getStrengthColor = (points: number) => {
    if (points >= 7) return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    if (points >= 5) return 'bg-teal-500/15 text-teal-300 border border-teal-500/25';
    if (points >= 3) return 'bg-amber-500/15 text-amber-300 border border-amber-500/25';
    return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
  };

  const getHouseName = (house: number) => {
    const houses = [
      'Self',
      'Wealth',
      'Siblings',
      'Home',
      'Children',
      'Enemies',
      'Spouse',
      'Death',
      'Fortune',
      'Career',
      'Gains',
      'Losses',
    ];
    return houses[house - 1] || `House ${house}`;
  };

  const formatPoints = (points: number) => {
    return `${points}/8`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Calculating Ashtakavarga analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to calculate Ashtakavarga</h3>
            <p className="text-muted-foreground mb-4">
              Please check your birth details and try again.
            </p>
            <Button onClick={loadAshtakavargaAnalysis}>
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
            <Grid className="w-8 h-8" />
            Enhanced Ashtakavarga Analysis
          </h1>
          <p className="text-muted-foreground">
            Comprehensive Ashtakavarga system with transit analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTransitAnalysis(!showTransitAnalysis)}>
            <Activity className="w-4 h-4 mr-2" />
            {showTransitAnalysis ? 'Hide Transit' : 'Show Transit'}
          </Button>
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

      {/* Sarvashtakavarga Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Sarvashtakavarga
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">Total Points</div>
                <div className="text-3xl font-bold text-primary">
                  {analysis.sarvashtakavarga.totalPoints}
                </div>
                <div className="text-sm text-muted-foreground">
                  Average: {analysis.sarvashtakavarga.averagePoints.toFixed(1)} points/house
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Excellent Houses</span>
                  <Badge variant="default">
                    {analysis.sarvashtakavarga.interpretations.excellent.length}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Good Houses</span>
                  <Badge variant="secondary">
                    {analysis.sarvashtakavarga.interpretations.good.length}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Weak Houses</span>
                  <Badge variant="destructive">
                    {analysis.sarvashtakavarga.interpretations.poor.length}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Planet Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.planetCharts.map(planet => (
                <div key={planet.planet} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPlanetIcon(planet.planet)}
                    <span className="text-sm font-medium capitalize">{planet.planet}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(planet.totalPoints / 56) * 100} className="w-20 h-2" />
                    <span className="text-sm">{planet.totalPoints}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Overall Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Chart Strength</div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={(analysis.sarvashtakavarga.averagePoints / 30) * 100}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium">
                    {((analysis.sarvashtakavarga.averagePoints / 30) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">{analysis.predictions.overall}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="planets">Planets</TabsTrigger>
          <TabsTrigger value="sarvashtakavarga">Sarvashtakavarga</TabsTrigger>
          <TabsTrigger value="transit">Transit Analysis</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="remedies">Remedies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Planet Charts Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid className="w-5 h-5" />
                Planet Ashtakavarga Charts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.planetCharts.map(planet => (
                  <Card
                    key={planet.planet}
                    className={`cursor-pointer transition-all ${
                      selectedPlanet?.planet === planet.planet ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedPlanet(planet)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                          {getPlanetIcon(planet.planet)}
                        </div>
                        <div>
                          <div className="font-medium">{planet.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {planet.totalPoints} points
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Strong Houses</span>
                          <Badge variant="default">{planet.interpretations.strong.length}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Weak Houses</span>
                          <Badge variant="destructive">{planet.interpretations.weak.length}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Planet Details */}
          {selectedPlanet && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getPlanetIcon(selectedPlanet.planet)}
                  {selectedPlanet.name} - Detailed Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">House-wise Points</h4>
                    <div className="space-y-2">
                      {selectedPlanet.chart.map((points, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <span className="text-sm">
                            House {index + 1} ({getHouseName(index + 1)})
                          </span>
                          <div className="flex items-center gap-2">
                            <Progress value={(points / 8) * 100} className="w-16 h-2" />
                            <Badge className={getStrengthColor(points)}>
                              {formatPoints(points)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Interpretations</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-green-600">Strong Houses</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedPlanet.interpretations.strong.length > 0
                            ? `Houses ${selectedPlanet.interpretations.strong.join(', ')}`
                            : 'None'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-red-600">Weak Houses</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedPlanet.interpretations.weak.length > 0
                            ? `Houses ${selectedPlanet.interpretations.weak.join(', ')}`
                            : 'None'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-blue-600">Recommendations</div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {selectedPlanet.interpretations.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="planets" className="space-y-6">
          {/* Detailed Planet Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analysis.planetCharts.map(planet => (
              <Card key={planet.planet}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getPlanetIcon(planet.planet)}
                    {planet.name} Ashtakavarga
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Points</span>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {planet.totalPoints}/56
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {planet.chart.map((points, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <span className="text-xs">H{index + 1}</span>
                          <Badge className={getStrengthColor(points)}>{points}</Badge>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Summary</div>
                      <div className="text-sm text-muted-foreground">
                        {planet.interpretations.recommendations[0]}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sarvashtakavarga" className="space-y-6">
          {/* Bird's-Eye View Unified Matrix Table */}
          <Card className="border-primary/20 bg-card/40 overflow-hidden backdrop-blur-md">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold font-serif text-primary">
                    <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                    Unified Bhinnashtakavarga & SAV Matrix
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete point distribution matrix for all 7 planets across the 12 houses, with
                    conditional strength highlighting and Sarvashtakavarga totals.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40" />{' '}
                    Strong (5-8 / 25+)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500/10 border border-amber-500/30" />{' '}
                    Medium (4 / 20-24)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-rose-500/10 border border-rose-500/30" />{' '}
                    Weak (0-3 / &lt;20)
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Table Container */}
              <div className="overflow-x-auto rounded-xl border border-primary/10 shadow-lg bg-background/20">
                <table className="w-full border-collapse text-left min-w-[900px]">
                  <thead>
                    <tr className="bg-muted/40">
                      <th className="p-3 text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase border-b border-r border-primary/10 w-[180px]">
                        Planet / Sign
                      </th>
                      {Array.from({ length: 12 }).map((_, idx) => (
                        <th
                          key={idx}
                          className="p-2 text-center border-b border-r border-primary/10 last:border-r-0"
                        >
                          <div className="text-xs font-bold font-mono text-primary/80">
                            H{idx + 1}
                          </div>
                          <div className="text-[9px] text-muted-foreground font-medium truncate max-w-[70px] mx-auto">
                            {getHouseName(idx + 1)}
                          </div>
                        </th>
                      ))}
                      <th className="p-3 text-center text-xs font-mono font-bold tracking-wider text-primary uppercase border-b border-primary/10 bg-primary/5">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.planetCharts.map(planet => (
                      <tr
                        key={planet.planet}
                        className="hover:bg-primary/5 transition-colors border-b border-primary/5 last:border-b-0"
                      >
                        <td className="p-3 font-medium text-sm border-r border-primary/10 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                            {getPlanetIcon(planet.planet)}
                          </div>
                          <div>
                            <div className="font-bold text-foreground/90 leading-none">
                              {planet.name}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono leading-none">
                              {planet.symbol}
                            </span>
                          </div>
                        </td>

                        {planet.chart.map((points, houseIdx) => {
                          let cellClass = '';
                          if (points >= 5) {
                            cellClass =
                              'bg-emerald-500/20 text-emerald-400 border-emerald-500/20 font-bold shadow-[inset_0_0_4px_rgba(16,185,129,0.1)]';
                          } else if (points === 4) {
                            cellClass =
                              'bg-amber-500/10 text-amber-300 border-amber-500/25 font-semibold';
                          } else {
                            cellClass =
                              'bg-rose-500/10 text-rose-300 border-rose-500/25 font-medium';
                          }

                          return (
                            <td
                              key={houseIdx}
                              className="p-2 text-center border-r border-primary/5 last:border-r-0"
                            >
                              <span
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-mono border ${cellClass}`}
                              >
                                {points}
                              </span>
                            </td>
                          );
                        })}

                        <td className="p-3 text-center bg-primary/5 font-bold font-mono text-sm text-foreground/90 border-l border-primary/10">
                          {planet.totalPoints}
                        </td>
                      </tr>
                    ))}

                    {/* Bottom SAV Total Row */}
                    <tr className="bg-primary/10 border-t-2 border-primary/20">
                      <td className="p-3 font-extrabold text-xs text-primary border-r border-primary/20 uppercase tracking-wider flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/20">
                          <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-bold text-primary">SAV Total</div>
                          <span className="text-[9px] text-primary/70 font-mono">
                            Sarvashtakavarga
                          </span>
                        </div>
                      </td>

                      {analysis.sarvashtakavarga.chart.map((points, houseIdx) => {
                        let cellClass = '';
                        if (points >= 30) {
                          cellClass =
                            'bg-gradient-to-br from-emerald-500/25 to-teal-500/25 text-emerald-400 border-2 border-emerald-400/40 font-extrabold shadow-[0_0_8px_rgba(16,185,129,0.2)]';
                        } else if (points >= 25) {
                          cellClass =
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold';
                        } else if (points >= 20) {
                          cellClass =
                            'bg-amber-500/10 text-amber-300 border-amber-500/25 font-semibold';
                        } else {
                          cellClass =
                            'bg-rose-500/20 text-rose-300 border border-rose-500/35 font-bold';
                        }

                        return (
                          <td
                            key={houseIdx}
                            className="p-2 text-center border-r border-primary/10 last:border-r-0"
                          >
                            <span
                              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-mono border ${cellClass}`}
                            >
                              {points}
                            </span>
                          </td>
                        );
                      })}

                      {/* Total SAV Points Cell */}
                      <td className="p-3 text-center bg-primary/20 font-black font-mono text-sm text-primary shadow-[0_0_12px_rgba(99,102,241,0.2)] border-l border-primary/20">
                        {analysis.sarvashtakavarga.totalPoints}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Detailed House Predictions Cards */}
          <Card className="border-primary/10 bg-card/25 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Detailed House Interpretations (SAV)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {analysis.sarvashtakavarga.chart.map((points, index) => (
                    <Card
                      key={index}
                      className="border-primary/5 bg-background/30 hover:border-primary/20 transition-all"
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary mb-1">{points}</div>
                        <div className="text-sm font-semibold">{getHouseName(index + 1)}</div>
                        <div className="text-[10px] text-muted-foreground mb-2">
                          House {index + 1}
                        </div>
                        <Badge className={getStrengthColor(points)} variant="outline">
                          {points >= 30
                            ? 'Excellent'
                            : points >= 25
                              ? 'Good'
                              : points >= 20
                                ? 'Average'
                                : 'Poor'}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-primary/10">
                  <h4 className="font-semibold text-lg font-serif mb-4 text-primary">
                    House Predictions & Dynamic Interpretations
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(analysis.sarvashtakavarga.predictions.houses).map(
                      ([house, prediction]) => (
                        <div
                          key={house}
                          className="p-4 border border-primary/5 rounded-xl bg-background/20 hover:bg-background/40 transition-all flex gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                            {house}
                          </div>
                          <div className="space-y-1">
                            <div className="font-bold text-sm text-foreground">
                              {getHouseName(parseInt(house))}
                            </div>
                            <div className="text-xs text-muted-foreground leading-relaxed">
                              {prediction}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transit" className="space-y-6">
          {/* Transit Analysis */}
          {showTransitAnalysis && analysis.transitAnalysis.length > 0 ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Transit Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysis.transitAnalysis.map(transit => (
                      <Card key={transit.planet}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            {getPlanetIcon(transit.planet)}
                            {transit.planet} Transit
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="text-sm font-medium">Combined Strength</div>
                              <div className="text-lg font-bold text-primary">
                                {transit.combinedChart.reduce((sum, points) => sum + points, 0)}/96
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-green-600">Favorable</div>
                              <div className="text-sm text-muted-foreground">
                                {transit.predictions.favorable.length} houses
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-red-600">Challenging</div>
                              <div className="text-sm text-muted-foreground">
                                {transit.predictions.unfavorable.length} houses
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium">Peak Periods</div>
                              <div className="space-y-1">
                                {transit.timing.peakPeriods.slice(0, 2).map((peak, index) => (
                                  <div key={index} className="text-xs text-muted-foreground">
                                    {peak.date.toLocaleDateString()}: {peak.description}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Transit Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  Enable transit analysis to see current planetary influences
                </p>
                <Button onClick={() => setShowTransitAnalysis(true)}>
                  <Activity className="w-4 h-4 mr-2" />
                  Enable Transit Analysis
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          {/* Predictions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {analysis.predictions.strengths.map((strength, index) => (
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
                  {analysis.predictions.weaknesses.map((weakness, index) => (
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
                  <Clock className="w-5 h-5" />
                  Timing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {analysis.predictions.timing.map((timing, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Info className="w-3 h-3 text-blue-500" />
                      {timing}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="remedies" className="space-y-6">
          {/* Remedies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  General Remedies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {analysis.recommendations.general.map((remedy, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {remedy}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gem className="w-5 h-5" />
                  Planet-Specific Remedies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analysis.recommendations.specific).map(([planet, remedies]) => (
                    <div key={planet}>
                      <div className="font-medium text-sm flex items-center gap-2 mb-2">
                        {getPlanetIcon(planet)}
                        <span className="capitalize">{planet}</span>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                        {remedies.map((remedy, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {remedy}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAshtakavargaDashboard;
