import { useRef } from 'react';

interface AudioPlayerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onToggle: () => void;
  onSeek: (time: number) => void;
}

export function AudioPlayer({ audioRef, isPlaying, currentTime, duration, onToggle, onSeek }: AudioPlayerProps) {
  const progressRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(percent * duration);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-tokyo-bg-primary border border-tokyo-border rounded-2xl p-5">
      <div className="flex items-center gap-5">
        <button
          onClick={onToggle}
          className="w-12 h-12 flex items-center justify-center bg-tokyo-accent-blue text-tokyo-bg-secondary hover:bg-tokyo-accent-blue/90 rounded-full transition-all flex-shrink-0 shadow-lg shadow-tokyo-accent-blue/20"
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="h-2 bg-tokyo-border rounded-full cursor-pointer overflow-hidden group"
          >
            <div
              className="h-full bg-tokyo-accent-blue rounded-full transition-all duration-75 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-tokyo-accent-blue rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-tokyo-text-muted mt-2 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
