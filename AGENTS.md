# AGENTS.md

This file provides guidelines for agentic coding agents working in this podcast viewer repository.

## Build, Lint, and Test Commands

### Core Commands
- `bun install` - Install all dependencies
- `bun run build` - Build the production application
- `bun run dev` - Start development server with hot reload
- `bun run lint` - Run ESLint on the codebase
- `bun run lint:fix` - Run ESLint with auto-fix for fixable issues
- `bun run typecheck` - Run TypeScript type checking
- `bun run format` - Format code with Prettier
- `bun run format:check` - Check code formatting with Prettier

### Testing
- `bun test` - Run all tests
- `bun run test:watch` - Run tests in watch mode
- `bun run test:coverage` - Run tests with coverage report
- `bun run test:unit` - Run unit tests only
- `bun run test:e2e` - Run end-to-end tests
- **Run a single test**: `bun test -- --testNamePattern="test name"` or `bun test -- path/to/test.test.ts`

## Project Overview

Pure client-side frontend webapp for podcast transcription and playback with synchronized lyrics-style display. Users upload m4a/mp3/mp4 files, Groq API (Whisper v3) transcribes them directly from the browser, and a karaoke UI shows aligned text with smooth scrolling.

### Key Features
- Audio file upload (m4a, mp3, mp4) via drag-and-drop or file picker
- Groq Whisper v3 transcription API integration (pure client-side, CORS enabled)
- API key management via modal, stored in browser localStorage
- Audio player with play/pause/seek controls and progress bar
- Synchronized transcript view (karaoke/lyrics style)
- Turkish language support (default `language=tr`, but configurable)
- Word-level timestamps for precise sync
- Smooth auto-scrolling to active line at center screen

### Groq API Configuration
- **Model**: `whisper-large-v3-turbo`
- **Language**: `tr` (Turkish) - configurable per request
- **Temperature**: `0` (deterministic output)
- **Response Format**: `verbose_json` (includes word-level timestamps)
- **Timestamp Granularities**: `word` (for precise transcript syncing)

## Text Processing Pipeline

The transcript processing follows this exact order:

1. **Join**: Replace newlines with spaces, join all text into single continuous line
2. **Split**: Split by spaces to create words array (punctuation stays attached to preceding word, e.g., "sunar." stays as single token)
3. **Chunk**: Group words into lines of 7-8 words each for karaoke display
4. **Sync**: Each line inherits start time from first word, end time from last word

```typescript
// Example output structure
interface TranscriptLine {
  text: string;           // "Rosman ortamlarda satılacak bilgiyi sunar."
  start: number;          // 0.04
  end: number;            // 3.16
  wordIndices: [number, number]; // indices in original words array
}
```

## Code Style Guidelines

### General Principles
- Write self-documenting code; avoid comments that explain "what" the code does
- Keep functions small and focused on a single responsibility
- Follow the DRY principle but prefer readability over extreme deduplication
- Use meaningful variable and function names that describe intent

### Imports and Dependencies
- Use absolute imports with `@/` alias for project modules (e.g., `import { usePlayer } from '@/hooks/usePlayer'`)
- Group imports in this order: React/library imports, absolute imports, relative imports
- Use named imports for multiple items from the same package: `import { useState, useEffect } from 'react'`
- Avoid default exports; prefer named exports for better refactoring support
- Remove unused imports immediately

### Formatting and Style
- Use 2 spaces for indentation
- Use single quotes for strings unless template strings are needed
- Add trailing commas in multi-line objects and arrays
- Limit line length to 100 characters
- Use semicolons consistently Prettier before committing; use `bun
- Format with run format`

### TypeScript Conventions
- Enable `strict: true` in tsconfig.json; do not use `any` except in extreme cases
- Define explicit types for function parameters and return values
- Use interfaces for object shapes and type unions for variant types
- Prefer `type` over `interface` for unions, intersections, and primitives
- Use `enum` sparingly; prefer const objects with `as const` for fixed sets
- Export types that are used across modules; keep internal types private
- Use `unknown` instead of `any` for truly dynamic values

### Naming Conventions
- **Components**: PascalCase for React components, e.g., `AudioPlayer`, `TranscriptView`
- **Files**: kebab-case for non-component files, e.g., `use-audio.ts`, `groq-api.ts`
- **Variables and functions**: camelCase, e.g., `currentTime`, `splitTranscriptIntoLines()`
- **Constants**: SCREAMING_SNAKE_CASE for config values, camelCase for internal constants
- **Booleans**: Use `is`/`has`/`should` prefixes, e.g., `isPlaying`, `hasTranscript`
- **Custom hooks**: `use` prefix, e.g., `useAudioPlayer`, `useTranscript`
- **Context**: `use[Name]Context` pattern, e.g., `useApiKeyContext`

### Audio & Transcript Handling
- Use HTML5 `<audio>` element for playback (simpler than Web Audio API for this use case)
- Use `timeupdate` event to sync transcript highlighting
- Store transcript lines with start/end timestamps from Whisper output
- Split long transcript text into chunks of 7-8 words for karaoke display
- Implement smooth scrolling using `scrollIntoView({ behavior: 'smooth', block: 'center' })`
- Use refs for direct DOM manipulation of scrollable container
- Debounce rapid seek events to avoid jank
- Handle audio file uploads with proper type validation (m4a, mp3, mp4)

### API Key Management
- Store API key in localStorage under `groq_api_key` key
- Create a modal component for entering/resetting the API key
- Mask the API key when displaying (show only last 4 characters)
- Provide "Save" and "Clear/Remove" buttons
- Check for existing key on app mount; show modal if none exists

### Error Handling
- Use typed error results instead of throwing exceptions for expected failures
- Wrap async operations in try/catch blocks with specific error handling
- Log errors with context using structured logging
- Propagate errors with added context rather than swallowing them
- Create custom error classes for domain-specific errors (e.g., `TranscriptionError`)
- Handle API key missing errors gracefully with modal prompt

### React Patterns
- Use functional components with hooks exclusively
- Use `useCallback` for event handlers and functions passed as props
- Use `useMemo` for expensive computations and object/array creation in JSX
- Keep components under 200 lines; extract sub-components when growing larger
- Use composition over prop drilling; use context for global state like API key
- Destructure props explicitly for better IDE support
- Place `useEffect` cleanup functions in their own return statement
- Sync audio `timeupdate` events with transcript highlighting via refs and state

### File Organization
- Keep related logic together; co-locate components with their hooks and types
- Create index barrels (`index.ts`) for public API exports in directories
- Put tests alongside source files with `.test.ts` or `.spec.ts` suffix
- Use feature-based directory structure: `components/AudioPlayer/`, `components/TranscriptView/`
- Place API clients in `services/` directory (e.g., `services/groq.ts`)
- Place context providers in `context/` directory (e.g., `context/ApiKeyContext.tsx`)
- API call should use `whisper-large-v3-turbo` model with configurable language and word-level timestamps

### Component Structure

```
src/
├── components/
│   ├── AudioPlayer/
│   │   ├── AudioPlayer.tsx
│   │   ├── AudioPlayer.module.css (if needed)
│   │   └── index.ts
│   ├── TranscriptView/
│   │   ├── TranscriptView.tsx
│   │   ├── TranscriptLine.tsx (individual line component)
│   │   └── index.ts
│   ├── FileUpload/
│   │   ├── FileUpload.tsx
│   │   └── index.ts
│   └── ApiKeyModal/
│       ├── ApiKeyModal.tsx
│       └── index.ts
├── context/
│   ├── ApiKeyContext.tsx
│   └── index.ts
├── hooks/
│   ├── useAudioPlayer.ts
│   ├── useTranscript.ts
│   └── index.ts
├── services/
│   └── groq.ts
├── utils/
│   └── transcript.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

### Git and Pull Requests
- Write descriptive commit messages following conventional commits format
- Keep PRs focused; one feature or fix per PR
- Include tests for new functionality
- Self-review code before opening PRs
