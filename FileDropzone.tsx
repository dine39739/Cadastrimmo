import React, { useState, useCallback, useRef } from 'react';

interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void;
  disabled: boolean;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFilesAdded, disabled }) => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const preventDefaults = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    preventDefaults(e);
    if (!disabled) setIsHighlighted(true);
  }, [disabled]);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    preventDefaults(e);
    setIsHighlighted(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    preventDefaults(e);
    if (disabled) return;
    setIsHighlighted(false);
    const acceptedTypes = ['application/pdf', 'text/html'];
    const files = Array.from(e.dataTransfer.files).filter((file: File) => acceptedTypes.includes(file.type));
    if (files.length > 0) {
      onFilesAdded(files);
    }
  }, [disabled, onFilesAdded]);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const acceptedTypes = ['application/pdf', 'text/html'];
    const files = Array.from(e.target.files || []).filter((file: File) => acceptedTypes.includes(file.type));
     if (files.length > 0) {
      onFilesAdded(files);
    }
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const highlightClass = isHighlighted ? 'bg-blue-100 border-blue-500' : 'bg-blue-50 border-blue-300';
  const cursorClass = disabled ? 'cursor-not-allowed' : 'cursor-pointer';

  return (
    <div
      className={`p-10 text-center border-2 border-dashed rounded-lg transition-colors duration-200 mb-4 ${highlightClass} ${cursorClass}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,text/html"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />
      <p className="text-slate-600 font-medium">
        Glissez-déposez un ou plusieurs fichiers PDF ou HTML ici, ou cliquez pour sélectionner.
      </p>
       <p className="mt-2 text-sm text-red-600 font-bold">
        ATTENTION : L'extraction ne fonctionnera qu'avec des fichiers contenant du texte sélectionnable.
      </p>
    </div>
  );
};

export default FileDropzone;
