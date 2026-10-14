import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Code,
  X,
  Copy,
  Check,
} from 'lucide-react';

interface AiOptimizerModalProps {
  recipeCode: string;
  modelName: string;
  onClose: () => void;
}

interface AnalysisResult {
  overallScore: number;
  latencyMs: number;
  fps: number;
  npuEfficiency: string;
  summary: string;
  strengths: string[];
  bottlenecks: { stage: string; impact: string; description: string }[];
  recommendations: { title: string; explanation: string; codeSnippet: string }[];
}

export const AiOptimizerModal: React.FC<AiOptimizerModalProps> = ({
  recipeCode,
  modelName,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedSnippetIdx, setCopiedSnippetIdx] = useState<number | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeCode, modelName }),
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const copySnippet = (snippet: string, idx: number) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippetIdx(idx);
    setTimeout(() => setCopiedSnippetIdx(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Axelera AI Recipe Optimizer & NPU Profiler</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Gemini 3.8 Flash
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated compiler analysis, Metis hardware efficiency audit & code tuning.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!result && !loading && (
              <button
                onClick={runAnalysis}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Start AI Analysis</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {!result && !loading && !error && (
            <div className="text-center py-12 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
                <Cpu className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-white">
                Inspect & Optimize &ldquo;{modelName}&rdquo;
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The AI will evaluate your pipeline against Axelera Metis D-PU hardware parameters:
                PTQ calibration coverage, DFL postamble fusion, letterbox memory bounds, and NMS host overhead.
              </p>
              <button
                onClick={runAnalysis}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Run Analysis Now</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-16 space-y-4">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <div className="text-sm font-semibold text-white">
                Analyzing Axelera Recipe Architecture...
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Auditing tensor memory layout, quantization nodes, and Metis NPU acceleration mapping.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <span className="font-bold block">Analysis Failed</span>
                <p className="mt-1">{error}</p>
                <button
                  onClick={runAnalysis}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Score & Key Metrics Banner */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Compiler Score</span>
                    <div className="text-2xl font-bold font-mono text-emerald-400">
                      {result.overallScore} <span className="text-xs text-slate-400">/ 100</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Predicted Latency</span>
                    <div className="text-2xl font-bold font-mono text-cyan-400">
                      {result.latencyMs} <span className="text-xs text-slate-400">ms</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Throughput</span>
                    <div className="text-2xl font-bold font-mono text-indigo-300">
                      {result.fps} <span className="text-xs text-slate-400">FPS</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">NPU Efficiency</span>
                    <div className="text-sm font-bold font-mono text-amber-400 truncate">
                      {result.npuEfficiency}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-white block mb-1">Executive Summary</span>
                {result.summary}
              </div>

              {/* Strengths & Bottlenecks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Hardware Strengths</span>
                  </span>
                  <ul className="space-y-1.5">
                    {result.strengths.map((str, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Potential Bottlenecks</span>
                  </span>
                  <div className="space-y-2">
                    {result.bottlenecks.map((btn, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between font-bold text-white mb-0.5">
                          <span>{btn.stage}</span>
                          <span className="text-[10px] text-amber-400 font-mono uppercase">{btn.impact}</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{btn.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actionable Code Recommendations */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Code className="w-4 h-4" />
                  <span>Actionable Code Optimizations</span>
                </span>

                <div className="space-y-3">
                  {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-xs text-white">{rec.title}</h5>
                        <button
                          onClick={() => copySnippet(rec.codeSnippet, idx)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                        >
                          {copiedSnippetIdx === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-slate-400">{rec.explanation}</p>

                      <pre className="p-3 bg-black/60 rounded-lg text-cyan-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
                        {rec.codeSnippet}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
