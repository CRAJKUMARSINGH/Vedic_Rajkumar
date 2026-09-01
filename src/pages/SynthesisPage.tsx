import { useState } from 'react';
import { useChartCalculation, type BirthInput } from '@/hooks/useChartCalculation';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import { SynthesisDashboard } from '@/components/synthesis/SynthesisDashboard';
import MainLayout from '@/components/MainLayout';
import { SEO } from '@/components/SEO';

const parseCoords = (loc: string) => {
  const m = loc.match(/\(([^,]+),\s*([^)]+)\)/);
  if (m) { const lat = parseFloat(m[1]), lon = parseFloat(m[2]); if (!isNaN(lat) && !isNaN(lon)) return { lat, lon }; }
  return { lat: 23.0, lon: 72.0 };
};

export default function SynthesisPage() {
  const [rawBirth, setRawBirth] = useState<{ date: string; time: string; location: string } | null>(null);
  const [birthData, setBirthData] = useState<BirthInput | null>(null);
  const { data: chart, isCalculating } = useChartCalculation(birthData);

  const handleSubmit = (data: { date: string; time: string; location: string }) => {
    const coords = parseCoords(data.location);
    setRawBirth(data);
    setBirthData({ date: data.date, time: data.time, lat: coords.lat, lon: coords.lon });
  };

  return (
    <MainLayout>
      <SEO
        title="13-Layer Synthesis Dashboard"
        description="Comprehensive astrological synthesis combining all classical Vedic systems"
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            13-Layer Synthesis Dashboard
          </h1>
          
          <div className="mb-8">
            <EnhancedBirthInputForm lang="en" onSubmit={handleSubmit} />
          </div>

          {rawBirth && (
            <div className="mt-8">
              <SynthesisDashboard chart={chart} />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
