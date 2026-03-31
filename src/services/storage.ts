import { openDB, type IDBPDatabase } from 'idb';
import type { GroqTranscriptResponse, StoredAudioFile, StoredTranscription } from '@/types';

const DB_NAME = 'podcast-viewer-db';
const DB_VERSION = 1;
const AUDIO_STORE = 'audioFiles';
const TRANSCRIPTION_STORE = 'transcriptions';

let dbInstance: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE, { keyPath: 'hash' });
      }
      if (!db.objectStoreNames.contains(TRANSCRIPTION_STORE)) {
        db.createObjectStore(TRANSCRIPTION_STORE, { keyPath: 'hash' });
      }
    },
  });

  return dbInstance;
}

export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function saveAudioFile(file: File): Promise<StoredAudioFile> {
  const db = await getDB();
  const hash = await hashFile(file);

  const metadata: StoredAudioFile = {
    hash,
    name: file.name,
    mimeType: file.type,
    size: file.size,
    duration: 0,
    createdAt: Date.now(),
  };

  const audioBlob = new Blob([await file.arrayBuffer()], { type: file.type });
  await db.put(AUDIO_STORE, { ...metadata, audioBlob });

  return metadata;
}

export async function updateAudioFileDuration(hash: string, duration: number): Promise<void> {
  const db = await getDB();
  const stored = await db.get(AUDIO_STORE, hash);
  if (stored) {
    stored.duration = duration;
    await db.put(AUDIO_STORE, stored);
  }
}

export async function getAudioFile(hash: string): Promise<{ file: File; metadata: StoredAudioFile } | null> {
  const db = await getDB();
  const stored = await db.get(AUDIO_STORE, hash);

  if (!stored || !stored.audioBlob) return null;

  const file = new File([stored.audioBlob], stored.name, { type: stored.mimeType });
  const { audioBlob, ...metadata } = stored;

  return { file, metadata: metadata as StoredAudioFile };
}

export async function deleteAudioFile(hash: string): Promise<void> {
  const db = await getDB();
  await db.delete(AUDIO_STORE, hash);
}

export async function saveTranscription(
  hash: string,
  language: string,
  response: GroqTranscriptResponse
): Promise<void> {
  const db = await getDB();
  const transcription: StoredTranscription = {
    hash,
    language,
    groqResponse: response,
    createdAt: Date.now(),
  };
  await db.put(TRANSCRIPTION_STORE, transcription);
}

export async function getTranscription(hash: string): Promise<StoredTranscription | null> {
  const db = await getDB();
  return (await db.get(TRANSCRIPTION_STORE, hash)) || null;
}

export async function deleteTranscription(hash: string): Promise<void> {
  const db = await getDB();
  await db.delete(TRANSCRIPTION_STORE, hash);
}

export async function getAllAudioFiles(): Promise<StoredAudioFile[]> {
  const db = await getDB();
  const all = await db.getAll(AUDIO_STORE);
  return all
    .filter(item => item.audioBlob)
    .map(({ audioBlob, ...metadata }) => metadata as StoredAudioFile)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function hasTranscription(hash: string): Promise<boolean> {
  const db = await getDB();
  const transcription = await db.get(TRANSCRIPTION_STORE, hash);
  return !!transcription;
}

export async function getStoredTranscriptionWithAudio(
  hash: string
): Promise<{ file: File; metadata: StoredAudioFile; transcription: StoredTranscription } | null> {
  const audioResult = await getAudioFile(hash);
  if (!audioResult) return null;

  const transcription = await getTranscription(hash);
  if (!transcription) return null;

  return {
    ...audioResult,
    transcription,
  };
}
