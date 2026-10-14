import React, { useState } from 'react';
import { Terminal, Copy, Check, Play, Zap, FileCode, CheckCircle2 } from 'lucide-react';
import { ModelRecipeConfig } from '../types/recipe';

interface CliGuideProps {
  config: ModelRecipeConfig;
}

export const CliGuide: React.FC<CliGuideProps> = ({ config }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const scriptName = `${config.modelName.replace('-', '_')}_${config.backend}.py`;

  const commands = [
    {
      id: 'fork',
      title: '1. Fork Recipe into Your Project',
      desc: 'Copies out the standalone recipe and the shared/ runtime helpers.',
      cmd: `axzoo fork ${config.modelName} --script`,
      tip: 'Writes the recipe script and the shared/ helper library in your local directory.',
    },
    {
      id: 'run_standalone',
      title: '2. Run Standalone Build & Quantization',
      desc: 'Downloads weights, runs PTQ calibration, and compiles .axm artifact.',
      cmd: `python ${scriptName}`,
      tip: 'Uses axelera-compiler to output build/yolov8n-coco.axm.',
    },
    {
      id: 'custom_weights',
      title: '3. Build with Your Own Custom Weights',
      desc: 'Point AXZOO_WEIGHT_FILE at your exported ONNX or PyTorch model.',
      cmd: `AXZOO_WEIGHT_FILE=/path/to/my_model.onnx python ${scriptName}`,
      tip: 'Skips downloading remote assets and compiles your custom checkpoint.',
    },
    {
      id: 'run_rt',
      title: '4. Run Live Inference with Axelera Runtime',
      desc: 'Execute the compiled model on hardware or simulator with an input image or video.',
      cmd: `axelera-rt run ${config.outputPath} --input test_image.jpg`,
      tip: 'Uses Metis AIPU acceleration with the fused postamble.',
    },
    {
      id: 'benchmark',
      title: '5. Benchmark FPS & Latency on Metis NPU',
      desc: 'Profile execution speed, sustained frame rates, and memory bandwidth.',
      cmd: `axelera-rt benchmark ${config.outputPath} --fps --num-iterations 500`,
      tip: 'Outputs P50, P90, P99 latency and total throughput in FPS.',
    },
    {
      id: 'eval',
      title: '6. Score Accuracy on COCO Dataset',
      desc: 'Runs full mAP@0.5:0.95 evaluation on the COCO validation split.',
      cmd: `python ${scriptName} --eval`,
      tip: 'Requires the Model Zoo dataset cache; uses low confidence floor (0.001).',
    },
    {
      id: 'drift',
      title: '7. Refresh Recipe After Config Drift',
      desc: 'If modifying zoo recipes in-repo, regenerate code to pass CI drift-check.',
      cmd: `axzoo drift-check --fix`,
      tip: 'Ensures committed model_recipes/ files stay synchronized with BuildConfig.',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-6 overflow-y-auto">
      {/* Title */}
      <div className="pb-4 border-b border-slate-800 mb-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <span>Axelera CLI & SDK Workflow Reference</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Commands for compiling, running, benchmarking, and evaluating{' '}
          <span className="text-cyan-300 font-mono font-medium">{scriptName}</span>.
        </p>
      </div>

      {/* Commands List */}
      <div className="space-y-4 max-w-4xl">
        {commands.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                {item.title}
              </h3>
              <span className="text-[11px] text-slate-500 font-sans">{item.tip}</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">{item.desc}</p>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400">
              <span className="overflow-x-auto select-all pr-4">{item.cmd}</span>
              <button
                onClick={() => copyCommand(item.cmd, item.id)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans transition-colors"
              >
                {copiedCmd === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
