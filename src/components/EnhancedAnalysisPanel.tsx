import React from 'react';
import { Layers, ShieldAlert, Zap, Flame, Brain, BookOpen } from 'lucide-react';
import type { EnhancedClassicalAnswer } from '../services/classicalAnswerEngine';

interface Props {
  answer: EnhancedClassicalAnswer;
  isHi: boolean;
}

export default function EnhancedAnalysisPanel({ answer, isHi }: Props) {
  // If it's not enhanced (missing these fields), don't render this panel
  if (!answer.sixLayerRemedy || !answer.thereforeClause) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm mt-8">
      <div className="bg-slate-50 dark:bg-slate-800 p-4 border-b flex items-center gap-3">
        <Layers className="w-6 h-6 text-indigo-600" />
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
          {isHi ? '13-स्तरीय ज्योतिष विश्लेषण' : '13-Layer Cognitive Synthesis'}
        </h3>
      </div>
      
      <div className="p-5 space-y-8">
        
        {/* Executive Verdict */}
        {answer.executiveVerdict && (
          <section className="p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4" />
              {isHi ? 'अंतिम निर्णय' : 'Executive Verdict'}
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
              {answer.executiveVerdict}
            </p>
          </section>
        )}

        {/* Therefore Clause */}
        <section>
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3 border-b pb-1">
            <Flame className="w-4 h-4 text-orange-500" />
            {isHi ? 'संघर्ष समाधान (Layer 9)' : 'Conflict Resolution (Layer 9)'}
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded border text-sm">
              <span className="block text-xs font-semibold text-slate-500 mb-1">Conflict Detected</span>
              {answer.thereforeClause.conflict}
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-100 text-sm">
              <span className="block text-xs font-semibold text-amber-700 mb-1">Forced Verdict</span>
              {answer.thereforeClause.verdict}
            </div>
          </div>
        </section>

        {/* Psychological Profile */}
        {answer.psychologicalProfile && (
          <section>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3 border-b pb-1">
              <Brain className="w-4 h-4 text-purple-500" />
              {isHi ? 'मनोवैज्ञानिक प्रोफाइल (Layer 11)' : 'Psychological Profile (Layer 11)'}
            </h4>
            <div className="bg-purple-50/50 dark:bg-purple-900/20 p-4 rounded-lg text-sm text-slate-700 dark:text-slate-300">
              <p className="mb-2"><strong>Core Fear:</strong> {answer.psychologicalProfile.nakshatra_fear.coreFear}</p>
              <p className="italic">"{answer.psychologicalProfile.nakshatra_fear.reframe}"</p>
            </div>
          </section>
        )}

        {/* Six-Layer Remedy */}
        <section>
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3 border-b pb-1">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            {isHi ? '6-स्तरीय व्यावहारिक उपाय (Layer 12)' : '6-Layer Remedial Stack (Layer 12)'}
          </h4>
          <p className="text-xs text-slate-500 mb-3">
            Targeting weakest planet: <strong>{answer.sixLayerRemedy.planet}</strong>
          </p>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="p-3 border rounded bg-slate-50 dark:bg-slate-800/50">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">1. Behavioral</span>
              <span className="text-slate-600 dark:text-slate-400">{answer.sixLayerRemedy.layer1_behavioral}</span>
            </div>
            <div className="p-3 border rounded bg-slate-50 dark:bg-slate-800/50">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">2. Psychological</span>
              <span className="text-slate-600 dark:text-slate-400">{answer.sixLayerRemedy.layer2_psychological}</span>
            </div>
            <div className="p-3 border rounded bg-slate-50 dark:bg-slate-800/50">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">3. Spiritual</span>
              <span className="text-slate-600 dark:text-slate-400">{answer.sixLayerRemedy.layer3_spiritual}</span>
            </div>
            <div className="p-3 border rounded bg-slate-50 dark:bg-slate-800/50">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">4. Practical</span>
              <span className="text-slate-600 dark:text-slate-400">{answer.sixLayerRemedy.layer4_practical}</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
