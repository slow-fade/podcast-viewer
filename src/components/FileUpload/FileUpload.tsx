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
      <div className="w-full max-w-lg">
        <div className="bg-[#1a1b26] border border-[#292e42] rounded-2xl p-10 text-center space-y-5">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-3 border-[#7aa2f7]/20 rounded-full"></div>
            <div className="absolute inset-0 border-3 border-[#7aa2f7] rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div className="space-y-2">
            <p className="text-[#c0caf5] text-lg font-medium">Transcribing audio...</p>
            <p className="text-[#565f89] text-sm">This may take a few moments</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-[#7aa2f7] bg-[#7aa2f7]/5'
            : 'border-[#292e42] bg-[#1a1b26]/50 hover:border-[#565f89] hover:bg-[#1a1b26]/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".m4a,.mp3,.mp4,audio/m4a,audio/mp3,audio/mpeg,video/mp4"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="text-5xl mb-4">🎙️</div>
        <p className="text-[#c0caf5] text-lg mb-2 font-medium">Drop your audio file here</p>
        <p className="text-[#565f89] text-sm mb-3">or click to browse</p>
        <p className="text-[#565f89]/60 text-xs">Supports: m4a, mp3, mp4</p>
      </div>
    </div>
  );
}
