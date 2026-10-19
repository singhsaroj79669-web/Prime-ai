import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { EmptyState } from './components/EmptyState';
import { SettingsModal } from './components/SettingsModal';
import { ImageModal } from './components/ImageModal';
import {
  Conversation,
  ChatMessage as ChatMessageType,
  InlineImage,
  AppSettings,
  LanguageMode,
} from './types';
import {
  loadConversations,
  saveConversations,
  loadActiveChatId,
  saveActiveChatId,
  loadSettings,
  saveSettings,
  createNewConversation,
} from './utils/storage';
import { stopCurrentAudioPlayback } from './utils/speech';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize and load saved state
  useEffect(() => {
    const saved = loadConversations();
    const savedId = loadActiveChatId();

    if (saved.length > 0) {
      setConversations(saved);
      if (savedId && saved.some((c) => c.id === savedId)) {
        setActiveChatId(savedId);
      } else {
        setActiveChatId(saved[0].id);
      }
    } else {
      const initialChat = createNewConversation();
      setConversations([initialChat]);
      setActiveChatId(initialChat.id);
      saveConversations([initialChat]);
      saveActiveChatId(initialChat.id);
    }

    // Check backend health & key status
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(Boolean(data.hasApiKey));
      })
      .catch((err) => {
        console.warn('Backend health check error:', err);
      });
  }, []);

  // Sync to storage when conversations change
  useEffect(() => {
    if (conversations.length > 0) {
      saveConversations(conversations);
    }
  }, [conversations]);

  useEffect(() => {
    saveActiveChatId(activeChatId);
  }, [activeChatId]);

  const activeConversation =
    conversations.find((c) => c.id === activeChatId) || conversations[0];

  // Auto-scroll to bottom of messages
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (settings.autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [activeChatId]);

  useEffect(() => {
    if (isStreaming) {
      scrollToBottom('smooth');
    }
  }, [activeConversation?.messages]);

  // Create new conversation
  const handleNewChat = () => {
    stopCurrentAudioPlayback();
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }

    const newChat = createNewConversation();
    setConversations((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  // Select conversation
  const handleSelectChat = (id: string) => {
    if (id === activeChatId) return;
    stopCurrentAudioPlayback();
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
    setActiveChatId(id);
  };

  // Delete single conversation
  const handleDeleteChat = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    if (updated.length === 0) {
      const fresh = createNewConversation();
      setConversations([fresh]);
      setActiveChatId(fresh.id);
    } else {
      setConversations(updated);
      if (activeChatId === id) {
        setActiveChatId(updated[0].id);
      }
    }
  };

  // Rename conversation
  const handleRenameChat = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  // Clear all conversations
  const handleClearAllChats = () => {
    stopCurrentAudioPlayback();
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
    const fresh = createNewConversation();
    setConversations([fresh]);
    setActiveChatId(fresh.id);
    saveConversations([fresh]);
    saveActiveChatId(fresh.id);
  };

  // Language mode toggle
  const handleToggleLanguage = () => {
    const modes: LanguageMode[] = ['auto', 'hi', 'en'];
    const nextIndex = (modes.indexOf(settings.languageMode) + 1) % modes.length;
    const nextMode = modes[nextIndex];
    const newSettings = { ...settings, languageMode: nextMode };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleSelectLanguage = (lang: LanguageMode) => {
    const newSettings = { ...settings, languageMode: lang };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Save settings from modal
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Stop streaming
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);

    // finalize current message
    if (activeChatId) {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== activeChatId) return conv;
          const updatedMessages = conv.messages.map((m) =>
            m.isStreaming ? { ...m, isStreaming: false } : m
          );
          return { ...conv, messages: updatedMessages };
        })
      );
    }
  };

  // Generate automated title from user message
  const deriveConversationTitle = (text: string, image?: InlineImage): string => {
    if (text) {
      const clean = text.replace(/[\n\r]+/g, ' ').trim();
      return clean.length > 38 ? clean.substring(0, 38) + '...' : clean;
    }
    if (image?.fileName) {
      return `Image: ${image.fileName}`;
    }
    return 'Image Analysis';
  };

  // Send message to Gemini via Server SSE
  const handleSendMessage = async (userText: string, userImage?: InlineImage) => {
    if (!userText && !userImage) return;

    let targetConv = activeConversation;
    if (!targetConv) {
      targetConv = createNewConversation();
      setConversations([targetConv]);
      setActiveChatId(targetConv.id);
    }

    const userMessage: ChatMessageType = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      role: 'user',
      text: userText,
      image: userImage,
      timestamp: Date.now(),
    };

    const modelMessageId = 'msg_' + Math.random().toString(36).substring(2, 9) + '_' + (Date.now() + 1);
    const initialModelMessage: ChatMessageType = {
      id: modelMessageId,
      role: 'model',
      text: '',
      timestamp: Date.now() + 1,
      isStreaming: true,
    };

    const isFirstMessage = targetConv.messages.length === 0;
    const newTitle = isFirstMessage
      ? deriveConversationTitle(userText, userImage)
      : targetConv.title;

    // Update conversation state with user message and streaming placeholder
    const currentConvId = targetConv.id;
    const conversationHistory = [...targetConv.messages, userMessage];

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== currentConvId) return conv;
        return {
          ...conv,
          title: newTitle,
          updatedAt: Date.now(),
          messages: [...conversationHistory, initialModelMessage],
        };
      })
    );

    // Format Gemini contents payload
    const contentsPayload = conversationHistory.map((msg) => {
      const parts: any[] = [];
      if (msg.image) {
        parts.push({
          inlineData: {
            mimeType: msg.image.mimeType,
            data: msg.image.data,
          },
        });
      }
      if (msg.text) {
        parts.push({ text: msg.text });
      }
      return {
        role: msg.role,
        parts,
      };
    });

    setIsStreaming(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contentsPayload,
          systemInstruction: settings.systemInstruction,
          languageMode: settings.languageMode,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.substring(6);
            try {
              const data = JSON.parse(jsonStr);
              if (data.text) {
                accumulatedText += data.text;
                // Live update model message
                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id !== currentConvId) return c;
                    const msgs = c.messages.map((m) =>
                      m.id === modelMessageId
                        ? { ...m, text: accumulatedText, isStreaming: true }
                        : m
                    );
                    return { ...c, messages: msgs };
                  })
                );
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (err: any) {
              if (err.message && !jsonStr.includes('done')) {
                console.error('SSE parse error:', err);
              }
            }
          }
        }
      }

      // Finalize model message
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== currentConvId) return c;
          const msgs = c.messages.map((m) =>
            m.id === modelMessageId ? { ...m, isStreaming: false } : m
          );
          return { ...c, messages: msgs, updatedAt: Date.now() };
        })
      );
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
      } else {
        console.error('Chat generation error:', error);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== currentConvId) return c;
            const msgs = c.messages.map((m) =>
              m.id === modelMessageId
                ? {
                    ...m,
                    isStreaming: false,
                    error:
                      error.message ||
                      'An unexpected error occurred while communicating with Gemini AI.',
                  }
                : m
            );
            return { ...c, messages: msgs };
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Retry or regenerate a response
  const handleRetryMessage = (messageId: string) => {
    if (!activeConversation) return;
    const msgIndex = activeConversation.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    // Find preceding user message
    let precedingUserMsg: ChatMessageType | null = null;
    for (let i = msgIndex; i >= 0; i--) {
      if (activeConversation.messages[i].role === 'user') {
        precedingUserMsg = activeConversation.messages[i];
        break;
      }
    }

    if (!precedingUserMsg) return;

    // Remove the failed model message and re-send
    const trimmedMessages = activeConversation.messages.slice(0, msgIndex);
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, messages: trimmedMessages } : c))
    );

    setTimeout(() => {
      handleSendMessage(precedingUserMsg!.text, precedingUserMsg!.image);
    }, 50);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080a10] text-slate-100 antialiased font-sans">
      {/* Sidebar Drawer */}
      <Sidebar
        conversations={conversations}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onClearAllChats={handleClearAllChats}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        hasApiKey={hasApiKey}
      />

      {/* Main Chat Interface */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative bg-gradient-to-b from-[#080a10] via-[#090d16] to-[#080a10]">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNewChat={handleNewChat}
          onOpenSettings={() => setSettingsModalOpen(true)}
          currentTitle={activeConversation?.title || 'PrimeXzerox AI'}
          languageMode={settings.languageMode}
          onSelectLanguage={handleSelectLanguage}
          hasApiKey={hasApiKey}
        />

        {/* Messages or Empty State Scrollable Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <EmptyState
              onSelectPrompt={(prompt) => handleSendMessage(prompt)}
              languageMode={settings.languageMode}
            />
          ) : (
            <div className="flex-1 pb-4">
              {activeConversation.messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onRetry={handleRetryMessage}
                  onImageClick={(url) => setModalImageUrl(url)}
                  ttsVoice={settings.ttsVoice}
                  languageMode={settings.languageMode}
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onStopStreaming={handleStopStreaming}
          isStreaming={isStreaming}
          languageMode={settings.languageMode}
          onToggleLanguage={handleToggleLanguage}
        />
      </main>

      {/* Settings & Security Setup Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        conversations={conversations}
        onClearAll={handleClearAllChats}
        hasApiKey={hasApiKey}
      />

      {/* Full Resolution Image Lightbox Modal */}
      <ImageModal
        isOpen={Boolean(modalImageUrl)}
        onClose={() => setModalImageUrl(null)}
        imageUrl={modalImageUrl || ''}
      />
    </div>
  );
}
