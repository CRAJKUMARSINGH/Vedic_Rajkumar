/**
 * LaunchChecklist.tsx — Week 12 Production Readiness
 * 
 * Interactive checklist tracking each launch requirement.
 * State is persisted in localStorage so progress is retained across sessions.
 */
import { useState, useEffect } from 'react';

interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  description: string;
  priority: 'critical' | 'high' | 'medium';
  done: boolean;
}

const INITIAL_ITEMS: Omit<ChecklistItem, 'done'>[] = [
  // Legal
  { id: 'tos', category: 'Legal', label: 'Terms of Service', description: 'Drafted and legally reviewed', priority: 'critical' },
  { id: 'privacy', category: 'Legal', label: 'Privacy Policy (GDPR/DPDP)', description: 'Full compliance with Indian DPDP and GDPR', priority: 'critical' },
  { id: 'cookie', category: 'Legal', label: 'Cookie Policy', description: 'Required if using analytics/tracking', priority: 'high' },
  { id: 'disclaimer', category: 'Legal', label: 'Astrology Disclaimer', description: 'Prominent on all reports and the home page', priority: 'critical' },
  { id: 'refund', category: 'Legal', label: 'Refund Policy', description: 'For paid subscription tiers', priority: 'high' },
  // Security
  { id: 'pentest', category: 'Security', label: 'Penetration Test', description: 'Hire security firm or use Bugcrowd/Cobalt', priority: 'critical' },
  { id: 'sec-headers', category: 'Security', label: 'Security Headers A+', description: 'Verify on securityheaders.com', priority: 'critical' },
  { id: 'dep-audit', category: 'Security', label: 'Dependency Audit Clean', description: 'npm audit shows 0 high/critical', priority: 'high' },
  { id: 'secrets-scan', category: 'Security', label: 'Secrets Scan Clean', description: 'TruffleHog shows no verified secrets', priority: 'critical' },
  { id: 'rls-tested', category: 'Security', label: 'RLS Policies Tested', description: 'Verified with real data across roles', priority: 'critical' },
  // Infrastructure
  { id: 'db-backup', category: 'Infrastructure', label: 'Database Backups', description: 'Automated daily backups verified and tested', priority: 'critical' },
  { id: 'cdn', category: 'Infrastructure', label: 'CDN Configured', description: 'Cloudflare or Netlify CDN active', priority: 'high' },
  { id: 'ssl', category: 'Infrastructure', label: 'SSL Certificate', description: 'Auto-renewal configured', priority: 'critical' },
  { id: 'uptime', category: 'Infrastructure', label: 'Uptime Monitoring', description: 'UptimeRobot or Better Uptime alert set up', priority: 'high' },
  { id: 'sentry', category: 'Infrastructure', label: 'Sentry Error Tracking', description: 'Configured for production environment', priority: 'high' },
  // Support
  { id: 'help', category: 'Support', label: 'Help Center', description: 'Basic FAQ and documentation live', priority: 'medium' },
  { id: 'feedback', category: 'Support', label: 'In-App Feedback', description: 'User feedback form or widget integrated', priority: 'medium' },
  // Marketing
  { id: 'og-tags', category: 'Marketing', label: 'Open Graph Tags', description: 'All pages have og:title, og:description, og:image', priority: 'high' },
  { id: 'sitemap', category: 'Marketing', label: 'Sitemap.xml', description: 'Sitemap generated and submitted to Search Console', priority: 'medium' },
];

const STORAGE_KEY = 'vedic-launch-checklist-v1';

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'text-red-600 bg-red-50',
  high: 'text-orange-600 bg-orange-50',
  medium: 'text-yellow-600 bg-yellow-50',
};

export const LaunchChecklist = () => {
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedMap: Record<string, boolean> = saved ? JSON.parse(saved) : {};
      return INITIAL_ITEMS.map((i) => ({ ...i, done: savedMap[i.id] ?? false }));
    } catch {
      return INITIAL_ITEMS.map((i) => ({ ...i, done: false }));
    }
  });

  useEffect(() => {
    const map: Record<string, boolean> = {};
    items.forEach((i) => { map[i.id] = i.done; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }, [items]);

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const doneCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  const pct = Math.round((doneCount / totalCount) * 100);
  const criticalDone = items.filter((i) => i.priority === 'critical' && i.done).length;
  const criticalTotal = items.filter((i) => i.priority === 'critical').length;

  const categories = [...new Set(INITIAL_ITEMS.map((i) => i.category))];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">🚀 Launch Checklist</h1>
      <p className="text-gray-500 text-sm mb-6">Week 12 — Production Readiness</p>

      {/* Progress summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border rounded p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">{pct}%</div>
          <div className="text-xs text-gray-500 mt-1">Overall Progress</div>
        </div>
        <div className="border rounded p-4 text-center">
          <div className="text-3xl font-bold">{doneCount}/{totalCount}</div>
          <div className="text-xs text-gray-500 mt-1">Items Complete</div>
        </div>
        <div className="border rounded p-4 text-center">
          <div className={`text-3xl font-bold ${criticalDone === criticalTotal ? 'text-green-600' : 'text-red-600'}`}>
            {criticalDone}/{criticalTotal}
          </div>
          <div className="text-xs text-gray-500 mt-1">Critical Items</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div
          className="h-2 rounded-full bg-orange-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Grouped items */}
      {categories.map((category) => {
        const catItems = items.filter((i) => i.category === category);
        const catDone = catItems.filter((i) => i.done).length;
        return (
          <div key={category} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {category}
              </h2>
              <span className="text-xs text-gray-400">{catDone}/{catItems.length}</span>
            </div>
            <div className="border rounded divide-y">
              {catItems.map((item) => (
                <label
                  key={item.id}
                  htmlFor={`check-${item.id}`}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${item.done ? 'opacity-60' : ''}`}
                >
                  <input
                    id={`check-${item.id}`}
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggle(item.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${item.done ? 'line-through text-gray-400' : ''}`}>
                        {item.label}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${PRIORITY_COLORS[item.priority]}`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LaunchChecklist;
