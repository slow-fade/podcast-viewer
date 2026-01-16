import { useMemo } from 'react';
import type { TranscriptLine } from '@/types';
import { findActiveLineIndex } from '@/utils';

export function useTranscript(currentTime: number, lines: TranscriptLine[]) {
  const activeLineIndex = useMemo(
    () => findActiveLineIndex(currentTime, lines),
    [currentTime, lines]
  );

  return { activeLineIndex };
}
