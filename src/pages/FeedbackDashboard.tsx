/**
 * Feedback Dashboard Component
 * Week 28 - Tuesday Implementation
 * Visualize feedback analysis and insights
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { feedbackAnalysisService, type FeedbackAnalysis } from '@/services/feedbackAnalysisService';
import { feedbackService } from '@/services/feedbackService';

interface FeedbackDashboardProps {
  language?: 'en' | 'hi';
}

export const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({ language = 'en' }) => {
  const [analysis, setAnalysis] = useState<FeedbackAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = () => {
    setLoading(true);
    try {
      const result = feedbackAnalysisService.analyzeAllFeedback();
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const t = {
    title: language === 'hi' ? '📊 फीडबैक विश्लेषण डैशबोर्ड' : '📊 Feedback Analysis Dashboard',
    overview: language === 'hi' ? 'अवलोकन' : 'Overview',
    totalFeedback: language === 'hi' ? 'कुल फीडबैक' : 'Total Feedback',
    avgRating: language === 'hi' ? 'औसत रेटिंग' : 'Average Rating',
    sentiment: language === 'hi' ? 'भावना स्कोर' : 'Sentiment Score',
    topIssues: language === 'hi' ? 'शीर्ष समस्याएं' : 'Top Issues',
    topRequests: language === 'hi' ? 'शीर्ष अनुरोध' : 'Top Requests',
    painPoints: language === 'hi' ? 'दर्द बिंदु' : 'Pain Points',
    trends: language === 'hi' ? 'रुझान' : 'Trends',
    recommendations: language === 'hi' ? 'सिफारिशें' : 'Recommendations',
    urgentItems: language === 'hi' ? 'तत्काल आइटम' : 'Urgent Items',
    refresh: language === 'hi' ? 'रीफ्रेश करें' : 'Refresh',
    votes: language === 'hi' ? 'वोट्स' : 'Votes',
    priority: language === 'hi' ? 'प्राथमिकता' : 'Priority',
    impact: language === 'hi' ? 'प्रभाव' : 'Impact',
    effort: language === 'hi' ? 'प्रयास' : 'Effort'
  };

  const getSentimentLabel = (score: number): { label: string; color: string } => {
    if (score > 0.3) return { label: language === 'hi' ? 'सकारात्मक' : 'Positive', color: 'text-green-600' };
    if (score < -0.3) return { label: language === 'hi' ? 'नकारात्मक' : 'Negative', color: 'text-red-600' };
    return { label: language === 'hi' ? 'तटस्थ' : 'Neutral', color: 'text-yellow-600' };
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'immediate': return 'bg-red-100 text-red-700';
      case 'short_term': return 'bg-yellow-100 text-yellow-700';
      case 'long_term': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-pulse mb-4">📊</div>
          <p className="text-gray-600">Analyzing feedback...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No feedback data available</p>
      </div>
    );
  }

  const sentiment = getSentimentLabel(analysis.sentimentScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <Button onClick={loadAnalysis}>{t.refresh}</Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-l-4 border-l-purple-500">
            <div className="text-sm text-gray-600 mb-2">{t.totalFeedback}</div>
            <div className="text-4xl font-bold text-purple-600">{analysis.totalFeedback}</div>
          </Card>

          <Card className="p-6 border-l-4 border-l-yellow-500">
            <div className="text-sm text-gray-600 mb-2">{t.avgRating}</div>
            <div className="flex items-center gap-2">
              <div className="text-4xl font-bold text-yellow-600">
                {analysis.averageRating.toFixed(1)}
              </div>
              <div className="text-2xl">⭐</div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-green-500">
            <div className="text-sm text-gray-600 mb-2">{t.sentiment}</div>
            <div className={`text-2xl font-bold ${sentiment.color}`}>
              {sentiment.label}
            </div>
            <Progress 
              value={(analysis.sentimentScore + 1) * 50} 
              className="mt-2"
            />
          </Card>
        </div>

        {/* Urgent Items */}
        {analysis.urgentItems.length > 0 && (
          <Card className="p-6 mb-8 border-l-4 border-l-red-500">
            <h2 className="text-2xl font-bold mb-4 text-red-600">
              🚨 {t.urgentItems} ({analysis.urgentItems.length})
            </h2>
            <div className="space-y-3">
              {analysis.urgentItems.slice(0, 5).map(item => (
                <div key={item.id} className="bg-red-50 p-3 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <Badge className="bg-red-100 text-red-700">{item.priority}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recommendations */}
        <Card className="p-6 mb-8 border-l-4 border-l-blue-500">
          <h2 className="text-2xl font-bold mb-4">💡 {t.recommendations}</h2>
          <div className="space-y-3">
            {analysis.recommendations.map((rec, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{rec.action}</h3>
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>📊 {t.impact}: {rec.estimatedImpact}</span>
                  <span>⚡ {t.effort}: {rec.estimatedEffort}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Issues */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">🐛 {t.topIssues}</h2>
            <div className="space-y-4">
              {analysis.topIssues.map((issue, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">{issue.category}</span>
                    <Badge className={
                      issue.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      issue.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }>
                      {issue.severity}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {issue.count} reports
                  </div>
                  <div className="text-xs text-gray-500">
                    {issue.examples.slice(0, 2).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Feature Requests */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">🚀 {t.topRequests}</h2>
            <div className="space-y-4">
              {analysis.topRequests.map((req, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">{req.title}</span>
                    <span className="text-sm text-purple-600 font-bold">
                      {req.votes} {t.votes}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>📊 {req.impact}</span>
                    <span>⚡ {req.estimatedEffort}</span>
                    <span>🎯 {req.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Pain Points */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">😣 {t.painPoints}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.painPoints.map((pain, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{pain.area}</h3>
                  <Badge className={
                    pain.impact === 'high' ? 'bg-red-100 text-red-700' :
                    pain.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }>
                    {pain.impact}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{pain.description}</p>
                <p className="text-xs text-gray-500 italic">💡 {pain.suggestedFix}</p>
                <div className="text-xs text-gray-400 mt-2">
                  {pain.frequency} mentions
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Trends */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">📈 {t.trends}</h2>
          <div className="space-y-4">
            {analysis.trends.map((trend, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-3 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">{trend.category}</span>
                  <Badge className={
                    trend.type === 'increasing' ? 'bg-red-100 text-red-700' :
                    trend.type === 'decreasing' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }>
                    {trend.type === 'increasing' ? '📈' : trend.type === 'decreasing' ? '📉' : '➡️'} {trend.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{trend.description}</p>
                <p className="text-xs text-gray-500 italic">{trend.recommendation}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackDashboard;
