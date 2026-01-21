
import React from 'react';

interface FileListProps {
  files: File[];
  onRemoveFile: (index: number) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onRemoveFile }) => {
  if (files.length === 0) {
    return null;
  }

  const handleRemoveClick = (index: number, fileName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le fichier "${fileName}" ?`)) {
      onRemoveFile(index);
    }
  };

  return (
    <div className="mb-4">
      <h4 className="font-semibold text-slate-800 border-b-2 border-slate-200 pb-1 mb-2">
        Fichiers sélectionnés ({files.length}):
      </h4>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {files.map((file, index) => (
          <li key={index} className="flex items-center justify-between bg-slate-100 p-2 rounded text-sm text-slate-700 font-mono" title={file.name}>
            <span className="truncate flex-1 pr-2">
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </span>
            <button
              onClick={() => handleRemoveClick(index, file.name)}
              className="p-1 text-red-500 hover:bg-red-100 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-150"
              aria-label={`Supprimer ${file.name}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
