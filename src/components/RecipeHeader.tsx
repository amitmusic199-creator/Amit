import React from 'react';
import { Cpu, Terminal, Download, Copy, Check, Sparkles, Layers, Sliders, Folder } from 'lucide-react';
import { ModelRecipeConfig } from '../types/recipe';

interface RecipeHeaderProps {
  config: ModelRecipeConfig;
  onSelectPreset: (presetKey: 'yolov8n' | 'yolov8s' | 'custom') => void;
  activePresetKey: string;
  activeTab: 'pipeline' | 'detect' | 'code' | 'config' | 'cli' | 'fork';
  onTabChange: (tab: 'pipeline' | 'detect' | 'code' | 'config' | 'cli' | 'fork') => void;
  onCopyCode: () => void;
  hasCopied: boolean;
  onDownloadCode: () => void;
  onOpenAiOptimizer: () => void;
}

export const RecipeHeader: React.FC<RecipeHeaderProps> = ({
  config,
  onSelectPreset,
  activePresetKey,
  activeTab,
  onTabChange,
  onCopyCode,
  hasCopied,
  onDownloadCode,
  onOpenAiOptimizer,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md z-30 select-none">
      {/* Top Brand Bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-3 border-b border-slate-800/80 gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-white">Axelera AI</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-medium">
                Recipe Studio
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-mono">
                {config.backend}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span className="font-mono text-slate-300">{config.modelName}</span>
              <span>•</span>
              <span className="text-slate-400">{config.upstreamModel}</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">INT8 Quantized</span>
            </div>
          </div>
        </div>

        {/* Preset Selector & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Preset Buttons */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => onSelectPreset('yolov8n')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activePresetKey === 'yolov8n'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              YOLOv8n (Nano)
            </button>
            <button
              onClick={() => onSelectPreset('yolov8s')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activePresetKey === 'yolov8s'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              YOLOv8s (Small)
            </button>
            <button
              onClick={() => onSelectPreset('custom')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activePresetKey === 'custom'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Custom ONNX
            </button>
          </div>

          {/* AI Optimizer button */}
          <button
            onClick={onOpenAiOptimizer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-indigo-600/20 hover:from-amber-500/30 hover:to-indigo-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all shadow-xs"
            title="Analyze & Optimize Recipe with Gemini AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Optimizer</span>
          </button>

          {/* Copy Script */}
          <button
            onClick={onCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors shadow-xs"
            title="Copy Python Recipe Code"
          >
            {hasCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Script</span>
              </>
            )}
          </button>

          {/* Download Script */}
          <button
            onClick={onDownloadCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-md shadow-indigo-600/20"
            title="Download .py Recipe"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .py</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center space-x-1 px-6 bg-slate-950/60 text-xs overflow-x-auto">
        <button
          onClick={() => onTabChange('pipeline')}
          className={`flex items-center gap-2 py-3 px-3.5 font-medium border-b-2 transition-colors ${
            activeTab === 'pipeline'
              ? 'border-cyan-400 text-cyan-300 font-semibold bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Pipeline Graph</span>
        </button>

        <button
          onClick={() => onTabChange('detect')}
          className={`flex items-center gap-2 py-3 px-3.5 font-medium border-b-2 transition-colors ${
            activeTab === 'detect'
              ? 'border-cyan-400 text-cyan-300 font-semibold bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Inference Simulator</span>
        </button>

        <button
          onClick={() => onTabChange('code')}
          className={`flex items-center gap-2 py-3 px-3.5 font-medium border-b-2 transition-colors ${
            activeTab === 'code'
              ? 'border-cyan-400 text-cyan-300 font-semibold bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Python Recipe Code</span>
        </button>

        <button
          onClick={() => onTabChange('config')}
          className={`flex items-center gap-2 py-3 px-3.5 font-medium border-b-2 transition-colors ${
            activeTab === 'config'
              ? 'border-cyan-400 text-cyan-300 font-semibold bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Config & Calibration</span>
        </button>

        <button
          onClick={() => onTabChange('fork')}
          className={`flex items-center gap-2 py-3 px-3.5 font-medium border-b-2 transition-colors ${
            activeTab === 'fork'
              ? 'border-emerald-400 text-emerald-300 font-semibold bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Folder className="w-4 h-4 text-emerald-400" />
          <span>Fork Bundle (shared/)</span>
        </button>

        <button
          onClick={() => onTabChange('cli')}
          className={`flex items-center gap-2 py-3 px-3.5 font-medium border-b-2 transition-colors ${
            activeTab === 'cli'
              ? 'border-cyan-400 text-cyan-300 font-semibold bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Axelera CLI Guide</span>
        </button>
      </nav>
    </header>
  );
};
