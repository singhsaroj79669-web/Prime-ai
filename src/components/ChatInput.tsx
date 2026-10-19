import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Mic,
  MicOff,
  Image as ImageIcon,
  X,
  Sparkles,
  Languages,
} from 'lucide-react';
import { InlineImage, LanguageMode } from '../types';
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  stopCurrentAudioPlayback,
} from '../utils/speech';

interface ChatInputProps {
  onSendMessage: (text: string, image?: InlineImage) => void;
  onStopStreaming: () => void;
  isStreaming: boolean;
  languageMode: LanguageMode;
  onToggleLanguage: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopStreaming,
  isStreaming,
  languageMode,
  onToggleLanguage,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<InlineImage | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [inputText]);

  // Handle Image Upload & Conversion to Base64
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP, GIF)');
      return;
    }

    // Limit to 15MB
    if (file.size > 15 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setAttachedImage({
        mimeType: file.type,
        data: base64Data,
        previewUrl: result,
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // reset input
    e.target.value = '';
  };

  // Drag and Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Voice Recognition Handler
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setSpeechError('Microphone speech recognition is not supported in this browser.');
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    stopCurrentAudioPlayback();
    setSpeechError(null);
    setSpeechTranscript('');

    const langCode = languageMode === 'hi' ? 'hi-IN' : 'en-US';

    const recognizer = createSpeechRecognizer(
      langCode,
      (transcript, isFinal) => {
        setSpeechTranscript(transcript);
        setInputText((prev) => {
          // If first speech chunk, append or replace
          const trimmed = prev.trim();
          return trimmed ? `${trimmed} ${transcript}` : transcript;
        });
        if (isFinal) {
          // Keep recording until user stops or continuous ends
        }
      },
      (err) => {
        setSpeechError(err);
        setIsRecording(false);
        setTimeout(() => setSpeechError(null), 4000);
      },
      () => {
        setIsRecording(false);
      }
    );

    if (recognizer) {
      recognitionRef.current = recognizer;
      try {
        recognizer.start();
        setIsRecording(true);
      } catch (e: any) {
        setSpeechError('Could not start microphone: ' + (e?.message || e));
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isStreaming) {
      onStopStreaming();
      return;
    }

    const trimmed = inputText.trim();
    if (!trimmed && !attachedImage) return;

    if (isRecording) {
      stopRecording();
    }

    onSendMessage(trimmed, attachedImage || undefined);
    setInputText('');
    setAttachedImage(null);
    setSpeechTranscript('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const languageLabel =
    languageMode === 'hi' ? 'हिंदी (Hindi)' : languageMode === 'en' ? 'English' : 'Auto 🌐';

  return (
    <div
      className="sticky bottom-0 w-full bg-gradient-to-t from-[#080a10] via-[#080a10]/95 to-transparent pt-3 pb-3 sm:pb-5 px-3 sm:px-6 z-20"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="max-w-4xl mx-auto">
        {/* Live speech feedback banner */}
        {isRecording && (
          <div className="mb-2.5 px-4 py-2.5 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-200 text-xs sm:text-sm flex items-center justify-between shadow-lg backdrop-blur animate-in fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <span className="font-medium text-cyan-300">
                Listening ({languageMode === 'hi' ? 'हिंदी' : 'English'})...
              </span>
              <span className="text-cyan-100/90 truncate italic">
                {speechTranscript || 'Speak into your microphone now'}
              </span>
            </div>
            <button
              onClick={stopRecording}
              className="px-2.5 py-1 rounded-lg bg-cyan-800/70 hover:bg-cyan-700 text-white font-medium text-xs transition-colors flex-shrink-0"
            >
              Done
            </button>
          </div>
        )}

        {/* Speech Error Banner */}
        {speechError && (
          <div className="mb-2 px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-800/60 text-red-200 text-xs flex items-center justify-between">
            <span>{speechError}</span>
            <button onClick={() => setSpeechError(null)} className="p-0.5 text-red-300 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Attached image preview banner */}
        {attachedImage && (
          <div className="mb-2 flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-700/80 max-w-sm shadow-md">
            <img
              src={attachedImage.previewUrl}
              alt="Attachment"
              className="w-12 h-12 object-cover rounded-lg border border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">
                {attachedImage.fileName || 'Attached Image'}
              </p>
              <p className="text-[10px] text-cyan-400 font-mono">Vision analysis ready</p>
            </div>
            <button
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Pill Container */}
        <div className="relative rounded-2xl bg-slate-900/90 border border-slate-700/70 hover:border-slate-600 focus-within:border-cyan-500/80 focus-within:ring-2 focus-within:ring-cyan-500/20 shadow-xl transition-all duration-200">
          <div className="flex items-end px-3 py-2 sm:py-2.5 gap-2">
            {/* Image upload button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-xl transition-colors flex-shrink-0"
              title="Attach Image (Vision Analysis)"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                isRecording
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse'
                  : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80'
              }`}
              title={isRecording ? 'Stop Recording' : 'Voice Input (Mic)'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                languageMode === 'hi'
                  ? 'PrimeXzerox AI से कुछ भी पूछें (हिंदी या हिंगलिश में)...'
                  : 'Ask PrimeXzerox AI anything in English or Hindi...'
              }
              rows={1}
              className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 text-sm sm:text-base resize-none outline-none py-1.5 min-h-[38px] max-h-40 leading-relaxed font-normal"
            />

            {/* Send / Stop Action Button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30 transition-colors flex-shrink-0"
                title="Stop generation"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!inputText.trim() && !attachedImage}
                className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                  inputText.trim() || attachedImage
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/25 active:scale-95'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Language Switcher & Disclaimer under the bar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/50 rounded-b-2xl border-t border-slate-800/60 text-[11px] text-slate-400">
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors font-medium"
              title="Click to switch language preference"
            >
              <Languages className="w-3.5 h-3.5 text-cyan-400" />
              <span>Language: {languageLabel}</span>
            </button>

            <span className="hidden sm:inline-block text-slate-500 text-[10px]">
              Powered by Gemini 3.8 Flash • Multimodal & Voice
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
