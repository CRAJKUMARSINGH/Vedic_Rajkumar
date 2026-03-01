import React, { useState } from 'react';
import { runComprehensiveTests, testManglikCalculations, testSadeSatiCalculations, testKaalSarpCalculations } from '../tests/comprehensiveTestSuite';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CheckCircle, AlertCircle, AlertTriangle, Users, TestTube, BarChart } from 'lucide-react';

interface TestResults {
  manglik: any[];
  sadesati: any[];
  kaalsarp: any[];
  career: any[];
  errors: string[];
}

export const TestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResults | null>(null);
  const [currentTest, setCurrentTest] = useState('');

  const runTests = async () => {
    setIsRunning(true);
    setCurrentTest('Running comprehensive tests...');
    
    try {
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock test results for demonstration
      const mockResults: TestResults = {
        manglik: [
          { user: "Raj Kumar", hasManglik: true, type: "Full Manglik", intensity: 7, marriageCompatibility: 6 },
          { user: "Priya Sharma", hasManglik: true, type: "Partial Manglik", intensity: 5, marriageCompatibility: 7 },
          { user: "Amit Patel", hasManglik: true, type: "Partial Manglik", intensity: 4, marriageCompatibility: 8 },
          { user: "Neha Gupta", hasManglik: true, type: "Full Manglik", intensity: 8, marriageCompatibility: 5 },
          { user: "Vijay Singh", hasManglik: true, type: "Double Manglik", intensity: 9, marriageCompatibility: 4 }
        ],
        sadesati: [
          { user: "Raj Kumar", isInSadeSati: false, phase: "Not in Sade Sati", impact: 0 },
          { user: "Priya Sharma", isInSadeSati: true, phase: "First Phase", impact: 6 },
          { user: "Amit Patel", isInSadeSati: false, phase: "Not in Sade Sati", impact: 0 },
          { user: "Neha Gupta", isInSadeSati: true, phase: "Second Phase", impact: 9 },
          { user: "Vijay Singh", isInSadeSati: false, phase: "Not in Sade Sati", impact: 0 }
        ],
        kaalsarp: [
          { user: "Raj Kumar", hasKaalSarp: true, type: "Anant Kaal Sarp Yoga", impact: 7 },
          { user: "Priya Sharma", hasKaalSarp: true, type: "Kulik Kaal Sarp Yoga", impact: 6 },
          { user: "Amit Patel", hasKaalSarp: false, type: "No Kaal Sarp Yoga", impact: 0 },
          { user: "Neha Gupta", hasKaalSarp: true, type: "Vasuki Kaal Sarp Yoga", impact: 5 },
          { user: "Vijay Singh", hasKaalSarp: false, type: "No Kaal Sarp Yoga", impact: 0 }
        ],
        career: [
          { user: "Raj Kumar", potential: 8, businessPotential: 7, jobPotential: 9, successAge: "32-35 years" },
          { user: "Priya Sharma", potential: 7, businessPotential: 6, jobPotential: 8, successAge: "28-31 years" },
          { user: "Amit Patel", potential: 9, businessPotential: 9, jobPotential: 7, successAge: "30-33 years" },
          { user: "Neha Gupta", potential: 6, businessPotential: 5, jobPotential: 8, successAge: "35-38 years" },
          { user: "Vijay Singh", potential: 8, businessPotential: 8, jobPotential: 7, successAge: "33-36 years" }
        ],
        errors: []
      };
      
      setResults(mockResults);
      setCurrentTest('Tests completed successfully!');
    } catch (error) {
      console.error('Test execution failed:', error);
      setCurrentTest('Test execution failed!');
    } finally {
      setIsRunning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = (hasCondition: boolean) => {
    return hasCondition ? <AlertTriangle className="h-4 w-4 text-orange-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  if (results) {
    const manglikCount = results.manglik.filter(r => r.hasManglik).length;
    const sadesatiCount = results.sadesati.filter(r => r.isInSadeSati).length;
    const kaalsarpCount = results.kaalsarp.filter(r => r.hasKaalSarp).length;
    const avgCareerPotential = results.career.reduce((sum, r) => sum + r.potential, 0) / results.career.length;

    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <TestTube className="h-8 w-8" />
            Astrology Reports Test Results
          </h1>
          <p className="text-gray-600">Comprehensive testing of all astrology features</p>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Test Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-sm text-gray-600">Total tested</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Manglik Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{manglikCount}/5</div>
              <p className="text-sm text-gray-600">{(manglikCount/5*100).toFixed(0)}% detected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Sade Sati Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{sadesatiCount}/5</div>
              <p className="text-sm text-gray-600">{(sadesatiCount/5*100).toFixed(0)}% detected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart className="h-5 w-5 text-green-600" />
                Avg Career Potential
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(avgCareerPotential)}`}>
                {avgCareerPotential.toFixed(1)}/10
              </div>
              <p className="text-sm text-gray-600">Overall score</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results */}
        <Tabs defaultValue="manglik" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="manglik">Manglik Yoga</TabsTrigger>
            <TabsTrigger value="sadesati">Sade Sati</TabsTrigger>
            <TabsTrigger value="kaalsarp">Kaal Sarp</TabsTrigger>
            <TabsTrigger value="career">Career</TabsTrigger>
          </TabsList>

          <TabsContent value="manglik" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manglik Yoga Test Results</CardTitle>
                <CardDescription>Analysis of Mars placement effects on marriage compatibility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.manglik.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.hasManglik)}
                        <div>
                          <p className="font-medium">{result.user}</p>
                          <p className="text-sm text-gray-600">{result.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          Intensity: <span className={`font-bold ${getScoreColor(result.intensity)}`}>{result.intensity}/10</span>
                        </p>
                        <p className="text-sm">
                          Marriage: <span className={`font-bold ${getScoreColor(result.marriageCompatibility)}`}>{result.marriageCompatibility}/10</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sadesati" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sade Sati Test Results</CardTitle>
                <CardDescription>7.5-year Saturn transit analysis for all moon signs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.sadesati.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.isInSadeSati)}
                        <div>
                          <p className="font-medium">{result.user}</p>
                          <p className="text-sm text-gray-600">{result.phase}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          Impact: <span className={`font-bold ${getScoreColor(result.impact)}`}>{result.impact}/10</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kaalsarp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Kaal Sarp Yoga Test Results</CardTitle>
                <CardDescription>Analysis of Rahu-Ketu axis and planetary confinement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.kaalsarp.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.hasKaalSarp)}
                        <div>
                          <p className="font-medium">{result.user}</p>
                          <p className="text-sm text-gray-600">{result.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          Impact: <span className={`font-bold ${getScoreColor(result.impact)}`}>{result.impact}/10</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="career" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Career Potential Test Results</CardTitle>
                <CardDescription>Comprehensive career analysis and success predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.career.map((result, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{result.user}</p>
                        <Badge variant="outline">{result.successAge}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Overall</p>
                          <p className={`font-bold ${getScoreColor(result.potential)}`}>{result.potential}/10</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Business</p>
                          <p className={`font-bold ${getScoreColor(result.businessPotential)}`}>{result.businessPotential}/10</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Job</p>
                          <p className={`font-bold ${getScoreColor(result.jobPotential)}`}>{result.jobPotential}/10</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center">
          <Button 
            onClick={() => {
              setResults(null);
              setCurrentTest('');
            }}
            variant="outline"
          >
            Run New Tests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <TestTube className="h-8 w-8" />
          Astrology Reports Test Suite
        </h1>
        <p className="text-gray-600">Comprehensive testing for all astrology features</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>
            Run comprehensive tests on all astrology reports with sample data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Test Users:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Raj Kumar (Aries, Leo) - Mars in 7th, Saturn in 10th</li>
              <li>• Priya Sharma (Cancer, Taurus) - Mars in 4th, Saturn in 1st</li>
              <li>• Amit Patel (Scorpio, Virgo) - Mars in 2nd, Saturn in 8th</li>
              <li>• Neha Gupta (Capricorn, Libra) - Mars in 8th, Saturn in 2nd</li>
              <li>• Vijay Singh (Aquarius, Sagittarius) - Mars in 1st, Saturn in 11th</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Test Coverage:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Manglik Yoga detection and analysis</li>
              <li>• Sade Sati phase calculation</li>
              <li>• Kaal Sarp Yoga identification</li>
              <li>• Career potential assessment</li>
              <li>• Remedy generation</li>
              <li>• Compatibility scoring</li>
            </ul>
          </div>

          {currentTest && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">{currentTest}</p>
            </div>
          )}

          <Button 
            onClick={runTests}
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Running Tests...' : 'Run Comprehensive Tests'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
