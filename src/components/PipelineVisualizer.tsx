import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  ArrowRight,
  Info,
  Maximize2,
  Box,
  Sliders,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { ModelRecipeConfig, PipelineStage } from '../types/recipe';

interface PipelineVisualizerProps {
  config: ModelRecipeConfig;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({ config }) => {
  const [selectedStageId, setSelectedStageId] = useState<string>('stage_axm');

  const stages: PipelineStage[] = [
    {
      id: 'stage_input',
      name: 'Input Video / Image',
      category: 'preprocess',
      device: 'Host CPU',
      inputShape: 'H × W × 3',
      outputShape: 'H × W × 3',
      dataType: 'uint8 (RGB/BGR)',
      description: 'Incoming frame from video camera, image file, or RTSP stream.',
      details: [
        'Supports any arbitrary input resolution',
        'Direct memory zero-copy where available',
        'Feeds into preprocessing pipeline',
      ],
    },
    {
      id: 'stage_preprocess',
      name: 'op.seq(color_convert, letterbox, to_tensor)',
      category: 'preprocess',
      device: 'Host CPU',
      inputShape: 'H × W × 3',
      outputShape: `1 × 3 × ${config.inputSize[2]} × ${config.inputSize[3]}`,
      dataType: 'float32 (0.0 to 1.0)',
      description: 'Standardizes aspect ratio and layout for neural network ingestion.',
      details: [
        'op.color_convert: BGR -> RGB colorspace',
        `op.letterbox: Aspect-ratio preserving resize with padding to ${config.inputSize[3]}×${config.inputSize[2]}`,
        'op.to_tensor: HWC uint8 -> CHW float32 [0.0, 1.0]',
      ],
    },
    {
      id: 'stage_axm',
      name: `op.load("${config.outputPath}")`,
      category: 'hardware',
      device: 'Metis AIPU',
      inputShape: `1 × 3 × ${config.inputSize[2]} × ${config.inputSize[3]}`,
      outputShape: 'Multi-scale Feature Maps (P3, P4, P5)',
      dataType: 'int8 (quantized weights/activations)',
      description: 'Axelera NPU hardware execution compiled by axelera.compiler.',
      details: [
        'Compiled .axm artifact optimized for Axelera Metis D-PUs',
        'INT8 post-training quantization (PTQ) with ~200 calibration images',
        'Sub-3ms execution latency with ultra-low thermal dissipation',
        'High bandwidth internal SRAM activation buffers',
      ],
    },
    {
      id: 'stage_postamble',
      name: `POSTAMBLE (${config.postamble.fusedKernel})`,
      category: 'postamble',
      device: 'Metis AIPU',
      inputShape: 'Fused Strided Convolutions',
      outputShape: `1 × 84 × 8400 (boxes + ${config.postamble.numClasses} classes)`,
      dataType: 'float32 / int32',
      description: 'Fused Postamble kernel executing directly on the acceleration engine.',
      details: [
        `Kernel: ${config.postamble.fusedKernel}`,
        `Classes: ${config.postamble.numClasses} COCO categories`,
        `DFL Bins: ${config.postamble.dflBins} distribution bins for anchor regression`,
        'Eliminates CPU regression bottleneck by computing softmax & integral on-chip',
      ],
    },
    {
      id: 'stage_decode',
      name: `op.decode_detections(algo="yolov8")`,
      category: 'postprocess',
      device: 'Host CPU',
      inputShape: '1 × 84 × 8400 candidates',
      outputShape: 'N × [x1, y1, x2, y2, score, class_id]',
      dataType: 'float32',
      description: 'Parses raw tensor slices into geometric bounding box proposals.',
      details: [
        'Extracts candidate boxes above initial confidence threshold',
        'Transposes grid coordinates to spatial boxes',
        `Production threshold: 0.25 | Accuracy eval threshold: ${config.accuracy.confThreshold}`,
      ],
    },
    {
      id: 'stage_nms',
      name: 'op.nms(iou_threshold=0.7)',
      category: 'postprocess',
      device: 'Host CPU',
      inputShape: 'Candidate Detections',
      outputShape: 'Filtered Detections (Top-K)',
      dataType: 'Structured Array',
      description: 'Non-Maximum Suppression filters overlapping duplicate bounding boxes.',
      details: [
        'Calculates Intersection over Union (IoU) between adjacent proposals',
        'Suppresses redundant lower-confidence overlaps',
        `Configured IoU Threshold: ${config.accuracy.iouThreshold}`,
      ],
    },
    {
      id: 'stage_output',
      name: 'op.to_image_space() & op.ax_detection()',
      category: 'postprocess',
      device: 'Host CPU',
      inputShape: 'Normalized Letterbox Space',
      outputShape: 'Original Frame Pixel Space',
      dataType: 'CocoClasses Detection Objects',
      description: 'Projects boxes back to original aspect ratio and tags COCO class names.',
      details: [
        'Inverts letterbox scale and offset coordinates',
        'Attaches human-readable COCO labels (person, car, dog...)',
        'Renders overlays or outputs to downstream business logic',
      ],
    },
  ];

  const selectedStage = stages.find((s) => s.id === selectedStageId) || stages[2];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-6 overflow-y-auto">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950/60 p-5 rounded-2xl border border-slate-800 mb-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                <Zap className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-white">
                Axelera End-to-End Runtime Pipeline Architecture
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              In Axelera’s <code className="text-cyan-300 font-mono">axrelay</code> backend, inference
              is partitioned across host CPU preprocessing, accelerated Metis NPU INT8 execution, and a
              fused <code className="text-indigo-300 font-mono">UltralyticsYoloPostamble</code> kernel that avoids host bottlenecks.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-slate-300">Metis AIPU (Hardware)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-slate-300">Host CPU (Runtime)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Node Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3 mb-6">
        {stages.map((stage, idx) => {
          const isSelected = stage.id === selectedStageId;
          const isHardware = stage.device === 'Metis AIPU';

          return (
            <div
              key={stage.id}
              onClick={() => setSelectedStageId(stage.id)}
              className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all cursor-pointer group ${
                isSelected
                  ? 'bg-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400'
                  : isHardware
                  ? 'bg-indigo-950/30 border-indigo-800/60 hover:border-indigo-600'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-slate-400">Step 0{idx + 1}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${
                      isHardware
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {stage.device === 'Metis AIPU' ? 'NPU' : 'CPU'}
                  </span>
                </div>

                <h3 className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {stage.name}
                </h3>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="block truncate font-mono text-slate-300">{stage.outputShape}</span>
              </div>

              {idx < stages.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stage Detail Inspector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{selectedStage.name}</h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium ${
                    selectedStage.device === 'Metis AIPU'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {selectedStage.device}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{selectedStage.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Input Shape:</span>
              <span className="text-cyan-300 font-semibold">{selectedStage.inputShape}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Output Shape:</span>
              <span className="text-emerald-300 font-semibold">{selectedStage.outputShape}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Data Type:</span>
              <span className="text-amber-300 font-semibold">{selectedStage.dataType}</span>
            </div>
          </div>
        </div>

        {/* Breakdown Items */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Key Mechanism & Operations
            </h4>
            <ul className="space-y-2">
              {selectedStage.details.map((detail, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
            <div className="text-slate-500 text-[11px] mb-2 font-sans font-semibold uppercase tracking-wider">
              Python Recipe Definition
            </div>
            {selectedStage.id === 'stage_preprocess' && (
              <pre className="text-cyan-300 overflow-x-auto">
{`preprocess = op.seq(
    op.color_convert(dst='RGB'),
    op.letterbox(width=${config.inputSize[3]}, height=${config.inputSize[2]}),
    op.to_tensor(),
)`}
              </pre>
            )}
            {selectedStage.id === 'stage_axm' && (
              <pre className="text-indigo-300 overflow-x-auto">
{`# Compiled .axm deployment
op.load(
    str(axm_path),
    using_postamble=POSTAMBLE
)`}
              </pre>
            )}
            {selectedStage.id === 'stage_postamble' && (
              <pre className="text-amber-300 overflow-x-auto">
{`POSTAMBLE = Postamble(
    fused_kernel='${config.postamble.fusedKernel}',
    num_classes=${config.postamble.numClasses},
    dfl_bins=${config.postamble.dflBins}
)`}
              </pre>
            )}
            {selectedStage.id === 'stage_decode' && (
              <pre className="text-emerald-300 overflow-x-auto">
{`op.decode_detections(
    algo='yolov8',
    num_classes=${config.postamble.numClasses}
)`}
              </pre>
            )}
            {selectedStage.id === 'stage_nms' && (
              <pre className="text-cyan-300 overflow-x-auto">
{`# Production: op.nms()
# Accuracy Eval:
op.nms(iou_threshold=${config.accuracy.iouThreshold})`}
              </pre>
            )}
            {selectedStage.id === 'stage_output' && (
              <pre className="text-purple-300 overflow-x-auto">
{`op.to_image_space()
op.ax_detection(class_id_type=op.CocoClasses)`}
              </pre>
            )}
            {selectedStage.id === 'stage_input' && (
              <pre className="text-slate-300 overflow-x-auto">
{`# Ingested by shared/cli.py pipeline runner
INPUT_SIZE = [${config.inputSize.join(', ')}]
# Auto-batched and fed into runtime`}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
