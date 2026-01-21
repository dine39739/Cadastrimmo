
import React, { useState, useEffect, useCallback } from 'react';
import {
  extractDataFromFileWithGemini,
  synthesizeResultsWithGemini,
} from './services/geminiService';
import { exportToExcel } from './services/excelService';
import { readFileAsBase64, readFileAsText } from './utils/fileUtils';
import {
  filterAndNormalizeData,
  groupAndAggregateLots,
} from './utils/dataProcessing';
import type { AggregatedGroup, Lot, ExtractedLot } from './types';
import ApiKeyInput from './components/ApiKeyInput';
import FilterInputs from './components/FilterInputs';
import FileDropzone from './components/FileDropzone';
import FileList from './components/FileList';
import ActionButtons from './components/ActionButtons';
import StatusMessage from './components/StatusMessage';
import ResultsDisplay from './components/ResultsDisplay';
import GeminiAnalysis from './components/GeminiAnalysis';
import DebugInfo from './components/DebugInfo';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isKeySaved, setIsKeySaved] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [section, setSection] = useState<string>('');
  const [plan, setPlan] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [aggregatedGroups, setAggregatedGroups] =
    useState<Map<string, AggregatedGroup> | null>(null);
  const [finalLots, setFinalLots] = useState<Lot[]>([]);
  const [geminiAnalysis, setGeminiAnalysis] = useState<string>('');
  const [geminiStatus, setGeminiStatus] = useState<string>('En attente...');

  useEffect(() => {
    const savedKey = localStorage.getItem('geminiApiKey');
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeySaved(true);
    }
  }, []);

  const updateSubmitButtonState = useCallback(() => {
    if (!isKeySaved || isProcessing) return;
    if (uploadedFiles.length === 0) {
      setStatusMessage('Veuillez déposer un ou plusieurs fichiers pour commencer.');
    } else if (!section.trim()) {
      setStatusMessage('Veuillez spécifier la section à rechercher.');
    } else {
      setStatusMessage(
        `${uploadedFiles.length} fichier(s) prêt(s). Cliquez sur "Analyser les Fichiers".`
      );
    }
  }, [section, uploadedFiles.length, isProcessing, isKeySaved]);

  useEffect(() => {
    updateSubmitButtonState();
  }, [updateSubmitButtonState]);

  const resetState = () => {
    setAggregatedGroups(null);
    setFinalLots([]);
    setGeminiAnalysis('');
    setGeminiStatus('En attente...');
    setDebugInfo('');
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setUploadedFiles(currentFiles => currentFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleAnalyze = async () => {
    if (!section.trim() || uploadedFiles.length === 0 || isProcessing || !isKeySaved) {
      return;
    }

    setIsProcessing(true);
    resetState();
    let allExtractedLots: ExtractedLot[] = [];

    try {
      setDebugInfo('Début de l\'analyse...\n');
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const progress = `(${i + 1}/${uploadedFiles.length})`;
        setStatusMessage(
          `1/3: Extraction des données du fichier ${file.name} ${progress}`
        );
        setDebugInfo(
          (prev) =>
            `${prev}\n--- Traitement du fichier ${progress}: ${file.name} ---\n`
        );
        
        try {
          const mimeType = file.type === 'application/pdf' ? 'application/pdf' : 'text/html';
          let fileContent: string;

          if (mimeType === 'application/pdf') {
            fileContent = await readFileAsBase64(file);
            setDebugInfo((prev) => `${prev}✓ Fichier PDF converti en base64\n`);
          } else {
            fileContent = await readFileAsText(file);
            setDebugInfo((prev) => `${prev}✓ Fichier HTML lu comme texte\n`);
          }

          const rawData = await extractDataFromFileWithGemini(
            fileContent,
            mimeType,
            section,
            file.name,
            apiKey
          );
          setDebugInfo(
            (prev) => `${prev}✓ ${rawData.length} lots bruts extraits\n`
          );
          allExtractedLots = allExtractedLots.concat(rawData);
        } catch (error) {
           const errorMessage = error instanceof Error ? error.message : String(error);
           setDebugInfo(
            (prev) => `${prev}✗ Erreur sur le fichier ${file.name}: ${errorMessage}\n`
          );
          throw new Error(`Échec du traitement du fichier ${file.name}.`);
        }
      }

      setStatusMessage('2/3: Filtrage, dédoublonnage et agrégation des données...');
      setDebugInfo((prev) => `${prev}\n--- PHASE 2: FILTRAGE ET AGRÉGATION ---\n`);
      setDebugInfo((prev) => `${prev}Total des lots extraits: ${allExtractedLots.length}\n`);

      const filteredData = filterAndNormalizeData(allExtractedLots, section, plan);
      setDebugInfo((prev) => `${prev}Lots après filtrage: ${filteredData.length}\n`);

      const groups = groupAndAggregateLots(filteredData);
      setAggregatedGroups(groups);
      setDebugInfo((prev) => `${prev}Groupes agrégés: ${groups.size}\n`);

      const finalConsolidatedLots = Array.from(groups.values()).flatMap(
        (group) => group.lots
      );
      setFinalLots(finalConsolidatedLots);
       setStatusMessage(`Extraction terminée. ${finalConsolidatedLots.length} lots uniques trouvés.`);
       setDebugInfo((prev) => `${prev}Lots uniques finaux: ${finalConsolidatedLots.length}\n`);


      if (finalConsolidatedLots.length > 0) {
        setStatusMessage('3/3: Génération de la synthèse par IA...');
        setGeminiStatus('Analyse Gemini en cours de synthèse...');
        const analysis = await synthesizeResultsWithGemini(finalConsolidatedLots, apiKey);
        setGeminiAnalysis(analysis);
        setGeminiStatus('Analyse Gemini terminée.');
      } else {
        setStatusMessage('Aucune donnée trouvée correspondant aux filtres.');
        setGeminiStatus('Aucune donnée à analyser.');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setStatusMessage(`Erreur: ${errorMessage}`);
       setDebugInfo((prev) => `${prev}\n\n✗ ERREUR FATALE: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const canAnalyze = !!section.trim() && uploadedFiles.length > 0 && isKeySaved;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <header className="text-center pb-4 mb-6 border-b-2 border-blue-200">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">
            Analyse de Relevés de Propriété Multi-Fichiers 📄
          </h1>
        </header>

        <main>
          <ApiKeyInput 
            apiKey={apiKey}
            setApiKey={setApiKey}
            isKeySaved={isKeySaved}
            setIsKeySaved={setIsKeySaved}
          />

          {isKeySaved ? (
            <>
              <FilterInputs section={section} setSection={setSection} plan={plan} setPlan={setPlan} disabled={isProcessing} />
              <FileDropzone onFilesAdded={setUploadedFiles} disabled={isProcessing} />
              <FileList files={uploadedFiles} onRemoveFile={handleRemoveFile} />
              
              <StatusMessage message={statusMessage} />
              
              <ActionButtons
                onAnalyze={handleAnalyze}
                onExport={() => exportToExcel(finalLots)}
                isProcessing={isProcessing}
                canAnalyze={canAnalyze}
                canExport={finalLots.length > 0 && !isProcessing}
              />
              
              <div className="mt-8 space-y-8">
                <ResultsDisplay aggregatedGroups={aggregatedGroups} />
                <GeminiAnalysis 
                  status={geminiStatus} 
                  analysis={geminiAnalysis}
                  show={finalLots.length > 0 || isProcessing}
                />
                <DebugInfo log={debugInfo} />
              </div>
            </>
          ) : (
            <div className="text-center p-6 bg-slate-100 rounded-md">
              <p className="font-semibold text-slate-700">Veuillez sauvegarder une clé API pour continuer.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
