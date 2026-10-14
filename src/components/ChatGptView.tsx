import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Paperclip,
  Image as ImageIcon,
  X,
  Sparkles,
  User,
  Copy,
  Check,
  ChevronDown,
  RotateCcw,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Globe,
  Mic,
  MicOff,
  Edit3,
  Share2,
  Trash2,
  Layers,
  FileCode,
  Terminal,
  Cpu,
} from 'lucide-react';
import { ModelRecipeConfig } from '../types/recipe';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  imageBase64?: string;
  isStreaming?: boolean;
}

export interface ModelOption {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  description: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gpt-4o',
    name: 'ChatGPT-4o',
    tagline: 'Great for most tasks',
    badge: 'Smart & Fast',
    description: 'High intelligence, multimodal vision, coding, and quick responses.',
  },
  {
    id: 'gpt-4o-mini',
    name: 'ChatGPT-4o mini',
    tagline: 'Faster for everyday tasks',
    badge: 'Lightweight',
    description: 'Ultra-fast, cost-effective, and highly responsive for quick questions.',
  },
  {
    id: 'o1-preview',
    name: 'o1 Reasoning',
    tagline: 'Deep thinking & reasoning',
    badge: 'STEM & Logic',
    description: 'Advanced step-by-step reasoning for hard math, algorithms, and logic.',
  },
  {
    id: 'axelera-vision',
    name: 'Axelera Vision Pro',
    tagline: 'Metis NPU & YOLO Specialist',
    badge: 'Edge AI',
    description: 'Specialized in YOLOv8, Metis NPU quantization, and axrelay recipes.',
  },
];

interface ChatGptViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, imageBase64?: string) => void;
  onStopGeneration?: () => void;
  onRegenerateResponse?: () => void;
  onEditMessage?: (id: string, newText: string) => void;
  onClearChat?: () => void;
  isLoading: boolean;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  useWebSearch: boolean;
  onToggleWebSearch: () => void;
  config: ModelRecipeConfig;
  onOpenTool: (tool: 'pipeline' | 'detect' | 'code' | 'fork' | 'cli') => void;
  onSelectPrompt: (prompt: string) => void;
}

const STARTER_PROMPTS = [
  {
    icon: '💻',
    category: 'Coding & Debugging',
    title: 'Write a Python YOLOv8 detector',
    prompt: 'Write a complete Python script to load YOLOv8 and run real-time inference on a webcam stream.',
  },
  {
    icon: '🧠',
    category: 'Concepts & Deep Dives',
    title: 'Explain neural networks simply',
    prompt: 'Explain what a neural network is and how backpropagation works using an easy-to-understand real-world analogy.',
  },
  {
    icon: '⚡',
    category: 'Edge AI & Optimization',
    title: 'Axelera Metis INT8 Quantization',
    prompt: 'How does INT8 Post-Training Quantization (PTQ) work on Axelera Metis NPU with the axrelay compiler?',
  },
  {
    icon: '🌐',
    category: 'General & Multilingual',
    title: 'Ai ko werka full banao',
    prompt: 'Mujhe AI ke baare me detail se batao aur code likhne me meri madad karo. Tum kis tarah ke tasks kar sakte ho?',
  },
];

export const ChatGptView: React.FC<ChatGptViewProps> = ({
  messages,
  onSendMessage,
  onStopGeneration,
  onRegenerateResponse,
  onEditMessage,
  onClearChat,
  isLoading,
  selectedModel,
  onSelectModel,
  useWebSearch,
  onToggleWebSearch,
  config,
  onOpenTool,
  onSelectPrompt,
}) => {
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({});
  const [showShareToast, setShowShareToast] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle textarea resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(200, textareaRef.current.scrollHeight)}px`;
    }
  }, [input]);

  // Voice speech recognition setup (native browser SpeechRecognition)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleSend = () => {
    if ((!input.trim() && !attachedImage) || isLoading) return;
    onSendMessage(input.trim(), attachedImage || undefined);
    setInput('');
    setAttachedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAttachedImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Text to speech
  const toggleSpeak = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean text of markdown symbols before speaking
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[#*`_~]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleShareChat = () => {
    const chatTranscript = messages
      .map((m) => `**${m.role === 'user' ? 'User' : 'ChatGPT'}**: \n${m.content}\n`)
      .join('\n---\n\n');
    navigator.clipboard.writeText(chatTranscript);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2500);
  };

  const activeModelObj =
    AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  // Markdown renderer supporting code blocks, tables, lists, and inline tags
  const renderMessageContent = (content: string, msgId: string, isStreaming?: boolean) => {
    const codeBlockRegex = /(```[\s\S]*?```)/g;
    const parts = content.split(codeBlockRegex);

    return (
      <div className="space-y-2">
        {parts.map((part, index) => {
          if (part.startsWith('```') && part.endsWith('```')) {
            const lines = part.slice(3, -3).trim().split('\n');
            const lang = lines[0].trim();
            const code = (lang ? lines.slice(1) : lines).join('\n');
            const blockId = `${msgId}_code_${index}`;

            return (
              <div
                key={index}
                className="my-3 rounded-xl overflow-hidden border border-[#333333] bg-[#0d0d0d] shadow-md"
              >
                <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-[#2d2d2d] text-xs font-mono text-slate-300">
                  <span className="text-emerald-400 font-semibold">{lang || 'text'}</span>
                  <button
                    onClick={() => copyCode(code, blockId)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedCodeId === blockId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-sans">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="font-sans">Copy code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                  {code}
                </pre>
              </div>
            );
          }

          // Check if lines form a table
          const rawLines = part.split('\n');
          const isTable =
            rawLines.length >= 3 &&
            rawLines[0].includes('|') &&
            rawLines[1].includes('|') &&
            rawLines[1].includes('-');

          if (isTable) {
            const tableRows = rawLines
              .filter((l) => l.trim().startsWith('|'))
              .map((l) =>
                l
                  .split('|')
                  .slice(1, -1)
                  .map((c) => c.trim())
              );

            if (tableRows.length >= 2) {
              const headerRow = tableRows[0];
              const bodyRows = tableRows.slice(2); // Skip separator row

              return (
                <div key={index} className="overflow-x-auto my-3">
                  <table className="min-w-full text-xs text-left border-collapse border border-neutral-700 rounded-lg overflow-hidden">
                    <thead className="bg-[#1e1e1e] text-slate-200 font-semibold">
                      <tr>
                        {headerRow.map((h, i) => (
                          <th key={i} className="border border-neutral-700 px-3 py-2">
                            {renderInlineMarkdown(h)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {bodyRows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className={rIdx % 2 === 0 ? 'bg-[#181818]' : 'bg-[#212121]'}
                        >
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="border border-neutral-700/60 px-3 py-1.5 text-slate-300">
                              {renderInlineMarkdown(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
          }

          // Standard paragraph lines with headings, lists, blockquotes
          const formattedLines = rawLines.map((line, lIdx) => {
            if (line.startsWith('# ')) {
              return (
                <h2 key={lIdx} className="font-bold text-white text-xl mt-4 mb-2 tracking-tight">
                  {renderInlineMarkdown(line.replace('# ', ''))}
                </h2>
              );
            }
            if (line.startsWith('## ')) {
              return (
                <h3 key={lIdx} className="font-bold text-white text-lg mt-3.5 mb-1.5 tracking-tight">
                  {renderInlineMarkdown(line.replace('## ', ''))}
                </h3>
              );
            }
            if (line.startsWith('### ')) {
              return (
                <h4 key={lIdx} className="font-bold text-white text-base mt-3 mb-1">
                  {renderInlineMarkdown(line.replace('### ', ''))}
                </h4>
              );
            }
            if (line.startsWith('> ')) {
              return (
                <blockquote
                  key={lIdx}
                  className="border-l-2 border-emerald-500 pl-3 my-2 text-slate-300 italic"
                >
                  {renderInlineMarkdown(line.replace('> ', ''))}
                </blockquote>
              );
            }
            if (line.startsWith('- ') || line.startsWith('* ')) {
              const bulletContent = line.slice(2);
              return (
                <li key={lIdx} className="ml-5 list-disc text-slate-200 leading-relaxed text-sm my-0.5">
                  {renderInlineMarkdown(bulletContent)}
                </li>
              );
            }
            if (/^\d+\.\s/.test(line)) {
              return (
                <li key={lIdx} className="ml-5 list-decimal text-slate-200 leading-relaxed text-sm my-0.5">
                  {renderInlineMarkdown(line.replace(/^\d+\.\s/, ''))}
                </li>
              );
            }
            if (!line.trim()) {
              return <div key={lIdx} className="h-1.5" />;
            }
            return (
              <p key={lIdx} className="text-slate-200 leading-relaxed text-sm my-1">
                {renderInlineMarkdown(line)}
              </p>
            );
          });

          return <div key={index}>{formattedLines}</div>;
        })}

        {/* Pulsing blinking cursor while streaming */}
        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse align-middle"></span>
        )}
      </div>
    );
  };

  const renderInlineMarkdown = (text: string) => {
    const inlineParts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return inlineParts.map((sub, i) => {
      if (sub.startsWith('`') && sub.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-[#2a2a2a] text-emerald-300 font-mono text-xs"
          >
            {sub.slice(1, -1)}
          </code>
        );
      }
      if (sub.startsWith('**') && sub.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-white">
            {sub.slice(2, -2)}
          </strong>
        );
      }
      if (sub.startsWith('*') && sub.endsWith('*')) {
        return (
          <em key={i} className="italic text-slate-300">
            {sub.slice(1, -1)}
          </em>
        );
      }
      return sub;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#212121] text-slate-100 relative font-sans">
      {/* Top Header Bar (Model Selector & Controls) */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-[#2f2f2f] bg-[#212121] z-20 shrink-0">
        {/* Model Dropdown Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2a2a2a] hover:bg-[#333333] text-white text-xs font-semibold border border-neutral-700/70 shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{activeModelObj.name}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-normal">
              {activeModelObj.badge}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {isModelDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-[#1e1e1e] border border-neutral-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="text-[11px] font-semibold text-slate-400 px-3 py-1">
                Model Selector
              </div>
              <div className="space-y-1">
                {AVAILABLE_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onSelectModel(model.id);
                      setIsModelDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                      selectedModel === model.id
                        ? 'bg-[#2a2a2a] text-white border border-neutral-700'
                        : 'text-slate-300 hover:bg-[#252525] hover:text-white'
                    }`}
                  >
                    <div className="mt-0.5">
                      <Sparkles
                        className={`w-4 h-4 ${
                          selectedModel === model.id ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{model.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-slate-400">
                          {model.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{model.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Header Right Tools */}
        <div className="flex items-center gap-1.5 text-xs">
          {/* Share / Copy Transcript */}
          {messages.length > 0 && (
            <button
              onClick={handleShareChat}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Share or copy conversation transcript"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden md:inline">Share</span>
            </button>
          )}

          {/* Clear chat */}
          {messages.length > 0 && onClearChat && (
            <button
              onClick={onClearChat}
              className="p-1.5 rounded-lg hover:bg-[#2a2a2a] text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Clear current messages"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick Tools */}
          <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-neutral-700/60">
            <button
              onClick={() => onOpenTool('detect')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Vision</span>
            </button>
            <button
              onClick={() => onOpenTool('code')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Share Toast */}
      {showShareToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-xl animate-in fade-in">
          Chat transcript copied to clipboard!
        </div>
      )}

      {/* Main Messages Stream Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-12 lg:px-28 space-y-6">
        {messages.length === 0 ? (
          /* Signature ChatGPT Empty State */
          <div className="flex flex-col items-center justify-center min-h-[58vh] text-center max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* OpenAI / ChatGPT Style Glowing Logo */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[9px] font-bold text-white shadow">
                AI
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                What can I help with today?
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Ask anything in English, Urdu, or Hindi. Write code, solve problems, analyze models, attach images, or search the web.
              </p>
            </div>

            {/* 4 Prompt Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
              {STARTER_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => onSelectPrompt(p.prompt)}
                  className="p-3.5 rounded-2xl bg-[#2a2a2a]/60 hover:bg-[#2f2f2f] border border-neutral-700/60 hover:border-neutral-500 transition-all text-xs flex flex-col justify-between group shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{p.icon}</span>
                    <span className="text-[10px] font-semibold uppercase text-emerald-400">
                      {p.category}
                    </span>
                  </div>
                  <div className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    {p.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{p.prompt}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Conversation Messages */
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isEditing = editingMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 max-w-3xl mx-auto group ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 max-w-[88%] text-sm ${
                    isUser
                      ? 'bg-[#2f2f2f] text-white shadow-md'
                      : 'bg-transparent text-slate-200'
                  }`}
                >
                  {/* User image attachment preview */}
                  {msg.imageBase64 && (
                    <div className="mb-2 rounded-xl overflow-hidden max-w-sm border border-neutral-700 shadow-md">
                      <img
                        src={msg.imageBase64}
                        alt="User upload"
                        className="w-full h-auto max-h-64 object-cover"
                      />
                    </div>
                  )}

                  {/* Message Content or Edit box */}
                  {isEditing ? (
                    <div className="space-y-2 min-w-[280px]">
                      <textarea
                        value={editInput}
                        onChange={(e) => setEditInput(e.target.value)}
                        className="w-full bg-[#1e1e1e] border border-emerald-500 rounded-xl p-2.5 text-xs text-white focus:outline-none resize-none"
                        rows={3}
                      />
                      <div className="flex items-center justify-end gap-2 text-xs">
                        <button
                          onClick={() => setEditingMsgId(null)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-700 text-slate-300 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (editInput.trim() && onEditMessage) {
                              onEditMessage(msg.id, editInput.trim());
                            }
                            setEditingMsgId(null);
                          }}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                        >
                          Save & Submit
                        </button>
                      </div>
                    </div>
                  ) : (
                    renderMessageContent(msg.content, msg.id, msg.isStreaming)
                  )}

                  {/* Assistant Actions Bar (Copy, Speak, Feedback, Regenerate) */}
                  {!isUser && !msg.isStreaming && (
                    <div className="flex items-center gap-1 pt-2.5 mt-2 border-t border-neutral-800 text-slate-400 text-xs">
                      {/* Copy message */}
                      <button
                        onClick={() => copyMessage(msg.content, msg.id)}
                        className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
                        title="Copy message"
                      >
                        {copiedMessageId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Read aloud (TTS) */}
                      <button
                        onClick={() => toggleSpeak(msg.content, msg.id)}
                        className={`p-1.5 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer ${
                          speakingMessageId === msg.id ? 'text-emerald-400' : 'hover:text-white'
                        }`}
                        title={speakingMessageId === msg.id ? 'Stop speaking' : 'Read aloud'}
                      >
                        {speakingMessageId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Thumbs up */}
                      <button
                        onClick={() =>
                          setFeedback((prev) => ({
                            ...prev,
                            [msg.id]: prev[msg.id] === 'up' ? undefined! : 'up',
                          }))
                        }
                        className={`p-1.5 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer ${
                          feedback[msg.id] === 'up' ? 'text-emerald-400' : 'hover:text-white'
                        }`}
                        title="Good response"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Thumbs down */}
                      <button
                        onClick={() =>
                          setFeedback((prev) => ({
                            ...prev,
                            [msg.id]: prev[msg.id] === 'down' ? undefined! : 'down',
                          }))
                        }
                        className={`p-1.5 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer ${
                          feedback[msg.id] === 'down' ? 'text-red-400' : 'hover:text-white'
                        }`}
                        title="Bad response"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Regenerate button */}
                      {onRegenerateResponse && (
                        <button
                          onClick={onRegenerateResponse}
                          className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer ml-1"
                          title="Regenerate response"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <span className="text-[10px] text-slate-500 ml-auto font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}

                  {/* User message edit button */}
                  {isUser && !isEditing && (
                    <div className="hidden group-hover:flex items-center justify-end gap-1 pt-1 text-slate-400">
                      <button
                        onClick={() => {
                          setEditingMsgId(msg.id);
                          setEditInput(msg.content);
                        }}
                        className="p-1 hover:text-white rounded hover:bg-neutral-700/60"
                        title="Edit message"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator when initiating response */}
        {isLoading && !messages.some((m) => m.isStreaming) && (
          <div className="flex gap-3.5 max-w-3xl mx-auto justify-start animate-in fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2.5 py-3 px-3 text-slate-400 text-xs bg-[#2a2a2a]/60 rounded-2xl border border-neutral-700/50">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>ChatGPT is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Signature ChatGPT Bottom Input Floating Bar */}
      <div className="p-4 md:px-12 lg:px-28 bg-[#212121] shrink-0">
        <div className="max-w-3xl mx-auto relative">
          {/* Attached image preview pill */}
          {attachedImage && (
            <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2f2f2f] border border-neutral-700 text-xs text-white shadow-lg animate-in fade-in">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-[11px]">Image attached</span>
              <button
                onClick={() => setAttachedImage(null)}
                className="p-0.5 rounded-full hover:bg-neutral-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Input Box Container */}
          <div className="flex items-end gap-2 bg-[#2f2f2f] rounded-3xl p-2 px-3 border border-neutral-700/90 shadow-2xl focus-within:border-neutral-500 transition-all">
            {/* Attachment Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-neutral-700/60 transition-colors shrink-0 mb-0.5 cursor-pointer"
              title="Attach image or screenshot"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Web Search Toggle Pill */}
            <button
              onClick={onToggleWebSearch}
              className={`p-2 rounded-full transition-colors shrink-0 mb-0.5 cursor-pointer ${
                useWebSearch
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-neutral-700/60'
              }`}
              title={useWebSearch ? 'Web search enabled' : 'Enable web search'}
            >
              <Globe className="w-4 h-4" />
            </button>

            {/* Microphone Voice Button */}
            <button
              onClick={toggleSpeechRecognition}
              className={`p-2 rounded-full transition-colors shrink-0 mb-0.5 cursor-pointer ${
                isListening
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                  : 'text-slate-400 hover:text-white hover:bg-neutral-700/60'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Voice typing'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything, write code, or analyze image..."
              className="flex-1 bg-transparent border-0 text-white placeholder-slate-400 text-sm focus:outline-none resize-none py-1.5 px-1 max-h-48 overflow-y-auto leading-relaxed"
            />

            {/* Send or Stop Generation Button */}
            {isLoading ? (
              <button
                onClick={onStopGeneration}
                className="p-2 rounded-full bg-white text-black hover:bg-slate-200 transition-all shrink-0 mb-0.5 shadow-md cursor-pointer"
                title="Stop generating"
              >
                <Square className="w-4 h-4 fill-black stroke-black" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() && !attachedImage}
                className={`p-2 rounded-full transition-all shrink-0 mb-0.5 ${
                  input.trim() || attachedImage
                    ? 'bg-white text-slate-900 hover:opacity-90 shadow-md cursor-pointer'
                    : 'bg-neutral-700 text-slate-500 cursor-not-allowed'
                }`}
                title="Send prompt"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>

          {/* Footer Disclaimer */}
          <div className="text-center text-[11px] text-slate-500 mt-2 select-none">
            ChatGPT can make mistakes. Verify important information.
          </div>
        </div>
      </div>
    </div>
  );
};
