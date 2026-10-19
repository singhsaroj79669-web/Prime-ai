// Voice Recognition & Speech Synthesis Utility

// Type definitions for SpeechRecognition API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function createSpeechRecognizer(
  lang: string,
  onTranscript: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  onEnd: () => void
): SpeechRecognitionInstance | null {
  if (!isSpeechRecognitionSupported()) {
    onError('Speech recognition is not supported in this browser.');
    return null;
  }

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionClass) return null;

  try {
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang || 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          final += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      const text = final || interim;
      if (text) {
        onTranscript(text, Boolean(final));
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') {
        // User didn't speak within timeout, benign
        return;
      }
      onError(`Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      onEnd();
    };

    return recognition;
  } catch (err: any) {
    onError(`Could not initialize speech recognition: ${err?.message || err}`);
    return null;
  }
}

let activeAudio: HTMLAudioElement | null = null;

export function stopCurrentAudioPlayback(): void {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {}
    activeAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export async function speakText(
  text: string,
  voiceName: string = 'Kore',
  lang: string = 'en-US',
  onStart?: () => void,
  onFinish?: () => void,
  onError?: (err: string) => void
): Promise<void> {
  stopCurrentAudioPlayback();

  // Try Server-side Gemini TTS first
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceName }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        activeAudio = audio;

        audio.onplay = () => {
          onStart?.();
        };

        audio.onended = () => {
          activeAudio = null;
          onFinish?.();
        };

        audio.onerror = () => {
          fallbackBrowserTTS(text, lang, onStart, onFinish, onError);
        };

        await audio.play();
        return;
      }
    }
  } catch {
    // If backend TTS fails or API key issue, fallback to browser TTS
  }

  // Fallback to browser SpeechSynthesis
  fallbackBrowserTTS(text, lang, onStart, onFinish, onError);
}

function fallbackBrowserTTS(
  text: string,
  lang: string,
  onStart?: () => void,
  onFinish?: () => void,
  onError?: (err: string) => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.('Speech synthesis not supported in this browser.');
    return;
  }

  const cleanText = text
    .replace(/```[\s\S]*?```/g, ' [Code Block] ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[#*_~>\[\]\(\)]/g, ' ')
    .slice(0, 1000);

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = lang === 'hi' || lang === 'hi-IN' ? 'hi-IN' : 'en-US';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onFinish?.();
  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    onFinish?.();
  };

  window.speechSynthesis.speak(utterance);
}
