
import React from 'react';

interface GeminiAnalysisProps {
  status: string;
  analysis: string;
  show: boolean;
}

const GeminiAnalysis: React.FC<GeminiAnalysisProps> = ({ status, analysis, show }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Synthèse d'Analyse (Gemini)</h3>
      <p className="text-sm font-semibold text-purple-700 mb-2">{status}</p>
      <div className="whitespace-pre-wrap p-4 bg-purple-100/50 border border-purple-200 rounded text-sm text-slate-800 min-h-[100px]">
        {analysis || '...'}
      </div>
    </div>
  );
};

export default GeminiAnalysis;
