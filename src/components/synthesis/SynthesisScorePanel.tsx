import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScoreVector } from '../../services/synthesis/signalTypes';

export function SynthesisScorePanel({ scores }: { scores: ScoreVector }) {
  const metrics = [
    { label: 'Promise', value: scores.promise, color: 'bg-emerald-500' },
    { label: 'Activation', value: scores.activation, color: 'bg-blue-500' },
    { label: 'Stability', value: scores.stability, color: 'bg-indigo-500' },
    { label: 'Visibility', value: scores.visibility, color: 'bg-purple-500' },
    { label: 'Obstruction', value: scores.obstruction, color: 'bg-red-500' },
    { label: 'Delay', value: scores.delay, color: 'bg-orange-500' },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
          Orthogonal Score Vector
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {metrics.map(m => (
            <div key={m.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-600">{m.label}</span>
                <span className="text-slate-500">{m.value}/100</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${m.color}`}
                  style={{ width: `${Math.max(0, Math.min(100, m.value))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
