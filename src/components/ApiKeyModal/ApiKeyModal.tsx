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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Groq API Key</h2>
        <p className="text-gray-400 mb-4 text-sm">
          Enter your Groq API key to transcribe audio files. Get one at{' '}
          <a
            href="https://console.groq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            console.groq.com
          </a>
        </p>
        <input
          type={showKey ? 'text' : 'password'}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="gsk_..."
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
        />
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="showKey"
            checked={showKey}
            onChange={e => setShowKey(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="showKey" className="text-sm text-gray-400">Show API key</label>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            disabled={!inputValue.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
