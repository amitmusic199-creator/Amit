import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Layers,
  FileCode,
  Terminal,
  Settings,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  ExternalLink,
  Sliders,
  Volume2,
} from 'lucide-react';

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
}

interface ChatGptSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onDeleteSession: (id: string) => void;
  activeView: 'chat' | 'pipeline' | 'detect' | 'code' | 'fork' | 'cli';
  onSelectView: (view: 'chat' | 'pipeline' | 'detect' | 'code' | 'fork' | 'cli') => void;
  onOpenSettings: () => void;
  userEmail?: string;
}

export const ChatGptSidebar: React.FC<ChatGptSidebarProps> = ({
  isOpen,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onDeleteSession,
  activeView,
  onSelectView,
  onOpenSettings,
  userEmail = 'User',
}) => {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-3 left-3 z-40 p-2 rounded-xl bg-[#212121] hover:bg-[#2f2f2f] text-slate-300 border border-neutral-700/60 shadow-lg transition-colors cursor-pointer"
        title="Open sidebar"
      >
        <PanelLeft className="w-5 h-5" />
      </button>
    );
  }

  const startRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(id);
    setEditTitle(currentTitle);
  };

  const saveRename = (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingSessionId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSession(id);
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-64 bg-[#171717] text-slate-200 border-r border-[#262626] flex flex-col h-full shrink-0 select-none z-40 font-sans">
      {/* Top Bar: New Chat & Toggle */}
      <div className="flex items-center justify-between p-3 border-b border-[#262626] gap-2">
        <button
          onClick={onNewChat}
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#212121] hover:bg-[#2f2f2f] text-white text-xs font-semibold border border-neutral-700/50 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>New chat</span>
        </button>

        <button
          onClick={() => setIsSearching(!isSearching)}
          className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#212121] transition-colors cursor-pointer ${
            isSearching ? 'bg-[#212121] text-white' : ''
          }`}
          title="Search chats"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={onToggle}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#212121] transition-colors cursor-pointer"
          title="Close sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar (if open) */}
      {isSearching && (
        <div className="px-3 pt-2 pb-1 border-b border-[#262626]">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat history..."
              className="w-full bg-[#212121] border border-neutral-700 rounded-lg py-1.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Workspace / Studio Tools Section */}
      <div className="p-3 border-b border-[#262626] space-y-1">
        <div className="text-[10px] uppercase font-bold text-slate-500 px-2 pb-1 tracking-wider">
          Assistant & Tools
        </div>

        <button
          onClick={() => onSelectView('chat')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeView === 'chat'
              ? 'bg-[#212121] text-emerald-300 font-semibold border border-neutral-700/50'
              : 'text-slate-400 hover:text-white hover:bg-[#212121]/50'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>ChatGPT Assistant</span>
        </button>

        <button
          onClick={() => onSelectView('detect')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeView === 'detect'
              ? 'bg-[#212121] text-amber-300 font-semibold border border-neutral-700/50'
              : 'text-slate-400 hover:text-white hover:bg-[#212121]/50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Live Vision Canvas</span>
        </button>

        <button
          onClick={() => onSelectView('pipeline')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeView === 'pipeline'
              ? 'bg-[#212121] text-indigo-300 font-semibold border border-neutral-700/50'
              : 'text-slate-400 hover:text-white hover:bg-[#212121]/50'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Pipeline Graph</span>
        </button>

        <button
          onClick={() => onSelectView('code')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeView === 'code'
              ? 'bg-[#212121] text-cyan-300 font-semibold border border-neutral-700/50'
              : 'text-slate-400 hover:text-white hover:bg-[#212121]/50'
          }`}
        >
          <FileCode className="w-4 h-4 text-cyan-400" />
          <span>Recipe Script & Code</span>
        </button>

        <button
          onClick={() => onSelectView('cli')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeView === 'cli'
              ? 'bg-[#212121] text-purple-300 font-semibold border border-neutral-700/50'
              : 'text-slate-400 hover:text-white hover:bg-[#212121]/50'
          }`}
        >
          <Terminal className="w-4 h-4 text-purple-400" />
          <span>Axelera CLI Guide</span>
        </button>
      </div>

      {/* Chat History List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="text-[10px] uppercase font-bold text-slate-500 px-3 py-1.5 tracking-wider">
          Chat History
        </div>

        {filteredSessions.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            No chats found
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId && activeView === 'chat';
            const isEditing = editingSessionId === session.id;

            return (
              <div
                key={session.id}
                onClick={() => {
                  onSelectSession(session.id);
                  onSelectView('chat');
                }}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#212121] text-white font-medium border border-neutral-700/60'
                    : 'text-slate-400 hover:text-white hover:bg-[#212121]/50'
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveRename(session.id, e);
                        if (e.key === 'Escape') cancelRename(e as any);
                      }}
                      className="flex-1 bg-[#171717] border border-emerald-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => saveRename(session.id, e)}
                      className="p-1 hover:text-emerald-400"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={cancelRename}
                      className="p-1 hover:text-red-400"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 truncate pr-2">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{session.title}</span>
                    </div>

                    {/* Action buttons on hover */}
                    <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => startRename(session.id, session.title, e)}
                        className="p-1 hover:text-white rounded hover:bg-neutral-700/60 transition-colors"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(session.id, e)}
                        className="p-1 hover:text-red-400 rounded hover:bg-neutral-700/60 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-[#262626] flex items-center justify-between bg-[#171717]">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-white truncate">{userEmail}</div>
            <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ChatGPT Plus</span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#212121] transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
