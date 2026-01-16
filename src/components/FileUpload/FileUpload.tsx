import { useState, useCallback, useRef } from 'react';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
}

export function FileUpload({ onFileSelected, isLoading }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && isValidAudioFile(file)) {
      onFileSelected(file);
    }
  }, [onFileSelected]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidAudioFile(file)) {
      onFileSelected(file);
    }
  }, [onFileSelected]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const isValidAudioFile = (file: File): boolean => {
    const validTypes = ['audio/m4a', 'audio/mp3', 'audio/mp4', 'audio/mpeg', 'video/mp4'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['m4a', 'mp3', 'mp4'];
    return validTypes.includes(file.type) || validExtensions.includes(extension || '');
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Transcribing audio...</p>
          <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".m4a,.mp3,.mp4,audio/m4a,audio/mp3,audio/mpeg,video/mp4"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="text-4xl mb-4">🎙️</div>
        <p className="text-lg mb-2">Drop your audio file here</p>
        <p className="text-sm text-gray-400">or click to browse</p>
        <p className="text-xs text-gray-500 mt-4">Supports: m4a, mp3, mp4</p>
      </div>
    </div>
  );
}
