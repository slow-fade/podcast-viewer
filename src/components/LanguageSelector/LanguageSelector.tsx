import { useCallback } from 'react';

export interface LanguageOption {
  code: string;
  label: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'tr', label: 'Turkish' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'ru', label: 'Russian' },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  disabled?: boolean;
}

export function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  disabled = false,
}: LanguageSelectorProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onLanguageChange(e.target.value);
    },
    [onLanguageChange]
  );

  return (
    <div className="w-full max-w-lg">
      <label className="block text-sm text-tokyo-text-muted mb-2">
        Transcription Language
      </label>
      <select
        value={selectedLanguage}
        onChange={handleChange}
        disabled={disabled}
        className="w-full px-4 py-3 bg-tokyo-bg-primary border border-tokyo-border rounded-xl text-tokyo-text-primary focus:outline-none focus:border-tokyo-accent-blue focus:ring-1 focus:ring-tokyo-accent-blue transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label} ({lang.code})
          </option>
        ))}
      </select>
    </div>
  );
}
