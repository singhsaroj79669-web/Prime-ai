import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCw,
  Cpu,
  User,
  AlertCircle,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';
import { speakText, stopCurrentAudioPlayback } from '../utils/speech';

interface ChatMessageProps {
  message: ChatMessageType;
  onRetry?: (messageId: string) => void;
  onImageClick?: (url: string) => void;
  ttsVoice?: string;
  languageMode?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRetry,
  onImageClick,
  ttsVoice = 'Kore',
  languageMode = 'auto',
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (isPlayingAudio) {
      stopCurrentAudioPlayback();
      setIsPlayingAudio(false);
      return;
    }

    const ttsLang = languageMode === 'hi' ? 'hi-IN' : 'en-US';
    setIsPlayingAudio(true);
    speakText(
      message.text,
      ttsVoice,
      ttsLang,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
  };

  const copyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`group relative flex gap-3 px-3 sm:px-6 py-4 transition-colors ${
        isUser
          ? 'bg-transparent justify-end'
          : 'bg-slate-900/40 border-y border-slate-800/40'
      }`}
    >
      <div
        className={`flex w-full max-w-4xl gap-3 sm:gap-4 ${
          isUser ? 'flex-row-reverse justify-start' : 'flex-row'
        }`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 border border-blue-400/30">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>
          )}
        </div>

        {/* Message Content Container */}
        <div
          className={`flex-1 min-w-0 ${
            isUser ? 'max-w-[85%] sm:max-w-[78%] flex flex-col items-end' : ''
          }`}
        >
          {/* Header info */}
          <div
            className={`flex items-center gap-2 mb-1.5 text-xs text-slate-400 ${
              isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            <span className="font-medium text-slate-300">
              {isUser ? 'You' : 'PrimeXzerox AI'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-[11px] text-slate-500">{formattedTime}</span>
            {!isUser && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                <Sparkles className="w-2.5 h-2.5" />
                Gemini 3.8 Flash
              </span>
            )}
          </div>

          {/* Attached Image (if any) */}
          {message.image && (
            <div className="mb-3 max-w-sm rounded-xl overflow-hidden border border-slate-700/70 bg-slate-950/50 relative group/img shadow-md">
              <img
                src={message.image.previewUrl}
                alt={message.image.fileName || 'Uploaded attachment'}
                className="max-h-60 w-auto object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => onImageClick?.(message.image!.previewUrl)}
              />
              <button
                onClick={() => onImageClick?.(message.image!.previewUrl)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white/90 opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-black"
                title="View full image"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              {message.image.fileName && (
                <div className="px-2.5 py-1 text-[11px] text-slate-400 truncate bg-slate-900/90 border-t border-slate-800">
                  {message.image.fileName}
                </div>
              )}
            </div>
          )}

          {/* Text Bubble / Markdown Area */}
          <div
            className={`rounded-2xl text-[14.5px] sm:text-[15px] leading-relaxed overflow-hidden ${
              isUser
                ? 'bg-blue-600/20 text-blue-50 border border-blue-500/30 px-4 py-3 rounded-tr-none shadow-sm shadow-blue-500/10'
                : 'text-slate-200'
            }`}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap break-words">{message.text}</div>
            ) : (
              <div className="prose-dark max-w-none break-words">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeContent = String(children).replace(/\n$/, '');
                      const isMultiLine = codeContent.includes('\n') || Boolean(match);

                      if (isMultiLine) {
                        const codeIndex = Math.abs(codeContent.length + (match ? match[1].length : 0));
                        return (
                          <div className="relative my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-[#0d1117] shadow-lg">
                            <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#161b22] border-b border-slate-800 text-xs text-slate-400">
                              <span className="font-mono text-cyan-400 text-[11px] uppercase tracking-wide">
                                {match ? match[1] : 'code'}
                              </span>
                              <button
                                onClick={() => copyCode(codeContent, codeIndex)}
                                className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
                              >
                                {copiedCodeIndex === codeIndex ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy code</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-3.5 text-xs sm:text-sm font-mono overflow-x-auto text-slate-200">
                              <code>{codeContent}</code>
                            </pre>
                          </div>
                        );
                      }

                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.text}
                </ReactMarkdown>

                {/* Animated cursor when streaming */}
                {message.isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 align-middle bg-cyan-400 animate-pulse rounded-sm" />
                )}
              </div>
            )}
          </div>

          {/* Error notice if message failed */}
          {message.error && (
            <div className="mt-2 flex items-start gap-2 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Generation Error</p>
                <p className="text-red-300/80 mt-0.5">{message.error}</p>
                {onRetry && (
                  <button
                    onClick={() => onRetry(message.id)}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-red-900/60 hover:bg-red-900 text-red-100 rounded-lg text-xs font-medium transition-colors"
                  >
                    <RotateCw className="w-3 h-3" />
                    Retry Generation
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action Toolbar for AI message */}
          {!isUser && !message.isStreaming && (
            <div className="flex items-center gap-2 mt-2 pt-1 text-slate-400">
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg hover:bg-slate-800/80 hover:text-slate-200 transition-colors"
                title="Copy response"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleToggleSpeak}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors ${
                  isPlayingAudio
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50'
                    : 'hover:bg-slate-800/80 hover:text-slate-200'
                }`}
                title={isPlayingAudio ? 'Stop audio' : 'Listen to response'}
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span className="text-[11px] text-cyan-300">Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Listen</span>
                  </>
                )}
              </button>

              {onRetry && (
                <button
                  onClick={() => onRetry(message.id)}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg hover:bg-slate-800/80 hover:text-slate-200 transition-colors"
                  title="Regenerate"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
