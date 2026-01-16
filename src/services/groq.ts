import type { GroqTranscriptResponse } from '@/types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

export async function transcribeAudio(
  file: File,
  language: string = 'tr',
  onProgress?: (progress: number) => void
): Promise<GroqTranscriptResponse> {
  const apiKey = localStorage.getItem('groq_api_key');
  if (!apiKey) {
    throw new Error('API key not found. Please set your Groq API key.');
  }

  const formData = new FormData();
  formData.append('model', 'whisper-large-v3-turbo');
  formData.append('file', file);
  formData.append('temperature', '0');
  formData.append('language', language);
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities[]', 'word');

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress((event.loaded / event.total) * 50);
      }
    });

    xhr.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(50 + (event.loaded / event.total) * 50);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText) as GroqTranscriptResponse;
          resolve(response);
        } catch {
          reject(new Error('Failed to parse response'));
        }
      } else if (xhr.status === 401) {
        reject(new Error('Invalid API key. Please check your Groq API key.'));
      } else {
        reject(new Error(`Transcription failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during transcription'));
    });

    xhr.open('POST', GROQ_API_URL);
    xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);
    xhr.send(formData);
  });
}
