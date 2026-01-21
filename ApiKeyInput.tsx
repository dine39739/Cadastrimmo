
import React, { useState, useEffect } from 'react';

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  isKeySaved: boolean;
  setIsKeySaved: (saved: boolean) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, setApiKey, isKeySaved, setIsKeySaved }) => {
  const [status, setStatus] = useState<{ message: string; color: string }>({ message: '', color: '' });

  useEffect(() => {
    if (isKeySaved) {
      setStatus({ message: 'Clé API chargée depuis la sauvegarde locale.', color: 'text-green-600' });
    } else {
      setStatus({ message: 'Veuillez entrer une clé API pour utiliser l\'application.', color: 'text-amber-600' });
    }
  }, [isKeySaved]);
  
  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('geminiApiKey', apiKey.trim());
      setIsKeySaved(true);
      setStatus({ message: 'Clé API sauvegardée avec succès !', color: 'text-green-600' });
    } else {
      localStorage.removeItem('geminiApiKey');
      setIsKeySaved(false);
      setStatus({ message: 'Erreur : Veuillez entrer une clé API valide.', color: 'text-red-600' });
    }
  };

  return (
    <div className="p-4 mb-6 bg-amber-50 border border-amber-200 rounded-lg">
      <h3 className="text-lg font-semibold text-amber-800 mb-2">Configuration de l'API Gemini</h3>
      <p className="text-sm text-amber-700">
        Pour utiliser cette application, vous devez entrer votre clé API Google Gemini.
      </p>
      <p className="text-sm font-semibold text-amber-700 mt-1">
        Important : Votre clé API reste uniquement sur votre appareil et n'est jamais envoyée sur nos serveurs.
      </p>
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            if (isKeySaved) setIsKeySaved(false); // Mark as unsaved if key is changed
          }}
          placeholder="Entrez votre clé API Google Gemini ici"
          className="flex-grow w-full px-3 py-2 text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={saveApiKey}
          className="mt-2 sm:mt-0 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shrink-0"
        >
          {isKeySaved ? 'Mettre à jour' : 'Sauvegarder'} la clé
        </button>
      </div>
      {status.message && (
          <p className={`mt-2 text-xs font-medium ${status.color}`}>
              {status.message}
          </p>
      )}
    </div>
  );
};

export default ApiKeyInput;
