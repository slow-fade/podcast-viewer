import type { Word, TranscriptLine } from '@/types';

export function splitTranscriptIntoLines(words: Word[], wordsPerLine: number = 10): TranscriptLine[] {
  const lines: TranscriptLine[] = [];

  for (let i = 0; i < words.length; i += wordsPerLine) {
    const chunk = words.slice(i, i + wordsPerLine);
    if (chunk.length === 0) continue;

    const text = chunk.map(w => w.word).join(' ');
    const start = chunk[0]!.start;
    const end = chunk[chunk.length - 1]!.end;
    const wordIndices: [number, number] = [i, i + chunk.length - 1];

    lines.push({ text, start, end, wordIndices });
  }

  return lines;
}

export function findActiveLineIndex(currentTime: number, lines: TranscriptLine[]): number {
  for (let i = 0; i < lines.length; i++) {
    if (currentTime >= lines[i].start && currentTime < lines[i].end) {
      return i;
    }
  }
  return -1;
}
