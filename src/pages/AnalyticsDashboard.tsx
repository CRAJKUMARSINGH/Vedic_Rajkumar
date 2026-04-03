/**
 * Analytics Dashboard Component
 * Week 27 - Thursday Implementation
 * Real-time metrics, performance, user behavior
 */

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { performanceMonitor, type PerformanceReport } from '@/utils/performanceMonitoringService';
import { userBehavior } from '@/utils/userBehaviorService';

interface DashboardData {
  performance: PerformanceReport | null;
  perfScore: number;
  behavior: ReturnType<typeof userBehavior.getSummary>;
  feedback: any[];
}

const ratingColor = (r: string) =>
  r === 'good' ? 'bg-green-100 text-green-700' :
  r === 'needs-improvement' ? 'bg-yellow-100 text-yellow-700' :
  'bg-red-100 text-red-700';

const scoreColor = (s: number) =>
  s >= 90 ? 'text-green-600' : s >= 70 ? 'text-yellow-600' : 'text-red-600';

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    performance: null,
    perfScore: 0,
    behavior: userBehavior.getSummary(),
    feedback: []
  });
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  useEffect(() => {
    performanceMonitor.startMonitoring();

    const refresh = () => {
      setData({
        performance: performanceMonitor.getReport(),
        perfScore: performanceMonitor.getScore(),
        behavior: userBehavior.getSummary(),
        feedback: userBehavior.getFeedback()
      });
    };

    refresh();
    const interval = setInterval(refresh, 5000);
    return () => {
      clearInterval(interval);
      performanceMonitor.disconnect();
    };
  }, []);

  const t = {
    title:       language === 'hi' ? '📊 एनालिटिक्स डैशबोर्ड' : '📊 Analytics Dashboard',
    perf:        language === 'hi' ? '⚡ परफॉर्मेंस मेट्रिक्स' : '⚡ Performance Metrics',
    behavior:    language === 'hi' ? '👤 उपयोगकर्ता व्यवहार' : '👤 User Behavior',
    feedback:    language === 'hi' ? '💬 फीडबैक' : '💬 Feedback',
    score:       language === 'hi' ? 'स्कोर' : 'Score',
    duration:    language === 'hi' ? 'सत्र अवधि' : 'Session Duration',
    pages:       language === 'hi' ? 'पृष्ठ देखे' : 'Pages Visited',
    features:    language === 'hi' ? 'फीचर उपयोग' : 'Features Used',
    clicks:      language === 'hi' ? 'कुल क्लिक' : 'Total Clicks',
    scroll:      language === 'hi' ? 'अधिकतम स्क्रॉल' : 'Max Scroll Depth',
    noFeedback:  language === 'hi' ? 'अभी तक कोई फीडबैक नहीं' : 'No feedback yet',
    good:        language === 'hi' ? 'अच्छा' : 'Good',
    improve:     language === 'hi' ? 'सुधार चाहिए' : 'Needs Improvement',
    poor:        language === 'hi' ? 'खराब' : 'Poor'
  };

  const formatDuration = (ms: number) => {
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  const avgRating = data.feedback.length
    ? (data.feedback.reduce((a, f) => a + f.rating, 0) / data.feedback.length).toFixed(1)
    : '—';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {t.title}
        </h1>
        <button
          onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
          className="px-4 py-2 rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 transition-colors text-sm font-medium"
        >
          {language === 'en' ? 'हिंदी' : 'English'}
        </button>
      </div>

      {/* Performance Score */}
      <Card className="p-6 mb-6 border-l-4 border-l-purple-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t.perf}</h2>
          <span className={`text-4xl font-bold ${scoreColor(data.perfScore)}`}>
            {data.perfScore}
          </span>
        </div>
        <Progress value={data.perfScore} className="h-3 mb-4" />

        {data.performance && data.performance.metrics.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {data.performance.metrics.map(m => (
              <div key={m.name} className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{m.name}</span>
                  <Badge className={`text-xs ${ratingColor(m.rating)}`}>
                    {m.rating === 'good' ? t.good :
                     m.rating === 'needs-improvement' ? t.improve : t.poor}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {m.name === 'CLS' ? (m.value / 1000).toFixed(3) : m.value}
                  <span className="text-xs text-gray-500 ml-1">
                    {m.name === 'CLS' ? '' : 'ms'}
                  </span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Collecting metrics…</p>
        )}

        {data.performance && (
          <div className="mt-3 flex gap-4 text-xs text-gray-500">
            <span>📱 {data.performance.deviceType}</span>
            <span>🌐 {data.performance.connectionType}</span>
            {data.performance.memoryUsage && (
              <span>💾 {(data.performance.memoryUsage / 1024 / 1024).toFixed(1)} MB</span>
            )}
          </div>
        )}
      </Card>

      {/* User Behavior */}
      <Card className="p-6 mb-6 border-l-4 border-l-blue-500">
        <h2 className="text-xl font-semibold mb-4">{t.behavior}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: t.duration,  value: formatDuration(data.behavior.duration),       icon: '⏱️' },
            { label: t.pages,     value: data.behavior.pagesVisited,                   icon: '📄' },
            { label: t.features,  value: data.behavior.featuresUsed,                   icon: '✨' },
            { label: t.clicks,    value: data.behavior.totalClicks,                    icon: '🖱️' },
            { label: t.scroll,    value: `${data.behavior.maxScrollDepth}%`,           icon: '📜' },
            { label: '🌐 Lang',   value: data.behavior.language.toUpperCase(),         icon: '🌐' }
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white rounded-lg p-4 shadow-sm text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-2xl font-bold text-gray-800">{value}</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Feedback */}
      <Card className="p-6 border-l-4 border-l-green-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t.feedback}</h2>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-yellow-500">⭐ {avgRating}</span>
            <span className="text-sm text-gray-500">({data.feedback.length})</span>
          </div>
        </div>

        {data.feedback.length === 0 ? (
          <p className="text-gray-400 text-center py-4">{t.noFeedback}</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[...data.feedback].reverse().slice(0, 10).map((f, i) => (
              <div key={i} className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <span key={s} className={s < f.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{f.page}</span>
                </div>
                {f.comment && <p className="text-sm text-gray-700">{f.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;