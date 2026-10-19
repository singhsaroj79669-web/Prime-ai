export interface InlineImage {
  mimeType: string;
  data: string; // base64 without prefix
  previewUrl: string;
  fileName?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: InlineImage;
  timestamp: number;
  isStreaming?: boolean;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  systemInstruction?: string;
}

export type LanguageMode = 'auto' | 'hi' | 'en';

export interface AppSettings {
  languageMode: LanguageMode;
  ttsVoice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  useGeminiTTS: boolean;
  autoScroll: boolean;
  systemInstruction: string;
}
