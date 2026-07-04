import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SynthesisVerdict } from '../../services/synthesis/signalTypes';
import { Clock } from 'lucide-react';

export function SynthesisTimingCard({ verdict }: { verdict: SynthesisVerdict }) {
  return (
    <Card>
      <CardHeader className="pb-2 bg-slate-50">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          Timing Class
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Classification</span>
            <span className="text-sm font-mono font-semibold text-indigo-700 uppercase bg-indigo-50 px-2 py-0.5 rounded">
              {verdict.timingClass.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Dasha Level</span>
            <span className="text-sm font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {verdict.levelTag}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
