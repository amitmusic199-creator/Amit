import React, { useState, useMemo, useRef } from 'react';
import {
  Sparkles,
  Sliders,
  Cpu,
  Zap,
  Gauge,
  Image as ImageIcon,
  Upload,
  Camera,
  RefreshCw,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { DetectedBox, ModelRecipeConfig } from '../types/recipe';
import { getCocoClass } from '../data/cocoClasses';

interface DetectionPlaygroundProps {
  config: ModelRecipeConfig;
}

interface SceneOption {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  detections: DetectedBox[];
}

const SAMPLE_SCENES: SceneOption[] = [
  {
    id: 'street',
    name: 'City Intersection & Pedestrians',
    description: 'Urban traffic with pedestrians, sedans, trucks, and traffic signals.',
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1000&q=80',
    detections: [
      { id: 'd1', label: 'car', classId: 2, confidence: 0.94, x: 0.12, y: 0.58, width: 0.28, height: 0.22, color: '#f59e0b' },
      { id: 'd2', label: 'car', classId: 2, confidence: 0.89, x: 0.55, y: 0.62, width: 0.32, height: 0.26, color: '#f59e0b' },
      { id: 'd3', label: 'person', classId: 0, confidence: 0.92, x: 0.44, y: 0.52, width: 0.08, height: 0.25, color: '#ef4444' },
      { id: 'd4', label: 'person', classId: 0, confidence: 0.86, x: 0.38, y: 0.54, width: 0.07, height: 0.23, color: '#ef4444' },
      { id: 'd5', label: 'traffic light', classId: 9, confidence: 0.88, x: 0.22, y: 0.22, width: 0.05, height: 0.12, color: '#0ea5e9' },
      { id: 'd6', label: 'truck', classId: 7, confidence: 0.78, x: 0.78, y: 0.54, width: 0.18, height: 0.28, color: '#14b8a6' },
      { id: 'd7', label: 'backpack', classId: 24, confidence: 0.65, x: 0.45, y: 0.57, width: 0.04, height: 0.08, color: '#6ee7b7' },
      { id: 'd8', label: 'car', classId: 2, confidence: 0.42, x: 0.02, y: 0.59, width: 0.12, height: 0.16, color: '#f59e0b' },
      { id: 'd9', label: 'person', classId: 0, confidence: 0.31, x: 0.68, y: 0.56, width: 0.05, height: 0.18, color: '#ef4444' },
    ],
  },
  {
    id: 'office',
    name: 'Modern Office Workspace',
    description: 'Workstations with laptops, chairs, bottles, keyboard, and coffee mug.',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
    detections: [
      { id: 'o1', label: 'laptop', classId: 63, confidence: 0.96, x: 0.35, y: 0.52, width: 0.24, height: 0.22, color: '#2563eb' },
      { id: 'o2', label: 'chair', classId: 56, confidence: 0.91, x: 0.28, y: 0.56, width: 0.22, height: 0.38, color: '#64748b' },
      { id: 'o3', label: 'chair', classId: 56, confidence: 0.88, x: 0.62, y: 0.54, width: 0.24, height: 0.40, color: '#64748b' },
      { id: 'o4', label: 'dining table', classId: 60, confidence: 0.93, x: 0.15, y: 0.60, width: 0.70, height: 0.36, color: '#1e293b' },
      { id: 'o5', label: 'cup', classId: 41, confidence: 0.84, x: 0.62, y: 0.62, width: 0.07, height: 0.09, color: '#f87171' },
      { id: 'o6', label: 'bottle', classId: 39, confidence: 0.79, x: 0.26, y: 0.52, width: 0.05, height: 0.14, color: '#facc15' },
      { id: 'o7', label: 'keyboard', classId: 66, confidence: 0.74, x: 0.38, y: 0.68, width: 0.18, height: 0.08, color: '#1e3a8a' },
      { id: 'o8', label: 'potted plant', classId: 58, confidence: 0.69, x: 0.82, y: 0.44, width: 0.12, height: 0.22, color: '#16a34a' },
    ],
  },
  {
    id: 'living',
    name: 'Home Living Room & Pet',
    description: 'Indoor living space with couch, pet dog, TV, and table.',
    imageUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=1000&q=80',
    detections: [
      { id: 'l1', label: 'dog', classId: 16, confidence: 0.95, x: 0.38, y: 0.58, width: 0.25, height: 0.32, color: '#f43f5e' },
      { id: 'l2', label: 'couch', classId: 57, confidence: 0.93, x: 0.18, y: 0.46, width: 0.65, height: 0.42, color: '#475569' },
      { id: 'l3', label: 'potted plant', classId: 58, confidence: 0.87, x: 0.82, y: 0.36, width: 0.14, height: 0.38, color: '#16a34a' },
      { id: 'l4', label: 'book', classId: 73, confidence: 0.72, x: 0.58, y: 0.72, width: 0.09, height: 0.06, color: '#059669' },
      { id: 'l5', label: 'clock', classId: 74, confidence: 0.81, x: 0.46, y: 0.18, width: 0.08, height: 0.10, color: '#d97706' },
    ],
  },
];

export const DetectionPlayground: React.FC<DetectionPlaygroundProps> = ({ config }) => {
  const [selectedSceneId, setSelectedSceneId] = useState<string>('street');
  const [confThreshold, setConfThreshold] = useState<number>(0.25);
  const [iouThreshold, setIouThreshold] = useState<number>(0.45);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showScores, setShowScores] = useState<boolean>(true);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);

  // Live AI state
  const [isAiRunning, setIsAiRunning] = useState<boolean>(false);
  const [aiDetections, setAiDetections] = useState<DetectedBox[] | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Webcam state
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeScene = SAMPLE_SCENES.find((s) => s.id === selectedSceneId) || SAMPLE_SCENES[0];
  const imageSource = customImageUrl || activeScene.imageUrl;

  // Active detections pool
  const currentDetections = aiDetections !== null ? aiDetections : activeScene.detections;

  // Filter detections by confidence threshold
  const visibleDetections = useMemo(() => {
    return currentDetections.filter((d) => d.confidence >= confThreshold);
  }, [currentDetections, confThreshold]);

  // Handle custom image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCustomImageUrl(base64);
        setAiDetections(null);
        setAiSummary(null);
        stopWebcam();
        // Automatically run real AI detection on user uploaded image!
        runAiDetection(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run Real AI Object Detection via Gemini API endpoint
  const runAiDetection = async (base64Override?: string) => {
    setIsAiRunning(true);
    setAiError(null);

    try {
      let payload: any = {};
      const img = base64Override || customImageUrl;

      if (img && img.startsWith('data:')) {
        payload = { imageBase64: img };
      } else {
        payload = { imageUrl: img || activeScene.imageUrl };
      }

      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Inference returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.detections) {
        const parsed: DetectedBox[] = data.detections.map((d: any, idx: number) => {
          const coco = getCocoClass(d.label);
          // Convert 0-1000 coordinate format to 0-1 percentage
          const y = (d.ymin || 0) / 1000;
          const x = (d.xmin || 0) / 1000;
          const height = Math.max(0.02, ((d.ymax || 1000) - (d.ymin || 0)) / 1000);
          const width = Math.max(0.02, ((d.xmax || 1000) - (d.xmin || 0)) / 1000);

          return {
            id: `ai_${idx}_${Date.now()}`,
            label: d.label,
            classId: coco.id,
            confidence: d.confidence || 0.85,
            x,
            y,
            width,
            height,
            color: coco.color,
          };
        });

        setAiDetections(parsed);
        if (data.summary) {
          setAiSummary(data.summary);
        }
      }
    } catch (err: any) {
      console.error('AI Detection Error:', err);
      setAiError(err.message || 'AI detection failed. Check API key.');
    } finally {
      setIsAiRunning(false);
    }
  };

  // Start Webcam
  const startWebcam = async () => {
    try {
      setIsWebcamActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 640 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setIsWebcamActive(false);
    }
  };

  // Stop Webcam
  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
  };

  // Capture from Webcam
  const captureWebcamFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 640, 640);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCustomImageUrl(dataUrl);
      stopWebcam();
      runAiDetection(dataUrl);
    }
  };

  // Hardware metrics based on model
  const isNano = config.modelName.includes('yolov8n');
  const latencyMs = isNano ? 2.3 : 4.8;
  const fps = Math.round(1000 / latencyMs);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-6 overflow-y-auto">
      {/* Top Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Metis Inference Latency</div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {latencyMs} <span className="text-xs text-slate-400">ms</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Throughput (Batch=1)</div>
            <div className="text-xl font-bold font-mono text-cyan-400">
              ~{fps} <span className="text-xs text-slate-400">FPS</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Quantization & Model</div>
            <div className="text-sm font-bold font-mono text-indigo-300 truncate">
              {config.modelName} (INT8)
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Detected Objects</div>
            <div className="text-xl font-bold font-mono text-amber-400">
              {visibleDetections.length}{' '}
              <span className="text-xs text-slate-400 font-sans">
                / {currentDetections.length} total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Image & Canvas Overlay */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col shadow-xl">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Video Viewport
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                [1, 3, {config.inputSize[2]}, {config.inputSize[3]}]
              </span>
              {aiDetections !== null && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Live AI Active
                </span>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 text-xs">
              {SAMPLE_SCENES.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => {
                    setSelectedSceneId(scene.id);
                    setCustomImageUrl(null);
                    setAiDetections(null);
                    setAiSummary(null);
                    stopWebcam();
                  }}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    selectedSceneId === scene.id && !customImageUrl && !isWebcamActive
                      ? 'bg-indigo-600 text-white font-medium shadow-xs'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {scene.name.split(' ')[0]}
                </button>
              ))}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Upload image"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>

              {!isWebcamActive ? (
                <button
                  onClick={startWebcam}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  title="Capture live webcam"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Webcam</span>
                </button>
              ) : (
                <button
                  onClick={captureWebcamFrame}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors animate-pulse"
                  title="Snap and analyze"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Capture</span>
                </button>
              )}
            </div>
          </div>

          {/* Image & Bounding Box Canvas Container */}
          <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center min-h-[380px] max-h-[500px]">
            {isWebcamActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto max-h-[480px] object-cover rounded-xl"
              />
            ) : (
              <img
                src={imageSource}
                alt="Detection Frame"
                className="w-full h-auto max-h-[480px] object-cover rounded-xl"
              />
            )}

            {/* AI Scanning Animation overlay */}
            {isAiRunning && (
              <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-xs flex flex-col items-center justify-center z-20">
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-0 animate-[bounce_2s_infinite]" />
                  <div className="bg-slate-900/90 px-4 py-3 rounded-xl border border-cyan-500/50 flex items-center gap-3 shadow-2xl">
                    <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                    <span className="text-xs font-mono font-bold text-white">
                      Gemini Vision Object Detection in Progress...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bounding Box Overlays */}
            {!isWebcamActive &&
              visibleDetections.map((box) => {
                const cocoInfo = getCocoClass(box.classId);
                const color = box.color || cocoInfo.color;

                return (
                  <div
                    key={box.id}
                    style={{
                      left: `${box.x * 100}%`,
                      top: `${box.y * 100}%`,
                      width: `${box.width * 100}%`,
                      height: `${box.height * 100}%`,
                      borderColor: color,
                    }}
                    className="absolute border-2 rounded-sm transition-all pointer-events-none group"
                  >
                    {/* Label Tag */}
                    {showLabels && (
                      <div
                        style={{ backgroundColor: color }}
                        className="absolute -top-5 left-0 px-1.5 py-0.5 rounded-t-sm text-[10px] font-bold text-white font-mono flex items-center gap-1 shadow-sm whitespace-nowrap"
                      >
                        <span>{box.label}</span>
                        {showScores && (
                          <span className="opacity-90">{Math.round(box.confidence * 100)}%</span>
                        )}
                      </div>
                    )}

                    {/* Corner Accent */}
                    <div
                      style={{ backgroundColor: color }}
                      className="absolute -bottom-1 -right-1 w-1.5 h-1.5 rounded-full"
                    />
                  </div>
                );
              })}
          </div>

          {/* AI Summary Banner */}
          {aiSummary && (
            <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">AI Vision Analysis: </span>
                {aiSummary}
              </div>
            </div>
          )}

          {aiError && (
            <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {/* Subtext info */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3">
            <span>
              Letterbox scaling: <code className="text-cyan-300 font-mono">op.letterbox(640, 640)</code>
            </span>
            <span>
              Inverted by: <code className="text-indigo-300 font-mono">op.to_image_space()</code>
            </span>
          </div>
        </div>

        {/* Right Col: Interactive Parameter Sliders & Detections List */}
        <div className="space-y-4">
          {/* Action: Run Real AI Detection Button */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 rounded-2xl border border-indigo-900/60 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                  Real AI Vision Detector
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">Gemini 3.8 Flash</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Run real object detection on this image to identify objects, localize 2D bounding boxes, and score probabilities.
            </p>

            <button
              onClick={() => runAiDetection()}
              disabled={isAiRunning || isWebcamActive}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 disabled:opacity-40 transition-all"
            >
              {isAiRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Detect Objects with AI</span>
                </>
              )}
            </button>
          </div>

          {/* Pipeline Tuners */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                  Runtime Thresholds
                </h3>
              </div>
            </div>

            {/* Confidence Threshold Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Confidence Threshold</span>
                <span className="font-mono text-cyan-400 font-bold">{confThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.01"
                value={confThreshold}
                onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>0.05 (Recall)</span>
                <span className="text-cyan-300">Default: 0.25</span>
                <span>0.95 (Precision)</span>
              </div>
            </div>

            {/* NMS IoU Threshold Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">NMS IoU Threshold</span>
                <span className="font-mono text-indigo-400 font-bold">{iouThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.90"
                step="0.05"
                value={iouThreshold}
                onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>0.10 (Aggressive)</span>
                <span className="text-indigo-300">Eval: 0.70</span>
                <span>0.90 (Permissive)</span>
              </div>
            </div>

            {/* Display Toggles */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Show Labels</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showScores}
                  onChange={(e) => setShowScores(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Show Scores</span>
              </label>
            </div>
          </div>

          {/* Filtered Detections List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Active Bounding Boxes ({visibleDetections.length})
              </h4>
              <span className="text-[10px] font-mono text-emerald-400">
                Postamble: {config.postamble.fusedKernel}
              </span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {visibleDetections.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  No objects above confidence {confThreshold.toFixed(2)}. Lower threshold slider.
                </div>
              ) : (
                visibleDetections.map((box) => (
                  <div
                    key={box.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: box.color }}
                      />
                      <span className="font-semibold text-white capitalize">{box.label}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        #{box.classId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {Math.round(box.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
