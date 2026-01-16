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
      className="fixed inset-0 bg-tokyo-bg-secondary/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-tokyo-bg-primary border border-tokyo-border rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-tokyo-text-muted hover:text-tokyo-text-secondary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-tokyo-text-primary mb-2">Groq API Key</h2>
        <p className="text-tokyo-text-muted mb-5 text-sm">
          Enter your Groq API key to transcribe audio files. Get one at{' '}
          <a
            href="https://console.groq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-tokyo-accent-blue hover:underline"
          >
            console.groq.com
          </a>
        </p>
        <input
          type={showKey ? 'text' : 'password'}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="gsk_..."
          className="w-full px-4 py-3 bg-tokyo-bg-secondary border border-tokyo-border rounded-xl mb-4 text-tokyo-text-primary placeholder-tokyo-text-muted focus:outline-none focus:border-tokyo-accent-blue focus:ring-1 focus:border-tokyo-accent-blue transition-all"
        />
        <div className="flex items-center gap-3 mb-5">
          <input
            type="checkbox"
            id="showKey"
            checked={showKey}
            onChange={e => setShowKey(e.target.checked)}
            className="w-4 h-4 rounded border-tokyo-border bg-tokyo-bg-secondary text-tokyo-accent-blue focus:ring-tokyo-accent-blue focus:ring-offset-0"
          />
          <label htmlFor="showKey" className="text-sm text-tokyo-text-muted">Show API key</label>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-2.5 bg-tokyo-accent-red/10 text-tokyo-accent-red hover:bg-tokyo-accent-red/20 rounded-xl transition-all font-medium"
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            disabled={!inputValue.trim()}
            className="flex-1 px-4 py-2.5 bg-tokyo-accent-blue text-tokyo-bg-secondary hover:bg-tokyo-accent-blue/90 rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
