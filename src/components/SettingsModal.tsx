import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Languages,
  Volume2,
  Sliders,
  Download,
  Trash2,
  Check,
  Server,
  Key,
  Info,
} from 'lucide-react';
import { AppSettings, Conversation, LanguageMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  conversations: Conversation[];
  onClearAll: () => void;
  hasApiKey: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  conversations,
  onClearAll,
  hasApiKey,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'data'>('general');
  const [formSettings, setFormSettings] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(formSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(conversations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `primexzerox-chats-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportMarkdown = () => {
    let md = `# PrimeXzerox AI - Chat History Export\nExported on: ${new Date().toLocaleString()}\n\n`;
    conversations.forEach((conv, index) => {
      md += `## Conversation ${index + 1}: ${conv.title}\n`;
      md += `*Date: ${new Date(conv.createdAt).toLocaleString()}*\n\n`;
      conv.messages.forEach((msg) => {
        md += `### ${msg.role === 'user' ? 'User' : 'PrimeXzerox AI'}\n`;
        if (msg.image) {
          md += `*[Attached Image: ${msg.image.fileName || 'Image'}]*\n\n`;
        }
        md += `${msg.text}\n\n---\n\n`;
      });
      md += `\n\n=========================================\n\n`;
    });

    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `primexzerox-chats-${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                PrimeXzerox AI Settings
              </h2>
              <p className="text-[11px] text-slate-400">Customize language, voice, and AI connection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-5 pt-2 gap-2 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Preferences & Voice
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            API & Security
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'data'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Data & Export
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs sm:text-sm">
          {activeTab === 'general' && (
            <>
              {/* Language Preference */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Default Language Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'auto', label: 'Auto Detect', sub: 'Adaptive 🌐' },
                    { id: 'hi', label: 'हिंदी', sub: 'Hindi / Hinglish 🇮🇳' },
                    { id: 'en', label: 'English', sub: 'Global English 🇬🇧' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setFormSettings({ ...formSettings, languageMode: item.id as LanguageMode })
                      }
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formSettings.languageMode === item.id
                          ? 'bg-cyan-950/60 border-cyan-500/80 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-xs sm:text-sm text-slate-200">{item.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text to Speech Voice Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Text-to-Speech Voice (Gemini TTS)
                </label>
                <select
                  value={formSettings.ttsVoice}
                  onChange={(e) =>
                    setFormSettings({
                      ...formSettings,
                      ttsVoice: e.target.value as any,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-cyan-500/80"
                >
                  <option value="Kore">Kore (Balanced, soothing tone - recommended)</option>
                  <option value="Puck">Puck (Energetic, cheerful tone)</option>
                  <option value="Charon">Charon (Deep, grounded tone)</option>
                  <option value="Fenrir">Fenrir (Authoritative, clear tone)</option>
                  <option value="Zephyr">Zephyr (Warm, conversational tone)</option>
                </select>
              </div>

              {/* Custom System Instruction */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Custom Assistant Persona / Instruction
                  </label>
                  <span className="text-[10px] text-slate-500">Optional</span>
                </div>
                <textarea
                  value={formSettings.systemInstruction}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, systemInstruction: e.target.value })
                  }
                  placeholder="e.g. Always include step-by-step examples; prioritize Devanagari Hindi for explanations..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 placeholder:text-slate-600 outline-none focus:border-cyan-500/80 text-xs"
                />
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              {/* Security Architecture Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure Backend Integration Architecture</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  PrimeXzerox AI strictly follows zero-client-exposure security principles. The
                  Gemini API is never called directly from the browser, and API keys are never bundled
                  in the frontend javascript.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-start gap-2">
                    <Server className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200 block">Server-Side Proxy</span>
                      Express backend handles all @google/genai calls securely.
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-start gap-2">
                    <Key className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200 block">Encrypted Secrets</span>
                      Accessed via process.env.GEMINI_API_KEY on the Node server.
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Setup Instructions */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">Gemini Connection Status:</span>
                  {hasApiKey ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Active & Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Awaiting API Key in Secrets
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1.5 leading-relaxed">
                  <p className="font-medium text-slate-300">How to set up your Gemini API key:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
                    <li>
                      In AI Studio, click on <strong>Settings</strong> &gt; <strong>Secrets</strong>.
                    </li>
                    <li>
                      Add a secret named <code className="text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded font-mono">GEMINI_API_KEY</code> with your Google AI Studio key.
                    </li>
                    <li>
                      The server automatically receives this key securely on boot.
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h3 className="font-semibold text-slate-200 text-xs sm:text-sm">Export Chat History</h3>
                <p className="text-xs text-slate-400">
                  Download all your conversations for offline archival or documentation.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={handleExportJSON}
                    disabled={conversations.length === 0}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Export JSON</span>
                  </button>
                  <button
                    onClick={handleExportMarkdown}
                    disabled={conversations.length === 0}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Export Markdown (.md)</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 space-y-2">
                <h3 className="font-semibold text-red-300 text-xs sm:text-sm">Clear All Conversations</h3>
                <p className="text-xs text-red-300/80">
                  Permanently deletes all saved conversations from local device memory.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete all conversations permanently?')) {
                      onClearAll();
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-900/60 hover:bg-red-900 text-red-100 text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Everything</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/80">
          <div className="text-[11px] text-slate-500 font-mono">
            PrimeXzerox AI • v3.8 Flash
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md shadow-cyan-600/30 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
