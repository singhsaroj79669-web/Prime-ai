import React from 'react';
import {
  Menu,
  Plus,
  Sparkles,
  Settings,
  Languages,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { LanguageMode } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  currentTitle: string;
  languageMode: LanguageMode;
  onSelectLanguage: (lang: LanguageMode) => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNewChat,
  onOpenSettings,
  currentTitle,
  languageMode,
  onSelectLanguage,
  hasApiKey,
}) => {
  const [showLangMenu, setShowLangMenu] = React.useState(false);

  const langOptions: { id: LanguageMode; label: string; flag: string }[] = [
    { id: 'auto', label: 'Auto (Detect)', flag: '🌐' },
    { id: 'hi', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { id: 'en', label: 'English (Global)', flag: '🇬🇧' },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 sm:h-16 px-3 sm:px-5 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      {/* Left: Hamburger menu (mobile) & Brand */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand link / logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 p-[1.5px] shadow-md shadow-cyan-500/20">
            <div className="w-full h-full bg-[#080a10] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                PrimeXzerox
              </span>
              <span className="text-xs font-mono font-bold px-1.5 py-0.2 rounded bg-gradient-to-r from-cyan-500 to-blue-500 text-black">
                AI
              </span>
            </div>
          </div>
        </div>

        {/* Divider & Current Chat Title (desktop) */}
        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs text-slate-400 max-w-xs truncate">
          <span className="text-slate-300 truncate font-medium">
            {currentTitle || 'New Conversation'}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Language selector popup */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Switch conversation language"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline font-medium">
              {languageMode === 'hi'
                ? 'हिंदी'
                : languageMode === 'en'
                ? 'English'
                : 'Auto'}
            </span>
          </button>

          {showLangMenu && (
            <div
              className="absolute right-0 mt-1.5 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-40 text-xs animate-in fade-in"
              onClick={() => setShowLangMenu(false)}
            >
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-slate-500 border-b border-slate-800">
                Language Preference
              </div>
              {langOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onSelectLanguage(opt.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-800/80 transition-colors ${
                    languageMode === opt.id ? 'text-cyan-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{opt.flag}</span>
                    <span>{opt.label}</span>
                  </span>
                  {languageMode === opt.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all shadow-sm"
          title="Start a new chat"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* Security badge / Setup */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors relative"
          title="Settings & Security"
        >
          <Settings className="w-4 h-4" />
          {hasApiKey && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>
      </div>
    </header>
  );
};
