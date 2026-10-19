import { Conversation, AppSettings } from '../types';

const STORAGE_KEY_CONVERSATIONS = 'primexzerox_conversations_v2';
const STORAGE_KEY_ACTIVE_ID = 'primexzerox_active_chat_id';
const STORAGE_KEY_SETTINGS = 'primexzerox_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  languageMode: 'auto',
  ttsVoice: 'Kore',
  useGeminiTTS: true,
  autoScroll: true,
  systemInstruction: '',
};

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load conversations from localStorage:', err);
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
  } catch (err) {
    console.error('Failed to save conversations to localStorage:', err);
  }
}

export function loadActiveChatId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
  } catch {
    return null;
  }
}

export function saveActiveChatId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
    }
  } catch (err) {
    console.error('Failed to save active chat ID:', err);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function createNewConversation(): Conversation {
  const now = Date.now();
  return {
    id: 'chat_' + Math.random().toString(36).substring(2, 9) + '_' + now,
    title: 'New Conversation',
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}
