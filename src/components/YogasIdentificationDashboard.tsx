/**
 * 50+ Yogas Identification Dashboard Component
 * Phase 2 Week 34: Advanced Features
 * Provides comprehensive yoga analysis and visualization
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  Crown, 
  Coins, 
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
  Heart,
  Briefcase,
  DollarSign,
  GraduationCap,
  Users,
  Activity,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Filter,
  Search,
  Radar,
  Gauge,
  PieChart,
  BarChart3,
  LineChart,
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
  Sun,
  Moon,
  Mountain,
  Flame,
  TreePine,
  Cloud,
  Sunrise,
  Sunset,
  MoonStar,
  Award,
  Trophy,
  Medal,
  Key,
  Lock,
  Unlock,
  ShieldCheck,
  HeartHandshake,
  Baby,
  Stethoscope,
  Ring,
  Award as AwardIcon
} from 'lucide-react';
import { 
  yogasIdentificationService, 
  type YogaAnalysis, 
  type YogaCalculationParams,
  type Yoga
} from '@/services/yogasIdentificationService';

const YogasIdentificationDashboard = () => {
  const [analysis, setAnalysis] = useState<YogaAnalysis | null>(null);
  const [selectedYoga, setSelectedYoga] = useState<Yoga | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterType, setFilterType] = useState<'all' | 'present' | 'potential'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'raja' | 'dhana' | 'parivartana' | 'nabhasa' | 'kalasarpa'>('all');

  useEffect(() => {
    loadYogaAnalysis();
  }, []);

  const loadYogaAnalysis = async () => {
    setIsLoading(true);
    try {
      // Mock birth data
      const mockParams: YogaCalculationParams = {
        birthDate: new Date('1990-01-15'),
        birthTime: '10:30',
        birthLocation: {
          latitude: 28.6139,
          longitude: 77.2090,
          timezone: 'Asia/Kolkata'
        },
        ayanamsa: 23.5,
        system: 'parashara',
        includeTransit: true,
        transitDate: new Date()
      };

      const result = await yogasIdentificationService.calculateYogaAnalysis(mockParams);
      setAnalysis(result);
      if (result.presentYogas.length > 0) {
        setSelectedYoga(result.presentYogas[0]);
      }
    } catch (error) {
      console.error('Failed to load yoga analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getYogaIcon = (yoga: Yoga) => {
    const icons: Record<string, React.ReactNode> = {
      raja: <Crown className="w-4 h-4" />,
      dhana: <Coins className="w-4 h-4" />,
      parivartana: <Activity className="w-4 h-4" />,
      nabhasa: <Cloud className="w-4 h-4" />,
      akhanda: <Shield className="w-4 h-4" />,
      kalasarpa: <AlertTriangle className="w-4 h-4" />,
      sankha: <Target className="w-4 h-4" />,
      pasha: <Lock className="w-4 h-4" />,
      kartari: <Zap className="w-4 h-4" />,
      asraya: <Home className="w-4 h-4" />,
      durdhara: <ShieldCheck className="w-4 h-4" />,
      sanyasa: <TreePine className="w-4 h-4" />,
      daridra: <AlertTriangle className="w-4 h-4" />,
      vipra: <AwardIcon className="w-4 h-4" />,
      shubha: <CheckCircle className="w-4 h-4" />,
      ashubha: <AlertTriangle className="w-4 h-4" />
    };
    return icons[yoga.type] || <Star className="w-4 h-4" />;
  };

  const getYogaColor = (yoga: Yoga) => {
    const colors: Record<string, string> = {
      raja: 'bg-purple-100 text-purple-800',
      dhana: 'bg-yellow-100 text-yellow-800',
      parivartana: 'bg-blue-100 text-blue-800',
      nabhasa: 'bg-indigo-100 text-indigo-800',
      akhanda: 'bg-green-100 text-green-800',
      kalasarpa: 'bg-red-100 text-red-800',
      sankha: 'bg-orange-100 text-orange-800',
      pasha: 'bg-pink-100 text-pink-800',
      kartari: 'bg-teal-100 text-teal-800',
      asraya: 'bg-cyan-100 text-cyan-800',
      durdhara: 'bg-gray-100 text-gray-800',
      sanyasa: 'bg-emerald-100 text-emerald-800',
      daridra: 'bg-orange-100 text-orange-800',
      vipra: 'bg-violet-100 text-violet-800',
      shubha: 'bg-green-100 text-green-800',
      ashubha: 'bg-red-100 text-red-800'
    };
    return colors[yoga.type] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-gray-100 text-gray-800',
      power: 'bg-purple-100 text-purple-800',
      wealth: 'bg-yellow-100 text-yellow-800',
      knowledge: 'bg-blue-100 text-blue-800',
      spiritual: 'bg-indigo-100 text-indigo-800',
      health: 'bg-green-100 text-green-800',
      relationships: 'bg-pink-100 text-pink-800',
      career: 'bg-orange-100 text-orange-800',
      negative: 'bg-red-100 text-red-800',
      positive: 'bg-green-100 text-green-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 90) return 'bg-green-100 text-green-800';
    if (strength >= 75) return 'bg-blue-100 text-blue-800';
    if (strength >= 60) return 'bg-yellow-100 text-yellow-800';
    if (strength >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getFilteredYogas = () => {
    if (!analysis) return [];
    
    let yogas = [...analysis.presentYogas];
    
    if (filterType === 'potential') {
      yogas = [...analysis.potentialYogas];
    }
    
    if (filterCategory !== 'all') {
      yogas = yogas.filter(yoga => yoga.type === filterCategory);
    }
    
    return yogas;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Calculating yoga analysis...</p>
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
            <h3 className="text-lg font-semibold mb-2">Unable to calculate yoga analysis</h3>
            <p className="text-muted-foreground mb-4">
              Please check your birth details and try again.
            </p>
            <Button onClick={loadYogaAnalysis}>
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
            <Star className="w-8 h-8" />
            50+ Yogas Identification
          </h1>
          <p className="text-muted-foreground">
            Comprehensive yoga analysis and identification system
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

      {/* Yoga Statistics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Total Yogas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-primary">{analysis.totalYogas}</div>
                <div className="text-sm text-muted-foreground">
                  {analysis.presentYogas.length} Present, {analysis.potentialYogas.length} Potential
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Raja Yogas</span>
                  <Badge variant="default">{analysis.rajaYogas}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Dhana Yogas</span>
                  <Badge variant="secondary">{analysis.dhanaYogas}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shubha Yogas</span>
                  <Badge variant="outline">{analysis.shubhaYogas}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Ashubha Yogas</span>
                  <Badge variant="destructive">{analysis.ashubhaYogas}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Raja Yogas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-purple-600">{analysis.rajaYogas}</div>
                <div className="text-sm text-muted-foreground">
                  Power and authority yogas
                </div>
              </div>
              <div className="space-y-2">
                {analysis.presentYogas.filter(y => y.type === 'raja').slice(0, 3).map((yoga, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {getYogaIcon(yoga)}
                    <span className="text-sm">{yoga.name}</span>
                    <Badge className={getStrengthColor(yoga.strength)}>
                      {yoga.strength}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Dhana Yogas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-yellow-600">{analysis.dhanaYogas}</div>
                <div className="text-sm text-muted-foreground">
                  Wealth and prosperity yogas
                </div>
              </div>
              <div className="space-y-2">
                {analysis.presentYogas.filter(y => y.type === 'dhana').slice(0, 3).map((yoga, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {getYogaIcon(yoga)}
                    <span className="text-sm">{yoga.name}</span>
                    <Badge className={getStrengthColor(yoga.strength)}>
                      {yoga.strength}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              Overall Strength
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-primary">{analysis.overallStrength.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">
                  Average yoga strength
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Chart Strength</span>
                  <Progress value={analysis.overallStrength} className="w-20 h-2" />
                </div>
                <div className="text-sm text-muted-foreground">
                  {analysis.overallStrength >= 70 ? 'Excellent' : 
                   analysis.overallStrength >= 50 ? 'Good' : 
                   analysis.overallStrength >= 30 ? 'Average' : 'Weak'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
          >
            All Yogas
          </Button>
          <Button
            variant={filterType === 'present' ? 'default' : 'outline'}
            onClick={() => setFilterType('present')}
          >
            Present
          </Button>
          <Button
            variant={filterType === 'potential' ? 'default' : 'outline'}
            onClick={() => setFilterType('potential')}
          >
            Potential
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterCategory('all')}
          >
            All Types
          </Button>
          <Button
            variant={filterCategory === 'raja' ? 'default' : 'outline'}
            onClick={() => setFilterCategory('raja')}
          >
            Raja
          </Button>
          <Button
            variant={filterCategory === 'dhana' ? 'default' : 'outline'}
            onClick={() => setFilterCategory('dhana')}
          >
            Dhana
          </Button>
          <Button
            variant={filterCategory === 'kalasarpa' ? 'default' : 'outline'}
            onClick={() => setFilterCategory('kalasarpa')}
          >
            Kalasarpa
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="yogas">Yogas</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="remedies">Remedies</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Present Yogas Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Present Yogas Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.presentYogas.map((yoga) => (
                  <Card 
                    key={yoga.id}
                    className={`cursor-pointer transition-all ${
                      selectedYoga?.id === yoga.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedYoga(yoga)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                          {getYogaIcon(yoga)}
                        </div>
                        <div>
                          <div className="font-medium">{yoga.name}</div>
                          <div className="text-sm text-muted-foreground">{yoga.nameHi}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Type</span>
                          <Badge className={getYogaColor(yoga)}>
                            {yoga.type}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Category</span>
                          <Badge className={getCategoryColor(yoga.category)}>
                            {yoga.category}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Strength</span>
                          <Badge className={getStrengthColor(yoga.strength)}>
                            {yoga.strength}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Yoga Details */}
          {selectedYoga && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getYogaIcon(selectedYoga)}
                  {selectedYoga.name} - Detailed Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Description</h4>
                    <div className="text-sm text-muted-foreground mb-3">
                      {selectedYoga.description}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedYoga.descriptionHi}
                    </div>
                    
                    <h4 className="font-semibold mb-3">Formation</h4>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Method:</span> {selectedYoga.formation.method}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Houses:</span> {selectedYoga.houses.join(', ')}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Special Conditions:</span> {selectedYoga.formation.specialConditions.join(', ')}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Effects</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-green-600">Positive Effects</div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {selectedYoga.effects.positive.map((effect, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {effect}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-red-600">Negative Effects</div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {selectedYoga.effects.negative.map((effect, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <AlertTriangle className="w-3 h-3 text-orange-500" />
                              {effect}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-sm font-medium">General Effect</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedYoga.effects.general}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="yogas" className="space-y-6">
          {/* Detailed Yoga List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Yoga Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getFilteredYogas().map((yoga) => (
                  <Card key={yoga.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                            {getYogaIcon(yoga)}
                          </div>
                          <div>
                            <div className="font-medium">{yoga.name}</div>
                            <div className="text-sm text-muted-foreground">{yoga.nameHi}</div>
                            <div className="text-xs text-muted-foreground">{yoga.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getYogaColor(yoga)}>
                            {yoga.type}
                          </Badge>
                          <Badge className={getCategoryColor(yoga.category)}>
                            {yoga.category}
                          </Badge>
                          <Badge className={getStrengthColor(yoga.strength)}>
                            {yoga.strength}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {/* Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Overall Prediction</h4>
                  <p className="text-sm text-muted-foreground">
                    {analysis.predictions.overall}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Strengths</CardTitle>
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
                      <CardTitle className="text-sm">Weaknesses</CardTitle>
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
                      <CardTitle className="text-sm">Life Areas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm font-medium">Career</div>
                          <div className="text-xs text-muted-foreground">
                            {analysis.predictions.lifeAreas.career}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Finance</div>
                          <div className="text-xs text-muted-foreground">
                            {analysis.predictions.lifeAreas.finance}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Health</div>
                          <div className="text-xs text-muted-foreground">
                            {analysis.predictions.lifeAreas.health}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Relationships</div>
                          <div className="text-xs text-muted-foreground">
                            {analysis.predictions.lifeAreas.relationships}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Spirituality</div>
                          <div className="text-xs text-muted-foreground">
                            {analysis.predictions.lifeAreas.spirituality}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Education</div>
                          <div className="text-xs text-muted-foreground">
                            {analysis.predictions.lifeAreas.education}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
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
                  Yoga-Specific Remedies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analysis.recommendations.specific).map(([yogaName, remedies]) => (
                    <div key={yogaName}>
                      <div className="font-medium text-sm mb-2">{yogaName}</div>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
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

        <TabsContent value="education" className="space-y-6">
          {/* Educational Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Understanding Yogas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">What are Yogas?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yogas are specific planetary combinations in Vedic astrology that produce distinctive effects on a person's life. They are formed by the specific placement, aspect, and relationship between planets, houses, and signs in the birth chart.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Types of Yogas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        <span className="font-medium">Raja Yogas</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Power, authority, and royal status. Formed by Kendra-Trikona relationships.
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4" />
                        <span className="font-medium">Dhana Yogas</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Wealth, prosperity, and financial gains. Formed by 2nd-11th house relationships.
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span className="font-medium">Parivartana Yogas</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Exchange relationships between planets. Bring balanced results.
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-4 h-4" />
                        <span className="font-medium">Nabhasa Yogas</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Celestial formations based on planetary positions. Very powerful.
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Kalasarpa Yogas</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        All planets between Rahu and Ketu. Indicates challenges.
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span className="font-medium">Akhanda Yogas</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Uninterrupted planetary formations. Very auspicious.
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Yoga Formation</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Planetary positions in specific houses</li>
                    <li>Aspects between planets</li>
li <li>Conjunctions and exchanges</li>
                    <li>Lordship relationships</li>
                    <li>Dignity and strength of planets</li>
                    <li>Special conditions and combinations</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Yoga Strength</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>90-100%</span>
                        <Badge variant="default">Excellent</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>75-89%</span>
                        <Badge variant="secondary">Very Good</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>60-74%</span>
                        <Badge variant="outline">Good</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>40-59%</span>
                        <Badge variant="outline">Average</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>0-39%</span>
                        <Badge variant="destructive">Weak</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Benefits of Yoga Analysis</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Understanding inherent strengths and weaknesses</li>
                    <li>Predicting life events and timing</li>
                    <li>Identifying favorable and unfavorable periods</li>
                    <li>Guiding career and life decisions</li>
                    <li>Providing remedial measures for challenges</li>
                    <li>Enhancing positive planetary influences</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Remedial Measures</h4>
                  <p className="text-sm text-muted-foreground">
                    Remedies help strengthen positive yogas and mitigate negative effects of challenging yogas. These include mantras, gemstones, charity, fasting, and worship practices specific to each yoga.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default YogasIdentificationDashboard;
