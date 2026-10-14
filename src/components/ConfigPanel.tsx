import React from 'react';
import { Sliders, Database, Layers, Sparkles, Folder, Save, RefreshCw } from 'lucide-react';
import { ModelRecipeConfig } from '../types/recipe';

interface ConfigPanelProps {
  config: ModelRecipeConfig;
  onChange: (updated: Partial<ModelRecipeConfig>) => void;
  onReset: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  onChange,
  onReset,
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-6 overflow-y-auto">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div>
          <h2 className="text-base font-bold text-white">Recipe & Compiler Configuration</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Parameters injected into <code className="text-cyan-300 font-mono">CompilerConfig</code> and runtime pipeline.
          </p>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Input & Model Definition */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">
              Model Inputs & Format
            </h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Model Name (Identifier)
            </label>
            <input
              type="text"
              value={config.modelName}
              onChange={(e) => onChange({ modelName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Input Height
              </label>
              <select
                value={config.inputSize[2]}
                onChange={(e) => {
                  const h = parseInt(e.target.value, 10);
                  onChange({ inputSize: [1, 3, h, h] });
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value={640}>640 × 640 (Standard)</option>
                <option value={512}>512 × 512</option>
                <option value={416}>416 × 416 (Fast)</option>
                <option value={320}>320 × 320 (Ultra Fast)</option>
                <option value={1280}>1280 × 1280 (High Res)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Default Weight Format
              </label>
              <select
                value={config.weightFormat}
                onChange={(e) => onChange({ weightFormat: e.target.value as 'onnx' | 'pt2' })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="onnx">ONNX (.onnx)</option>
                <option value="pt2">PyTorch Export (.pt2)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Compiled Artifact Output Path
            </label>
            <input
              type="text"
              value={config.outputPath}
              onChange={(e) => onChange({ outputPath: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Card 2: Postamble & Fused Kernel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">
              Fused Postamble Kernel
            </h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Postamble Fused Kernel
            </label>
            <input
              type="text"
              value={config.postamble.fusedKernel}
              onChange={(e) =>
                onChange({
                  postamble: { ...config.postamble, fusedKernel: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Executes bounding box regression decoding on Axelera Metis NPU.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Number of Classes
              </label>
              <input
                type="number"
                value={config.postamble.numClasses}
                onChange={(e) =>
                  onChange({
                    postamble: { ...config.postamble, numClasses: parseInt(e.target.value, 10) || 80 },
                    accuracy: { ...config.accuracy, numClasses: parseInt(e.target.value, 10) || 80 },
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">80 for COCO</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                DFL Distribution Bins
              </label>
              <input
                type="number"
                value={config.postamble.dflBins}
                onChange={(e) =>
                  onChange({
                    postamble: { ...config.postamble, dflBins: parseInt(e.target.value, 10) || 16 },
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">16 for YOLOv8</span>
            </div>
          </div>
        </div>

        {/* Card 3: Calibration & PTQ */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">
              INT8 Calibration Source
            </h3>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Number of Calibration Images (NUM_CAL)</span>
              <span className="font-mono text-emerald-400 font-bold">{config.numCal}</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="25"
              value={config.numCal}
              onChange={(e) => onChange({ numCal: parseInt(e.target.value, 10) })}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Axelera recommendation: ~200 images representative of target deployment scene.
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Custom Local Calibration Directory (CALIBRATION_DIR)
            </label>
            <input
              type="text"
              placeholder="e.g. /path/to/my_calibration_images/ (wins over download)"
              value={config.calibration.dir}
              onChange={(e) =>
                onChange({
                  calibration: { ...config.calibration, dir: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Card 4: Evaluation Parameters */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">
              Accuracy Evaluation (--eval)
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Dataset / Split
              </label>
              <input
                type="text"
                value={`${config.accuracy.dataset} ${config.accuracy.split}`}
                disabled
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs font-mono text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Eval IoU Threshold
              </label>
              <input
                type="number"
                step="0.05"
                value={config.accuracy.iouThreshold}
                onChange={(e) =>
                  onChange({
                    accuracy: { ...config.accuracy, iouThreshold: parseFloat(e.target.value) || 0.7 },
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Low Confidence Floor (accuracy ranking)
            </label>
            <input
              type="number"
              step="0.0005"
              value={config.accuracy.confThreshold}
              onChange={(e) =>
                onChange({
                  accuracy: { ...config.accuracy, confThreshold: parseFloat(e.target.value) || 0.001 },
                })
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Set low (e.g. 0.001) so metric evaluators can rank all confidence percentiles.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
