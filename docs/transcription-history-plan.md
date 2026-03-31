# Transcription History Feature - Implementation Plan

## Overview
Add persistent storage for audio files and transcriptions, with a history modal to manage past transcriptions.

## Storage Strategy
- **Storage**: IndexedDB via `idb` library (lightweight, promise-based wrapper)
- **Database Name**: `podcast-viewer-db`
- **Object Stores**:
  1. `audioFiles` - stores audio blobs with metadata
  2. `transcriptions` - stores transcription results keyed by file hash

## Data Types

```typescript
interface StoredAudioFile {
  hash: string;           // SHA-256 hash of file content
  name: string;           // Original filename
  mimeType: string;       // File MIME type
  size: number;           // File size in bytes
  duration: number;       // Audio duration in seconds
  createdAt: number;      // Timestamp when stored
}

interface StoredTranscription {
  hash: string;           // References StoredAudioFile.hash
  language: string;       // Language used for transcription
  groqResponse: GroqTranscriptResponse;  // Full API response
  createdAt: number;      // Timestamp when stored
}
```

## Implementation Steps

### 1. Create IndexedDB Service (`src/services/storage.ts`)
- Initialize IndexedDB with `idb` library
- Functions:
  - `initDB()` - opens database, creates object stores if needed
  - `saveAudioFile(file: File): Promise<string>` - saves audio blob, returns hash
  - `getAudioFile(hash: string): Promise<{file: File; metadata: StoredAudioFile} | null>`
  - `deleteAudioFile(hash: string): Promise<void>`
  - `saveTranscription(hash: string, language: string, response: GroqTranscriptResponse): Promise<void>`
  - `getTranscription(hash: string): Promise<StoredTranscription | null>`
  - `deleteTranscription(hash: string): Promise<void>`
  - `getAllAudioFiles(): Promise<StoredAudioFile[]>`
  - `hashFile(file: File): Promise<string>` - SHA-256 hash using SubtleCrypto API

### 2. Create History Types (`src/types/index.ts`)
- Add `StoredAudioFile` and `StoredTranscription` interfaces

### 3. Create History Modal Component (`src/components/HistoryModal/`)
- Props: `isOpen`, `onClose`, `onSelectItem`
- Displays list of past transcriptions sorted by date (newest first)
- Each item shows: filename, duration, date, word count
- Delete button (trash icon) on each item with confirmation
- Empty state when no history

### 4. Create History Button Component (`src/components/HistoryButton/`)
- Icon button (clock/history icon) in header
- Shows count badge if history has items
- Opens HistoryModal on click

### 5. Modify App.tsx
- Add state for `historyModalOpen`
- Modify `handleFileSelected` to:
  1. Hash the file first
  2. Check if transcription exists in IndexedDB
  3. If exists: load directly without API call
  4. If not: transcribe, then save both audio and transcription to IndexedDB
- Add `HistoryButton` to header
- Pass `onDeleteItem` handler to clear storage when items are deleted

### 6. Handle Item Selection
- When user clicks history item: load audio blob URL, parse stored transcription, display

### 7. Handle Deletion
- When user deletes item: remove both audio file and transcription from IndexedDB
- If deleted item is currently displayed, reset the view

## File Structure Changes
```
src/
├── services/
│   ├── storage.ts    (NEW)
│   └── groq.ts
├── components/
│   ├── HistoryModal/   (NEW)
│   │   ├── HistoryModal.tsx
│   │   └── index.ts
│   ├── HistoryButton/  (NEW)
│   │   ├── HistoryButton.tsx
│   │   └── index.ts
│   └── ...
├── types/
│   └── index.ts       (MODIFIED - add StoredAudioFile, StoredTranscription)
└── App.tsx            (MODIFIED)
```

## Dependencies
- `idb` - Already in package.json or add it

## UI/UX Details
- History icon: clock/History icon (Lucide or similar)
- Badge on icon shows number of stored items
- Modal: centered overlay with backdrop blur
- Each history item: card style with hover effect
- Delete: icon button that shows confirmation on hover, then deletes
- Toast/notification when file is loaded from history vs newly transcribed
