/**
 * Quick Wins Dashboard Component
 * Week 28 - Wednesday Implementation
 * Track and display quick improvements
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { quickWinsService, type QuickWin } from '@/services/quickWinsService';

interface QuickWinsDashboardProps {
  language?: 'en' | 'hi';
}

export const QuickWinsDashboard: React.FC<QuickWinsDashboardProps> = ({ language = 'en' }) => {
  const [wins, setWins] = useState<QuickWin[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [impact, setImpact] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress' | 'planned'>('all');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = () => {
    const allWins = filter === 'all' 
      ? quickWinsService.getAllQuickWins()
      : quickWinsService.getQuickWinsByStatus(filter);
    
    setWins(allWins);
    setStats(quickWinsService.getStatistics());
    setImpact(quickWinsService.getImpactSummary());
    setCategories(quickWinsService.getQuickWinsByCategory());
  };

  const t = {
    title: language === 'hi' ? '⚡ त्वरित जीत डैशबोर्ड' : '⚡ Quick Wins Dashboard',
    subtitle: language === 'hi' 
      ? 'छोटे सुधार, बड़ा प्रभाव' 
      : 'Small improvements, big impact',
    overview: language === 'hi' ? 'अवलोकन' : 'Overview',
    total: language === 'hi' ? 'कुल' : 'Total',
    completed: language === 'hi' ? 'पूर्ण' : 'Completed',
    inProgress: language === 'hi' ? 'प्रगति में' : 'In Progress',
    planned: language === 'hi' ? 'योजनाबद्ध' : 'Planned',
    completionRate: language === 'hi' ? 'पूर्णता दर' : 'Completion Rate',
    timeInvested: language === 'hi' ? 'समय निवेश' : 'Time Invested',
    impact: language === 'hi' ? 'प्रभाव' : 'Impact',
    categories: language === 'hi' ? 'श्रेणियां' : 'Categories',
    allWins: language === 'hi' ? 'सभी जीत' : 'All Wins',
    bugFixes: language === 'hi' ? 'बग फिक्स' : 'Bug Fixes',
    uxImprovements: language === 'hi' ? 'UX सुधार' : 'UX Improvements',
    features: language === 'hi' ? 'फीचर्स' : 'Features',
    performance: language === 'hi' ? 'प्रदर्शन' : 'Performance',
    content: language === 'hi' ? 'सामग्री' : 'Content',
    minutes: language === 'hi' ? 'मिनट' : 'minutes',
    estimated: language === 'hi' ? 'अनुमानित' : 'Estimated',
    actual: language === 'hi' ? 'वास्तविक' : 'Actual',
    priority: language === 'hi' ? 'प्राथमिकता' : 'Priority',
    high: language === 'hi' ? 'उच्च' : 'High',
    medium: language === 'hi' ? 'मध्यम' : 'Medium',
    low: language === 'hi' ? 'निम्न' : 'Low'
  };

  const getTypeIcon = (type: QuickWin['type']): string => {
    switch (type) {
      case 'bug_fix': return '🐛';
      case 'ux_improvement': return '✨';
      case 'small_feature': return '🎁';
      case 'performance': return '⚡';
      case 'content': return '📝';
      default: return '📌';
    }
  };

  const getTypeLabel = (type: QuickWin['type']): string => {
    const labels = {
      bug_fix: language === 'hi' ? 'बग फिक्स' : 'Bug Fix',
      ux_improvement: language === 'hi' ? 'UX सुधार' : 'UX Improvement',
      small_feature: language === 'hi' ? 'छोटा फीचर' : 'Small Feature',
      performance: language === 'hi' ? 'प्रदर्शन' : 'Performance',
      content: language === 'hi' ? 'सामग्री' : 'Content'
    };
    return labels[type];
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'planned': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-pulse mb-4">⚡</div>
          <p className="text-gray-600">Loading quick wins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            {t.title}
          </h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border-l-4 border-l-purple-500">
            <div className="text-sm text-gray-600 mb-1">{t.total}</div>
            <div className="text-3xl font-bold text-purple-600">{stats.total}</div>
          </Card>

          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="text-sm text-gray-600 mb-1">{t.completed}</div>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </Card>

          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="text-sm text-gray-600 mb-1">{t.inProgress}</div>
            <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
          </Card>

          <Card className="p-4 border-l-4 border-l-gray-500">
            <div className="text-sm text-gray-600 mb-1">{t.planned}</div>
            <div className="text-3xl font-bold text-gray-600">{stats.planned}</div>
          </Card>
        </div>

        {/* Completion Progress */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{t.completionRate}</h2>
            <span className="text-2xl font-bold text-green-600">
              {stats.completionRate.toFixed(0)}%
            </span>
          </div>
          <Progress value={stats.completionRate} className="h-4" />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{stats.completed} {t.completed}</span>
            <span>{stats.total - stats.completed} remaining</span>
          </div>
        </Card>

        {/* Impact Summary */}
        {impact && (
          <Card className="p-6 mb-8 border-l-4 border-l-yellow-500">
            <h2 className="text-2xl font-bold mb-4">🎯 {t.impact}</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{impact.bugsFixed}</div>
                <div className="text-sm text-gray-600">🐛 {t.bugFixes}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{impact.uxImprovements}</div>
                <div className="text-sm text-gray-600">✨ {t.uxImprovements}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{impact.featuresAdded}</div>
                <div className="text-sm text-gray-600">🎁 {t.features}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{impact.performanceGains}</div>
                <div className="text-sm text-gray-600">⚡ {t.performance}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{impact.contentUpdates}</div>
                <div className="text-sm text-gray-600">📝 {t.content}</div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{t.timeInvested}</div>
              <div className="text-2xl font-bold text-yellow-700">
                {Math.round(impact.totalTimeInvested / 60)} hours {impact.totalTimeInvested % 60} {t.minutes}
              </div>
              <div className="text-sm text-gray-600 mt-2">{impact.estimatedUserImpact}</div>
            </div>
          </Card>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            {t.allWins}
          </Button>
          <Button
            onClick={() => setFilter('completed')}
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
          >
            {t.completed}
          </Button>
          <Button
            onClick={() => setFilter('in_progress')}
            variant={filter === 'in_progress' ? 'default' : 'outline'}
            size="sm"
          >
            {t.inProgress}
          </Button>
          <Button
            onClick={() => setFilter('planned')}
            variant={filter === 'planned' ? 'default' : 'outline'}
            size="sm"
          >
            {t.planned}
          </Button>
        </div>

        {/* Quick Wins List */}
        <div className="space-y-4">
          {wins.map(win => (
            <Card key={win.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="text-3xl">{getTypeIcon(win.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{win.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{win.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(win.status)}>
                        {win.status}
                      </Badge>
                      <Badge className={getPriorityColor(win.priority)}>
                        {win.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📁 {getTypeLabel(win.type)}</span>
                    <span>⏱️ {t.estimated}: {win.estimatedTime}m</span>
                    {win.actualTime && (
                      <span>✅ {t.actual}: {win.actualTime}m</span>
                    )}
                    {win.implementedDate && (
                      <span>📅 {new Date(win.implementedDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {wins.length === 0 && (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {filter === 'completed' ? 'All done!' : 'No items found'}
            </h3>
            <p className="text-gray-600">
              {filter === 'completed' 
                ? 'Great job completing all quick wins!' 
                : 'Try changing the filter to see more items'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuickWinsDashboard;
