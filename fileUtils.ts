
export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        // The result is a data URL like "data:application/pdf;base64,..."
        // We only need the base64 part.
        const base64String = e.target.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to read file as a valid string.'));
      }
    };
    reader.onerror = () => reject(new Error(`Échec de lecture du fichier ${file.name}`));
    reader.readAsDataURL(file);
  });
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        resolve(e.target.result);
      } else {
        reject(new Error('Failed to read file as text.'));
      }
    };
    reader.onerror = () => reject(new Error(`Échec de lecture du fichier ${file.name}`));
    reader.readAsText(file);
  });
};
