import React, { useState } from 'react';
import { X, Sliders, Sparkles, Trash2, Check, Shield, User, Globe } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemPrompt: string;
  onSaveSystemPrompt: (prompt: string) => void;
  onClearAllChats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  systemPrompt,
  onSaveSystemPrompt,
  onClearAllChats,
}) => {
  const [prompt, setPrompt] = useState(systemPrompt);
  const [activeTab, setActiveTab] = useState<'general' | 'instructions' | 'data'>('general');
  const [hasSaved, setHasSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSystemPrompt(prompt);
    setHasSaved(true);
    setTimeout(() => {
      setHasSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#1e1e1e] border border-neutral-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 font-sans text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 px-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'general'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'instructions'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Instructions
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'data'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Data Controls
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {activeTab === 'general' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-neutral-800">
                <div>
                  <div className="font-semibold text-white">Theme</div>
                  <div className="text-slate-400 text-[11px]">Dark OLED theme (ChatGPT default)</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-neutral-800 text-emerald-400 font-mono">
                  Dark
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-neutral-800">
                <div>
                  <div className="font-semibold text-white">Speech & Voice</div>
                  <div className="text-slate-400 text-[11px]">
                    Web Speech synthesis & Speech-to-text mic
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 font-mono">
                  Enabled
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-semibold text-white">Language Compatibility</div>
                  <div className="text-slate-400 text-[11px]">
                    English, Urdu, Hindi, Roman Urdu, and 80+ languages
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-neutral-800 text-slate-300 font-mono">
                  Automatic
                </span>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-white block mb-1">
                  How would you like ChatGPT to respond?
                </label>
                <div className="text-[11px] text-slate-400 mb-2">
                  Customize the assistant's personality, tone, or default role. Leave blank for default versatile ChatGPT.
                </div>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                placeholder="e.g. Always be concise, write Python code first, explain in Roman Urdu or English..."
                className="w-full bg-[#141414] border border-neutral-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed resize-none"
              />
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4 text-xs">
              <div>
                <div className="font-semibold text-white mb-1">Clear all chat sessions</div>
                <div className="text-slate-400 text-[11px] mb-3">
                  Permanently deletes all saved conversations and messages from local storage.
                </div>

                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClearAllChats();
                        setConfirmDelete(false);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold cursor-pointer"
                    >
                      Yes, delete all chats
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 text-slate-300 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear chat history</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-[#181818] border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Close
          </button>
          {activeTab === 'instructions' && (
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              {hasSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Instructions</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
