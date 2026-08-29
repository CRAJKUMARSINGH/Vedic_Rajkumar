import React, { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { getBirthChart } from '@/services/birthChartService';
import { SEO } from '@/components/SEO';

type BirthInput = {
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  lat: number;
  lon: number;
  tz: number;
};

export default function BirthChartPage() {
  const [input, setInput] = useState<BirthInput>({
    day: 8,
    month: 10,
    year: 1999,
    hour: 7,
    minute: 43,
    lat: 24.58,
    lon: 73.68,
    tz: 5.5,
  });
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleChange = (field: keyof BirthInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(prev => ({ ...prev, [field]: Number(value) }));
  };

  const compute = async () => {
    setError('');
    try {
      const res = await getBirthChart({
        day: input.day,
        month: input.month,
        year: input.year,
        hour: input.hour,
        minute: input.minute,
        latitude: input.lat,
        longitude: input.lon,
        timezone: input.tz,
      });
      setResult(res);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <SEO
        title="Birth Chart Insights"
        description="Compute a detailed birth chart using Vedic calculations."
        canonical="/birth-chart"
      />
      <GlassCard className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Birth Chart Insights</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Day"
            value={input.day}
            onChange={handleChange('day')}
            className="rounded border p-2 bg-black/20 text-white"
          />
          <input
            type="number"
            placeholder="Month"
            value={input.month}
            onChange={handleChange('month')}
            className="rounded border p-2 bg-black/20 text-white"
          />
          <input
            type="number"
            placeholder="Year"
            value={input.year}
            onChange={handleChange('year')}
            className="rounded border p-2 bg-black/20 text-white"
          />
          <input
            type="number"
            placeholder="Hour (24h)"
            value={input.hour}
            onChange={handleChange('hour')}
            className="rounded border p-2 bg-black/20 text-white"
          />
          <input
            type="number"
            placeholder="Minute"
            value={input.minute}
            onChange={handleChange('minute')}
            className="rounded border p-2 bg-black/20 text-white"
          />
          <input
            type="number"
            placeholder="Latitude"
            value={input.lat}
            onChange={handleChange('lat')}
            className="rounded border p-2 bg-black/20 text-white"
          />
          <input
            type="number"
            placeholder="Longitude"
            value={input.lon}
            onChange={handleChange('lon')}
            className="rounded border p-2 bg-black/20 text-white"
          />
          <input
            type="number"
            placeholder="Timezone"
            value={input.tz}
            onChange={handleChange('tz')}
            className="rounded border p-2 bg-black/20 text-white"
          />
        </div>
        <button
          onClick={compute}
          className="mt-4 px-4 py-2 bg-amber-400 text-slate-950 rounded hover:bg-amber-300"
        >
          Compute Chart
        </button>
        {error && <p className="mt-2 text-red-400">{error}</p>}
        {result && (
          <pre className="mt-4 overflow-auto bg-black/50 p-2 rounded text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </GlassCard>
    </div>
  );
}
