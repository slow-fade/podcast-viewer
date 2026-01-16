import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  hasApiKey: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('groq_api_key');
    if (stored) {
      setApiKeyState(stored);
    }
  }, []);

  const setApiKey = (key: string | null) => {
    if (key) {
      localStorage.setItem('groq_api_key', key);
    } else {
      localStorage.removeItem('groq_api_key');
    }
    setApiKeyState(key);
  };

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, hasApiKey: !!apiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKeyContext() {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error('useApiKeyContext must be used within ApiKeyProvider');
  }
  return context;
}
