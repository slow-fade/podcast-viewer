# Podcast Transcription Player

A static, pure frontend webapp for transcribing and playing podcast episodes with synchronized lyrics-style text display.

## Features

- **Audio Upload**: Support for m4a, mp3, and mp4 podcast episode files
- **Language Selection**: Choose transcription language (Turkish, English, French, German, Spanish, Russian)
- **API Key Management**: Enter and store Groq API key in browser localStorage
- **AI Transcription**: Uses Groq's hosted API with Whisper v3 for accurate speech-to-text
- **Playback Controls**: Full audio controls including play, pause, and seek functionality
- **Synchronized Lyrics View**: Karaoke-style text display that:
  - Joins transcript text into single line, splits into chunks of 10 words
  - Keeps punctuation attached to preceding word
  - Highlights the currently playing line at center screen
  - Dims inactive lines for focus
  - Smooth auto-scrolls through the transcript as audio progresses

## Tech Stack

- **Frontend Framework**: React (static build)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Audio**: HTML5 Audio API
- **API**: Groq (Whisper v3 transcription) - pure client-side, no backend
- **Build Tool**: Vite
- **Runtime**: Bun

## Getting Started

### Prerequisites

- Bun 1.0+
- Groq API key (get one at https://console.groq.com)

### Installation

```bash
bun install
```

### Development

```bash
bun run dev
```

Starts the development server with hot reload at http://localhost:5173

### Build

```bash
bun run build
```

Builds the production-ready static files to `dist/`

### Preview Production Build

```bash
bun run preview
```

## API Key Management

- First-time users are prompted to enter their Groq API key via a modal
- API key is saved to browser localStorage (`groq_api_key`)
- Button in header allows viewing and resetting the API key
- No server-side storage - everything stays in the browser

## Project Structure

```
src/
├── components/
│   ├── AudioPlayer/       # Playback controls and audio management
│   ├── TranscriptView/    # Karaoke-style text display with smooth scrolling
│   ├── FileUpload/        # Drag-and-drop audio upload zone
│   ├── LanguageSelector/  # Dropdown to select transcription language
│   └── ApiKeyModal/       # Modal for entering/resetting API key
├── context/
│   └── ApiKeyContext.tsx  # localStorage API key state management
├── hooks/
│   ├── useAudioPlayer.ts  # Audio playback state management
│   └── useTranscript.ts   # Transcript data and synchronization
├── services/
│   └── groq.ts            # Groq transcription API client
├── types/
│   └── index.ts           # TypeScript type definitions
├── utils/
│   └── transcript.ts      # Transcript text processing (join → split into lines)
├── App.tsx
└── main.tsx
```

## API Reference

### Groq Transcription

This project uses Groq's Whisper v3 model for fast, accurate transcription. Audio files are sent directly to Groq's API from the browser (CORS enabled).

**Endpoint**: `https://api.groq.com/openai/v1/audio/transcriptions`

**Request Example**:
```bash
curl "https://api.groq.com/openai/v1/audio/transcriptions" \
  -H "Authorization: Bearer ${GROQ_API_KEY}" \
  -F "model=whisper-large-v3-turbo" \
  -F "file=@./audio.m4a" \
  -F "temperature=0" \
  -F "language=tr" \
  -F "response_format=verbose_json" \
  -F "timestamp_granularities[]=word" \
  -X POST
```

**Configuration**:
- **Model**: `whisper-large-v3-turbo`
- **Language**: Configurable via UI (Turkish, English, French, German, Spanish, Russian)
- **Temperature**: `0` (deterministic output)
- **Response Format**: `verbose_json` (includes word-level timestamps)
- **Timestamp Granularities**: `word` (for precise transcript syncing)

### Response Format

The API returns JSON with:
```typescript
{
  task: "transcribe",
  language: "Turkish",
  duration: number,
  text: string,        // Full transcript text
  words: Array<{       // Word-level timestamps
    word: string,
    start: number,
    end: number
  }>,
  x_groq: { id: string }
}
```

## Text Processing

The transcript processing pipeline:

1. **Join**: Replace newlines with spaces, join all text into single line
2. **Split**: Split by spaces to get words array (punctuation stays with preceding word)
3. **Chunk**: Group words into lines of 10 words each
4. **Sync**: Each line inherits start/end from first/last word

## Usage

1. Open the webapp in your browser
2. Enter your Groq API key when prompted (or use the API Key button in header)
3. Select your desired transcription language from the dropdown
4. Drag and drop an m4a, mp3, or mp4 file, or click to browse
5. Wait for the transcription to complete (usually a few seconds)
6. Use the playback controls to play, pause, and seek through the audio
7. Watch the synchronized transcript scroll smoothly as you listen

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
