import { useState, useEffect } from 'react';
import { performanceMonitor } from '@/utils/performanceMonitor';

interface PerformanceMetrics {
  score: number;
  lcp: number;
  fid: number;
  cls: number;
  tti: number;
  memoryUsed: number;
  memoryLimit: number;
  totalRequests: number;
  cachedRequests: number;
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Simulate performance monitoring
    const interval = setInterval(() => {
      const report = performanceMonitor.generateReport();
      setMetrics(report.metrics);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!metrics) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
      >
        {isVisible ? 'Hide Metrics' : 'Show Performance'}
      </button>

      {isVisible && (
        <div className="fixed bottom-20 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Performance Monitor</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Performance Score */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Performance Score</span>
                <span className={`font-bold text-lg ${getScoreColor(metrics.score)}`}>
                  {metrics.score}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${metrics.score}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {getScoreLabel(metrics.score)} ({metrics.score}/100)
              </p>
            </div>

            {/* Core Web Vitals */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">LCP</span>
                  <span className="text-sm">{metrics.lcp}ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(metrics.lcp / 10, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">FID</span>
                  <span className="text-sm">{metrics.fid}ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(metrics.fid / 2, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">CLS</span>
                  <span className="text-sm">{metrics.cls.toFixed(3)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(metrics.cls * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span>{metrics.memoryUsed.toFixed(1)}MB / {metrics.memoryLimit.toFixed(1)}MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${(metrics.memoryUsed / metrics.memoryLimit) * 100}%` }}
                />
              </div>
            </div>

            {/* Cache Performance */}
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span>Cache Hit Rate</span>
                <span>{metrics.cacheHitRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${metrics.cacheHitRate}%` }}
                />
              </div>
            </div>

            {/* Recommendations */}
            {metrics.score < 70 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">Recommendations:</p>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  {metrics.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;