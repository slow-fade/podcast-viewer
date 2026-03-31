import { useState, useCallback, useEffect, useRef } from 'react';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { FileUpload } from '@/components/FileUpload';
import { AudioPlayer } from '@/components/AudioPlayer';
import { TranscriptView } from '@/components/TranscriptView';
import { LanguageSelector } from '@/components/LanguageSelector';
import { HistoryButton } from '@/components/HistoryButton';
import { HistoryModal } from '@/components/HistoryModal';
import { ApiKeyProvider, useApiKeyContext } from '@/context';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useTranscript } from '@/hooks/useTranscript';
import { transcribeAudio } from '@/services/groq';
import {
  hashFile,
  saveAudioFile,
  updateAudioFileDuration,
  getStoredTranscriptionWithAudio,
  getAllAudioFiles,
  getTranscription,
  deleteAudioFile,
  deleteTranscription,
  hasTranscription,
  saveTranscription,
} from '@/services/storage';
import { splitTranscriptIntoLines } from '@/utils';
import dummyTranscript from '@/services/dummy-transcript.json';
import type { TranscriptLine, GroqTranscriptResponse, StoredAudioFile, StoredTranscription } from '@/types';

function AppContent({ onOpenApiKeyModal }: { onOpenApiKeyModal: () => void }) {
  const { audioRef, isPlaying, currentTime, duration, loadAudio, toggle, seek } = useAudioPlayer();
  const [transcript, setTranscript] = useState<GroqTranscriptResponse | null>(null);
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useDummy, setUseDummy] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('tr');

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<StoredAudioFile[]>([]);
  const [historyTranscriptions, setHistoryTranscriptions] = useState<Map<string, StoredTranscription>>(new Map());
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const currentHashRef = useRef<string | null>(null);
  const { activeLineIndex } = useTranscript(currentTime, lines);

  const loadHistoryItems = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const items = await getAllAudioFiles();
      setHistoryItems(items);

      const transcriptionsMap = new Map<string, StoredTranscription>();
      for (const item of items) {
        const transcription = await getTranscription(item.hash);
        if (transcription) {
          transcriptionsMap.set(item.hash, transcription);
        }
      }
      setHistoryTranscriptions(transcriptionsMap);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistoryItems();
  }, [loadHistoryItems]);

  const handleFileSelected = useCallback(async (file: File) => {
    setIsTranscribing(true);
    setError(null);

    try {
      const fileHash = await hashFile(file);
      currentHashRef.current = fileHash;

      const existingTranscription = await hasTranscription(fileHash);

      if (existingTranscription) {
        const stored = await getStoredTranscriptionWithAudio(fileHash);
        if (stored) {
          const audioUrl = URL.createObjectURL(stored.file);
          loadAudio(audioUrl);
          setTranscript(stored.transcription.groqResponse);
          updateAudioFileDuration(fileHash, stored.transcription.groqResponse.duration);
          const parsedLines = splitTranscriptIntoLines(stored.transcription.groqResponse.words);
          setLines(parsedLines);
          await loadHistoryItems();
          return;
        }
      }

      const audioUrl = URL.createObjectURL(file);
      loadAudio(audioUrl);

      let result: GroqTranscriptResponse;
      if (useDummy) {
        result = dummyTranscript as unknown as GroqTranscriptResponse;
      } else {
        result = await transcribeAudio(file, selectedLanguage);
      }

      const savedFileMeta = await saveAudioFile(file);
      await saveTranscription(savedFileMeta.hash, selectedLanguage, result);

      if (currentHashRef.current === fileHash) {
        setTranscript(result);
        const parsedLines = splitTranscriptIntoLines(result.words);
        setLines(parsedLines);
      }

      await loadHistoryItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  }, [loadAudio, useDummy, selectedLanguage, loadHistoryItems]);

  const handleSelectHistoryItem = useCallback(async (hash: string) => {
    setHistoryModalOpen(false);
    setIsTranscribing(true);
    setError(null);

    try {
      const stored = await getStoredTranscriptionWithAudio(hash);
      if (!stored) {
        setError('File not found in storage');
        return;
      }

      currentHashRef.current = hash;
      const audioUrl = URL.createObjectURL(stored.file);
      loadAudio(audioUrl);
      setTranscript(stored.transcription.groqResponse);
      const parsedLines = splitTranscriptIntoLines(stored.transcription.groqResponse.words);
      setLines(parsedLines);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transcription');
    } finally {
      setIsTranscribing(false);
    }
  }, [loadAudio]);

  const handleDeleteHistoryItem = useCallback(async (hash: string) => {
    await deleteTranscription(hash);
    await deleteAudioFile(hash);

    if (currentHashRef.current === hash) {
      setTranscript(null);
      setLines([]);
      currentHashRef.current = null;
    }

    await loadHistoryItems();
  }, [loadHistoryItems]);

  const handleReset = useCallback(() => {
    setTranscript(null);
    setLines([]);
    setError(null);
    currentHashRef.current = null;
  }, []);

  return (
    <div>
      <header className="fixed top-0 left-0 right-0 z-40 bg-tokyo-bg-secondary/90 backdrop-blur-md border-b border-tokyo-border/50">
        <div className="container-responsive h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-tokyo-text-primary">Podcast Transcription Player</h1>
          <div className="flex items-center gap-3">
            <HistoryButton
              onClick={() => setHistoryModalOpen(true)}
              itemCount={historyItems.length}
            />
            {import.meta.env.DEV && (
              <label className="flex items-center gap-2 text-sm text-tokyo-text-muted cursor-pointer hover:text-tokyo-accent-blue transition-colors">
                <input
                  type="checkbox"
                  checked={useDummy}
                  onChange={e => setUseDummy(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                Dummy JSON
              </label>
            )}
            <button
              onClick={onOpenApiKeyModal}
              className="px-4 py-2 bg-tokyo-accent-blue/10 text-tokyo-accent-blue hover:bg-tokyo-accent-blue/20 border border-tokyo-accent-blue/30 rounded-xl transition-all font-medium text-sm"
            >
              API Key
            </button>
          </div>
        </div>
      </header>
      <main className="container-responsive pt-24 pb-12 min-h-screen">
        {!transcript ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-tokyo-text-primary">Upload Your Podcast</h2>
              <p className="text-tokyo-text-muted text-lg">Transcribe and play with synchronized lyrics</p>
            </div>
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              disabled={isTranscribing}
            />
            <FileUpload onFileSelected={handleFileSelected} isLoading={isTranscribing} />
            {error && (
              <div className="w-full max-w-lg bg-tokyo-accent-red/10 border border-tokyo-accent-red/30 text-tokyo-accent-red px-5 py-4 rounded-xl text-center text-sm">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-tokyo-border hover:bg-tokyo-border/80 text-tokyo-text-primary rounded-xl transition-all font-medium text-sm"
              >
                ← Upload New File
              </button>
              <span className="text-sm text-tokyo-text-muted">
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

      <HistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        onSelectItem={handleSelectHistoryItem}
        onDeleteItem={handleDeleteHistoryItem}
        items={historyItems}
        transcriptions={historyTranscriptions}
        isLoading={isLoadingHistory}
      />
    </div>
  );
}

function App() {
  const { setApiKey } = useApiKeyContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <AppContent onOpenApiKeyModal={() => setIsModalOpen(true)} />
      {isModalOpen && <ApiKeyModal onClose={() => setIsModalOpen(false)} onSave={setApiKey} />}
    </>
  );
}

export default () => (
  <ApiKeyProvider>
    <App />
  </ApiKeyProvider>
);
