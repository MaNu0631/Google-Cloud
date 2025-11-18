
import { useCallback } from 'react';

export const useFileHandler = () => {
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>): Promise<{ content: string; name: string } | null> => {
    return new Promise((resolve, reject) => {
      const file = event.target.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          resolve({ content, name: file.name });
        } else {
          resolve(null);
        }
      };
      reader.onerror = (error) => {
        console.error('File reading error:', error);
        reject(error);
      };
      reader.readAsText(file);
    });
  }, []);

  const handleFileDownload = useCallback((content: string, fileName: string) => {
    if (!content) return;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return { handleFileUpload, handleFileDownload };
};
