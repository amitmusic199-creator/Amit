export interface ModelWeightSource {
  kind: 'remote' | 'local';
  weight_url: string;
  weight_path: string;
  md5: string;
}

export interface ModelRecipeConfig {
  modelName: string;
  task: 'detection' | 'segmentation' | 'classification';
  upstreamModel: string;
  dataset: string;
  license: string;
  backend: string;
  inputSize: [number, number, number, number]; // [B, C, H, W]
  numCal: number;
  weightFormat: 'onnx' | 'pt2';
  sources: Record<string, ModelWeightSource>;
  postamble: {
    fusedKernel: string;
    numClasses: number;
    dflBins: number;
  };
  calibration: {
    url: string;
    md5: string;
    dir: string;
  };
  accuracy: {
    task: string;
    dataset: string;
    split: string;
    numClasses: number;
    confThreshold: number;
    iouThreshold: number;
  };
  outputPath: string;
}

export interface DetectedBox {
  id: string;
  label: string;
  classId: number;
  confidence: number;
  x: number; // percentage [0, 1]
  y: number; // percentage [0, 1]
  width: number; // percentage [0, 1]
  height: number; // percentage [0, 1]
  color: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  category: 'preprocess' | 'hardware' | 'postamble' | 'postprocess';
  device: 'Host CPU' | 'Metis AIPU';
  inputShape: string;
  outputShape: string;
  dataType: string;
  description: string;
  details: string[];
}
