import { useState, useCallback } from 'react';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { FileUpload } from '@/components/FileUpload';
import { AudioPlayer } from '@/components/AudioPlayer';
import { TranscriptView } from '@/components/TranscriptView';
import { ApiKeyProvider, useApiKeyContext } from '@/context';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useTranscript } from '@/hooks/useTranscript';
import { transcribeAudio } from '@/services/groq';
import { splitTranscriptIntoLines } from '@/utils';
import dummyTranscript from '@/services/dummy-transcript.json';
import type { TranscriptLine, GroqTranscriptResponse } from '@/types';

function AppContent() {
  const { audioRef, isPlaying, currentTime, duration, loadAudio, toggle, seek } = useAudioPlayer();
  const [transcript, setTranscript] = useState<GroqTranscriptResponse | null>(null);
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useDummy, setUseDummy] = useState(false);

  const { activeLineIndex } = useTranscript(currentTime, lines);

  const handleFileSelected = useCallback(async (file: File) => {
    setIsTranscribing(true);
    setError(null);

    try {
      const audioUrl = URL.createObjectURL(file);
      loadAudio(audioUrl);

      let result: GroqTranscriptResponse;
      if (useDummy) {
        result = dummyTranscript as unknown as GroqTranscriptResponse;
      } else {
        result = await transcribeAudio(file);
      }
      setTranscript(result);

      const parsedLines = splitTranscriptIntoLines(result.words);
      setLines(parsedLines);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  }, [loadAudio, useDummy]);

  const handleReset = useCallback(() => {
    setTranscript(null);
    setLines([]);
    setError(null);
  }, []);

  return (
    <>
      <header className="flex justify-between items-center p-4 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold">Podcast Transcription Player</h1>
        <div className="flex items-center gap-2">
          {import.meta.env.DEV && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useDummy}
                onChange={e => setUseDummy(e.target.checked)}
                className="w-4 h-4"
              />
              Use dummy JSON
            </label>
          )}
          <ApiKeyModalTrigger />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {!transcript ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Upload Your Podcast</h2>
              <p className="text-gray-400">Transcribe and play with synchronized lyrics</p>
            </div>
            <FileUpload onFileSelected={handleFileSelected} isLoading={isTranscribing} />
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg text-center">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                ← Upload New File
              </button>
              <span className="text-sm text-gray-400">
                {transcript.words.length} words • {Math.round(transcript.duration)}s
              </span>
            </div>
            <AudioPlayer
              audioRef={audioRef}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              onToggle={toggle}
              onSeek={seek}
            />
            <TranscriptView lines={lines} activeLineIndex={activeLineIndex} />
          </div>
        )}
      </main>
    </>
  );
}

function ApiKeyModalTrigger() {
  const { setApiKey } = useApiKeyContext();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
      >
        API Key
      </button>
      {isOpen && <ApiKeyModal onClose={() => setIsOpen(false)} onSave={setApiKey} />}
    </>
  );
}

export default function App() {
  return (
    <ApiKeyProvider>
      <AppContent />
    </ApiKeyProvider>
  );
}
