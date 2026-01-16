import { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  onClose: () => void;
  onSave: (key: string | null) => void;
}

export function ApiKeyModal({ onClose, onSave }: ApiKeyModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('groq_api_key');
    if (stored) {
      setInputValue(stored);
    }
  }, []);

  const handleSave = () => {
    if (inputValue.trim()) {
      onSave(inputValue.trim());
      onClose();
    }
  };

  const handleClear = () => {
    onSave(null);
    setInputValue('');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#0f0f14]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#1a1b26] border border-[#292e42] rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#565f89] hover:text-[#a9b1d6] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-[#c0caf5] mb-2">Groq API Key</h2>
        <p className="text-[#565f89] mb-5 text-sm">
          Enter your Groq API key to transcribe audio files. Get one at{' '}
          <a
            href="https://console.groq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#7aa2f7] hover:underline"
          >
            console.groq.com
          </a>
        </p>
        <input
          type={showKey ? 'text' : 'password'}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="gsk_..."
          className="w-full px-4 py-3 bg-[#16161e] border border-[#292e42] rounded-xl mb-4 text-[#c0caf5] placeholder-[#565f89] focus:outline-none focus:border-[#7aa2f7] focus:ring-1 focus:border-[#7aa2f7] transition-all"
        />
        <div className="flex items-center gap-3 mb-5">
          <input
            type="checkbox"
            id="showKey"
            checked={showKey}
            onChange={e => setShowKey(e.target.checked)}
            className="w-4 h-4 rounded border-[#292e42] bg-[#16161e] text-[#7aa2f7] focus:ring-[#7aa2f7] focus:ring-offset-0"
          />
          <label htmlFor="showKey" className="text-sm text-[#565f89]">Show API key</label>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-2.5 bg-[#f7768e]/10 text-[#f7768e] hover:bg-[#f7768e]/20 rounded-xl transition-all font-medium"
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            disabled={!inputValue.trim()}
            className="flex-1 px-4 py-2.5 bg-[#7aa2f7] text-[#15161e] hover:bg-[#7aa2f7]/90 rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
