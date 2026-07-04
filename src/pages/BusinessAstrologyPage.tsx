/**
 * Business Astrology Page - Complete Business Success Analysis UI
 * Week 16: Business Astrology - Thursday Implementation
 * Comprehensive business astrology interface with all analysis components
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Calendar, AlertTriangle, Target, DollarSign, Sparkles } from 'lucide-react';
import { generateBusinessAnalysis } from '../services/businessAstrologyService';
import { generatePartnershipAnalysis } from '../services/partnershipAnalysisService';
import { generateFinancialTimingAnalysis } from '../services/financialTimingService';
import CompanyNameLetterCard from '../components/CompanyNameLetterCard';

interface BusinessAstrologyPageProps {
  birthChart?: any;
}

export const BusinessAstrologyPage: React.FC<BusinessAstrologyPageProps> = ({ birthChart }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'partnership' | 'timing' | 'risks' | 'nameletter'>('overview');
  const [businessAnalysis, setBusinessAnalysis] = useState<any>(null);
  const [partnershipAnalysis, setPartnershipAnalysis] = useState<any>(null);
  const [timingAnalysis, setTimingAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (birthChart) {
      setLoading(true);
      
      // Generate all analyses
      const business = generateBusinessAnalysis('user', birthChart);
      const partnership = generatePartnershipAnalysis('user', birthChart);
      const timing = generateFinancialTimingAnalysis('user', birthChart);
      
      setBusinessAnalysis(business);
      setPartnershipAnalysis(partnership);
      setTimingAnalysis(timing);
      setLoading(false);
    }
  }, [birthChart]);

  const TabButton: React.FC<{ 
    tab: string; 
    icon: React.ReactNode; 
    label: string; 
    count?: number 
  }> = ({ tab, icon, label, count }) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        activeTab === tab
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {count && (
        <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
          {count}
        </span>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analyzing your business potential...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Business Astrology Analysis</h1>
            <p className="text-lg text-muted-foreground">
              Comprehensive business success guidance based on Vedic astrology
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overall Score Card */}
        {businessAnalysis && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-green-800">
                  Business Success Score: {businessAnalysis.overallScore}/100
                </h2>
                <p className="text-green-600 mt-1">
                  {businessAnalysis.overallScore > 70 ? 'Excellent business potential' :
                   businessAnalysis.overallScore > 50 ? 'Good business prospects' :
                   'Moderate business potential - focus on improvements'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-700">
                  {businessAnalysis.overallScore > 70 ? '🚀' :
                   businessAnalysis.overallScore > 50 ? '📈' : '⚡'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton 
            tab="overview" 
            icon={<TrendingUp className="h-4 w-4" />} 
            label="Business Overview" 
          />
          <TabButton 
            tab="partnership" 
            icon={<Users className="h-4 w-4" />} 
            label="Partnership Analysis" 
          />
          <TabButton 
            tab="timing" 
            icon={<Calendar className="h-4 w-4" />} 
            label="Financial Timing" 
          />
          <TabButton 
            tab="risks" 
            icon={<AlertTriangle className="h-4 w-4" />} 
            label="Risk Assessment" 
          />
          <TabButton
            tab="nameletter"
            icon={<Sparkles className="h-4 w-4" />}
            label="Company Name Letters"
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && businessAnalysis && (
          <div className="space-y-6">
            {/* Business Indicators */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  2nd House - Wealth
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Strength:</span>
                    <span className="font-semibold">{businessAnalysis.businessIndicators.secondHouse.strength}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${businessAnalysis.businessIndicators.secondHouse.strength}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {businessAnalysis.businessIndicators.secondHouse.significance.en}
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  10th House - Career
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Strength:</span>
                    <span className="font-semibold">{businessAnalysis.businessIndicators.tenthHouse.strength}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${businessAnalysis.businessIndicators.tenthHouse.strength}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {businessAnalysis.businessIndicators.tenthHouse.significance.en}
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  11th House - Gains
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Strength:</span>
                    <span className="font-semibold">{businessAnalysis.businessIndicators.eleventhHouse.strength}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${businessAnalysis.businessIndicators.eleventhHouse.strength}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {businessAnalysis.businessIndicators.eleventhHouse.significance.en}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* More tab content will be added in the next part */}

        {/* Partnership Analysis Tab */}
        {activeTab === 'partnership' && partnershipAnalysis && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Partnership Compatibility Analysis</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Compatibility Score: {partnershipAnalysis.compatibility.overallScore}%</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Mental Compatibility:</span>
                      <span>{partnershipAnalysis.compatibility.compatibilityFactors.mentalCompatibility}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Financial Compatibility:</span>
                      <span>{partnershipAnalysis.compatibility.compatibilityFactors.financialCompatibility}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Communication:</span>
                      <span>{partnershipAnalysis.compatibility.compatibilityFactors.communicationCompatibility}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trust Factor:</span>
                      <span>{partnershipAnalysis.compatibility.compatibilityFactors.trustFactor}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Partnership Strengths</h4>
                  <ul className="space-y-1">
                    {partnershipAnalysis.compatibility.strengths.map((strength: string, index: number) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h4 className="font-semibold mb-3 text-green-700">Ideal Partner Qualities</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Business Skills:</p>
                    <ul className="text-sm text-muted-foreground mt-1">
                      {partnershipAnalysis.idealPartner.idealPartner.businessSkills.slice(0, 3).map((skill: string, index: number) => (
                        <li key={index}>• {skill}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Personality Traits:</p>
                    <ul className="text-sm text-muted-foreground mt-1">
                      {partnershipAnalysis.idealPartner.idealPartner.personality.slice(0, 3).map((trait: string, index: number) => (
                        <li key={index}>• {trait}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h4 className="font-semibold mb-3 text-red-700">Partnership Red Flags</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Business Risks:</p>
                    <ul className="text-sm text-muted-foreground mt-1">
                      {partnershipAnalysis.idealPartner.avoidPartner.businessRisks.slice(0, 3).map((risk: string, index: number) => (
                        <li key={index}>• {risk}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Warning Signs:</p>
                    <ul className="text-sm text-muted-foreground mt-1">
                      {partnershipAnalysis.idealPartner.avoidPartner.redFlags.slice(0, 3).map((flag: string, index: number) => (
                        <li key={index}>• {flag}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Timing Tab */}
        {activeTab === 'timing' && timingAnalysis && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Current Period Analysis</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {timingAnalysis.currentPeriodAnalysis.businessScore}%
                  </div>
                  <p className="text-sm text-muted-foreground">Current Business Score</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {timingAnalysis.currentPeriodAnalysis.trend === 'rising' ? '📈' :
                     timingAnalysis.currentPeriodAnalysis.trend === 'declining' ? '📉' : '➡️'}
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {timingAnalysis.currentPeriodAnalysis.trend} Trend
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">📅</div>
                  <p className="text-sm text-muted-foreground">
                    {timingAnalysis.currentPeriodAnalysis.period}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h4 className="font-semibold mb-3 text-green-700">Optimal Launch Periods</h4>
                <div className="space-y-3">
                  {timingAnalysis.launchTiming.optimalPeriods.slice(0, 2).map((period: any, index: number) => (
                    <div key={index} className="border-l-4 border-green-500 pl-4">
                      <p className="font-medium">{period.period}</p>
                      <p className="text-sm text-muted-foreground">{period.description.en}</p>
                      <p className="text-xs text-green-600 mt-1">
                        Success Probability: {period.successProbability}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h4 className="font-semibold mb-3 text-red-700">Periods to Avoid</h4>
                <div className="space-y-3">
                  {timingAnalysis.launchTiming.avoidPeriods.slice(0, 2).map((period: any, index: number) => (
                    <div key={index} className="border-l-4 border-red-500 pl-4">
                      <p className="font-medium">{period.period}</p>
                      <p className="text-sm text-muted-foreground">{period.description.en}</p>
                      <p className="text-xs text-red-600 mt-1 capitalize">
                        Risk Level: {period.riskLevel}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="font-semibold mb-3">Investment Opportunities</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {timingAnalysis.investmentTiming.expansionPeriods.slice(0, 2).map((expansion: any, index: number) => (
                  <div key={index} className="bg-muted/30 p-4 rounded-lg">
                    <h5 className="font-medium">{expansion.period}</h5>
                    <p className="text-sm text-muted-foreground mt-1">{expansion.description.en}</p>
                    <div className="flex justify-between mt-2 text-xs">
                      <span>Success Rate: {expansion.successRate}%</span>
                      <span className="capitalize">Type: {expansion.investmentType}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Risk Assessment Tab */}
        {activeTab === 'risks' && partnershipAnalysis && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Overall Risk Assessment</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                  partnershipAnalysis.riskAssessment.overallRisk === 'low' ? 'bg-green-100 text-green-700' :
                  partnershipAnalysis.riskAssessment.overallRisk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {partnershipAnalysis.riskAssessment.overallRisk.toUpperCase()} RISK
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h4 className="font-semibold mb-3">Financial Risks</h4>
                <div className={`text-sm px-2 py-1 rounded mb-3 ${
                  partnershipAnalysis.riskAssessment.riskFactors.financial.level === 'low' ? 'bg-green-100 text-green-700' :
                  partnershipAnalysis.riskAssessment.riskFactors.financial.level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {partnershipAnalysis.riskAssessment.riskFactors.financial.level.toUpperCase()}
                </div>
                <ul className="text-sm space-y-1">
                  {partnershipAnalysis.riskAssessment.riskFactors.financial.factors.slice(0, 3).map((factor: string, index: number) => (
                    <li key={index}>• {factor}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h4 className="font-semibold mb-3">Operational Risks</h4>
                <div className={`text-sm px-2 py-1 rounded mb-3 ${
                  partnershipAnalysis.riskAssessment.riskFactors.operational.level === 'low' ? 'bg-green-100 text-green-700' :
                  partnershipAnalysis.riskAssessment.riskFactors.operational.level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {partnershipAnalysis.riskAssessment.riskFactors.operational.level.toUpperCase()}
                </div>
                <ul className="text-sm space-y-1">
                  {partnershipAnalysis.riskAssessment.riskFactors.operational.factors.slice(0, 3).map((factor: string, index: number) => (
                    <li key={index}>• {factor}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h4 className="font-semibold mb-3">Personal Risks</h4>
                <div className={`text-sm px-2 py-1 rounded mb-3 ${
                  partnershipAnalysis.riskAssessment.riskFactors.personal.level === 'low' ? 'bg-green-100 text-green-700' :
                  partnershipAnalysis.riskAssessment.riskFactors.personal.level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {partnershipAnalysis.riskAssessment.riskFactors.personal.level.toUpperCase()}
                </div>
                <ul className="text-sm space-y-1">
                  {partnershipAnalysis.riskAssessment.riskFactors.personal.factors.slice(0, 3).map((factor: string, index: number) => (
                    <li key={index}>• {factor}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h4 className="font-semibold mb-3 text-orange-700">Warning Signals</h4>
                <ul className="text-sm space-y-1">
                  {partnershipAnalysis.riskAssessment.warningSignals.slice(0, 4).map((signal: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-orange-600">⚠️</span>
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h4 className="font-semibold mb-3 text-blue-700">Protective Strategies</h4>
                <ul className="text-sm space-y-1">
                  {partnershipAnalysis.riskAssessment.protectiveStrategies.slice(0, 4).map((strategy: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-blue-600">🛡️</span>
                      {strategy}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Company Name Letter Tab */}
        {activeTab === 'nameletter' && (
          <div className="max-w-2xl">
            <CompanyNameLetterCard lang="en" />
          </div>
        )}

        {/* Business Type Recommendations */}
        {businessAnalysis && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Recommended Business Types</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businessAnalysis.businessTypes.slice(0, 6).map((businessType: any, index: number) => (
                <div key={index} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm">{businessType.type}</h4>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {businessType.suitability}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {businessType.description.en}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium">Success Factors:</p>
                      <ul className="text-xs text-muted-foreground">
                        {businessType.successFactors.slice(0, 2).map((factor: string, idx: number) => (
                          <li key={idx}>• {factor}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {businessAnalysis && (
          <div className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Key Recommendations</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-green-700">Your Strengths</h4>
                <ul className="space-y-1">
                  {businessAnalysis.strengths.map((strength: string, index: number) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-orange-700">Areas to Improve</h4>
                <ul className="space-y-1">
                  {businessAnalysis.weaknesses.map((weakness: string, index: number) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <span className="text-orange-600">⚡</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Strategic Recommendations</h4>
              <ul className="space-y-1">
                {businessAnalysis.recommendations.en.map((recommendation: string, index: number) => (
                  <li key={index} className="text-sm flex items-center gap-2">
                    <span className="text-primary">💡</span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!birthChart && (
          <div className="text-center py-12">
            <div className="bg-muted/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No birth chart data available</h3>
            <p className="text-muted-foreground">
              Please provide your birth chart details to get comprehensive business astrology analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessAstrologyPage;
