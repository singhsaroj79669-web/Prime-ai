import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Settings,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Languages,
} from 'lucide-react';
import { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onClearAllChats: () => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  hasApiKey: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onClearAllChats,
  isOpen,
  onClose,
  onOpenSettings,
  hasApiKey,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Filter conversations
  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by date
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  const groups: { label: string; items: Conversation[] }[] = [
    {
      label: 'Today',
      items: filtered.filter((c) => now - c.updatedAt < oneDay),
    },
    {
      label: 'Previous 7 Days',
      items: filtered.filter(
        (c) => now - c.updatedAt >= oneDay && now - c.updatedAt < 7 * oneDay
      ),
    },
    {
      label: 'Older',
      items: filtered.filter((c) => now - c.updatedAt >= 7 * oneDay),
    },
  ].filter((g) => g.items.length > 0);

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      onDeleteChat(id);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 sm:w-80 bg-[#0c101a] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Header section in sidebar */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center p-[1px] shadow-md shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                PrimeXzerox <span className="text-cyan-400 text-xs">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Bilingual Assistant</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:via-blue-500/30 hover:to-indigo-500/30 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-200 hover:text-white font-medium text-xs sm:text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Search Input */}
        {conversations.length > 3 && (
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-slate-700"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
          {conversations.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-slate-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
              <p>No chat history yet</p>
              <p className="text-[11px] text-slate-600 mt-1">Start a new query above</p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="space-y-1">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {group.label}
                </div>

                {group.items.map((conv) => {
                  const isActive = conv.id === activeChatId;
                  const isEditing = conv.id === editingId;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        onSelectChat(conv.id);
                        if (window.innerWidth < 768) onClose();
                      }}
                      className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm cursor-pointer transition-all ${
                        isActive
                          ? 'bg-slate-800/90 text-white font-medium border border-slate-700/60 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-1">
                        <MessageSquare
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            isActive ? 'text-cyan-400' : 'text-slate-500'
                          }`}
                        />
                        {isEditing ? (
                          <form
                            onSubmit={(e) => saveRename(conv.id, e)}
                            className="flex items-center gap-1 flex-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full bg-slate-950 border border-cyan-500/60 rounded px-1.5 py-0.5 text-xs text-white outline-none"
                              autoFocus
                            />
                            <button
                              type="submit"
                              className="p-1 text-emerald-400 hover:bg-slate-700 rounded"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1 text-slate-400 hover:bg-slate-700 rounded"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </form>
                        ) : (
                          <span className="truncate">{conv.title}</span>
                        )}
                      </div>

                      {/* Action buttons (Rename & Delete) */}
                      {!isEditing && (
                        <div
                          className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                            isActive ? 'opacity-100' : ''
                          }`}
                        >
                          <button
                            onClick={(e) => startRename(conv, e)}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/60 transition-colors"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(conv.id, e)}
                            className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-700/60 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Feature highlight card */}
        <div className="p-3 mx-2 my-1 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 mb-1.5 text-cyan-400 font-medium">
            <Languages className="w-3.5 h-3.5" />
            <span>Dual-Language Engine</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            English & Hindi supported. Speak or type in either language seamlessly.
          </p>
        </div>

        {/* Footer Area */}
        <div className="p-3 border-t border-slate-800/80 space-y-1.5 bg-[#090d15]">
          {/* Clear all chats button */}
          {conversations.length > 0 && (
            <div className="px-1">
              {showConfirmClear ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-red-950/60 border border-red-800/60 text-xs text-red-200">
                  <span>Delete all chats?</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        onClearAllChats();
                        setShowConfirmClear(false);
                      }}
                      className="px-2 py-0.5 rounded bg-red-800 hover:bg-red-700 text-white font-medium"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setShowConfirmClear(false)}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                    >
                      No
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirmClear(true)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-400 hover:text-red-300 hover:bg-slate-900/60 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Clear all chats</span>
                </button>
              )}
            </div>
          )}

          {/* Settings Trigger */}
          <button
            onClick={() => {
              onOpenSettings();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900/80 rounded-xl transition-colors border border-transparent hover:border-slate-800"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>Settings & Setup</span>
            </div>
            <div className="flex items-center gap-1.5">
              {hasApiKey ? (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Active
                </span>
              ) : (
                <span className="text-[10px] text-amber-400">Setup</span>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
