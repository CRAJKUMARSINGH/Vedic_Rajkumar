// Week 72-73: API Documentation & Developer Portal
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

interface APIEndpoint {
  method: 'GET' | 'POST';
  path: string;
  description: string;
  params: Array<{ name: string; type: string; required: boolean; description: string }>;
  example: string;
  response: string;
}

const ENDPOINTS: APIEndpoint[] = [
  {
    method: 'POST',
    path: '/api/v1/chart/birth',
    description: 'Calculate complete Vedic birth chart with all planetary positions, houses, and ascendant.',
    params: [
      { name: 'date', type: 'string', required: true, description: 'Birth date in YYYY-MM-DD format' },
      { name: 'time', type: 'string', required: true, description: 'Birth time in HH:MM format (24h)' },
      { name: 'lat', type: 'number', required: true, description: 'Birth latitude (-90 to 90)' },
      { name: 'lon', type: 'number', required: true, description: 'Birth longitude (-180 to 180)' },
      { name: 'ayanamsa', type: 'string', required: false, description: 'Ayanamsa system: lahiri (default), raman, krishnamurti' },
    ],
    example: `POST /api/v1/chart/birth
{
  "date": "1990-03-15",
  "time": "06:30",
  "lat": 28.6139,
  "lon": 77.2090
}`,
    response: `{
  "ascendant": { "rashi": "Aquarius", "degrees": 15.3 },
  "planets": [
    { "name": "Sun", "rashi": "Pisces", "house": 2, "degrees": 24.5 },
    { "name": "Moon", "rashi": "Cancer", "house": 6, "degrees": 12.1 }
  ],
  "nakshatra": { "name": "Pushya", "pada": 2, "lord": "Saturn" }
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/dasha/vimshottari',
    description: 'Calculate Vimshottari Dasha periods for a birth chart.',
    params: [
      { name: 'date', type: 'string', required: true, description: 'Birth date in YYYY-MM-DD format' },
      { name: 'time', type: 'string', required: true, description: 'Birth time in HH:MM format' },
      { name: 'lat', type: 'number', required: true, description: 'Birth latitude' },
      { name: 'lon', type: 'number', required: true, description: 'Birth longitude' },
    ],
    example: `POST /api/v1/dasha/vimshottari
{
  "date": "1990-03-15",
  "time": "06:30",
  "lat": 28.6139,
  "lon": 77.2090
}`,
    response: `{
  "currentMahadasha": { "planet": "Jupiter", "start": "2020-01-15", "end": "2036-01-15" },
  "currentAntardasha": { "planet": "Saturn", "start": "2024-03-10", "end": "2026-09-10" },
  "allPeriods": [...]
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/compatibility/ashtakuta',
    description: 'Calculate 36-point Ashtakuta compatibility between two birth charts.',
    params: [
      { name: 'person1', type: 'object', required: true, description: 'First person: { date, time, lat, lon }' },
      { name: 'person2', type: 'object', required: true, description: 'Second person: { date, time, lat, lon }' },
    ],
    example: `POST /api/v1/compatibility/ashtakuta
{
  "person1": { "date": "1990-03-15", "time": "06:30", "lat": 28.61, "lon": 77.20 },
  "person2": { "date": "1992-07-22", "time": "14:15", "lat": 19.07, "lon": 72.87 }
}`,
    response: `{
  "totalScore": 28,
  "maxScore": 36,
  "compatibility": "Good",
  "categories": {
    "varna": { "score": 1, "max": 1 },
    "vashya": { "score": 2, "max": 2 },
    "nadi": { "score": 8, "max": 8 }
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/panchang/:date',
    description: 'Get Panchang (Hindu almanac) for a specific date and location.',
    params: [
      { name: 'date', type: 'string', required: true, description: 'Date in YYYY-MM-DD format (URL parameter)' },
      { name: 'lat', type: 'number', required: true, description: 'Latitude (query parameter)' },
      { name: 'lon', type: 'number', required: true, description: 'Longitude (query parameter)' },
    ],
    example: `GET /api/v1/panchang/2026-03-26?lat=28.6139&lon=77.2090`,
    response: `{
  "tithi": { "name": "Tritiya", "number": 3, "paksha": "Shukla" },
  "nakshatra": { "name": "Rohini", "lord": "Moon" },
  "yoga": { "name": "Siddha", "number": 21 },
  "karana": { "name": "Bava", "number": 1 },
  "sunrise": "06:15", "sunset": "18:42"
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/yogas/identify',
    description: 'Identify all Vedic yogas present in a birth chart.',
    params: [
      { name: 'date', type: 'string', required: true, description: 'Birth date' },
      { name: 'time', type: 'string', required: true, description: 'Birth time' },
      { name: 'lat', type: 'number', required: true, description: 'Latitude' },
      { name: 'lon', type: 'number', required: true, description: 'Longitude' },
    ],
    example: `POST /api/v1/yogas/identify
{
  "date": "1990-03-15",
  "time": "06:30",
  "lat": 28.6139,
  "lon": 77.2090
}`,
    response: `{
  "yogas": [
    { "name": "Gajakesari Yoga", "type": "Dhana", "strength": "Strong", "effect": "Wealth and wisdom" },
    { "name": "Hamsa Yoga", "type": "Pancha Mahapurusha", "strength": "Moderate", "effect": "Spiritual wisdom" }
  ],
  "totalYogas": 12
}`,
  },
];

const METHOD_COLORS = { GET: 'bg-green-100 text-green-800', POST: 'bg-blue-100 text-blue-800' };

const APIDocumentationPage = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [activeTab, setActiveTab] = useState<'overview'|'endpoints'|'auth'|'pricing'>('overview');

  return (
    <>
      <SEO title="API Documentation - Vedic Astrology API" description="Complete API documentation for the Vedic Astrology platform. Integrate birth charts, dasha, compatibility, panchang and more into your applications." keywords="astrology api, vedic astrology api, birth chart api, dasha api, panchang api, developer" canonical="/api-docs" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              <div>
                <h1 className="text-xl font-bold">API Documentation</h1>
                <p className="text-xs text-muted-foreground">v1.0 • REST API • JSON</p>
              </div>
            </div>
            <Link to="/" className="text-sm text-primary underline underline-offset-2">Home</Link>
          </div>
        </header>

        <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
          {/* Tabs */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(['overview','endpoints','auth','pricing'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-colors ${activeTab === tab ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-card border rounded-xl p-5">
                <h2 className="font-bold mb-2">Vedic Astrology REST API</h2>
                <p className="text-sm text-muted-foreground mb-4">Access the world's most comprehensive Vedic astrology calculations through our REST API. Build astrology apps, integrate into existing platforms, or create custom solutions.</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Base URL', value: 'https://api.gocharphal.com/v1' },
                    { label: 'Format', value: 'JSON' },
                    { label: 'Auth', value: 'API Key (Bearer)' },
                    { label: 'Rate Limit', value: '1000 req/day (free)' },
                  ].map(item => (
                    <div key={item.label} className="bg-muted rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                      <div className="text-sm font-mono font-medium">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card border rounded-xl p-5">
                <h3 className="font-semibold mb-3">Quick Start</h3>
                <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto">{`curl -X POST https://api.gocharphal.com/v1/chart/birth \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "date": "1990-03-15",
    "time": "06:30",
    "lat": 28.6139,
    "lon": 77.2090
  }'`}</pre>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Endpoints', value: '25+', icon: '🔌' },
                  { label: 'Uptime', value: '99.9%', icon: '⚡' },
                  { label: 'Avg Response', value: '<100ms', icon: '🚀' },
                ].map(s => (
                  <div key={s.label} className="bg-card border rounded-xl p-4 text-center">
                    <div className="text-2xl">{s.icon}</div>
                    <div className="font-bold">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'endpoints' && (
            <div className="space-y-3">
              {selectedEndpoint ? (
                <div className="space-y-4">
                  <button onClick={() => setSelectedEndpoint(null)} className="text-sm text-primary flex items-center gap-1">← All Endpoints</button>
                  <div className="bg-card border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${METHOD_COLORS[selectedEndpoint.method]}`}>{selectedEndpoint.method}</span>
                      <code className="text-sm font-mono">{selectedEndpoint.path}</code>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{selectedEndpoint.description}</p>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Parameters</div>
                      <div className="space-y-2">
                        {selectedEndpoint.params.map(p => (
                          <div key={p.name} className="flex items-start gap-2 text-sm">
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{p.name}</code>
                            <span className="text-xs text-blue-600">{p.type}</span>
                            {p.required && <span className="text-xs text-red-500">required</span>}
                            <span className="text-xs text-muted-foreground">{p.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Example Request</div>
                      <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto">{selectedEndpoint.example}</pre>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Example Response</div>
                      <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto">{selectedEndpoint.response}</pre>
                    </div>
                  </div>
                </div>
              ) : (
                ENDPOINTS.map((ep, i) => (
                  <button key={i} onClick={() => setSelectedEndpoint(ep)}
                    className="w-full bg-card border rounded-xl p-4 text-left hover:border-primary transition-colors">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${METHOD_COLORS[ep.method]}`}>{ep.method}</span>
                      <code className="text-sm font-mono">{ep.path}</code>
                      <span className="text-muted-foreground ml-auto">→</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{ep.description}</p>
                  </button>
                ))
              )}
            </div>
          )}

          {activeTab === 'auth' && (
            <div className="space-y-4">
              <div className="bg-card border rounded-xl p-5">
                <h3 className="font-semibold mb-3">Authentication</h3>
                <p className="text-sm text-muted-foreground mb-3">All API requests require authentication using an API key passed as a Bearer token in the Authorization header.</p>
                <pre className="bg-muted rounded-lg p-3 text-xs">{`Authorization: Bearer YOUR_API_KEY`}</pre>
              </div>
              <div className="bg-card border rounded-xl p-5">
                <h3 className="font-semibold mb-3">Get Your API Key</h3>
                <p className="text-sm text-muted-foreground mb-3">API keys are available for registered developers. Sign up to get your free API key with 1000 requests/day.</p>
                <button className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium">
                  Get Free API Key (Coming Soon)
                </button>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="grid grid-cols-1 gap-4">
              {[
                { plan: 'Free', price: '₹0/month', requests: '1,000/day', features: ['All basic endpoints', 'Birth chart', 'Dasha', 'Panchang'], color: 'border-gray-200' },
                { plan: 'Developer', price: '₹999/month', requests: '10,000/day', features: ['All endpoints', 'Compatibility', 'Yogas', 'Priority support'], color: 'border-blue-300' },
                { plan: 'Enterprise', price: '₹4,999/month', requests: 'Unlimited', features: ['All endpoints', 'White-label', 'SLA guarantee', 'Dedicated support'], color: 'border-purple-300' },
              ].map(plan => (
                <div key={plan.plan} className={`bg-card border-2 rounded-xl p-5 ${plan.color}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold text-lg">{plan.plan}</div>
                    <div className="text-xl font-bold text-primary">{plan.price}</div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">{plan.requests} requests</div>
                  <ul className="space-y-1">
                    {plan.features.map(f => <li key={f} className="text-sm flex items-center gap-2"><span className="text-green-500">✓</span>{f}</li>)}
                  </ul>
                  <button className="w-full mt-4 border rounded-lg py-2 text-sm font-medium hover:bg-muted transition-colors">
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default APIDocumentationPage;
