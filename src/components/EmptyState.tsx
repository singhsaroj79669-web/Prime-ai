import React from 'react';
import {
  Sparkles,
  Languages,
  Mic,
  Image as ImageIcon,
  Zap,
  Code2,
  Brain,
  MessageSquareHeart,
  ArrowUpRight,
} from 'lucide-react';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
  languageMode: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onSelectPrompt,
  languageMode,
}) => {
  const suggestions = [
    {
      title: 'हिंदी में तकनीकी समझें',
      subtitle: 'क्वांटम कंप्यूटिंग क्या है और यह सुपरकंप्यूटर से कैसे अलग है? सरल शब्दों में समझाइए।',
      icon: Languages,
      lang: 'hi',
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    },
    {
      title: 'Bilingual Strategy & Planning',
      subtitle: 'Mujhe ek modern AI SaaS app launch karna hai. Go-to-market plan Hinglish me structure karo.',
      icon: Zap,
      lang: 'hi-en',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      title: 'Fullstack Code Architecture',
      subtitle: 'Write a high-performance React hook with TypeScript for audio recording and real-time visualizer.',
      icon: Code2,
      lang: 'en',
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
    },
    {
      title: 'Image Analysis & Vision',
      subtitle: 'Upload any image or diagram: "Is photo ka visual analysis karo aur text extract karo."',
      icon: ImageIcon,
      lang: 'en',
      color: 'from-cyan-500/20 to-sky-500/20 text-cyan-400 border-cyan-500/30',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full text-center">
      {/* Futuristic Emblem */}
      <div className="relative mb-6">
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 rounded-full blur-xl opacity-25 animate-pulse"></div>
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700/80 p-0.5 shadow-2xl flex items-center justify-center">
          <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-slate-950/80 to-slate-900/90 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700/60 text-[10px] font-mono text-cyan-300">
          v3.8
        </div>
      </div>

      {/* Brand Title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
        PrimeXzerox <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400">AI</span>
      </h1>

      {/* Subtitles in Hindi & English */}
      <p className="text-base sm:text-lg text-slate-300 font-medium max-w-lg mb-1">
        Next-Generation Bilingual Intelligence
      </p>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6">
        हिंदी और अंग्रेज़ी में बेरोक-टोक वार्तालाप, ध्वनि पहचान व इमेज विज़न
      </p>

      {/* Feature Capabilities Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs text-slate-400">
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300">
          <Languages className="w-3.5 h-3.5 text-amber-400" />
          Hindi & English (Bilingual)
        </span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300">
          <Mic className="w-3.5 h-3.5 text-cyan-400" />
          Voice Input & Audio Playback
        </span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300">
          <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
          Multimodal Image Analysis
        </span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300">
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          Gemini 3.8 Flash Engine
        </span>
      </div>

      {/* Suggestion Starter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
        {suggestions.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(card.subtitle)}
              className="group relative p-3.5 sm:p-4 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 text-left flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg border bg-gradient-to-br ${card.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white transition-colors mb-1">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {card.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
