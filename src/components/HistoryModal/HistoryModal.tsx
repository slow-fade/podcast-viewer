import { useEffect, useState } from 'react';
import type { StoredAudioFile, StoredTranscription } from '@/types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (hash: string) => void;
  onDeleteItem: (hash: string) => void;
  items: StoredAudioFile[];
  transcriptions: Map<string, StoredTranscription>;
  isLoading: boolean;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function HistoryModal({
  isOpen,
  onClose,
  onSelectItem,
  onDeleteItem,
  items,
  transcriptions,
  isLoading,
}: HistoryModalProps) {
  const [deletingHash, setDeletingHash] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (e: React.MouseEvent, hash: string) => {
    e.stopPropagation();
    setDeletingHash(hash);
    try {
      await onDeleteItem(hash);
    } finally {
      setDeletingHash(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-tokyo-bg-secondary border border-tokyo-border rounded-2xl shadow-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-tokyo-border">
          <h2 className="text-lg font-semibold text-tokyo-text-primary">Transcription History</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-tokyo-border/50 text-tokyo-text-muted hover:text-tokyo-text-primary rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-tokyo-accent-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3 opacity-50">📭</div>
              <p className="text-tokyo-text-muted">No transcriptions yet</p>
              <p className="text-tokyo-text-muted/60 text-sm mt-1">
                Upload an audio file to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map(item => {
                const transcription = transcriptions.get(item.hash);
                const isDeleting = deletingHash === item.hash;

                return (
                  <div
                    key={item.hash}
                    onClick={() => onSelectItem(item.hash)}
                    className="group p-4 bg-tokyo-bg-primary hover:bg-tokyo-border/20 border border-tokyo-border hover:border-tokyo-accent-blue/30 rounded-xl cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-tokyo-text-primary truncate">{item.name}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-tokyo-text-muted">
                          <span className="flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {formatDuration(item.duration || transcription?.groqResponse.duration || 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            {transcription?.groqResponse.words.length || 0} words
                          </span>
                          <span>{formatFileSize(item.size)}</span>
                        </div>
                        <p className="text-xs text-tokyo-text-muted/60 mt-1.5">
                          {formatDate(item.createdAt)}
                          {transcription && (
                            <span className="ml-2 text-tokyo-accent-green">Transcribed</span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={e => handleDelete(e, item.hash)}
                        disabled={isDeleting}
                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-tokyo-accent-red/10 text-tokyo-text-muted hover:text-tokyo-accent-red rounded-lg transition-all disabled:opacity-50"
                        title="Delete"
                      >
                        {isDeleting ? (
                          <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
