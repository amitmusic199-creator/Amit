/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ModelRecipeConfig } from './types/recipe';
import {
  YOLOV8N_COCO_RECIPE,
  YOLOV8S_COCO_RECIPE,
  CUSTOM_YOLO_RECIPE,
} from './data/presetRecipes';
import { generateAxeleraRecipeScript } from './utils/recipeGenerator';

import { ChatGptSidebar, ChatSession } from './components/ChatGptSidebar';
import { ChatGptView, ChatMessage } from './components/ChatGptView';
import { SettingsModal } from './components/SettingsModal';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { DetectionPlayground } from './components/DetectionPlayground';
import { CodeViewer } from './components/CodeViewer';
import { ConfigPanel } from './components/ConfigPanel';
import { CliGuide } from './components/CliGuide';
import { ForkBundleModal } from './components/ForkBundleModal';
import { AiOptimizerModal } from './components/AiOptimizerModal';

export default function App() {
  const [config, setConfig] = useState<ModelRecipeConfig>(CUSTOM_YOLO_RECIPE);
  const [activePresetKey, setActivePresetKey] = useState<'yolov8n' | 'yolov8s' | 'custom'>('custom');
  const [activeView, setActiveView] = useState<'chat' | 'pipeline' | 'detect' | 'code' | 'fork' | 'cli'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Selected AI Model & Web Search
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o');
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const [customSystemPrompt, setCustomSystemPrompt] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // AbortController ref for canceling streaming
  const abortControllerRef = useRef<AbortController | null>(null);

  // Chat Sessions & Messages State (persisted in localStorage)
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('chatgpt_sessions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 'session_1',
        title: 'New conversation',
        timestamp: 'Today',
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'session_1';
  });

  const [messagesBySession, setMessagesBySession] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem('chatgpt_messages');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {
      session_1: [],
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showAiOptimizer, setShowAiOptimizer] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chatgpt_sessions', JSON.stringify(sessions));
    } catch (e) {}
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem('chatgpt_messages', JSON.stringify(messagesBySession));
    } catch (e) {}
  }, [messagesBySession]);

  // Generate python code for Axelera recipe
  const pythonScript = useMemo(() => {
    return generateAxeleraRecipeScript(config);
  }, [config]);

  const scriptFilename = `${config.modelName.replace(/-/g, '_')}_${config.backend}.py`;

  // Current session messages
  const currentMessages = messagesBySession[activeSessionId] || [];

  // Stop generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    // Mark any streaming message as finished
    setMessagesBySession((prev) => {
      const msgs = prev[activeSessionId] || [];
      return {
        ...prev,
        [activeSessionId]: msgs.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)),
      };
    });
  };

  // Send message with real-time SSE streaming
  const handleSendMessage = async (text: string, imageBase64?: string, isRetry = false) => {
    if (!text.trim() && !imageBase64) return;

    // Abort any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const userMsgId = `user_${Date.now()}`;
    const botMsgId = `bot_${Date.now()}`;

    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageBase64,
    };

    // Calculate updated messages list
    const existing = messagesBySession[activeSessionId] || [];
    const updatedMessages = isRetry ? existing : [...existing, userMsg];

    // Auto-update session title from first prompt if title is default
    const currentSession = sessions.find((s) => s.id === activeSessionId);
    if (
      currentSession &&
      (currentSession.title === 'New conversation' || currentSession.title === 'New chat')
    ) {
      const summaryTitle = text.slice(0, 30) + (text.length > 30 ? '...' : '');
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, title: summaryTitle } : s))
      );
    }

    // Add placeholder assistant message
    const botPlaceholder: ChatMessage = {
      id: botMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };

    setMessagesBySession((prev) => ({
      ...prev,
      [activeSessionId]: [...updatedMessages, botPlaceholder],
    }));

    setIsLoading(true);

    // Format history for API (all messages prior to the new user prompt)
    const historyPayload = existing.map((m) => ({
      role: m.role,
      content: m.content,
      imageBase64: m.imageBase64,
    }));

    // Dynamic system prompt incorporating recipe context if model is set to axelera-vision
    let effectiveSystemPrompt = customSystemPrompt;
    if (selectedModel === 'axelera-vision') {
      effectiveSystemPrompt = `You are a Senior Edge AI Architect and Metis NPU Specialist at Axelera AI.
Current Recipe Config:\n${pythonScript}\n
Help the user optimize, quantize, and inspect YOLOv8 models for the Metis NPU using axrelay.`;
    }

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          prompt: text,
          history: historyPayload,
          imageBase64,
          systemPrompt: effectiveSystemPrompt,
          useSearch: useWebSearch,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.slice(6);
              if (dataStr === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.chunk) {
                  accumulatedText += parsed.chunk;
                  setMessagesBySession((prev) => {
                    const sessionMsgs = prev[activeSessionId] || [];
                    return {
                      ...prev,
                      [activeSessionId]: sessionMsgs.map((m) =>
                        m.id === botMsgId
                          ? { ...m, content: accumulatedText, isStreaming: true }
                          : m
                      ),
                    };
                  });
                } else if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (parseErr) {
                // Ignore parse errors on raw tokens
              }
            }
          }
        }
      }

      // Mark streaming as finished
      setMessagesBySession((prev) => {
        const sessionMsgs = prev[activeSessionId] || [];
        return {
          ...prev,
          [activeSessionId]: sessionMsgs.map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  content: accumulatedText || "I'm here to help. What would you like to explore next?",
                  isStreaming: false,
                }
              : m
          ),
        };
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User stopped generation manually
        setMessagesBySession((prev) => {
          const sessionMsgs = prev[activeSessionId] || [];
          return {
            ...prev,
            [activeSessionId]: sessionMsgs.map((m) =>
              m.id === botMsgId ? { ...m, isStreaming: false } : m
            ),
          };
        });
        return;
      }

      console.error('Chat stream error, attempting fallback:', err);

      // Fallback to non-streaming endpoint
      try {
        const fallbackRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: text,
            history: historyPayload,
            imageBase64,
            systemPrompt: effectiveSystemPrompt,
            useSearch: useWebSearch,
          }),
        });
        const fallbackData = await fallbackRes.json();
        const finalContent = fallbackData.text || fallbackData.error || 'Response generated.';

        setMessagesBySession((prev) => {
          const sessionMsgs = prev[activeSessionId] || [];
          return {
            ...prev,
            [activeSessionId]: sessionMsgs.map((m) =>
              m.id === botMsgId ? { ...m, content: finalContent, isStreaming: false } : m
            ),
          };
        });
      } catch (fallbackErr: any) {
        setMessagesBySession((prev) => {
          const sessionMsgs = prev[activeSessionId] || [];
          return {
            ...prev,
            [activeSessionId]: sessionMsgs.map((m) =>
              m.id === botMsgId
                ? {
                    ...m,
                    content: `An error occurred while generating the response: ${
                      err?.message || 'Network error'
                    }. Please verify your connection or try again.`,
                    isStreaming: false,
                  }
                : m
            ),
          };
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last response
  const handleRegenerateResponse = () => {
    const msgs = messagesBySession[activeSessionId] || [];
    if (msgs.length === 0) return;

    // Find last user message
    let lastUserMsg: ChatMessage | null = null;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        lastUserMsg = msgs[i];
        break;
      }
    }

    if (!lastUserMsg) return;

    // Remove the last assistant message if present
    setMessagesBySession((prev) => {
      const current = prev[activeSessionId] || [];
      const trimmed = current[current.length - 1]?.role === 'assistant' ? current.slice(0, -1) : current;
      return {
        ...prev,
        [activeSessionId]: trimmed,
      };
    });

    handleSendMessage(lastUserMsg.content, lastUserMsg.imageBase64, true);
  };

  // Edit user message
  const handleEditMessage = (id: string, newText: string) => {
    const msgs = messagesBySession[activeSessionId] || [];
    const index = msgs.findIndex((m) => m.id === id);
    if (index === -1) return;

    // Truncate messages to this point and re-run
    const truncated = msgs.slice(0, index);
    setMessagesBySession((prev) => ({
      ...prev,
      [activeSessionId]: truncated,
    }));

    handleSendMessage(newText, msgs[index].imageBase64);
  };

  // Clear current chat
  const handleClearChat = () => {
    setMessagesBySession((prev) => ({
      ...prev,
      [activeSessionId]: [],
    }));
  };

  // Clear all chats
  const handleClearAllChats = () => {
    const newSessionId = `session_${Date.now()}`;
    const initialSession: ChatSession = {
      id: newSessionId,
      title: 'New conversation',
      timestamp: 'Today',
    };
    setSessions([initialSession]);
    setActiveSessionId(newSessionId);
    setMessagesBySession({ [newSessionId]: [] });
    try {
      localStorage.removeItem('chatgpt_sessions');
      localStorage.removeItem('chatgpt_messages');
    } catch (e) {}
  };

  // Start new chat
  const handleNewChat = () => {
    const newId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New conversation',
      timestamp: 'Today',
    };

    setSessions((s) => [newSession, ...s]);
    setActiveSessionId(newId);
    setMessagesBySession((m) => ({
      ...m,
      [newId]: [],
    }));
    setActiveView('chat');
  };

  // Rename session
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    const remaining = sessions.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      handleNewChat();
      return;
    }
    setSessions(remaining);
    if (activeSessionId === id) {
      setActiveSessionId(remaining[0].id);
    }
    setMessagesBySession((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Preset switching
  const handleSelectPreset = (presetKey: 'yolov8n' | 'yolov8s' | 'custom') => {
    setActivePresetKey(presetKey);
    if (presetKey === 'yolov8n') {
      setConfig(YOLOV8N_COCO_RECIPE);
    } else if (presetKey === 'yolov8s') {
      setConfig(YOLOV8S_COCO_RECIPE);
    } else {
      setConfig(CUSTOM_YOLO_RECIPE);
    }
  };

  // Copy code
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(pythonScript);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy script:', err);
    }
  };

  // Download code
  const handleDownloadCode = () => {
    const blob = new Blob([pythonScript], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = scriptFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#212121] text-slate-100 font-sans">
      {/* ChatGPT Collapsible Sidebar */}
      <ChatGptSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#212121] relative">
        {activeView === 'chat' && (
          <ChatGptView
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            onStopGeneration={handleStopGeneration}
            onRegenerateResponse={handleRegenerateResponse}
            onEditMessage={handleEditMessage}
            onClearChat={handleClearChat}
            isLoading={isLoading}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            useWebSearch={useWebSearch}
            onToggleWebSearch={() => setUseWebSearch(!useWebSearch)}
            config={config}
            onOpenTool={setActiveView}
            onSelectPrompt={(p) => handleSendMessage(p)}
          />
        )}

        {activeView === 'detect' && (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-2.5 bg-[#171717] border-b border-[#262626] text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <span>Live Vision Canvas & Object Detection</span>
              </span>
              <button
                onClick={() => setActiveView('chat')}
                className="px-3 py-1 rounded-lg bg-[#212121] text-slate-300 hover:text-white border border-neutral-700 cursor-pointer"
              >
                Back to ChatGPT
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <DetectionPlayground config={config} />
            </div>
          </div>
        )}

        {activeView === 'pipeline' && (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-2.5 bg-[#171717] border-b border-[#262626] text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <span>Axelera Metis Pipeline Architecture</span>
              </span>
              <button
                onClick={() => setActiveView('chat')}
                className="px-3 py-1 rounded-lg bg-[#212121] text-slate-300 hover:text-white border border-neutral-700 cursor-pointer"
              >
                Back to ChatGPT
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <PipelineVisualizer config={config} />
            </div>
          </div>
        )}

        {activeView === 'code' && (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-2.5 bg-[#171717] border-b border-[#262626] text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <span>Python Model Recipe Script ({scriptFilename})</span>
              </span>
              <button
                onClick={() => setActiveView('chat')}
                className="px-3 py-1 rounded-lg bg-[#212121] text-slate-300 hover:text-white border border-neutral-700 cursor-pointer"
              >
                Back to ChatGPT
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <CodeViewer
                code={pythonScript}
                filename={scriptFilename}
                onCopy={handleCopyCode}
                hasCopied={hasCopied}
                onDownload={handleDownloadCode}
              />
            </div>
          </div>
        )}

        {activeView === 'fork' && (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-2.5 bg-[#171717] border-b border-[#262626] text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <span>Standalone Fork Bundle (`axzoo fork {config.modelName} --script`)</span>
              </span>
              <button
                onClick={() => setActiveView('chat')}
                className="px-3 py-1 rounded-lg bg-[#212121] text-slate-300 hover:text-white border border-neutral-700 cursor-pointer"
              >
                Back to ChatGPT
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ForkBundleModal
                recipeCode={pythonScript}
                recipeFilename={scriptFilename}
              />
            </div>
          </div>
        )}

        {activeView === 'cli' && (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-2.5 bg-[#171717] border-b border-[#262626] text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <span>Axelera CLI & SDK Workflow Reference</span>
              </span>
              <button
                onClick={() => setActiveView('chat')}
                className="px-3 py-1 rounded-lg bg-[#212121] text-slate-300 hover:text-white border border-neutral-700 cursor-pointer"
              >
                Back to ChatGPT
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <CliGuide config={config} />
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        systemPrompt={customSystemPrompt}
        onSaveSystemPrompt={setCustomSystemPrompt}
        onClearAllChats={handleClearAllChats}
      />

      {/* AI Optimizer Modal */}
      {showAiOptimizer && (
        <AiOptimizerModal
          recipeCode={pythonScript}
          modelName={config.modelName}
          onClose={() => setShowAiOptimizer(false)}
        />
      )}
    </div>
  );
}
