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
      className="bg-[#1a1b26] border border-[#292e42] rounded-2xl p-6 max-w-3xl mx-auto h-80 overflow-y-auto scroll-smooth"
    >
      <div className="space-y-3">
        {lines.map((line, index) => {
          const isActive = index === activeLineIndex;
          return (
            <div
              key={index}
              ref={el => {
                lineRefs.current[index] = el;
              }}
              className={`transition-all duration-300 px-4 py-3 rounded-xl text-center ${
                isActive
                  ? 'bg-[#7aa2f7]/15 text-[#c0caf5] scale-[1.02] border border-[#7aa2f7]/30 shadow-lg shadow-[#7aa2f7]/10'
                  : 'bg-transparent text-[#565f89] hover:bg-[#292e42]/30'
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
