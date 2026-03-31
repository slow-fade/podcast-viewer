export interface Word {
  word: string;
  start: number;
  end: number;
}

export interface TranscriptLine {
  text: string;
  start: number;
  end: number;
  wordIndices: [number, number];
}

export interface GroqTranscriptResponse {
  task: string;
  language: string;
  duration: number;
  text: string;
  words: Word[];
  segments: unknown;
  x_groq: {
    id: string;
  };
}

export interface StoredAudioFile {
  hash: string;
  name: string;
  mimeType: string;
  size: number;
  duration: number;
  createdAt: number;
}

export interface StoredTranscription {
  hash: string;
  language: string;
  groqResponse: GroqTranscriptResponse;
  createdAt: number;
}
