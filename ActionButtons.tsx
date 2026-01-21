
import React from 'react';
import Spinner from './Spinner';

interface ActionButtonsProps {
  onAnalyze: () => void;
  onExport: () => void;
  isProcessing: boolean;
  canAnalyze: boolean;
  canExport: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAnalyze, onExport, isProcessing, canAnalyze, canExport }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 my-6">
      <button
        onClick={onAnalyze}
        disabled={!canAnalyze || isProcessing}
        className="flex-1 w-full flex justify-center items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
      >
        {isProcessing && <Spinner />}
        {isProcessing ? 'Analyse en cours...' : 'Analyser les Fichiers'}
      </button>
      <button
        onClick={onExport}
        disabled={!canExport}
        className="flex-1 w-full px-6 py-3 bg-green-600 text-white font-bold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
      >
        Exporter en XLSX
      </button>
    </div>
  );
};

export default ActionButtons;
