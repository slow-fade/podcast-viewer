import { useRef, useEffect } from 'react';
import type { TranscriptLine } from '@/types';

interface TranscriptViewProps {
  lines: TranscriptLine[];
  activeLineIndex: number;
}

export function TranscriptView({ lines, activeLineIndex }: TranscriptViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (activeLineIndex >= 0 && lineRefs.current[activeLineIndex]) {
      lineRefs.current[activeLineIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex]);

  if (lines.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="bg-gray-800 rounded-xl p-6 max-w-2xl mx-auto h-96 overflow-y-auto scroll-smooth"
    >
      <div className="space-y-4">
        {lines.map((line, index) => {
          const isActive = index === activeLineIndex;
          return (
            <div
              key={index}
              ref={el => {
                lineRefs.current[index] = el;
              }}
              className={`transition-all duration-300 p-3 rounded-lg ${
                isActive
                  ? 'bg-blue-600 text-white scale-105 shadow-lg'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
